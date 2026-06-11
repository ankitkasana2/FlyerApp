import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './api';
import { getAccessToken } from './tokenStore';

const buildClient = (baseURL: string) =>
  axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15_000,
  });

const attachInterceptors = (client: ReturnType<typeof buildClient>) => {
  // Attach the auth token before every request
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Normalize error messages so callers always get a plain Error
  client.interceptors.response.use(
    response => response,
    error => {
      const message =
        error.response?.data?.message ??
        error.response?.data?.error ??
        error.message ??
        'Network error';
      return Promise.reject(new Error(message));
    },
  );

  return client;
};

const apiClient = attachInterceptors(
  buildClient(API_BASE_URL),
);

export const createApiClient = (baseURL: string) =>
  attachInterceptors(buildClient(baseURL));

export default apiClient;
