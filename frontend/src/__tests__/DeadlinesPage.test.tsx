import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DeadlinesPage } from '@/pages/public/DeadlinesPage';

// Mock @/lib/api directly to avoid axios.create() interceptor issues in jsdom
const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));
vi.mock('@/lib/api', () => ({
  default: {
    get: mockGet,
  },
}));

vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    publicDeadlines: {
      sectionTitle: 'Срокове за прием',
      emptyState: 'Няма активни срокове в момента.',
      loading: 'Зареждане...',
      error: 'Грешка при зареждане на сроковете',
    },
  }),
}));

vi.mock('date-fns', async (importOriginal) => {
  const actual = await importOriginal<typeof import('date-fns')>();
  return {
    ...actual,
    format: vi.fn(() => '20.03.2026'),
    differenceInDays: vi.fn(() => 10), // default: not near expiry
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('DeadlinesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and displays published deadlines on mount', async () => {
    const mockDeadlines = [
      {
        id: 1,
        title: 'Записване за учебната година',
        description: '<p>Описание на срока</p>',
        deadlineDate: '2026-05-01T00:00:00Z',
        isUrgent: false,
        publishedAt: '2026-03-01T10:00:00Z',
      },
    ];

    mockGet.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: { deadlines: mockDeadlines },
      },
    });

    renderWithRouter(<DeadlinesPage />);

    expect(screen.getByText('Зареждане...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Записване за учебната година')).toBeInTheDocument();
    });

    expect(mockGet).toHaveBeenCalledWith(
      '/api/v1/public/admission-deadlines',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('shows loading state while fetching', () => {
    mockGet.mockImplementationOnce(() => new Promise(() => {}));

    renderWithRouter(<DeadlinesPage />);

    expect(screen.getByText('Зареждане...')).toBeInTheDocument();
    expect(screen.getByText('Срокове за прием')).toBeInTheDocument();
  });

  it('shows empty state when no deadlines returned', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: { deadlines: [] },
      },
    });

    renderWithRouter(<DeadlinesPage />);

    await waitFor(() => {
      expect(screen.getByText('Няма активни срокове в момента.')).toBeInTheDocument();
    });
  });

  it('shows error state on API failure', async () => {
    mockGet.mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter(<DeadlinesPage />);

    await waitFor(() => {
      expect(screen.getByText('Грешка при зареждане на сроковете')).toBeInTheDocument();
    });
  });

  it('displays 🚨 indicator for urgent deadlines', async () => {
    const mockDeadlines = [
      {
        id: 1,
        title: 'Спешен срок',
        description: null,
        deadlineDate: '2026-04-01T00:00:00Z',
        isUrgent: true,
        publishedAt: '2026-03-01T10:00:00Z',
      },
    ];

    mockGet.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: { deadlines: mockDeadlines },
      },
    });

    renderWithRouter(<DeadlinesPage />);

    await waitFor(() => {
      expect(screen.getByLabelText('Спешен срок')).toBeInTheDocument();
    });
  });

  it('shows near-expiry urgency badge for deadlines < 7 days away', async () => {
    const { differenceInDays } = await import('date-fns');
    vi.mocked(differenceInDays).mockReturnValue(3);

    const mockDeadlines = [
      {
        id: 1,
        title: 'Близък срок',
        description: null,
        deadlineDate: '2026-03-10T00:00:00Z',
        isUrgent: false,
        publishedAt: '2026-03-01T10:00:00Z',
      },
    ];

    mockGet.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: { deadlines: mockDeadlines },
      },
    });

    renderWithRouter(<DeadlinesPage />);

    await waitFor(() => {
      expect(screen.getByText(/Остават 3 дни/)).toBeInTheDocument();
    });
  });

  it('does not show error for cancelled requests', async () => {
    mockGet.mockRejectedValueOnce({ name: 'CanceledError', code: 'ERR_CANCELED' });

    renderWithRouter(<DeadlinesPage />);

    await waitFor(() => {
      expect(screen.queryByText('Грешка при зареждане на сроковете')).not.toBeInTheDocument();
    });
  });
});
