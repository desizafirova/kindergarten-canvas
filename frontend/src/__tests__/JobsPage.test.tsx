import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { JobsPage } from '@/pages/public/JobsPage';

// Use vi.hoisted() pattern per Story 5.7 debug note for Vitest hoisting issue
const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));
vi.mock('@/lib/api', () => ({
  default: {
    get: mockGet,
  },
}));

vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    publicJobs: {
      sectionTitle: 'Кариери',
      emptyState: 'В момента няма отворени позиции.',
      loading: 'Зареждане...',
      error: 'Грешка при зареждане на позициите',
      applyButton: 'Кандидатствай',
      deadlineLabel: 'Краен срок:',
      deadlineExpired: 'Срокът за кандидатстване е изтекъл',
      requirementsTitle: 'Изисквания',
      notFound: 'Позицията не е намерена',
      backToList: 'Всички позиции',
    },
  }),
}));

vi.mock('date-fns', async (importOriginal) => {
  const actual = await importOriginal<typeof import('date-fns')>();
  return {
    ...actual,
    format: vi.fn(() => '15.03.2026'),
    isPast: vi.fn(() => false),
  };
});

const renderWithRouter = (component: React.ReactElement) =>
  render(<BrowserRouter>{component}</BrowserRouter>);

describe('JobsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    mockGet.mockImplementationOnce(() => new Promise(() => {}));

    renderWithRouter(<JobsPage />);

    expect(screen.getByText('Зареждане...')).toBeInTheDocument();
    expect(screen.getByText('Кариери')).toBeInTheDocument();
  });

  it('shows error state on API failure', async () => {
    mockGet.mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter(<JobsPage />);

    await waitFor(() => {
      expect(screen.getByText('Грешка при зареждане на позициите')).toBeInTheDocument();
    });
  });

  it('shows empty state when API returns empty array', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: { jobs: [] },
      },
    });

    renderWithRouter(<JobsPage />);

    await waitFor(() => {
      expect(screen.getByText('В момента няма отворени позиции.')).toBeInTheDocument();
    });
  });

  it('renders one JobCard per job in API response', async () => {
    const mockJobs = [
      {
        id: 1,
        title: 'Учител',
        description: '<p>Описание 1</p>',
        requirements: null,
        applicationDeadline: null,
        isActive: true,
        publishedAt: '2026-03-01T00:00:00Z',
        createdAt: '2026-03-01T00:00:00Z',
      },
      {
        id: 2,
        title: 'Помощник-учител',
        description: '<p>Описание 2</p>',
        requirements: null,
        applicationDeadline: null,
        isActive: true,
        publishedAt: '2026-03-02T00:00:00Z',
        createdAt: '2026-03-02T00:00:00Z',
      },
    ];

    mockGet.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: { jobs: mockJobs },
      },
    });

    renderWithRouter(<JobsPage />);

    await waitFor(() => {
      expect(screen.getByText('Учител')).toBeInTheDocument();
      expect(screen.getByText('Помощник-учител')).toBeInTheDocument();
    });

    expect(mockGet).toHaveBeenCalledWith(
      '/api/v1/public/jobs',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('does not show error for cancelled requests (AbortController cleanup)', async () => {
    mockGet.mockRejectedValueOnce({ name: 'CanceledError', code: 'ERR_CANCELED' });

    renderWithRouter(<JobsPage />);

    await waitFor(() => {
      expect(screen.queryByText('Грешка при зареждане на позициите')).not.toBeInTheDocument();
    });
  });
});
