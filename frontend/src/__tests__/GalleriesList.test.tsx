import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GalleriesList from '@/pages/admin/GalleriesList';
import { useGalleries } from '@/hooks/useGalleries';
import * as useGalleriesModule from '@/hooks/useGalleries';

// Mock dependencies
vi.mock('@/hooks/useGalleries');

vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    galleryList: {
      title: 'Галерии',
      subtitle: 'Управлявайте фотогалериите',
      emptyState: 'Няма добавени галерии. Създайте първата!',
      createButton: 'Създай галерия',
      filterAll: 'Всички',
      filterDrafts: 'Чернови',
      filterPublished: 'Публикувани',
      deleteSuccess: 'Галерията е изтрита успешно',
      deleteError: 'Грешка при изтриване на галерията',
      deleteConfirmMessage: 'Сигурни ли сте, че искате да изтриете тази галерия? Всички снимки ще бъдат изтрити.',
      loadError: 'Грешка при зареждане на галериите',
      retryButton: 'Опитайте отново',
      itemDeleted: 'Галерията е премахната от списъка',
      imageCountSuffix: ' снимки',
    },
    common: { loading: 'Зареждане...' },
    buttons: { edit: 'Редактирай', delete: 'Изтрий' },
    status: { draft: 'Чернова', published: 'Публикуван' },
    deleteConfirmDialog: {
      title: 'Изтриване',
      message: 'Сигурни ли сте?',
      confirmMessage: 'Това действие не може да бъде отменено.',
    },
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/components/ui/StatusBadge', () => ({
  StatusBadge: ({ status }: { status: string }) => (
    <span data-testid="status-badge">{status}</span>
  ),
}));

const mockGallery = {
  id: 1,
  title: 'Пролетна галерия',
  description: 'Снимки от пролетните дейности',
  coverImageUrl: null,
  status: 'PUBLISHED' as const,
  publishedAt: '2026-03-01T00:00:00Z',
  createdAt: '2026-03-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
  imageCount: 12,
};

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <GalleriesList />
    </BrowserRouter>
  );
};

describe('GalleriesList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders gallery cards with title, image count, and StatusBadge', () => {
    (useGalleries as any).mockReturnValue({
      data: [mockGallery],
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    expect(screen.getByText('Пролетна галерия')).toBeInTheDocument();
    expect(screen.getByText('12 снимки')).toBeInTheDocument();
    expect(screen.getByTestId('status-badge')).toBeInTheDocument();
  });

  it('shows empty state when no galleries', () => {
    (useGalleries as any).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    expect(screen.getByText('Няма добавени галерии. Създайте първата!')).toBeInTheDocument();
    expect(screen.getAllByText('Създай галерия').length).toBeGreaterThanOrEqual(1);
  });

  it('shows skeleton during loading', () => {
    (useGalleries as any).mockReturnValue({
      data: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    expect(screen.getByLabelText('Зареждане...')).toBeInTheDocument();
  });

  it('shows error state and retry button', () => {
    const mockRefetch = vi.fn();
    (useGalleries as any).mockReturnValue({
      data: [],
      loading: false,
      error: { message: 'Network error' },
      refetch: mockRefetch,
      setData: vi.fn(),
    });

    renderComponent();

    expect(screen.getByText('Грешка при зареждане на галериите')).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();

    const retryButton = screen.getByText('Опитайте отново');
    fireEvent.click(retryButton);

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('clicking Delete opens confirmation dialog', async () => {
    (useGalleries as any).mockReturnValue({
      data: [mockGallery],
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    const deleteButton = screen.getByText('Изтрий');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/Сигурни ли сте/)).toBeInTheDocument();
    });
  });

  it('confirming delete calls deleteGallery and removes card', async () => {
    const mockSetData = vi.fn();
    const mockRefetch = vi.fn();
    (useGalleries as any).mockReturnValue({
      data: [mockGallery],
      loading: false,
      error: null,
      refetch: mockRefetch,
      setData: mockSetData,
    });

    vi.spyOn(useGalleriesModule, 'deleteGallery').mockResolvedValue();

    const { toast } = await import('sonner');

    renderComponent();

    // Open delete dialog
    const deleteButton = screen.getByText('Изтрий');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/Сигурни ли сте/)).toBeInTheDocument();
    });

    // Confirm the deletion (find the confirm button in dialog)
    const allDeleteButtons = screen.getAllByText('Изтрий');
    fireEvent.click(allDeleteButtons[allDeleteButtons.length - 1]);

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalled();
      expect(useGalleriesModule.deleteGallery).toHaveBeenCalledWith(1);
      expect(toast.success).toHaveBeenCalledWith('Галерията е изтрита успешно');
    });
  });
});
