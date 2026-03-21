import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { GalleryDetailPage } from '@/pages/public/GalleryDetailPage';

// Mock @/lib/api
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
      notFound: 'Галерията не е намерена',
      backToList: '← Назад към галериите',
      detailLoading: 'Зареждане на галерията...',
      detailError: 'Грешка при зареждане на галерията',
      lightboxClose: 'Затвори',
      lightboxPrev: 'Предишна снимка',
      lightboxNext: 'Следваща снимка',
    },
  }),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
  };
});

const mockGalleryDetail = {
  id: 1,
  title: 'Пролетна фотосесия',
  description: 'Снимки от тържеството',
  coverImageUrl: 'https://example.com/cover.jpg',
  publishedAt: '2026-03-01T10:00:00Z',
  createdAt: '2026-03-01T10:00:00Z',
  updatedAt: '2026-03-01T10:00:00Z',
  images: [
    {
      id: 1,
      imageUrl: 'https://example.com/img1.jpg',
      thumbnailUrl: 'https://example.com/thumb1.jpg',
      altText: 'Снимка 1',
      displayOrder: 1,
      createdAt: '2026-03-01T10:00:00Z',
    },
    {
      id: 2,
      imageUrl: 'https://example.com/img2.jpg',
      thumbnailUrl: 'https://example.com/thumb2.jpg',
      altText: 'Снимка 2',
      displayOrder: 2,
      createdAt: '2026-03-01T10:00:00Z',
    },
  ],
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('GalleryDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and displays gallery title and images', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: { gallery: mockGalleryDetail },
      },
    });

    renderWithRouter(<GalleryDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Пролетна фотосесия')).toBeInTheDocument();
    });

    expect(screen.getByAltText('Снимка 1')).toBeInTheDocument();
    expect(screen.getByAltText('Снимка 2')).toBeInTheDocument();
  });

  it('shows loading state while fetching', () => {
    mockGet.mockImplementationOnce(() => new Promise(() => {}));

    renderWithRouter(<GalleryDetailPage />);

    expect(screen.getByText('Зареждане на галерията...')).toBeInTheDocument();
  });

  it('shows not-found state on error', async () => {
    mockGet.mockRejectedValueOnce(new Error('Not found'));

    renderWithRouter(<GalleryDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Галерията не е намерена')).toBeInTheDocument();
    });
  });

  it('clicking image opens lightbox', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: { gallery: mockGalleryDetail },
      },
    });

    renderWithRouter(<GalleryDetailPage />);

    await waitFor(() => {
      expect(screen.getByAltText('Снимка 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByAltText('Снимка 1'));

    // Lightbox should open — check for counter indicator
    await waitFor(() => {
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });
  });

  it('shows "← Назад към галериите" link', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: { gallery: mockGalleryDetail },
      },
    });

    renderWithRouter(<GalleryDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('← Назад към галериите')).toBeInTheDocument();
    });
  });

  it('lightbox ArrowRight key navigates to next image', async () => {
    mockGet.mockResolvedValueOnce({
      data: { status: 'success', data: { gallery: mockGalleryDetail } },
    });

    renderWithRouter(<GalleryDetailPage />);

    await waitFor(() => expect(screen.getByAltText('Снимка 1')).toBeInTheDocument());

    fireEvent.click(screen.getByAltText('Снимка 1'));
    await waitFor(() => expect(screen.getByText('1 / 2')).toBeInTheDocument());

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    await waitFor(() => expect(screen.getByText('2 / 2')).toBeInTheDocument());
  });

  it('lightbox ArrowLeft key navigates to previous image', async () => {
    mockGet.mockResolvedValueOnce({
      data: { status: 'success', data: { gallery: mockGalleryDetail } },
    });

    renderWithRouter(<GalleryDetailPage />);

    await waitFor(() => expect(screen.getByAltText('Снимка 2')).toBeInTheDocument());

    fireEvent.click(screen.getByAltText('Снимка 2'));
    await waitFor(() => expect(screen.getByText('2 / 2')).toBeInTheDocument());

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    await waitFor(() => expect(screen.getByText('1 / 2')).toBeInTheDocument());
  });

  it('lightbox prev button is disabled on first image', async () => {
    mockGet.mockResolvedValueOnce({
      data: { status: 'success', data: { gallery: mockGalleryDetail } },
    });

    renderWithRouter(<GalleryDetailPage />);

    await waitFor(() => expect(screen.getByAltText('Снимка 1')).toBeInTheDocument());
    fireEvent.click(screen.getByAltText('Снимка 1'));

    await waitFor(() => {
      const prevBtn = screen.getByRole('button', { name: 'Предишна снимка' });
      expect(prevBtn).toBeDisabled();
    });
  });

  it('lightbox next button is disabled on last image', async () => {
    mockGet.mockResolvedValueOnce({
      data: { status: 'success', data: { gallery: mockGalleryDetail } },
    });

    renderWithRouter(<GalleryDetailPage />);

    await waitFor(() => expect(screen.getByAltText('Снимка 2')).toBeInTheDocument());
    fireEvent.click(screen.getByAltText('Снимка 2'));

    await waitFor(() => expect(screen.getByText('2 / 2')).toBeInTheDocument());

    const nextBtn = screen.getByRole('button', { name: 'Следваща снимка' });
    expect(nextBtn).toBeDisabled();
  });
});
