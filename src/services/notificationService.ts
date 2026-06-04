import apiClient from './apiClient';
import type { NotificationsResponse } from '../types/api';

export const getNotifications = () =>
  apiClient.get<NotificationsResponse>('/notifications');

export const markNotificationRead = (id: number) =>
  apiClient.patch(`/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  apiClient.patch('/notifications/read-all');

export const registerDeviceToken = (deviceToken: string, platform: 'ios' | 'android') =>
  apiClient.post('/notifications/device-token', { device_token: deviceToken, platform });
