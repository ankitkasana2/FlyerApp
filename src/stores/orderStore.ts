import { makeAutoObservable, runInAction } from 'mobx';
import * as orderService from '../services/orderService';
import type { Order } from '../types/api';

class OrderStore {
  orders: Order[] = [];
  currentOrder: Order | null = null;
  currentOrderId: string | null = null;
  isLoading = false;
  isLoadingDetail = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  fetchUserOrders = async (userId: string, limit?: number) => {
    if (!userId) return;
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });
    try {
      const { data } = await orderService.getUserOrders(userId, limit);
      runInAction(() => {
        this.orders = data.success ? data.orders : [];
        this.isLoading = false;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message;
        this.orders = [];
        this.isLoading = false;
      });
    }
  };

  fetchOrder = async (orderId: string) => {
    runInAction(() => {
      this.isLoadingDetail = true;
      this.error = null;
      this.currentOrderId = orderId;
      // Clear so the details screen never shows the previous order while loading.
      this.currentOrder = null;
    });
    try {
      const { data } = await orderService.getOrder(orderId);
      runInAction(() => {
        // Ignore stale responses (e.g. user tapped a different order quickly).
        if (this.currentOrderId !== orderId) return;
        this.currentOrder = data.success ? data.order : null;
        this.isLoadingDetail = false;
      });
    } catch (err: any) {
      runInAction(() => {
        if (this.currentOrderId !== orderId) return;
        this.error = err.message;
        this.currentOrder = null;
        this.isLoadingDetail = false;
      });
    }
  };

  reset() {
    this.orders = [];
    this.currentOrder = null;
    this.currentOrderId = null;
    this.isLoading = false;
    this.error = null;
  }
}

export default OrderStore;
