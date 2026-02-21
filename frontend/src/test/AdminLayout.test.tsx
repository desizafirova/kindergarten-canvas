import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';

const queryClient = new QueryClient();

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            {ui}
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('AdminLayout', () => {
  it('renders main content area with children', () => {
    renderWithProviders(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders sidebar navigation', () => {
    renderWithProviders(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    // Check for navigation items (Bulgarian labels)
    expect(screen.getByText('Табло')).toBeInTheDocument();
    expect(screen.getByText('Новини')).toBeInTheDocument();
    expect(screen.getByText('Кариери')).toBeInTheDocument();
  });

  it('renders settings and logout buttons', () => {
    renderWithProviders(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    expect(screen.getByText('Настройки')).toBeInTheDocument();
    expect(screen.getByText('Изход')).toBeInTheDocument();
  });

  it('applies max-width constraint to main content area', () => {
    const { container } = renderWithProviders(
      <AdminLayout>
        <div data-testid="main-content">Content</div>
      </AdminLayout>
    );

    const mainContent = container.querySelector('main > div');
    expect(mainContent).toHaveClass('max-w-[960px]');
  });
});
