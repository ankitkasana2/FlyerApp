import apiClient from './apiClient';
import type { NotificationsResponse } from '../types/api';

export const getNotifications = (page = 1, limit = 20) =>
  apiClient.get<NotificationsResponse>('/notifications', {
    params: { page, limit },
  });

export const markNotificationRead = (id: number) =>
  apiClient.patch(`/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  apiClient.patch('/notifications/read-all');

export const registerDeviceToken = (deviceToken: string, platform: 'ios' | 'android') =>
  apiClient.post('/notifications/device-token', { device_token: deviceToken, platform });
