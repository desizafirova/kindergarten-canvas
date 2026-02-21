/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import api from '@/lib/api';
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearTokens,
  isTokenExpired,
} from '@/lib/auth';

// User type from backend
interface User {
  id: number;
  email: string;
  role: 'ADMIN' | 'DEVELOPER';
}

// Auth context state
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

// Create context with default values
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  login: async () => ({ success: false, message: '' }),
  logout: async () => {},
  refreshToken: async () => false,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Check for existing token on mount and validate
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = getAccessToken();
      const refreshTokenValue = getRefreshToken();

      if (accessToken && !isTokenExpired(accessToken)) {
        // Token exists and is valid - decode user info
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          setUser({
            id: payload.userId,
            email: payload.email,
            role: payload.role,
          });
          setIsAuthenticated(true);
        } catch {
          // Invalid token format
          clearTokens();
        }
      } else if (refreshTokenValue && !isTokenExpired(refreshTokenValue)) {
        // Try to refresh the token
        const success = await refreshTokenInternal();
        if (!success) {
          clearTokens();
        }
      } else {
        // No valid tokens
        clearTokens();
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Internal function to refresh token
   */
  const refreshTokenInternal = async (): Promise<boolean> => {
    const refreshTokenValue = getRefreshToken();
    if (!refreshTokenValue) {
      return false;
    }

    try {
      // Use fetch directly to avoid circular dependency with api interceptors
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3344'}/api/client/auth/refresh`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: refreshTokenValue }),
        }
      );

      const data = await response.json();

      if (data.success && data.content?.accessToken) {
        const newAccessToken = data.content.accessToken;
        setAccessToken(newAccessToken);

        // Decode user from new token
        const payload = JSON.parse(atob(newAccessToken.split('.')[1]));
        setUser({
          id: payload.userId,
          email: payload.email,
          role: payload.role,
        });
        setIsAuthenticated(true);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  };

  /**
   * Login with email and password
   */
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post('/api/client/auth/login', { email, password });
      const data = response.data;

      if (data.success && data.content) {
        // Store tokens
        setAccessToken(data.content.accessToken);
        setRefreshToken(data.content.refreshToken);

        // Set user state
        setUser(data.content.user);
        setIsAuthenticated(true);

        return { success: true, message: data.message };
      }

      return { success: false, message: data.message || 'Login failed' };
    } catch (error: unknown) {
      // Handle axios error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        const message = axiosError.response?.data?.message || 'Невалиден имейл или парола';
        return { success: false, message };
      }
      return { success: false, message: 'Невалиден имейл или парола' };
    }
  }, []);

  /**
   * Logout - clear tokens and call backend
   */
  const logout = useCallback(async (): Promise<void> => {
    const refreshTokenValue = getRefreshToken();

    try {
      // Call backend logout if we have a refresh token
      if (refreshTokenValue) {
        await api.post('/api/client/auth/logout', { refreshToken: refreshTokenValue });
      }
    } catch {
      // Ignore logout errors - we'll clear tokens anyway
    }

    // Clear local state and tokens
    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  /**
   * Refresh token - exposed for manual refresh
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    return refreshTokenInternal();
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
