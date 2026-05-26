import { makeAutoObservable, runInAction } from 'mobx';
import * as cartService from '../services/cartService';
import type { AddToCartPayload, CartFileAttachments, CartItemRaw } from '../types/api';
import Toast from 'react-native-toast-message';

// Re-export so existing screen imports still work without changes
export type CartItem = CartItemRaw;
export type { AddToCartPayload, CartFileAttachments };

class CartStore {
  cartItems: CartItemRaw[] = [];
  isLoading: boolean = false;
  isAddingToCart: boolean = false;
  isRemoving: boolean = false;
  error: string | null = null;
  lastAddedCartItemId: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  addToCart = async (
    payload: AddToCartPayload,
    files?: CartFileAttachments,
  ): Promise<{ success: boolean; cartItemId?: number; message?: string }> => {
    runInAction(() => {
      this.isAddingToCart = true;
      this.error = null;
    });

    try {
      const { data } = await cartService.addToCart(payload, files);

      runInAction(() => {
        this.lastAddedCartItemId = data.cartItemId ?? null;
        this.isAddingToCart = false;
      });

      if (payload.user_id) {
        await this.load(payload.user_id);
      }

      Toast.show({ type: 'success', text1: 'Added to cart!' });
      return { success: true, cartItemId: data.cartItemId, message: data.message };
    } catch (err: any) {
      const msg = err?.message || 'Unknown error while adding to cart';
      runInAction(() => {
        this.error = msg;
        this.isAddingToCart = false;
      });
      return { success: false, message: msg };
    }
  };

  load = async (userId: string) => {
    if (!userId) return;
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });
    try {
      const { data } = await cartService.getCart(userId);
      runInAction(() => {
        if (data.success && Array.isArray(data.cart)) {
          this.cartItems = data.cart;
        } else {
          this.cartItems = [];
        }
        this.isLoading = false;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = 'Failed to load cart';
        this.cartItems = [];
        this.isLoading = false;
      });
    }
  };

  removeFromCart = async (cartItemId: number | string, userId: string) => {
    if (!userId) return;
    const previousItems = [...this.cartItems];

    runInAction(() => {
      this.isRemoving = true;
      this.cartItems = this.cartItems.filter(
        item => String(item.id) !== String(cartItemId),
      );
    });

    try {
      await cartService.removeCartItem(cartItemId, userId);
      runInAction(() => { this.isRemoving = false; });
      Toast.show({ type: 'success', text1: 'Item removed from cart' });
    } catch (err: any) {
      runInAction(() => {
        this.cartItems = previousItems;
        this.error = err?.message || 'Failed to remove item';
        this.isRemoving = false;
      });
    }
  };

  clearCart = async (userId: string) => {
    if (!userId) return;
    try {
      await cartService.clearCart(userId);
      runInAction(() => { this.cartItems = []; });
    } catch (err: any) {
      console.error('[CartStore] clearCart error:', err);
    }
  };

  reset() {
    this.cartItems = [];
    this.isLoading = false;
    this.isAddingToCart = false;
    this.error = null;
    this.lastAddedCartItemId = null;
  }

  get itemCount(): number {
    return this.cartItems.length;
  }

  get subtotal(): number {
    return this.cartItems.reduce(
      (sum, item) => sum + (item.total_price ? Number(item.total_price) : 0),
      0,
    );
  }
}

export default CartStore;
