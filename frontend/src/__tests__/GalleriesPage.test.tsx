import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { GalleriesPage } from '@/pages/public/GalleriesPage';

// Mock @/lib/api directly to avoid axios.create() interceptor issues in jsdom
const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));
vi.mock('@/lib/api', () => ({
  default: {
    get: mockGet,
  },
}));

vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    publicGallery: {
      sectionTitle: 'Фотогалерии',
      emptyState: 'Галерията скоро ще бъде обновена.',
      loading: 'Зареждане...',
      error: 'Грешка при зареждане на галериите',
      imageCount: ' снимки',
    },
  }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('GalleriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and displays gallery cards on mount', async () => {
    const mockGalleries = [
      {
        id: 1,
        title: 'Пролетна фотосесия',
        description: null,
        coverImageUrl: 'https://example.com/cover1.jpg',
        imageCount: 10,
        publishedAt: '2026-03-01T10:00:00Z',
        createdAt: '2026-03-01T10:00:00Z',
        updatedAt: '2026-03-01T10:00:00Z',
      },
      {
        id: 2,
        title: 'Коледно тържество',
        description: null,
        coverImageUrl: null,
        imageCount: 5,
        publishedAt: '2025-12-20T10:00:00Z',
        createdAt: '2025-12-20T10:00:00Z',
        updatedAt: '2025-12-20T10:00:00Z',
      },
    ];

    mockGet.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: { galleries: mockGalleries },
      },
    });

    renderWithRouter(<GalleriesPage />);

    expect(screen.getByText('Зареждане...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Пролетна фотосесия')).toBeInTheDocument();
      expect(screen.getByText('Коледно тържество')).toBeInTheDocument();
    });

    expect(mockGet).toHaveBeenCalledWith(
      '/api/v1/public/galleries',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('shows loading state while fetching', () => {
    mockGet.mockImplementationOnce(() => new Promise(() => {}));

    renderWithRouter(<GalleriesPage />);

    expect(screen.getByText('Зареждане...')).toBeInTheDocument();
    expect(screen.getByText('Фотогалерии')).toBeInTheDocument();
  });

  it('shows empty state when no galleries returned', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: { galleries: [] },
      },
    });

    renderWithRouter(<GalleriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Галерията скоро ще бъде обновена.')).toBeInTheDocument();
    });
  });

  it('shows error state on API failure', async () => {
    mockGet.mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter(<GalleriesPage />);

    await waitFor(() => {
      expect(screen.getByText('Грешка при зареждане на галериите')).toBeInTheDocument();
    });
  });

  it('does not show error for cancelled requests', async () => {
    mockGet.mockRejectedValueOnce({ name: 'CanceledError', code: 'ERR_CANCELED' });

    renderWithRouter(<GalleriesPage />);

    await waitFor(() => {
      expect(screen.queryByText('Грешка при зареждане на галериите')).not.toBeInTheDocument();
    });
  });
});
