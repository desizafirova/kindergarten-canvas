/**
 * API Client with Axios
 * Configured with request/response interceptors for JWT authentication
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearTokens,
  isTokenExpiringSoon,
} from './auth';

// Create axios instance with base URL from environment
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3344',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers: {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}[] = [];

// Subscribe to token refresh with both resolve and reject callbacks
const subscribeTokenRefresh = (
  resolve: (token: string) => void,
  reject: (error: Error) => void
) => {
  refreshSubscribers.push({ resolve, reject });
};

// Notify all subscribers with new token
const onTokenRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((subscriber) => subscriber.resolve(newToken));
  refreshSubscribers = [];
};

// Notify all subscribers of refresh failure
const onRefreshFailed = (error: Error) => {
  refreshSubscribers.forEach((subscriber) => subscriber.reject(error));
  refreshSubscribers = [];
};

/**
 * Refresh the access token using the refresh token
 * @returns new access token or null if refresh failed
 */
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    // Use axios directly to avoid interceptor loops
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL || 'http://localhost:3344'}/api/client/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (response.data.success && response.data.content?.accessToken) {
      const newAccessToken = response.data.content.accessToken;
      setAccessToken(newAccessToken);
      return newAccessToken;
    }
    return null;
  } catch {
    // Refresh failed - clear tokens
    clearTokens();
    return null;
  }
};

/**
 * Request Interceptor
 * - Attaches Bearer token to requests
 * - Proactively refreshes token if expiring soon
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token = getAccessToken();

    // Proactive token refresh if expiring soon (< 5 minutes)
    if (token && isTokenExpiringSoon(token)) {
      if (!isRefreshing) {
        isRefreshing = true;
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        if (newToken) {
          token = newToken;
          onTokenRefreshed(newToken);
        } else {
          onRefreshFailed(new Error('Token refresh failed'));
          // Token refresh failed - request will proceed without token
          // AuthContext will detect cleared tokens and redirect
          token = null;
        }
      } else {
        // Wait for the ongoing refresh to complete
        try {
          token = await new Promise<string>((resolve, reject) => {
            subscribeTokenRefresh(resolve, reject);
          });
        } catch {
          // Refresh failed - proceed without token
          token = null;
        }
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * - Handles 401 errors by attempting token refresh
 * - Retries original request with new token
 * - Redirects to login if refresh fails
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        const newToken = await refreshAccessToken();
        isRefreshing = false;

        if (newToken) {
          onTokenRefreshed(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          onRefreshFailed(new Error('Token refresh failed'));
          // Tokens cleared by refreshAccessToken - AuthContext will detect and redirect
          return Promise.reject(error);
        }
      } else {
        // Wait for the ongoing refresh
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(
            (newToken: string) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(api(originalRequest));
            },
            () => {
              // Refresh failed - reject with original error
              reject(error);
            }
          );
        });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
