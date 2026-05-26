import { makeAutoObservable, runInAction } from 'mobx';
import { API_BASE_URL } from '../services/api';
import * as flyerService from '../services/flyerService';
import * as favoritesService from '../services/favoritesService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import type {
  Flyer,
  Banner,
  FavoritesResponse,
  GetFlyersResponse,
  FlyersPagination,
  CategoryUiTab,
  CategoryTabQueryOptions,
  FetchFlyersForCategoryTabOptions,
} from '../types/flyer';

class FlyerStore {
  // ─── State ────────────────────────────────────────────────────────────────
  flyers: Flyer[] = [];
  allFlyers: Flyer[] = [];
  setFlyers = (flyers: Flyer[]) => {
    runInAction(() => {
      this.flyers = flyers;
    });
  };
  isLoading: boolean = false;
  isFetchingNextPage: boolean = false;
  error: string | null = null;
  hasFetched: boolean = false;
  favorites: string[] = [];
  favoritesData: Flyer[] = [];

  banners: Banner[] = [];
  isBannersLoading: boolean = false;
  bannerError: string | null = null;
  private bannersFetchPromise: Promise<Banner[]> | null = null;
  private categoryTabFetchPromises = new Map<string, Promise<Flyer[]>>();
  private homeCacheHydrationPromise: Promise<void> | null = null;
  private readonly HOME_CACHE_KEY = '@home_cache_v2';

  categories: any[] = [];
  isCategoriesLoading: boolean = false;

  page: number = 1;
  limit: number = 20;
  currentPage: number = 0;
  total: number = 0;
  totalPages: number = 0;
  hasMore: boolean = true;

  flyer: Flyer | null = null;
  loading: boolean = false;
  basePrice: number = 0;
  flyerFormDetail = {
    flyerId: null as string | number | null,
    categoryId: null as string | number | null,
  };

  constructor() {
    makeAutoObservable(this);
  }

  private normalizeBannerImageUrl = (value?: string | null): string => {
    if (!value || typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed) return '';

    if (/^https?:\/\//i.test(trimmed)) {
      try {
        const parsed = new URL(trimmed);
        if (parsed.protocol === 'http:' && !parsed.hostname.includes('localhost')) {
          return trimmed.replace(/^http:\/\//i, 'https://');
        }
        return parsed.toString();
      } catch {
        return trimmed.replace(/^http:\/\//i, 'https://');
      }
    }

    const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, '');
    return `${backendOrigin}/${trimmed.replace(/^\/+/, '')}`;
  };

  hydrateHomeCache = async () => {
    if (this.homeCacheHydrationPromise) return this.homeCacheHydrationPromise;

    this.homeCacheHydrationPromise = (async () => {
      try {
        const raw = await AsyncStorage.getItem(this.HOME_CACHE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        runInAction(() => {
          if (Array.isArray(parsed?.banners) && this.banners.length === 0) {
            this.banners = parsed.banners.map((banner: Banner) => ({
              ...banner,
              image_url: this.normalizeBannerImageUrl(banner.image_url),
            }));
          }
          if (Array.isArray(parsed?.categories) && this.categories.length === 0) {
            this.categories = parsed.categories;
          }
        });
      } catch (error) {
        console.warn('[FlyerStore] Failed to hydrate home cache', error);
      } finally {
        this.homeCacheHydrationPromise = null;
      }
    })();

    return this.homeCacheHydrationPromise;
  };

  private persistHomeCache = async () => {
    try {
      // Only persist banners + categories — allFlyers can grow very large and slow down AsyncStorage reads
      await AsyncStorage.setItem(
        this.HOME_CACHE_KEY,
        JSON.stringify({
          banners: this.banners,
          categories: this.categories,
          cachedAt: Date.now(),
        }),
      );
    } catch (error) {
      console.warn('[FlyerStore] Failed to persist home cache', error);
    }
  };

  private get sourceFlyers(): Flyer[] {
    return this.allFlyers.length > 0 ? this.allFlyers : this.flyers;
  }

  get orderedCategoryTabs(): CategoryUiTab[] {
    const tabs: CategoryUiTab[] = [
      { id: 'recently_added', name: 'Recently Added', label: 'RECENTLY ADDED' },
    ];
    const seenLabels = new Set(tabs.map(tab => tab.label));
    this.categories.forEach(category => {
      const name = String(category.name ?? category.label ?? '').trim();
      if (!name) return;
      const label = name.toUpperCase();
      if (seenLabels.has(label)) return;
      tabs.push({ id: String(category._id ?? category.id ?? name), name, label });
      seenLabels.add(label);
    });
    return tabs;
  }

  private getFlyerId = (flyer: Flyer) => String(flyer._id ?? flyer.id);

  private getNormalizedCategories = (flyer: Flyer): string[] => {
    return [flyer.category, ...(Array.isArray(flyer.categories) ? flyer.categories : [])]
      .map(value => String(value ?? '').trim())
      .filter(Boolean);
  };

  private dedupeFlyers = (flyers: Flyer[]): Flyer[] => {
    const seen = new Set<string>();
    return flyers.filter(flyer => {
      const id = this.getFlyerId(flyer);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  };

  private getCreatedTimestamp = (flyer: Flyer): number => {
    const value = flyer.created_at ?? flyer.createdAt;
    const parsed = value ? Date.parse(value) : 0;
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  private getPriceNumber = (value: Flyer['price']): number => {
    if (typeof value === 'number') return value;
    const cleaned = String(value ?? '0').replace(/[^0-9.]/g, '');
    const parsed = Number(cleaned);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  private sortFlyersForCategoryTab = (
    flyers: Flyer[],
    sortBy: string,
    sortDir: 'asc' | 'desc',
  ): Flyer[] => {
    const stabilized = flyers.map((flyer, index) => ({ flyer, index }));
    stabilized.sort((left, right) => {
      if (sortBy === 'price') {
        const diff = this.getPriceNumber(left.flyer.price) - this.getPriceNumber(right.flyer.price);
        return sortDir === 'asc' ? diff : -diff;
      }
      if (sortBy === 'created_at') {
        const diff = this.getCreatedTimestamp(left.flyer) - this.getCreatedTimestamp(right.flyer);
        if (diff !== 0) return sortDir === 'asc' ? diff : -diff;
      }
      return left.index - right.index;
    });
    return stabilized.map(item => item.flyer);
  };

  get recentlyAdded(): Flyer[] {
    return [...this.dedupeFlyers(this.sourceFlyers)].sort(
      (left, right) => this.getCreatedTimestamp(right) - this.getCreatedTimestamp(left),
    );
  }

  get premiumFlyers(): Flyer[] {
    return this.dedupeFlyers(this.sourceFlyers).filter(flyer => flyer.isPremium === true);
  }

  get basicFlyers(): Flyer[] {
    return this.dedupeFlyers(this.sourceFlyers).filter(flyer => flyer.isPremium !== true);
  }

  flyersByCategory(categoryName: string): Flyer[] {
    const normalizedTarget = categoryName.trim().toLowerCase();
    if (!normalizedTarget) return [];
    return this.dedupeFlyers(
      this.sourceFlyers.filter(flyer =>
        this.getNormalizedCategories(flyer).some(
          category => category.toLowerCase() === normalizedTarget,
        ),
      ),
    );
  }

  getLocalFlyersForCategoryTab = ({
    categoryName,
    isRecentlyAdded = false,
    sortBy = 'created_at',
    sortDir = 'desc',
    templateType,
  }: CategoryTabQueryOptions): Flyer[] => {
    let result = [...this.allFlyers];

    if (!isRecentlyAdded) {
      const categoryLower = categoryName.trim().toLowerCase();
      result = result.filter(flyer => {
        const primary = String(flyer.category || '').toLowerCase();
        const categories = (flyer.categories || []).map(c => String(c).toLowerCase());
        return primary === categoryLower || categories.includes(categoryLower);
      });
    }

    if (templateType) {
      const selectedTemplates = templateType.split(',').map(v => v.trim()).filter(Boolean);
      if (selectedTemplates.length > 0) {
        result = result.filter(flyer => selectedTemplates.includes(String(flyer.template_type)));
      }
    }

    return this.sortFlyersForCategoryTab(
      isRecentlyAdded ? [...this.recentlyAdded] : result,
      sortBy,
      sortDir,
    );
  };

  // ─── Actions ──────────────────────────────────────────────────────────────

  fetchBanners = async () => {
    if (this.bannersFetchPromise) return this.bannersFetchPromise;

    runInAction(() => {
      this.isBannersLoading = true;
      this.bannerError = null;
    });

    this.bannersFetchPromise = (async () => {
      try {
        const { data } = await flyerService.getBanners();
        if (data.success) {
          const fresh = Array.isArray(data.data)
            ? data.data.map(banner => ({
                id: String(banner.id),
                title: banner.title,
                description: banner.description ?? undefined,
                button_text: banner.button_text ?? undefined,
                image_url: this.normalizeBannerImageUrl(banner.image_url),
                link_type: banner.link_type,
                link_value: banner.link_value,
                display_order: banner.display_order,
              }))
            : [];

          // Only replace the array when something actually changed to avoid
          // unnecessary re-renders that would flash the loading overlay in HeroBanner.
          const changed =
            fresh.length !== this.banners.length ||
            fresh.some(
              (b, i) =>
                b.id !== this.banners[i]?.id ||
                b.image_url !== this.banners[i]?.image_url,
            );

          if (changed) {
            runInAction(() => { this.banners = fresh; });
            void this.persistHomeCache();
          }
          return this.banners;
        }
        throw new Error('Failed to fetch banners');
      } catch (error: any) {
        runInAction(() => {
          this.bannerError = error.message ?? 'An unknown error occurred';
        });
        throw error;
      } finally {
        runInAction(() => {
          this.isBannersLoading = false;
          this.bannersFetchPromise = null;
        });
      }
    })();

    return this.bannersFetchPromise;
  };

  fetchCategories = async () => {
    runInAction(() => { this.isCategoriesLoading = true; });
    try {
      const { data } = await flyerService.getCategories();
      if (data.success && Array.isArray(data.categories)) {
        runInAction(() => {
          this.categories = data.categories.sort((a, b) => a.rank - b.rank);
        });
        void this.persistHomeCache();
      }
    } catch (error) {
      console.error('[FlyerStore] fetchCategories error:', error);
    } finally {
      runInAction(() => { this.isCategoriesLoading = false; });
    }
  };

  fetchFlyers = async (
    reset: boolean = false,
    sortBy: string = 'created_at',
    sortDir: 'asc' | 'desc' = 'desc',
    category?: string,
    templateType?: string,
  ) => {
    if (this.isLoading || this.isFetchingNextPage) return;
    if (!reset && !this.hasMore) return;

    if (reset) {
      runInAction(() => {
        this.isLoading = true;
        this.page = 1;
        this.currentPage = 0;
        this.total = 0;
        this.totalPages = 0;
        this.hasMore = true;
        this.flyers = [];
        this.allFlyers = [];
      });
    } else {
      runInAction(() => { this.isFetchingNextPage = true; });
    }
    runInAction(() => { this.error = null; });

    try {
      const { data } = await flyerService.getFlyers({
        page: this.page,
        limit: this.limit,
        sort_by: sortBy,
        sort_dir: sortDir,
        ...(category ? { category } : {}),
        ...(templateType ? { template_type: templateType } : {}),
      });

      const newFlyers = Array.isArray(data.flyers) ? data.flyers : [];
      const pagination = data.pagination as FlyersPagination | undefined;

      if (!pagination) throw new Error('Invalid flyers pagination response from server');

      runInAction(() => {
        if (reset) {
          this.flyers = newFlyers as unknown as Flyer[];
        } else {
          const existingIds = new Set(this.flyers.map(f => String(f._id || f.id)));
          const uniqueNew = (newFlyers as unknown as Flyer[]).filter(
            f => !existingIds.has(String(f._id || f.id)),
          );
          this.flyers = [...this.flyers, ...uniqueNew];
        }

        const masterIds = new Set(this.allFlyers.map(f => String(f._id || f.id)));
        const newToMaster = (newFlyers as unknown as Flyer[]).filter(
          f => !masterIds.has(String(f._id || f.id)),
        );
        this.allFlyers = [...this.allFlyers, ...newToMaster];

        this.hasFetched = true;
        this.isLoading = false;
        this.isFetchingNextPage = false;
        this.currentPage = pagination.page;
        this.limit = pagination.limit;
        this.total = pagination.total;
        this.totalPages = pagination.totalPages;
        this.hasMore = pagination.hasMore;
        if (this.hasMore) this.page += 1;
      });
    } catch (err: any) {
      console.error('[FlyerStore] fetchFlyers error:', err);
      runInAction(() => {
        this.error = err.message ?? 'Unknown network error';
        this.isLoading = false;
        this.isFetchingNextPage = false;
      });
    }
  };

  fetchFlyersForCategoryTab = async ({
    categoryName,
    isRecentlyAdded = false,
    sortBy = 'created_at',
    sortDir = 'desc',
    limit = 15,
    templateType,
  }: FetchFlyersForCategoryTabOptions): Promise<Flyer[]> => {
    const requestKey = JSON.stringify({
      categoryName, isRecentlyAdded, sortBy, sortDir, limit,
      templateType: templateType || '',
    });
    const existingPromise = this.categoryTabFetchPromises.get(requestKey);
    if (existingPromise) return existingPromise;

    const localCached = this.getLocalFlyersForCategoryTab({
      categoryName, isRecentlyAdded, sortBy, sortDir, templateType,
    }).slice(0, limit);
    if (localCached.length >= limit) return localCached;

    const requestPromise = (async () => {
      const collected: Flyer[] = [];
      const seenIds = new Set<string>();
      let page = 1;
      let hasMore = true;
      const apiCategory = isRecentlyAdded ? undefined : categoryName;

      while (hasMore && collected.length < limit) {
        const { data } = await flyerService.getFlyers({
          page,
          limit,
          sort_by: sortBy,
          sort_dir: sortDir,
          ...(apiCategory ? { category: apiCategory } : {}),
          ...(templateType ? { template_type: templateType } : {}),
        });

        const pageFlyers = (Array.isArray(data.flyers) ? data.flyers : []) as unknown as Flyer[];
        const pagination = data.pagination;
        hasMore = Boolean(pagination?.hasMore);

        pageFlyers.forEach(flyer => {
          const flyerId = this.getFlyerId(flyer);
          if (seenIds.has(flyerId) || collected.length >= limit) return;
          seenIds.add(flyerId);
          collected.push(flyer);
        });

        if (!pagination) { hasMore = false; } else { page += 1; }
      }

      runInAction(() => {
        const existingIds = new Set(this.allFlyers.map(f => this.getFlyerId(f)));
        const newFlyers = collected.filter(f => !existingIds.has(this.getFlyerId(f)));
        if (newFlyers.length > 0) this.allFlyers = [...this.allFlyers, ...newFlyers];
      });
      void this.persistHomeCache();

      return collected;
    })();

    this.categoryTabFetchPromises.set(requestKey, requestPromise);
    try {
      return await requestPromise;
    } finally {
      this.categoryTabFetchPromises.delete(requestKey);
    }
  };

  fetchNextPageForSection = async ({
    categoryName,
    isRecentlyAdded,
    sortBy = 'created_at',
    sortDir = 'desc',
    page,
  }: {
    categoryName: string;
    isRecentlyAdded: boolean;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    page: number;
  }): Promise<{ flyers: Flyer[]; hasMore: boolean }> => {
    const apiCategory = isRecentlyAdded ? undefined : categoryName;
    const { data } = await flyerService.getFlyers({
      page,
      limit: 15,
      sort_by: sortBy,
      sort_dir: sortDir,
      ...(apiCategory ? { category: apiCategory } : {}),
    });

    const pageFlyers = (Array.isArray(data.flyers) ? data.flyers : []) as unknown as Flyer[];
    const hasMore = Boolean(data.pagination?.hasMore);

    runInAction(() => {
      const existingIds = new Set(this.allFlyers.map(f => this.getFlyerId(f)));
      const newFlyers = pageFlyers.filter(f => !existingIds.has(this.getFlyerId(f)));
      if (newFlyers.length > 0) this.allFlyers = [...this.allFlyers, ...newFlyers];
    });

    return { flyers: pageFlyers, hasMore };
  };

  resetPaginationState = () => {
    runInAction(() => {
      this.page = 1;
      this.currentPage = 0;
      this.total = 0;
      this.totalPages = 0;
      this.hasMore = true;
      this.isLoading = false;
      this.isFetchingNextPage = false;
      this.error = null;
    });
  };

  toggleFavourite(id: string): void {
    const flyer = this.flyers.find(f => String(f._id ?? f.id) === String(id));
    if (flyer) flyer.isFavorited = !flyer.isFavorited;
  }

  async addToFavorites(userId: string, flyerId: number) {
    if (!userId) throw new Error('User ID is required');
    try {
      const { data } = await favoritesService.addFavorite({
        user_id: userId,
        flyer_id: flyerId,
      });
      if (data.success) {
        runInAction(() => {
          if (!this.favorites.includes(String(flyerId))) {
            this.favorites.push(String(flyerId));
          }
          const updateFlyerFav = (f: Flyer) => {
            if (String(f._id ?? f.id) === String(flyerId)) f.isFavorited = true;
          };
          this.flyers.forEach(updateFlyerFav);
          this.allFlyers.forEach(updateFlyerFav);
          if (this.flyer && String(this.flyer._id ?? this.flyer.id) === String(flyerId)) {
            this.flyer.isFavorited = true;
          }
        });
        Toast.show({ type: 'success', text1: 'Added to favorites!' });
        return { success: true, message: data.message };
      }
      throw new Error(data.message || 'Failed to add to favorites');
    } catch (error: any) {
      runInAction(() => { this.error = error.message; });
      throw error;
    }
  }

  async removeFromFavorites(userId: string, flyerId: number) {
    if (!userId) throw new Error('User ID is required');
    try {
      const { data } = await favoritesService.removeFavorite({
        user_id: userId,
        flyer_id: flyerId,
      });
      if (data.success) {
        runInAction(() => {
          this.favorites = this.favorites.filter(id => id !== String(flyerId));
          this.favoritesData = this.favoritesData.filter(
            f => String(f._id ?? f.id) !== String(flyerId),
          );
          const clearFlyerFav = (f: Flyer) => {
            if (String(f._id ?? f.id) === String(flyerId)) f.isFavorited = false;
          };
          this.flyers.forEach(clearFlyerFav);
          this.allFlyers.forEach(clearFlyerFav);
          if (this.flyer && String(this.flyer._id ?? this.flyer.id) === String(flyerId)) {
            this.flyer.isFavorited = false;
          }
        });
        Toast.show({ type: 'success', text1: 'Removed from favorites' });
        return { success: true, message: data.message };
      }
      throw new Error(data.message || 'Failed to remove from favorites');
    } catch (error: any) {
      runInAction(() => { this.error = error.message; });
      throw error;
    }
  }

  async fetchFavorites(userId: string) {
    if (!userId) return;
    runInAction(() => { this.loading = true; this.error = null; });
    try {
      const { data } = await favoritesService.getFavorites(userId);
      if (data.success) {
        runInAction(() => {
          this.favoritesData = data.favorites as unknown as Flyer[];
          this.favorites = data.favorites.map(f => String(f.id));
          this.loading = false;
        });
      } else {
        throw new Error('Failed to fetch favorites');
      }
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
        this.favoritesData = [];
        this.favorites = [];
      });
    }
  }

  async fetchFlyer(id: string, refreshSimilar = true) {
    runInAction(() => {
      this.loading = true;
      this.resetForm();
    });
    try {
      const { data } = await flyerService.getFlyer(id);
      runInAction(() => {
        const rawPrice = data.price;
        const numericPrice = rawPrice
          ? Number(String(rawPrice).replace(/[^0-9.]/g, ''))
          : null;

        this.flyer = {
          ...data,
          name: data.title,
          image_url: data.image_url,
          price: numericPrice || 0,
        } as unknown as Flyer;

        if (numericPrice !== null && !Number.isNaN(numericPrice)) {
          this.basePrice = numericPrice;
        }

        this.flyerFormDetail.flyerId = data.id;
        this.flyerFormDetail.categoryId = data.categories?.[0] ?? this.flyerFormDetail.categoryId;

        if (refreshSimilar) this.fetchSimilarFlyers();
        this.loading = false;
      });
    } catch (err) {
      console.error('[FlyerStore] fetchFlyer error:', err);
      runInAction(() => { this.loading = false; });
    }
  }

  resetForm() {
    this.flyerFormDetail = { flyerId: null, categoryId: null };
    this.flyer = null;
    this.basePrice = 0;
  }

  fetchSimilarFlyers() {
    // Future: fetch `/flyers?category={flyerFormDetail.categoryId}&limit=6`
  }

  reset(): void {
    this.flyers = [];
    this.allFlyers = [];
    this.banners = [];
    this.error = null;
    this.bannerError = null;
    this.isLoading = false;
    this.isBannersLoading = false;
    this.isFetchingNextPage = false;
    this.page = 1;
    this.currentPage = 0;
    this.total = 0;
    this.totalPages = 0;
    this.hasMore = true;
    this.categories = [];
    this.bannersFetchPromise = null;
    this.categoryTabFetchPromises.clear();
    this.resetForm();
  }
}

export default FlyerStore;
