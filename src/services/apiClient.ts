import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './api';
import { getAccessToken } from './tokenStore';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// Attach the auth token before every request
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize error messages so callers always get a plain Error
apiClient.interceptors.response.use(
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

export default apiClient;
