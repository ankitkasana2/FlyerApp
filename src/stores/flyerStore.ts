// src/stores/flyerStore.ts
// MobX store for managing the flyer list fetched from the backend.

import { makeAutoObservable, runInAction } from 'mobx';
import { API_BASE_URL, getApiUrl } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  allFlyers: Flyer[] = []; // Persistent cache for all flyers fetched so far
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

  // Banners state
  banners: Banner[] = [];
  isBannersLoading: boolean = false;
  bannerError: string | null = null;
  private bannersFetchPromise: Promise<Banner[]> | null = null;
  private categoryTabFetchPromises = new Map<string, Promise<Flyer[]>>();
  private homeCacheHydrationPromise: Promise<void> | null = null;
  private readonly HOME_CACHE_KEY = '@home_cache_v1';

  // Categories state
  categories: any[] = [];
  isCategoriesLoading: boolean = false;

  // Pagination state
  page: number = 1;
  limit: number = 20;
  currentPage: number = 0;
  total: number = 0;
  totalPages: number = 0;
  hasMore: boolean = true;

  // Single flyer state
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

  private normalizeBannerImageUrl = (value?: string | null) => {
    if (!value || typeof value !== 'string') {
      return '';
    }

    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }

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
    if (this.homeCacheHydrationPromise) {
      return this.homeCacheHydrationPromise;
    }

    this.homeCacheHydrationPromise = (async () => {
      try {
        const raw = await AsyncStorage.getItem(this.HOME_CACHE_KEY);
        if (!raw) {
          return;
        }

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

          if (Array.isArray(parsed?.allFlyers) && this.allFlyers.length === 0) {
            this.allFlyers = parsed.allFlyers;
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
      await AsyncStorage.setItem(
        this.HOME_CACHE_KEY,
        JSON.stringify({
          banners: this.banners,
          categories: this.categories,
          allFlyers: this.allFlyers,
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
      {
        id: 'recently_added',
        name: 'Recently Added',
        label: 'RECENTLY ADDED',
      },
    ];

    const seenLabels = new Set(tabs.map(tab => tab.label));

    this.categories.forEach(category => {
      const name = String(category.name ?? category.label ?? '').trim();
      if (!name) {
        return;
      }

      const label = name.toUpperCase();
      if (seenLabels.has(label)) {
        return;
      }

      tabs.push({
        id: String(category._id ?? category.id ?? name),
        name,
        label,
      });
      seenLabels.add(label);
    });

    return tabs;
  }

  private getFlyerId = (flyer: Flyer) => String(flyer._id ?? flyer.id);

  private getNormalizedCategories = (flyer: Flyer): string[] => {
    const categoryValues = [
      flyer.category,
      ...(Array.isArray(flyer.categories) ? flyer.categories : []),
    ];

    return categoryValues
      .map(value => String(value ?? '').trim())
      .filter(Boolean);
  };

  private dedupeFlyers = (flyers: Flyer[]): Flyer[] => {
    const seen = new Set<string>();
    return flyers.filter(flyer => {
      const id = this.getFlyerId(flyer);
      if (seen.has(id)) {
        return false;
      }
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
        const diff =
          this.getCreatedTimestamp(left.flyer) - this.getCreatedTimestamp(right.flyer);
        if (diff !== 0) {
          return sortDir === 'asc' ? diff : -diff;
        }
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
    if (!normalizedTarget) {
      return [];
    }

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
        const categories = (flyer.categories || []).map(category => String(category).toLowerCase());
        return primary === categoryLower || categories.includes(categoryLower);
      });
    }

    if (templateType) {
      const selectedTemplates = templateType
        .split(',')
        .map(value => value.trim())
        .filter(Boolean);
      if (selectedTemplates.length > 0) {
        result = result.filter(flyer =>
          selectedTemplates.includes(String(flyer.template_type)),
        );
      }
    }

    return this.sortFlyersForCategoryTab(
      isRecentlyAdded ? [...this.recentlyAdded] : result,
      sortBy,
      sortDir,
    );
  };

  // ─── Actions ──────────────────────────────────────────────────────────────

  /** Fetch banners for the hero slider */
  fetchBanners = async () => {
    if (this.bannersFetchPromise) {
      return this.bannersFetchPromise;
    }

    if (this.banners.length > 0) {
      return this.banners;
    }

    runInAction(() => {
      this.isBannersLoading = true;
      this.bannerError = null;
    });

    this.bannersFetchPromise = (async () => {
      try {
        const response = await fetch(getApiUrl('/banners?active_only=true'), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          runInAction(() => {
            this.banners = Array.isArray(data.data)
              ? data.data.map((banner: Banner) => ({
                  ...banner,
                  image_url: this.normalizeBannerImageUrl(banner.image_url),
                }))
              : [];
          });
          void this.persistHomeCache();
          return this.banners;
        }

        throw new Error(data.message || 'Failed to fetch banners');
      } catch (error: any) {
        console.error("fetchBanners Error:", error);
        runInAction(() => {
          this.bannerError = error instanceof Error ? error.message : 'An unknown error occurred';
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

  /** Fetch categories for the tabs */
  fetchCategories = async () => {
    runInAction(() => {
      this.isCategoriesLoading = true;
    });

    try {
      const res = await fetch(getApiUrl('/categories'));
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        // Sort by rank ascending (1, 2, 3...)
        runInAction(() => {
          this.categories = data.categories.sort((a: any, b: any) => a.rank - b.rank);
        });
        void this.persistHomeCache();
      }
    } catch (error) {
      console.error('fetchCategories Error:', error);
    } finally {
      runInAction(() => {
        this.isCategoriesLoading = false;
      });
    }
  };

  /** 
   * Fetch flyers from GET /flyers with pagination and sorting.
   * @param reset If true, clears the current list and starts from page 1.
   * @param sortBy Property to sort by.
   * @param sortDir Direction of sort ('asc' or 'desc').
   */
  fetchFlyers = async (
    reset: boolean = false,
    sortBy: string = 'created_at',
    sortDir: 'asc' | 'desc' = 'desc',
    category?: string,
    templateType?: string
  ) => {
    // Prevent overlapping requests
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
      runInAction(() => {
        this.isFetchingNextPage = true;
      });
    }
    
    runInAction(() => {
      this.error = null;
    });

    try {
      const params = new URLSearchParams();
      params.set('page', String(this.page));
      params.set('limit', String(this.limit));
      params.set('sort_by', sortBy);
      params.set('sort_dir', sortDir);
      if (category) {
        params.set('category', category);
      }
      if (templateType) {
        params.set('template_type', templateType);
      }

      const url = getApiUrl(`/flyers?${params.toString()}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = (await response.json()) as Partial<GetFlyersResponse> & {
        data?: Flyer[];
      };
      const hasValidFlyers = Array.isArray(data.flyers);
      const hasValidPagination =
        !!data.pagination &&
        typeof data.pagination.page === 'number' &&
        typeof data.pagination.limit === 'number' &&
        typeof data.pagination.total === 'number' &&
        typeof data.pagination.totalPages === 'number' &&
        typeof data.pagination.hasMore === 'boolean';

      const newFlyers: Flyer[] = hasValidFlyers
        ? data.flyers!
        : Array.isArray(data.data)
        ? data.data
        : [];

      if (!hasValidPagination) {
        throw new Error('Invalid flyers pagination response from server');
      }

      const pagination: FlyersPagination = data.pagination!;

      runInAction(() => {
        if (reset) {
          this.flyers = newFlyers;
        } else {
          // Append only new flyers that aren't already in the list
          const existingIds = new Set(this.flyers.map(f => String(f._id || f.id)));
          const uniqueNewFlyers = newFlyers.filter(f => !existingIds.has(String(f._id || f.id)));
          this.flyers = [...this.flyers, ...uniqueNewFlyers];
        }

        // Update master cache
        const masterIds = new Set(this.allFlyers.map(f => String(f._id || f.id)));
        const newToMaster = newFlyers.filter(f => !masterIds.has(String(f._id || f.id)));
        this.allFlyers = [...this.allFlyers, ...newToMaster];

        this.hasFetched = true;
        this.isLoading = false;
        this.isFetchingNextPage = false;

        this.currentPage = pagination.page;
        this.limit = pagination.limit;
        this.total = pagination.total;
        this.totalPages = pagination.totalPages;
        this.hasMore = pagination.hasMore;

        if (this.hasMore) {
          this.page += 1;
        }
      });

    } catch (err: any) {
      console.error("fetchFlyers Error:", err);
      runInAction(() => {
        this.error = err.message || "Unknown network error";
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
      categoryName,
      isRecentlyAdded,
      sortBy,
      sortDir,
      limit,
      templateType: templateType || '',
    });
    const existingPromise = this.categoryTabFetchPromises.get(requestKey);
    if (existingPromise) {
      return existingPromise;
    }

    const localCached = this.getLocalFlyersForCategoryTab({
      categoryName,
      isRecentlyAdded,
      sortBy,
      sortDir,
      templateType,
    }).slice(0, limit);

    if (localCached.length >= limit) {
      return localCached;
    }

    const requestPromise = (async () => {
    const collected: Flyer[] = [];
    const seenIds = new Set<string>();
    let page = 1;
    let hasMore = true;
    const apiCategory = isRecentlyAdded ? undefined : categoryName;

    while (hasMore && collected.length < limit) {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      params.set('sort_by', sortBy);
      params.set('sort_dir', sortDir);

      if (apiCategory) {
        params.set('category', apiCategory);
      }
      if (templateType) {
        params.set('template_type', templateType);
      }

      const response = await fetch(getApiUrl(`/flyers?${params.toString()}`));
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = (await response.json()) as Partial<GetFlyersResponse> & {
        data?: Flyer[];
      };

      const pageFlyers: Flyer[] = Array.isArray(data.flyers)
        ? data.flyers
        : Array.isArray(data.data)
        ? data.data
        : [];

      const pagination = data.pagination;
      hasMore = Boolean(pagination?.hasMore);

      pageFlyers.forEach(flyer => {
        const flyerId = this.getFlyerId(flyer);
        if (seenIds.has(flyerId) || collected.length >= limit) {
          return;
        }
        seenIds.add(flyerId);
        collected.push(flyer);
      });

      if (!pagination) {
        hasMore = false;
      } else {
        page += 1;
      }
    }

      runInAction(() => {
        const existingIds = new Set(this.allFlyers.map(flyer => this.getFlyerId(flyer)));
        const newFlyers = collected.filter(flyer => !existingIds.has(this.getFlyerId(flyer)));
        if (newFlyers.length > 0) {
          this.allFlyers = [...this.allFlyers, ...newFlyers];
        }
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

  /** Reset pagination counters without touching current list content */
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


  /** Toggle favourite flag locally (optimistic update) */
  toggleFavourite(id: string): void {
    const flyer = this.flyers.find((f) => String(f._id ?? f.id) === String(id));
    if (flyer) {
      flyer.isFavorited = !flyer.isFavorited;
    }
  }

  async addToFavorites(userId: string, flyerId: number) {
    if (!userId) {
      throw new Error("User ID is required")
    }

    try {
      const response = await fetch(getApiUrl("/favorites/add"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          flyer_id: flyerId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        runInAction(() => {
          // Add to local favorites array
          if (!this.favorites.includes(String(flyerId))) {
            this.favorites.push(String(flyerId))
          }
          // Also toggle locally in flyers list so UI updates immediately
          const flyer = this.flyers.find((f) => String(f._id ?? f.id) === String(flyerId));
          if (flyer) {
            flyer.isFavorited = true;
          }

          // Update single flyer object if it's the one currently being viewed
          if (this.flyer && String(this.flyer._id ?? this.flyer.id) === String(flyerId)) {
            this.flyer.isFavorited = true;
          }
        })
        return { success: true, message: data.message }
      } else {
        throw new Error(data.message || "Failed to add to favorites")
      }
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message
      })
      throw error
    }
  }
  async fetchFavorites(userId: string) {
    if (!userId) {
      return
    }

    runInAction(() => {
      this.loading = true
      this.error = null
    })

    try {
      const response = await fetch(getApiUrl(`/favorites/user/${userId}`), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data: FavoritesResponse = await response.json()

      if (data.success) {
        runInAction(() => {
          this.favoritesData = data.favorites
          this.favorites = data.favorites.map(f => String(f._id ?? f.id))
          this.loading = false
        })
      } else {
        throw new Error("Failed to fetch favorites")
      }
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message
        this.loading = false
        this.favoritesData = []
        this.favorites = []
      })
    }
  }


  /** Fetch a specific flyer by ID */
  async fetchFlyer(id: string, refreshSimilar = true) {
    runInAction(() => {
      this.loading = true;
      this.resetForm(); // Reset form when fetching a new flyer
    });
    try {
      const res = await fetch(getApiUrl(`/flyers/${id}`));

      const data = await res.json();

      runInAction(() => {
        // FIX PRICE
        const rawPrice = data.price;
        const numericPrice = rawPrice
          ? Number(String(rawPrice).replace(/[^0-9.]/g, ""))
          : null;

        this.flyer = {
          ...data,
          name: data.title, // FIX NAME
          image_url: data.image_url, // FIX IMAGE
          price: numericPrice || 0, // Store parsed numeric price
        };

        if (numericPrice !== null && !Number.isNaN(numericPrice)) {
          this.basePrice = numericPrice;
        }

        // FIX FLYER ID
        this.flyerFormDetail.flyerId = data.id;

        // FIX CATEGORY
        this.flyerFormDetail.categoryId =
          data.categories?.[0] ?? this.flyerFormDetail.categoryId;

        // Fetch similar flyers only if requested
        if (refreshSimilar) {
          this.fetchSimilarFlyers();
        }
        this.loading = false;
      });
    } catch (err) {
      console.error("fetchFlyer Error:", err);
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  /** Reset the flyer form detail */
  resetForm() {
    this.flyerFormDetail = {
      flyerId: null,
      categoryId: null,
    };
    this.flyer = null;
    this.basePrice = 0;
  }

  /** Placeholder for fetching similar flyers */
  fetchSimilarFlyers() {
    console.log("Fetching similar flyers for category:", this.flyerFormDetail.categoryId);
    // Implementation can be added here later
  }

  /** Clear the list (e.g. on logout) */
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
