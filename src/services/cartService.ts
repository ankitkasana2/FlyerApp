import apiClient from './apiClient';
import type {
  CartResponse,
  AddToCartPayload,
  AddToCartResponse,
  CartFileAttachments,
} from '../types/api';

const toFileBlob = (img: { uri: string; name: string; type: string }) => ({
  uri: img.uri,
  name: img.name,
  type: img.type,
});

// Appends either a local file blob or a server URL string for a given field.
const appendImage = (
  formData: FormData,
  key: string,
  img: { uri: string; name: string; type: string; serverUrl?: string },
) => {
  if (img.serverUrl) {
    formData.append(`${key}_url`, img.serverUrl);
  } else {
    formData.append(key, toFileBlob(img) as any);
  }
};

export const getCart = (userId: string) =>
  apiClient.get<CartResponse>(`/cart/${userId}`);

export const removeCartItem = (cartItemId: number | string, userId: string) =>
  apiClient.delete<{ success: boolean }>(`/cart/remove/${cartItemId}`, {
    data: { user_id: userId },
  });

export const clearCart = (userId: string) =>
  apiClient.delete<{ success: boolean }>(`/cart/clear/${userId}`);

export const addToCart = (
  payload: AddToCartPayload,
  files?: CartFileAttachments,
) => {
  const formData = new FormData();

  formData.append('user_id', String(payload.user_id));
  formData.append('flyer_is', String(payload.flyer_is));

  if (payload.presenting)    formData.append('presenting',    payload.presenting);
  if (payload.event_title)   formData.append('event_title',   payload.event_title);
  if (payload.event_date)    formData.append('event_date',    payload.event_date);
  if (payload.address_phone) formData.append('address_phone', payload.address_phone);
  if (payload.flyer_info)    formData.append('flyer_info',    payload.flyer_info);
  if (payload.delivery_time) formData.append('delivery_time', payload.delivery_time);
  if (payload.custom_notes)  formData.append('custom_notes',  payload.custom_notes);
  if (payload.email)         formData.append('email',         payload.email);
  if (payload.total_price !== undefined) {
    formData.append('total_price', String(payload.total_price));
  }

  // Backend toBool() handles '0'/'1' strings
  formData.append('story_size_version', payload.story_size_version  ? '1' : '0');
  formData.append('custom_flyer',       payload.custom_flyer        ? '1' : '0');
  formData.append('animated_flyer',     payload.animated_flyer      ? '1' : '0');
  formData.append('instagram_post_size',payload.instagram_post_size  ? '1' : '0');

  // Backend uses safeParse() on these JSON strings
  formData.append('djs',      JSON.stringify(payload.djs      ?? []));
  formData.append('host',     JSON.stringify(payload.host     ?? { name: '' }));
  formData.append('sponsors', JSON.stringify(payload.sponsors ?? []));

  if (files?.venueLogo)  appendImage(formData, 'venue_logo', files.venueLogo);
  if (files?.hostImage)  appendImage(formData, 'host_file',  files.hostImage);
  files?.djImages?.forEach((img, i) => {
    if (img) appendImage(formData, `dj_${i}`, img);
  });
  files?.sponsorImages?.forEach((img, i) => {
    if (img) appendImage(formData, `sponsor_${i}`, img);
  });

  return apiClient.post<AddToCartResponse>('/cart/add', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
