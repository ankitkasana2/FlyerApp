// Singleton that holds the active access token in memory.
// The authStore writes here after login/logout; apiClient reads here on every request.
// This breaks the circular dependency between authStore ↔ apiClient.

let _accessToken: string | null = null;

export const getAccessToken = (): string | null => _accessToken;

export const setAccessToken = (token: string | null): void => {
  _accessToken = token;
};
