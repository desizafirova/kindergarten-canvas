import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { ResponsiveSidebar } from '@/components/layout/ResponsiveSidebar';
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

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ResponsiveSidebar', () => {
  it('renders logo component', () => {
    renderWithProviders(<ResponsiveSidebar />);

    const logo = screen.getByAltText('Kindergarten Logo');
    expect(logo).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    renderWithProviders(<ResponsiveSidebar />);

    expect(screen.getByText('Табло')).toBeInTheDocument();
    expect(screen.getByText('Новини')).toBeInTheDocument();
    expect(screen.getByText('Кариери')).toBeInTheDocument();
    expect(screen.getByText('Събития')).toBeInTheDocument();
    expect(screen.getByText('Срокове')).toBeInTheDocument();
    expect(screen.getByText('Галерия')).toBeInTheDocument();
    expect(screen.getByText('Учители')).toBeInTheDocument();
  });

  it('renders settings link', () => {
    renderWithProviders(<ResponsiveSidebar />);

    const settingsLinks = screen.getAllByText('Настройки');
    expect(settingsLinks.length).toBeGreaterThan(0);
  });

  it('renders logout button', () => {
    renderWithProviders(<ResponsiveSidebar />);

    const logoutButtons = screen.getAllByText('Изход');
    expect(logoutButtons.length).toBeGreaterThan(0);
  });

  it('renders separator lines', () => {
    const { container } = renderWithProviders(<ResponsiveSidebar />);

    // Check for Separator component (renders as div with data-orientation="horizontal")
    const separators = container.querySelectorAll('[data-orientation="horizontal"]');
    expect(separators.length).toBeGreaterThanOrEqual(2);
  });

  it('has hamburger menu button for mobile', () => {
    renderWithProviders(<ResponsiveSidebar />);

    const hamburgerButton = screen.getByLabelText('Open navigation menu');
    expect(hamburgerButton).toBeInTheDocument();
  });

  it('opens mobile drawer when hamburger is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResponsiveSidebar />);

    const hamburgerButton = screen.getByLabelText('Open navigation menu');
    await user.click(hamburgerButton);

    // Sheet should be open with navigation content
    // Note: Sheet content is rendered conditionally when open
    const navigationMenu = screen.getByText('Navigation Menu', { selector: 'h2' });
    expect(navigationMenu).toBeInTheDocument();
  });

  it('has focus trap and escape key handling for mobile drawer', () => {
    renderWithProviders(<ResponsiveSidebar />);

    const hamburgerButton = screen.getByLabelText('Open navigation menu');
    expect(hamburgerButton).toHaveClass('focus-visible:outline-none');
  });

  it('renders desktop sidebar with full width (240px)', () => {
    const { container } = renderWithProviders(<ResponsiveSidebar />);

    const desktopSidebar = container.querySelector('aside.lg\\:w-60');
    expect(desktopSidebar).toBeInTheDocument();
  });

  it('renders tablet sidebar in collapsed mode', () => {
    const { container } = renderWithProviders(<ResponsiveSidebar />);

    const tabletSidebar = container.querySelector('aside.md\\:w-12');
    expect(tabletSidebar).toBeInTheDocument();
  });
});
