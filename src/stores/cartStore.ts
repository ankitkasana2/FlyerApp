// src/stores/cartStore.ts
// MobX store for cart management — mirrors the backend addToCart controller.

import { makeAutoObservable, runInAction } from 'mobx';
import { getApiUrl } from '../services/api';
import type { PickedImage } from '../hooks/useImagePicker';
import Toast from 'react-native-toast-message';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Shape returned by GET /cart?user_id=xxx */
export interface CartItem {
  id: number;
  user_id: string;
  flyer_is: string | number;
  presenting: string;
  event_title: string;
  event_date: string | null;
  address_and_phone: string;
  flyer_info: string;
  delivery_time: string;
  custom_notes: string;
  email: string | null;
  story_size_version: boolean | number;
  custom_flyer: boolean | number;
  animated_flyer: boolean | number;
  instagram_post_size: boolean | number;
  total_price: number | null;
  added_time: string;
  status: 'active' | 'pending' | 'inactive';
  venue_logo: string | null;
  djs: string; // JSON string: [{ name, image }]
  host: string; // JSON string: { name, image }
  sponsors: string; // JSON string: [{ name, image }]
  // Optional fields joined from flyer table
  flyer_title?: string;
  flyer_image_url?: string;
  flyer?: {
    id: number;
    title: string;
    price: number;
    image: string;
    type: string;
    categories: any[];
  };
}

/** Payload sent to POST /cart */
export interface AddToCartPayload {
  user_id: string;
  flyer_is: string | number;
  presenting?: string;
  event_title?: string;
  event_date?: string;
  address_phone?: string;
  flyer_info?: string;
  delivery_time?: string;
  custom_notes?: string;
  email?: string;
  story_size_version?: boolean;
  custom_flyer?: boolean;
  animated_flyer?: boolean;
  instagram_post_size?: boolean;
  total_price?: number;
  djs?: Array<{ name: string }>;
  host?: { name: string };
  sponsors?: Array<{ name: string }>;
}

/** Optional file attachments for the cart item */
export interface CartFileAttachments {
  venueLogo?: PickedImage | null;
  sponsorImages?: (PickedImage | null)[];
  hostImage?: PickedImage | null;
  djImages?: (PickedImage | null)[];
}

// Helper: build a FormData file blob from a PickedImage
const toFileBlob = (img: PickedImage) => ({
  uri: img.uri,
  name: img.name,
  type: img.type,
});

// ─── Store ────────────────────────────────────────────────────────────────────

class CartStore {
  // ── State ──────────────────────────────────────────────────────────────────
  cartItems: CartItem[] = [];
  isLoading: boolean = false;
  isAddingToCart: boolean = false;
  isRemoving: boolean = false;
  error: string | null = null;
  lastAddedCartItemId: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * POST /cart
   * Sends all form fields as multipart/form-data so the backend can also
   * receive file uploads (venue_logo, dj_N, host_file, sponsor_N) in the future.
   */
  addToCart = async (
    payload: AddToCartPayload,
    files?: CartFileAttachments,
  ): Promise<{ success: boolean; cartItemId?: number; message?: string }> => {
    runInAction(() => {
      this.isAddingToCart = true;
      this.error = null;
    });

    try {
      const formData = new FormData();

      // Required fields
      formData.append('user_id', String(payload.user_id));
      formData.append('flyer_is', String(payload.flyer_is));

      // Optional text fields
      if (payload.presenting)     formData.append('presenting',    payload.presenting);
      if (payload.event_title)    formData.append('event_title',   payload.event_title);
      if (payload.event_date)     formData.append('event_date',    payload.event_date);
      if (payload.address_phone)  formData.append('address_phone', payload.address_phone);
      if (payload.flyer_info)     formData.append('flyer_info',    payload.flyer_info);
      if (payload.delivery_time)  formData.append('delivery_time', payload.delivery_time);
      if (payload.custom_notes)   formData.append('custom_notes',  payload.custom_notes);
      if (payload.email)          formData.append('email',         payload.email);
      if (payload.total_price !== undefined) {
        formData.append('total_price', String(payload.total_price));
      }

      // Boolean extras (backend toBool() handles '0'/'1' strings)
      formData.append('story_size_version', payload.story_size_version ? '1' : '0');
      formData.append('custom_flyer',       payload.custom_flyer       ? '1' : '0');
      formData.append('animated_flyer',     payload.animated_flyer     ? '1' : '0');
      formData.append('instagram_post_size',payload.instagram_post_size ? '1' : '0');

      // JSON fields — backend uses safeParse() on these
      formData.append('djs',      JSON.stringify(payload.djs ?? []));
      formData.append('host',     JSON.stringify(payload.host ?? { name: '' }));
      formData.append('sponsors', JSON.stringify(payload.sponsors ?? []));

      // ── File attachments ─────────────────────────────────────────────────
      if (files?.venueLogo) {
        formData.append('venue_logo', toFileBlob(files.venueLogo) as any);
      }

      if (files?.hostImage) {
        formData.append('host_file', toFileBlob(files.hostImage) as any);
      }

      if (files?.djImages) {
        files.djImages.forEach((img, i) => {
          if (img) formData.append(`dj_${i}`, toFileBlob(img) as any);
        });
      }

      if (files?.sponsorImages) {
        files.sponsorImages.forEach((img, i) => {
          if (img) formData.append(`sponsor_${i}`, toFileBlob(img) as any);
        });
      }

      const response = await fetch(getApiUrl('/cart/add'), {
        method: 'POST',
        body: formData,
        // Do NOT set Content-Type manually — fetch sets the boundary automatically
      });

      // Safely parse the response — server may return HTML on errors
      const rawText = await response.text();
      console.log('[CartStore] addToCart raw response:', rawText);

      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        console.error('[CartStore] Server returned non-JSON response:', rawText);
        throw new Error(`Server error (${response.status}): ${rawText.slice(0, 200)}`);
      }

      if (response.status === 200 || response.status === 201) {
        // 200 = already in cart, 201 = newly added
        runInAction(() => {
          this.lastAddedCartItemId = data.cartItemId ?? null;
          this.isAddingToCart = false;
        });

        // Refresh cart list after adding so count updates instantly
        if (payload.user_id) {
          await this.load(payload.user_id);
        }
   Toast.show({
      type: 'success',
      text1: 'Added to cart!',
    });
        return {
          success: true,
          cartItemId: data.cartItemId,
          message: data.message,
        };
      } else {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }
    } catch (err: any) {
      console.error('[CartStore] addToCart error:', err);
      const msg = err?.message || 'Unknown error while adding to cart';
      runInAction(() => {
        this.error = msg;
        this.isAddingToCart = false;
      });
      return { success: false, message: msg };
    }
  };

  /**
   * GET /cart/:userId
   * Fetches all active cart items for the given user.
   */
  load = async (userId: string) => {
    if (!userId) return;

    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });

    try {
      const url = getApiUrl(`/cart/${userId}`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Read text first to prevent JSON parse errors
      const rawText = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        console.error('[CartStore] Server returned non-JSON response for load:', rawText);
        throw new Error(`Server error (${response.status})`);
      }

      runInAction(() => {
        if (data.success && Array.isArray(data.cart)) {
          this.cartItems = data.cart;
        } else if (Array.isArray(data)) {
          this.cartItems = data;
        } else {
          this.cartItems = [];
        }
        this.isLoading = false;
      });
    } catch (err: any) {
      console.error('[CartStore] load error:', err);
      runInAction(() => {
        this.error = "Failed to load cart";
        this.cartItems = [];
        this.isLoading = false;
      });
    }
  };

  /**
   * DELETE /cart/remove/:id
   * Removes a cart item.
   */
  removeFromCart = async (cartItemId: number | string, userId: string) => {
    if (!userId) return;

    // Save previous state for rollback
    const previousItems = [...this.cartItems];

    // Optimistic removal so count updates instantly
    runInAction(() => {
      this.isRemoving = true;
      this.cartItems = this.cartItems.filter((item) => String(item.id) !== String(cartItemId));
    });

    try {
      const response = await fetch(getApiUrl(`/cart/remove/${cartItemId}`), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      runInAction(() => {
        this.isRemoving = false;
      });

      Toast.show({
        type: 'success',
        text1: 'Item removed from cart',
      });
    } catch (err: any) {
      console.error('[CartStore] removeFromCart error:', err);
      // Rollback on failure
      runInAction(() => {
        this.cartItems = previousItems;
        this.error = err?.message || 'Failed to remove item';
        this.isRemoving = false;
      });
    }
  };

  /** Clear all cart state (called on logout) */
  reset() {
    this.cartItems = [];
    this.isLoading = false;
    this.isAddingToCart = false;
    this.error = null;
    this.lastAddedCartItemId = null;
  }

  // ── Computed helpers ───────────────────────────────────────────────────────

  get itemCount(): number {
    return this.cartItems.length;
  }

  get subtotal(): number {
    return this.cartItems.reduce((sum, item) => {
      return sum + (item.total_price ? Number(item.total_price) : 0);
    }, 0);
  }
}

export default CartStore;
