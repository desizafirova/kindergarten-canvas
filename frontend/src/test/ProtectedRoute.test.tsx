/**
 * ProtectedRoute Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AuthContext } from '@/contexts/AuthContext';

// Mock child component
const ProtectedContent = () => <div>Protected Content</div>;
const LoginPage = () => <div>Login Page</div>;

// Helper to render with auth context
const renderWithAuth = (
  isAuthenticated: boolean,
  isLoading: boolean = false
) => {
  const mockAuthContext = {
    isAuthenticated,
    isLoading,
    user: isAuthenticated ? { id: 1, email: 'test@test.com', role: 'ADMIN' as const } : null,
    login: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
  };

  return render(
    <AuthContext.Provider value={mockAuthContext}>
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route path="/admin/login" element={<LoginPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('ProtectedRoute', () => {
  it('should render children when authenticated', () => {
    renderWithAuth(true, false);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', () => {
    renderWithAuth(false, false);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should show loading state while checking auth', () => {
    renderWithAuth(false, true);
    expect(screen.getByText('Зареждане...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
});
