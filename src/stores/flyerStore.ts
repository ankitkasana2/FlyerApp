// src/stores/flyerStore.ts
// MobX store for managing the flyer list fetched from the backend.

import { makeAutoObservable, runInAction } from 'mobx';
import { getApiUrl } from '../services/api';
import type {
  Flyer,
  Banner,
  FavoritesResponse,
  GetFlyersResponse,
  FlyersPagination,
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

  // ─── Actions ──────────────────────────────────────────────────────────────

  /** Fetch banners for the hero slider */
  fetchBanners = async () => {
    runInAction(() => {
      this.isBannersLoading = true;
      this.bannerError = null;
    });

    try {
      const response = await fetch(getApiUrl('/banners'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        runInAction(() => {
          this.banners = data.data;
        });
      } else {
        throw new Error(data.message || 'Failed to fetch banners');
      }
    } catch (error: any) {
      console.error("fetchBanners Error:", error);
      runInAction(() => {
        this.bannerError = error instanceof Error ? error.message : 'An unknown error occurred';
      });
    } finally {
      runInAction(() => {
        this.isBannersLoading = false;
      });
    }
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
      const res = await fetch(getApiUrl(`/flyers/${id}`), {
        cache: "no-store",
      });

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
    this.error = null;
    this.isLoading = false;
    this.isFetchingNextPage = false;
    this.page = 1;
    this.currentPage = 0;
    this.total = 0;
    this.totalPages = 0;
    this.hasMore = true;
    this.resetForm();
  }
}

export default FlyerStore;
