import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NewsListPage } from '@/pages/public/NewsListPage';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
mockedAxios.isCancel = vi.fn(() => false);

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock useTranslation
vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    publicNews: {
      sectionTitle: 'Новини',
      emptyState: 'Няма публикувани новини в момента.',
      loading: 'Зареждане на новини...',
      error: 'Грешка при зареждане на новините',
      backToList: 'Назад към новините',
      notFound: 'Новината не е намерена',
    },
  }),
}));

// Helper to render with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('NewsListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and displays published news on mount', async () => {
    const mockNews = [
      {
        id: 1,
        title: 'Test News 1',
        content: '<p>Test content 1</p>',
        imageUrl: 'https://example.com/image1.jpg',
        publishedAt: '2026-02-27T10:00:00Z',
      },
      {
        id: 2,
        title: 'Test News 2',
        content: '<p>Test content 2</p>',
        imageUrl: null,
        publishedAt: '2026-02-26T10:00:00Z',
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: {
          news: mockNews,
        },
      },
    });

    renderWithRouter(<NewsListPage />);

    // Should show loading initially
    expect(screen.getByText('Зареждане на новини...')).toBeInTheDocument();

    // Wait for news to load
    await waitFor(() => {
      expect(screen.getByText('Test News 1')).toBeInTheDocument();
      expect(screen.getByText('Test News 2')).toBeInTheDocument();
    });

    // Verify axios was called with correct endpoint
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/public/news', expect.objectContaining({
      signal: expect.any(AbortSignal),
    }));
  });

  it('shows empty state when no news is available', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: {
          news: [],
        },
      },
    });

    renderWithRouter(<NewsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Няма публикувани новини в момента.')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching', () => {
    mockedAxios.get.mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithRouter(<NewsListPage />);

    expect(screen.getByText('Зареждане на новини...')).toBeInTheDocument();
  });

  it('shows error state on API failure', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter(<NewsListPage />);

    await waitFor(() => {
      expect(screen.getByText('Грешка при зареждане на новините')).toBeInTheDocument();
    });
  });

  it('formats date in Bulgarian (dd.MM.yyyy)', async () => {
    const mockNews = [
      {
        id: 1,
        title: 'Test News',
        content: '<p>Test content</p>',
        imageUrl: null,
        publishedAt: '2026-02-27T10:00:00Z',
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: {
          news: mockNews,
        },
      },
    });

    renderWithRouter(<NewsListPage />);

    await waitFor(() => {
      // Date should be formatted as dd.MM.yyyy (e.g., "27.02.2026")
      expect(screen.getByText('27.02.2026')).toBeInTheDocument();
    });
  });

  it('displays news cards with title, excerpt, image, and date', async () => {
    const mockNews = [
      {
        id: 1,
        title: 'News with Image',
        content: '<p>This is a long content that should be truncated to 150 characters maximum for the excerpt display</p>',
        imageUrl: 'https://example.com/image.jpg',
        publishedAt: '2026-02-27T10:00:00Z',
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: {
          news: mockNews,
        },
      },
    });

    renderWithRouter(<NewsListPage />);

    await waitFor(() => {
      // Title
      expect(screen.getByText('News with Image')).toBeInTheDocument();

      // Excerpt (without HTML tags)
      expect(screen.getByText(/This is a long content/)).toBeInTheDocument();

      // Image
      const image = screen.getByAltText('News with Image') as HTMLImageElement;
      expect(image.src).toBe('https://example.com/image.jpg');

      // Date
      expect(screen.getByText('27.02.2026')).toBeInTheDocument();
    });
  });

  it('cards are clickable and navigate to detail page', async () => {
    const mockNews = [
      {
        id: 42,
        title: 'Clickable News',
        content: '<p>Content</p>',
        imageUrl: null,
        publishedAt: '2026-02-27T10:00:00Z',
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: {
          news: mockNews,
        },
      },
    });

    renderWithRouter(<NewsListPage />);

    await waitFor(() => {
      const card = screen.getByText('Clickable News').closest('article');
      expect(card).toBeInTheDocument();

      // Click the card
      card?.click();

      // Should navigate to detail page
      expect(mockNavigate).toHaveBeenCalledWith('/news/42');
    });
  });

  it('truncates content to 150 characters for excerpt', async () => {
    const longContent = '<p>' + 'A'.repeat(200) + '</p>';

    const mockNews = [
      {
        id: 1,
        title: 'Long News',
        content: longContent,
        imageUrl: null,
        publishedAt: '2026-02-27T10:00:00Z',
      },
    ];

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: {
          news: mockNews,
        },
      },
    });

    renderWithRouter(<NewsListPage />);

    await waitFor(() => {
      const excerpt = screen.getByText(/A{150}\.\.\./);
      expect(excerpt).toBeInTheDocument();
    });
  });
});
