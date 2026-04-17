// src/services/api.ts
// Uses react-native-config to read .env variables at runtime.
// All variables are defined in the root .env file (no PUBLIC_ prefix needed).

import Config from 'react-native-config';

import { Platform } from 'react-native';

// ─── Base URL ─────────────────────────────────────────────────────────────────
// Switch based on ENVIRONMENT variable (development vs production)
const isProd = Config.ENVIRONMENT === 'production';

// Falls back to the hardcoded URLs if the env variable is missing
const fallbackUrl = isProd ? 'https://grodify.com/api' : 'http://localhost:3007/api';
const selectedUrl = isProd ? Config.API_BASE_URL : Config.LOCAL_URL;
let baseUrl = selectedUrl || fallbackUrl;

// On Android, 'localhost' refers to the device itself. 
// We must use 10.0.2.2 to point to the host machine's localhost.
if (baseUrl.includes('localhost') && Platform.OS === 'android') {
  baseUrl = baseUrl.replace('localhost', '10.0.2.2');
}

export const API_BASE_URL = baseUrl.replace(/\/$/, '');
// ─── Helper ───────────────────────────────────────────────────────────────────
/**
 * Returns a fully-qualified API URL.
 * Safely deduplicates '/api' if it is already present in the base URL.
 *
 * Usage:
 *   getApiUrl('/auth/login')   → http://193.203.161.174:3007/auth/login
 *   getApiUrl()                → http://193.203.161.174:3007
 */
export const getApiUrl = (path = ''): string => {
  if (!path) return API_BASE_URL;

  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // Deduplicate /api prefix if base URL already ends with /api
  if (API_BASE_URL.endsWith('/api') && cleanPath.startsWith('/api/')) {
    return `${API_BASE_URL}${cleanPath.substring(4)}`;
  }

  return `${API_BASE_URL}${cleanPath}`;
};
