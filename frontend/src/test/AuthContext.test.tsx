/**
 * AuthContext Tests
 * Tests for authentication context including logout functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, AuthContext } from '@/contexts/AuthContext';
import { useContext } from 'react';
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearTokens,
} from '@/lib/auth';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock api module
vi.mock('@/lib/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

// Create a valid JWT token for testing
const createTestToken = (expiresInMinutes: number): string => {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInMinutes * 60;
  const payload = { userId: 1, email: 'test@test.com', role: 'ADMIN', exp };
  const encodedPayload = btoa(JSON.stringify(payload));
  return `header.${encodedPayload}.signature`;
};

// Test component that uses AuthContext
const TestConsumer = () => {
  const { isAuthenticated, user, logout, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</span>
      <span data-testid="user-email">{user?.email || 'no-user'}</span>
      <button onClick={logout} data-testid="logout-btn">Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  describe('Logout Functionality', () => {
    it('should clear tokens when logout is called', async () => {
      // Setup: Store tokens in localStorage
      const accessToken = createTestToken(60);
      const refreshToken = createTestToken(60 * 24 * 7);
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);

      // Mock the logout API call
      const api = await import('@/lib/api');
      vi.mocked(api.default.post).mockResolvedValue({ data: { success: true } });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      // Wait for initial auth check to complete
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });

      // Verify tokens exist before logout
      expect(getAccessToken()).toBe(accessToken);
      expect(getRefreshToken()).toBe(refreshToken);

      // Click logout button
      const logoutBtn = screen.getByTestId('logout-btn');
      await userEvent.click(logoutBtn);

      // Verify tokens are cleared after logout
      await waitFor(() => {
        expect(getAccessToken()).toBeNull();
        expect(getRefreshToken()).toBeNull();
      });

      // Verify auth state is updated
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
        expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
      });
    });

    it('should clear tokens even if logout API call fails', async () => {
      // Setup: Store tokens
      const accessToken = createTestToken(60);
      const refreshToken = createTestToken(60 * 24 * 7);
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);

      // Mock the logout API call to fail
      const api = await import('@/lib/api');
      vi.mocked(api.default.post).mockRejectedValue(new Error('Network error'));

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      // Wait for initial auth check
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });

      // Click logout
      const logoutBtn = screen.getByTestId('logout-btn');
      await userEvent.click(logoutBtn);

      // Tokens should still be cleared even if API fails
      await waitFor(() => {
        expect(getAccessToken()).toBeNull();
        expect(getRefreshToken()).toBeNull();
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });
    });

    it('should call backend logout endpoint with refresh token', async () => {
      const accessToken = createTestToken(60);
      const refreshToken = createTestToken(60 * 24 * 7);
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);

      const api = await import('@/lib/api');
      vi.mocked(api.default.post).mockResolvedValue({ data: { success: true } });

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });

      const logoutBtn = screen.getByTestId('logout-btn');
      await userEvent.click(logoutBtn);

      await waitFor(() => {
        expect(api.default.post).toHaveBeenCalledWith(
          '/api/client/auth/logout',
          { refreshToken }
        );
      });
    });
  });

  describe('Initial Authentication State', () => {
    it('should restore auth state from valid stored token', async () => {
      const accessToken = createTestToken(60);
      setAccessToken(accessToken);

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@test.com');
      });
    });

    it('should clear expired tokens on mount', async () => {
      const expiredToken = createTestToken(-5); // Expired 5 minutes ago
      setAccessToken(expiredToken);

      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
        expect(getAccessToken()).toBeNull();
      });
    });
  });
});
