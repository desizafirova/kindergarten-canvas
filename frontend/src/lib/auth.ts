/**
 * JWT Token Storage Utilities
 * Manages accessToken and refreshToken in localStorage
 */

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Access Token functions
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setAccessToken = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const removeAccessToken = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

// Refresh Token functions
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const removeRefreshToken = (): void => {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Clear all tokens
export const clearTokens = (): void => {
  removeAccessToken();
  removeRefreshToken();
};

/**
 * Decode JWT and get expiration timestamp
 * @param token - JWT token string
 * @returns expiration timestamp in milliseconds, or null if invalid
 */
export const getTokenExpiry = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp) {
      return payload.exp * 1000; // Convert to milliseconds
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Check if token expires within threshold
 * @param token - JWT token string
 * @param thresholdMinutes - Minutes before expiry to consider "expiring soon" (default: 5)
 * @returns true if token expires within threshold, false otherwise
 */
export const isTokenExpiringSoon = (token: string, thresholdMinutes = 5): boolean => {
  const expiry = getTokenExpiry(token);
  if (!expiry) {
    return true; // Treat as expired if can't parse
  }
  const now = Date.now();
  const threshold = thresholdMinutes * 60 * 1000;
  return expiry - now < threshold;
};

/**
 * Check if token is expired
 * @param token - JWT token string
 * @returns true if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const expiry = getTokenExpiry(token);
  if (!expiry) {
    return true;
  }
  return Date.now() >= expiry;
};
