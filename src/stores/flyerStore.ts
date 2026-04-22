// src/stores/flyerStore.ts
// MobX store for managing the flyer list fetched from the backend.

import { makeAutoObservable, runInAction } from 'mobx';
import { getApiUrl } from '../services/api';
import type { Flyer, Banner } from '../types/flyer';

class FlyerStore {
  // ─── State ────────────────────────────────────────────────────────────────
  flyers: Flyer[] = [];
  isLoading: boolean = false;
  isFetchingNextPage: boolean = false;
  error: string | null = null;
  hasFetched: boolean = false;

  // Banners state
  banners: Banner[] = [];
  isBannersLoading: boolean = false;
  bannerError: string | null = null;

  // Pagination state
  page: number = 1;
  limit: number = 20;
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

  /** 
   * Fetch flyers from GET /flyers with pagination and sorting.
   * @param reset If true, clears the current list and starts from page 1.
   * @param sortBy Property to sort by.
   * @param sortDir Direction of sort ('asc' or 'desc').
   */
  fetchFlyers = async (
    reset: boolean = false,
    sortBy: string = 'created_at',
    sortDir: 'asc' | 'desc' = 'desc'
  ) => {
    // Prevent overlapping requests
    if (this.isLoading || this.isFetchingNextPage) return;
    if (!reset && !this.hasMore) return;

    if (reset) {
      runInAction(() => {
        this.isLoading = true;
        this.page = 1;
        this.hasMore = true;
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
      const url = getApiUrl(`/flyers?page=${this.page}&limit=${this.limit}&sort_by=${sortBy}&sort_dir=${sortDir}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
        
      // Extract flyers array. Response format: { data: [...], pagination: {...} }
      const newFlyers = Array.isArray(data) ? data : (data.data || data.flyers || []);

      runInAction(() => {
        if (reset) {
          this.flyers = newFlyers;
        } else {
          this.flyers = [...this.flyers, ...newFlyers];
        }

        this.hasFetched = true;
        this.isLoading = false;
        this.isFetchingNextPage = false;

        // Use pagination metadata if available, otherwise fallback to item count check
        if (data.pagination) {
          this.hasMore = data.pagination.hasNextPage;
        } else {
          this.hasMore = newFlyers.length >= this.limit;
        }

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

  /** Toggle favourite flag locally (optimistic update) */
  toggleFavourite(id: string): void {
    const flyer = this.flyers.find((f) => String(f._id ?? f.id) === String(id));
    if (flyer) {
      flyer.isFavorited = !flyer.isFavorited;
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
    this.resetForm();
  }
}

export default FlyerStore;
