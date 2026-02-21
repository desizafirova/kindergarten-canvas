/**
 * Authentication Tests
 * Tests for token storage utilities and auth functions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getAccessToken,
  setAccessToken,
  removeAccessToken,
  getRefreshToken,
  setRefreshToken,
  removeRefreshToken,
  clearTokens,
  getTokenExpiry,
  isTokenExpiringSoon,
  isTokenExpired,
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

// Create a valid JWT token for testing
const createTestToken = (expiresInMinutes: number): string => {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInMinutes * 60;
  const payload = { userId: 1, email: 'test@test.com', role: 'ADMIN', exp };
  const encodedPayload = btoa(JSON.stringify(payload));
  return `header.${encodedPayload}.signature`;
};

describe('Token Storage Utilities', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('Access Token', () => {
    it('should store and retrieve access token', () => {
      const token = 'test-access-token';
      setAccessToken(token);
      expect(getAccessToken()).toBe(token);
    });

    it('should return null when no access token exists', () => {
      expect(getAccessToken()).toBeNull();
    });

    it('should remove access token', () => {
      setAccessToken('test-token');
      removeAccessToken();
      expect(getAccessToken()).toBeNull();
    });
  });

  describe('Refresh Token', () => {
    it('should store and retrieve refresh token', () => {
      const token = 'test-refresh-token';
      setRefreshToken(token);
      expect(getRefreshToken()).toBe(token);
    });

    it('should return null when no refresh token exists', () => {
      expect(getRefreshToken()).toBeNull();
    });

    it('should remove refresh token', () => {
      setRefreshToken('test-token');
      removeRefreshToken();
      expect(getRefreshToken()).toBeNull();
    });
  });

  describe('Clear Tokens', () => {
    it('should clear both access and refresh tokens', () => {
      setAccessToken('access-token');
      setRefreshToken('refresh-token');
      clearTokens();
      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
    });
  });
});

describe('Token Expiry Utilities', () => {
  describe('getTokenExpiry', () => {
    it('should return expiry timestamp from valid token', () => {
      const token = createTestToken(60); // 60 minutes from now
      const expiry = getTokenExpiry(token);
      expect(expiry).not.toBeNull();
      expect(typeof expiry).toBe('number');
    });

    it('should return null for invalid token', () => {
      expect(getTokenExpiry('invalid-token')).toBeNull();
    });

    it('should return null for malformed token', () => {
      expect(getTokenExpiry('header.invalid-base64.signature')).toBeNull();
    });
  });

  describe('isTokenExpiringSoon', () => {
    it('should return false for token with more than 5 minutes remaining', () => {
      const token = createTestToken(10); // 10 minutes from now
      expect(isTokenExpiringSoon(token)).toBe(false);
    });

    it('should return true for token with less than 5 minutes remaining', () => {
      const token = createTestToken(3); // 3 minutes from now
      expect(isTokenExpiringSoon(token)).toBe(true);
    });

    it('should return true for expired token', () => {
      const token = createTestToken(-5); // 5 minutes ago
      expect(isTokenExpiringSoon(token)).toBe(true);
    });

    it('should return true for invalid token', () => {
      expect(isTokenExpiringSoon('invalid-token')).toBe(true);
    });

    it('should respect custom threshold', () => {
      const token = createTestToken(8); // 8 minutes from now
      expect(isTokenExpiringSoon(token, 5)).toBe(false);
      expect(isTokenExpiringSoon(token, 10)).toBe(true);
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for valid non-expired token', () => {
      const token = createTestToken(60); // 60 minutes from now
      expect(isTokenExpired(token)).toBe(false);
    });

    it('should return true for expired token', () => {
      const token = createTestToken(-5); // 5 minutes ago
      expect(isTokenExpired(token)).toBe(true);
    });

    it('should return true for invalid token', () => {
      expect(isTokenExpired('invalid-token')).toBe(true);
    });
  });
});
