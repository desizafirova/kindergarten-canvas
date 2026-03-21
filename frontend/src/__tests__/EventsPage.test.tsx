import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { EventsPage } from '@/pages/public/EventsPage';

// Mock @/lib/api directly to avoid axios.create() interceptor issues in jsdom
const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));
vi.mock('@/lib/api', () => ({
  default: {
    get: mockGet,
  },
}));

vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    publicEvents: {
      sectionTitle: 'Предстоящи събития',
      emptyState: 'Няма предстоящи събития в момента.',
      loading: 'Зареждане...',
      error: 'Грешка при зареждане на събитията',
    },
  }),
}));

vi.mock('date-fns', async (importOriginal) => {
  const actual = await importOriginal<typeof import('date-fns')>();
  return {
    ...actual,
    format: vi.fn(() => '15.03.2026'),
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('EventsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and displays published events on mount', async () => {
    const mockEvents = [
      {
        id: 1,
        title: 'Пролетен концерт',
        description: '<p>Описание на концерта</p>',
        eventDate: '2026-03-15T10:00:00Z',
        eventEndDate: null,
        location: 'Голямата зала',
        isImportant: false,
        imageUrl: null,
        publishedAt: '2026-03-01T10:00:00Z',
      },
      {
        id: 2,
        title: 'Великденски базар',
        description: '<p>Описание на базара</p>',
        eventDate: '2026-04-10T10:00:00Z',
        eventEndDate: null,
        location: null,
        isImportant: true,
        imageUrl: 'https://example.com/bazar.jpg',
        publishedAt: '2026-03-05T10:00:00Z',
      },
    ];

    mockGet.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: { events: mockEvents },
      },
    });

    renderWithRouter(<EventsPage />);

    expect(screen.getByText('Зареждане...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Пролетен концерт')).toBeInTheDocument();
      expect(screen.getByText('Великденски базар')).toBeInTheDocument();
    });

    expect(mockGet).toHaveBeenCalledWith(
      '/api/v1/public/events',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('shows loading state while fetching', () => {
    mockGet.mockImplementationOnce(() => new Promise(() => {}));

    renderWithRouter(<EventsPage />);

    expect(screen.getByText('Зареждане...')).toBeInTheDocument();
    expect(screen.getByText('Предстоящи събития')).toBeInTheDocument();
  });

  it('shows empty state when no events returned', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: { events: [] },
      },
    });

    renderWithRouter(<EventsPage />);

    await waitFor(() => {
      expect(screen.getByText('Няма предстоящи събития в момента.')).toBeInTheDocument();
    });
  });

  it('shows error state on API failure', async () => {
    mockGet.mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter(<EventsPage />);

    await waitFor(() => {
      expect(screen.getByText('Грешка при зареждане на събитията')).toBeInTheDocument();
    });
  });

  it('displays ⭐ indicator for important events', async () => {
    const mockEvents = [
      {
        id: 1,
        title: 'Важно събитие',
        description: null,
        eventDate: '2026-03-15T10:00:00Z',
        eventEndDate: null,
        location: null,
        isImportant: true,
        imageUrl: null,
        publishedAt: '2026-03-01T10:00:00Z',
      },
    ];

    mockGet.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: { events: mockEvents },
      },
    });

    renderWithRouter(<EventsPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Важно събитие')).toBeInTheDocument();
    });
  });

  it('does not show error for cancelled requests', async () => {
    mockGet.mockRejectedValueOnce({ name: 'CanceledError', code: 'ERR_CANCELED' });

    renderWithRouter(<EventsPage />);

    await waitFor(() => {
      expect(screen.queryByText('Грешка при зареждане на събитията')).not.toBeInTheDocument();
    });
  });
});
