import apiClient from './apiClient';
import type {
  MediaListResponse,
  UploadMediaResponse,
  RenameMediaPayload,
  SetMediaTypePayload,
  MediaActionResponse,
} from '../types/api';

export const listMedia = (userId: string) =>
  apiClient.get<MediaListResponse>(`/user-media/${userId}`, {
    params: { _t: Date.now() },
  });

export const uploadMedia = (
  userId: string,
  file: { uri: string; name: string; type: string },
) => {
  const formData = new FormData();
  formData.append('web_user_id', userId);
  formData.append('file', file as any);
  return apiClient.post<UploadMediaResponse>('/user-media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteMedia = (mediaId: number, userId: string) =>
  apiClient.delete<MediaActionResponse>(`/user-media/${mediaId}`, {
    data: { web_user_id: userId },
  });

export const renameMedia = (mediaId: number, payload: RenameMediaPayload) =>
  apiClient.patch<MediaActionResponse>(
    `/user-media/${mediaId}/rename`,
    payload,
  );

export const replaceMedia = (
  mediaId: number,
  userId: string,
  file: { uri: string; name: string; type: string },
) => {
  const formData = new FormData();
  formData.append('web_user_id', userId);
  formData.append('file', file as any);
  return apiClient.patch<MediaActionResponse>(
    `/user-media/${mediaId}/replace`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
};

export const setMediaAsLogo = (
  mediaId: number,
  payload: SetMediaTypePayload,
) =>
  apiClient.patch<MediaActionResponse>(
    `/user-media/${mediaId}/set-logo`,
    payload,
  );

export const setMediaAsImage = (
  mediaId: number,
  payload: SetMediaTypePayload,
) =>
  apiClient.patch<MediaActionResponse>(
    `/user-media/${mediaId}/set-image`,
    payload,
  );
