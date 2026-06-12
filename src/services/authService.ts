import apiClient from './apiClient';
import type {
  RegisterUserPayload,
  UpdateProfilePayload,
  ProfileResponse,
  ChangePasswordPayload,
} from '../types/api';

export const registerUser = (payload: RegisterUserPayload) =>
  apiClient.post<{ success: boolean; message: string; data: unknown }>(
    '/web/auth/register',
    payload,
  );

export const updateProfile = (payload: UpdateProfilePayload) =>
  apiClient.patch<ProfileResponse>('/web/auth/profile', payload);

export const changePassword = (payload: ChangePasswordPayload) =>
  apiClient.patch<ProfileResponse>('/web/auth/change-password', payload);

export const deleteAccount = () =>
  apiClient.delete<{ success: boolean; message: string }>('/mobile/auth/account');

export const checkEmailDeleted = (email: string) =>
  apiClient.get<{ deleted: boolean }>(`/mobile/auth/check-deleted?email=${encodeURIComponent(email)}`);

export const clearDeletedAccount = (email: string) =>
  apiClient.delete<{ success: boolean }>('/mobile/auth/deleted-account', { data: { email } });
