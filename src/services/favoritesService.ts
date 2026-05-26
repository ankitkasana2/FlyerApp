import apiClient from './apiClient';
import type {
  FavoritesResponse,
  FavoritePayload,
  FavoriteActionResponse,
} from '../types/api';

export const getFavorites = (userId: string) =>
  apiClient.get<FavoritesResponse>(`/favorites/user/${userId}`);

export const addFavorite = (payload: FavoritePayload) =>
  apiClient.post<FavoriteActionResponse>('/favorites/add', payload);

export const removeFavorite = (payload: FavoritePayload) =>
  apiClient.post<FavoriteActionResponse>('/favorites/remove', payload);
