/**
 * Dashboard Component Tests
 * Tests dashboard rendering, content type cards, and navigation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '@/pages/admin/Dashboard';
import * as useContentCountsHook from '@/hooks/useContentCounts';

// Mock the useContentCounts hook
vi.mock('@/hooks/useContentCounts');

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders 6 ContentTypeCard components', async () => {
    vi.mocked(useContentCountsHook.useContentCounts).mockReturnValue({
      data: {
        news: { draft: 2, published: 5 },
        careers: { draft: 1, published: 3 },
        events: { draft: 0, published: 2 },
        deadlines: { draft: 3, published: 1 },
        gallery: { draft: 4, published: 6 },
        teachers: { draft: 0, published: 8 },
      },
      loading: false,
      error: null,
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Should render all 6 content types
    await waitFor(() => {
      expect(screen.getByText('Новини')).toBeInTheDocument();
      expect(screen.getByText('Кариери')).toBeInTheDocument();
      expect(screen.getByText('Събития')).toBeInTheDocument();
      expect(screen.getByText('Срокове')).toBeInTheDocument();
      expect(screen.getByText('Галерия')).toBeInTheDocument();
      expect(screen.getByText('Учители')).toBeInTheDocument();
    });

    // Should render all icons
    expect(screen.getByText('📰')).toBeInTheDocument();
    expect(screen.getByText('💼')).toBeInTheDocument();
    expect(screen.getByText('📅')).toBeInTheDocument();
    expect(screen.getByText('⏰')).toBeInTheDocument();
    expect(screen.getByText('🖼️')).toBeInTheDocument();
    expect(screen.getByText('👨‍🏫')).toBeInTheDocument();
  });

  it('shows loading state while fetching counts', () => {
    vi.mocked(useContentCountsHook.useContentCounts).mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('Зареждане...')).toBeInTheDocument();
    expect(screen.queryByText('Новини')).not.toBeInTheDocument();
  });

  it('navigates to list view on card click', async () => {
    vi.mocked(useContentCountsHook.useContentCounts).mockReturnValue({
      data: {
        news: { draft: 0, published: 0 },
        careers: { draft: 0, published: 0 },
        events: { draft: 0, published: 0 },
        deadlines: { draft: 0, published: 0 },
        gallery: { draft: 0, published: 0 },
        teachers: { draft: 0, published: 0 },
      },
      loading: false,
      error: null,
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Новини')).toBeInTheDocument();
    });

    // Click on news card title
    fireEvent.click(screen.getByText('Новини'));

    expect(mockNavigate).toHaveBeenCalledWith('/admin/news');
  });

  it('navigates to create form on create button click', async () => {
    vi.mocked(useContentCountsHook.useContentCounts).mockReturnValue({
      data: {
        news: { draft: 0, published: 0 },
        careers: { draft: 0, published: 0 },
        events: { draft: 0, published: 0 },
        deadlines: { draft: 0, published: 0 },
        gallery: { draft: 0, published: 0 },
        teachers: { draft: 0, published: 0 },
      },
      loading: false,
      error: null,
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Създай').length).toBeGreaterThan(0);
    });

    // Click first "Създай" button
    const createButtons = screen.getAllByText('Създай');
    fireEvent.click(createButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/news/create');
  });

  it('renders in 2-column grid on desktop', async () => {
    vi.mocked(useContentCountsHook.useContentCounts).mockReturnValue({
      data: {
        news: { draft: 0, published: 0 },
        careers: { draft: 0, published: 0 },
        events: { draft: 0, published: 0 },
        deadlines: { draft: 0, published: 0 },
        gallery: { draft: 0, published: 0 },
        teachers: { draft: 0, published: 0 },
      },
      loading: false,
      error: null,
    });

    const { container } = render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Новини')).toBeInTheDocument();
    });

    // Check for grid layout classes
    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer).toHaveClass('grid-cols-1');
    expect(gridContainer).toHaveClass('md:grid-cols-2');
  });

  it('displays correct counts for each content type', async () => {
    vi.mocked(useContentCountsHook.useContentCounts).mockReturnValue({
      data: {
        news: { draft: 3, published: 7 },
        careers: { draft: 1, published: 2 },
        events: { draft: 0, published: 4 },
        deadlines: { draft: 5, published: 1 },
        gallery: { draft: 2, published: 10 },
        teachers: { draft: 0, published: 6 },
      },
      loading: false,
      error: null,
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Check for counts in single-line format per AC1
      const countsElements = screen.getAllByTestId('counts-text');
      expect(countsElements.length).toBe(6);

      // Verify specific counts are displayed
      expect(countsElements[0]).toHaveTextContent('3 чернови, 7 публикувани'); // news
      expect(countsElements[4]).toHaveTextContent('2 чернови, 10 публикувани'); // gallery
    });
  });

  it('displays error banner when API fails', async () => {
    vi.mocked(useContentCountsHook.useContentCounts).mockReturnValue({
      data: {
        news: { draft: 0, published: 0 },
        careers: { draft: 0, published: 0 },
        events: { draft: 0, published: 0 },
        deadlines: { draft: 0, published: 0 },
        gallery: { draft: 0, published: 0 },
        teachers: { draft: 0, published: 0 },
      },
      loading: false,
      error: new Error('Network error'),
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Should show error banner
    await waitFor(() => {
      expect(screen.getByTestId('api-error-banner')).toBeInTheDocument();
      expect(screen.getByText('Грешка при свързване със сървъра')).toBeInTheDocument();
    });

    // Should still show cards with fallback counts
    expect(screen.getByText('Новини')).toBeInTheDocument();
  });

  it('renders dashboard title', async () => {
    vi.mocked(useContentCountsHook.useContentCounts).mockReturnValue({
      data: {
        news: { draft: 0, published: 0 },
        careers: { draft: 0, published: 0 },
        events: { draft: 0, published: 0 },
        deadlines: { draft: 0, published: 0 },
        gallery: { draft: 0, published: 0 },
        teachers: { draft: 0, published: 0 },
      },
      loading: false,
      error: null,
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText('Табло')).toBeInTheDocument();
  });
});
