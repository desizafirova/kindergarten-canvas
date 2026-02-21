import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { TooltipProvider } from '@/components/ui/tooltip';

describe('SidebarNav', () => {
  it('renders all 7 navigation items with Bulgarian labels', () => {
    render(
      <BrowserRouter>
        <SidebarNav />
      </BrowserRouter>
    );

    // Check all navigation items
    expect(screen.getByText('Табло')).toBeInTheDocument();
    expect(screen.getByText('Новини')).toBeInTheDocument();
    expect(screen.getByText('Кариери')).toBeInTheDocument();
    expect(screen.getByText('Събития')).toBeInTheDocument();
    expect(screen.getByText('Срокове')).toBeInTheDocument();
    expect(screen.getByText('Галерия')).toBeInTheDocument();
    expect(screen.getByText('Учители')).toBeInTheDocument();
  });

  it('renders navigation items with correct icons', () => {
    const { container } = render(
      <BrowserRouter>
        <SidebarNav />
      </BrowserRouter>
    );

    // Check that icons are rendered (lucide-react renders SVG elements)
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(7); // At least 7 icons for nav items
  });

  it('highlights active navigation item with aria-current="page"', () => {
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <SidebarNav />
      </MemoryRouter>
    );

    const dashboardLink = screen.getByText('Табло').closest('a');
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');
  });

  it('applies active styling to current route', () => {
    render(
      <MemoryRouter initialEntries={['/admin/news']}>
        <SidebarNav />
      </MemoryRouter>
    );

    const newsLink = screen.getByText('Новини').closest('a');
    expect(newsLink).toHaveClass('bg-primary');
    expect(newsLink).toHaveClass('text-white');
  });

  it('applies inactive styling to non-current routes', () => {
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <SidebarNav />
      </MemoryRouter>
    );

    const newsLink = screen.getByText('Новини').closest('a');
    expect(newsLink).not.toHaveAttribute('aria-current');
    expect(newsLink).toHaveClass('text-muted-foreground');
  });

  it('calls onNavigate callback when navigation item is clicked', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    render(
      <BrowserRouter>
        <SidebarNav onNavigate={onNavigate} />
      </BrowserRouter>
    );

    await user.click(screen.getByText('Новини'));
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it('renders in collapsed mode with icons only', () => {
    const { container } = render(
      <BrowserRouter>
        <TooltipProvider>
          <SidebarNav collapsed={true} />
        </TooltipProvider>
      </BrowserRouter>
    );

    // Labels should not be visible in collapsed mode
    expect(screen.queryByText('Табло')).not.toBeInTheDocument();

    // But icons should still be present
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(7);
  });

  it('has proper keyboard navigation support with focus indicators', () => {
    render(
      <BrowserRouter>
        <SidebarNav />
      </BrowserRouter>
    );

    const firstLink = screen.getByText('Табло').closest('a');
    expect(firstLink).toHaveClass('focus-visible:ring-2');
    expect(firstLink).toHaveClass('focus-visible:ring-primary');
  });
});
