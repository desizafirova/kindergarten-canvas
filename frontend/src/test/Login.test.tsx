/**
 * Login Page Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '@/pages/admin/Login';
import { AuthContext } from '@/contexts/AuthContext';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper to render Login with mocked auth context
const renderLogin = (loginMock = vi.fn().mockResolvedValue({ success: true, message: 'Success' })) => {
  const mockAuthContext = {
    isAuthenticated: false,
    isLoading: false,
    user: null,
    login: loginMock,
    logout: vi.fn(),
    refreshToken: vi.fn(),
  };

  return {
    loginMock,
    ...render(
      <AuthContext.Provider value={mockAuthContext}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthContext.Provider>
    ),
  };
};

describe('Login Page', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('Form Rendering', () => {
    it('should display Bulgarian labels', () => {
      renderLogin();
      expect(screen.getByLabelText('Имейл')).toBeInTheDocument();
      expect(screen.getByLabelText('Парола')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Вход' })).toBeInTheDocument();
    });

    it('should display page title in Bulgarian', () => {
      renderLogin();
      expect(screen.getByText('Вход в администраторския панел')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when email is empty', async () => {
      renderLogin();
      const submitButton = screen.getByRole('button', { name: 'Вход' });

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Имейлът е задължителен')).toBeInTheDocument();
      });
    });

    // Note: Email format validation is handled by both HTML5 input type="email"
    // and Zod schema. Testing HTML5 validation in JSDOM is unreliable.

    it('should show error when password is empty', async () => {
      renderLogin();
      const emailInput = screen.getByLabelText('Имейл');
      const submitButton = screen.getByRole('button', { name: 'Вход' });

      await userEvent.type(emailInput, 'test@test.com');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Паролата е задължителна')).toBeInTheDocument();
      });
    });

    it('should show error for short password', async () => {
      renderLogin();
      const emailInput = screen.getByLabelText('Имейл');
      const passwordInput = screen.getByLabelText('Парола');
      const submitButton = screen.getByRole('button', { name: 'Вход' });

      await userEvent.type(emailInput, 'test@test.com');
      await userEvent.type(passwordInput, '12345');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Паролата трябва да е поне 6 символа')).toBeInTheDocument();
      });
    });
  });

  describe('Login Flow', () => {
    it('should call login function with correct credentials', async () => {
      const loginMock = vi.fn().mockResolvedValue({ success: true, message: 'Success' });
      renderLogin(loginMock);

      const emailInput = screen.getByLabelText('Имейл');
      const passwordInput = screen.getByLabelText('Парола');
      const submitButton = screen.getByRole('button', { name: 'Вход' });

      await userEvent.type(emailInput, 'admin@test.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(loginMock).toHaveBeenCalledWith('admin@test.com', 'password123');
      });
    });

    it('should redirect to dashboard on successful login', async () => {
      const loginMock = vi.fn().mockResolvedValue({ success: true, message: 'Success' });
      renderLogin(loginMock);

      const emailInput = screen.getByLabelText('Имейл');
      const passwordInput = screen.getByLabelText('Парола');
      const submitButton = screen.getByRole('button', { name: 'Вход' });

      await userEvent.type(emailInput, 'admin@test.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard', { replace: true });
      });
    });

    it('should display error message on login failure', async () => {
      const loginMock = vi.fn().mockResolvedValue({
        success: false,
        message: 'Невалиден имейл или парола'
      });
      renderLogin(loginMock);

      const emailInput = screen.getByLabelText('Имейл');
      const passwordInput = screen.getByLabelText('Парола');
      const submitButton = screen.getByRole('button', { name: 'Вход' });

      await userEvent.type(emailInput, 'admin@test.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Невалиден имейл или парола')).toBeInTheDocument();
      });
    });
  });
});
