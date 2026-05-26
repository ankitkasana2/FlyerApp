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
