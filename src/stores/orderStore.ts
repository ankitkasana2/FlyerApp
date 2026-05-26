import { makeAutoObservable, runInAction } from 'mobx';
import * as orderService from '../services/orderService';
import type { Order } from '../types/api';

class OrderStore {
  orders: Order[] = [];
  currentOrder: Order | null = null;
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
    });
    try {
      const { data } = await orderService.getOrder(orderId);
      runInAction(() => {
        this.currentOrder = data.success ? data.order : null;
        this.isLoadingDetail = false;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message;
        this.currentOrder = null;
        this.isLoadingDetail = false;
      });
    }
  };

  reset() {
    this.orders = [];
    this.currentOrder = null;
    this.isLoading = false;
    this.error = null;
  }
}

export default OrderStore;
