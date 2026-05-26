import apiClient from './apiClient';
import type { OrdersResponse, OrderDetailResponse } from '../types/api';

export const getUserOrders = (userId: string, limit?: number) =>
  apiClient.get<OrdersResponse>(`/orders/user/${userId}`, {
    params: limit ? { limit } : undefined,
  });

export const getOrder = (orderId: string) =>
  apiClient.get<OrderDetailResponse>(`/orders/${orderId}`);
