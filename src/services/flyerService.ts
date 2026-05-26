import apiClient from './apiClient';
import type {
  BannersResponse,
  CategoriesResponse,
  FlyersResponse,
  FlyerItem,
  GetFlyersParams,
} from '../types/api';

export const getBanners = () =>
  apiClient.get<BannersResponse>('/banners', {
    params: { active_only: true },
  });

export const getCategories = () =>
  apiClient.get<CategoriesResponse>('/categories');

export const getFlyers = (params: GetFlyersParams = {}) =>
  apiClient.get<FlyersResponse>('/flyers', { params });

export const getFlyer = (id: string | number) =>
  apiClient.get<FlyerItem>(`/flyers/${id}`);
