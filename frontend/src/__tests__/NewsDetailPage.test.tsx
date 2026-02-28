import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { NewsDetailPage } from '@/pages/public/NewsDetailPage';
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

// Helper to render with router and route params
const renderWithRouter = (id: string) => {
  return render(
    <MemoryRouter initialEntries={[`/news/${id}`]}>
      <Routes>
        <Route path="/news/:id" element={<NewsDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('NewsDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and displays full news detail', async () => {
    const mockNewsItem = {
      id: 1,
      title: 'Full News Title',
      content: '<p>This is the <strong>full HTML content</strong> of the news article.</p>',
      imageUrl: 'https://example.com/news-image.jpg',
      publishedAt: '2026-02-27T10:00:00Z',
    };

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: {
          news: mockNewsItem,
        },
      },
    });

    renderWithRouter('1');

    await waitFor(() => {
      // Title
      expect(screen.getByText('Full News Title')).toBeInTheDocument();

      // Date (formatted as dd.MM.yyyy)
      expect(screen.getByText('27.02.2026')).toBeInTheDocument();

      // HTML content should be rendered
      expect(screen.getByText(/full HTML content/)).toBeInTheDocument();

      // Image
      const image = screen.getByAltText('Full News Title') as HTMLImageElement;
      expect(image.src).toBe('https://example.com/news-image.jpg');
    });

    // Verify axios was called with correct endpoint
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/public/news/1', expect.objectContaining({
      signal: expect.any(AbortSignal),
    }));
  });

  it('renders HTML content with dangerouslySetInnerHTML', async () => {
    const mockNewsItem = {
      id: 1,
      title: 'HTML Test',
      content: '<p>Paragraph 1</p><h2>Heading 2</h2><ul><li>List item</li></ul>',
      imageUrl: null,
      publishedAt: '2026-02-27T10:00:00Z',
    };

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: {
          news: mockNewsItem,
        },
      },
    });

    renderWithRouter('1');

    await waitFor(() => {
      // Check that HTML elements are rendered
      const prose = document.querySelector('.prose');
      expect(prose).toBeInTheDocument();
      expect(prose?.innerHTML).toContain('<p>Paragraph 1</p>');
      expect(prose?.innerHTML).toContain('<h2>Heading 2</h2>');
      expect(prose?.innerHTML).toContain('<ul><li>List item</li></ul>');
    });
  });

  it('shows 404 message for non-existent news', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      response: {
        status: 404,
      },
    });

    renderWithRouter('999');

    await waitFor(() => {
      expect(screen.getByText('Новината не е намерена')).toBeInTheDocument();
      expect(screen.getByText('Назад към новините')).toBeInTheDocument();
    });
  });

  it('shows 404 message for draft items', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      response: {
        status: 404,
        data: {
          status: 'fail',
          data: {
            message: 'News item not found',
          },
        },
      },
    });

    renderWithRouter('5');

    await waitFor(() => {
      expect(screen.getByText('Новината не е намерена')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching', () => {
    mockedAxios.get.mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithRouter('1');

    expect(screen.getByText('Зареждане на новини...')).toBeInTheDocument();
  });

  it('shows error state on network failure', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter('1');

    await waitFor(() => {
      expect(screen.getByText('Грешка при зареждане на новините')).toBeInTheDocument();
      expect(screen.getByText('Назад към новините')).toBeInTheDocument();
    });
  });

  it('"Назад към новините" button navigates to /news', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      response: {
        status: 404,
      },
    });

    renderWithRouter('999');

    await waitFor(() => {
      const backButton = screen.getByText('Назад към новините');
      expect(backButton).toBeInTheDocument();

      // Click the back button
      backButton.click();

      // Should navigate to /news
      expect(mockNavigate).toHaveBeenCalledWith('/news');
    });
  });

  it('displays back button even when news is loaded successfully', async () => {
    const mockNewsItem = {
      id: 1,
      title: 'Test News',
      content: '<p>Content</p>',
      imageUrl: null,
      publishedAt: '2026-02-27T10:00:00Z',
    };

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: {
          news: mockNewsItem,
        },
      },
    });

    renderWithRouter('1');

    await waitFor(() => {
      const backButton = screen.getByText('Назад към новините');
      expect(backButton).toBeInTheDocument();

      // Click should navigate
      backButton.click();
      expect(mockNavigate).toHaveBeenCalledWith('/news');
    });
  });
});
