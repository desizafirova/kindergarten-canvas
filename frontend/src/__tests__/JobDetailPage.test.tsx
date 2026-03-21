import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { JobDetailPage } from '@/pages/public/JobDetailPage';

const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }));
vi.mock('@/lib/api', () => ({
  default: { get: mockGet },
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

const renderAtPath = (id: string) =>
  render(
    <MemoryRouter initialEntries={[`/jobs/${id}`]}>
      <Routes>
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/jobs" element={<div>Jobs List</div>} />
      </Routes>
    </MemoryRouter>
  );

const mockJob = {
  id: 1,
  title: 'Учител в детска градина',
  description: '<p>Пълно описание на позицията</p>',
  requirements: null,
  applicationDeadline: null,
  isActive: true,
  publishedAt: '2026-03-01T00:00:00.000Z',
  createdAt: '2026-03-01T00:00:00.000Z',
};

describe('JobDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially without flashing not-found', () => {
    mockGet.mockImplementationOnce(() => new Promise(() => {}));

    renderAtPath('1');

    expect(screen.getByText('Зареждане...')).toBeInTheDocument();
    expect(screen.queryByText('Позицията не е намерена')).not.toBeInTheDocument();
  });

  it('renders job details when API responds successfully', async () => {
    mockGet.mockResolvedValueOnce({
      data: { status: 'success', data: { job: mockJob } },
    });

    renderAtPath('1');

    await waitFor(() => {
      expect(screen.getByText('Учител в детска градина')).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: /Всички позиции/ })).toBeInTheDocument();
  });

  it('shows not found state on 404 response', async () => {
    mockGet.mockRejectedValueOnce({ response: { status: 404 } });

    renderAtPath('999');

    await waitFor(() => {
      expect(screen.getByText('Позицията не е намерена')).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: 'Всички позиции' })).toBeInTheDocument();
  });

  it('shows error state on non-404 API failure', async () => {
    mockGet.mockRejectedValueOnce(new Error('Network error'));

    renderAtPath('1');

    await waitFor(() => {
      expect(screen.getByText('Грешка при зареждане на позициите')).toBeInTheDocument();
    });
  });

  it('renders requirements section only when present', async () => {
    const jobWithRequirements = {
      ...mockJob,
      requirements: '<p>Висше образование</p>',
    };
    mockGet.mockResolvedValueOnce({
      data: { status: 'success', data: { job: jobWithRequirements } },
    });

    renderAtPath('1');

    await waitFor(() => {
      expect(screen.getByText('Изисквания')).toBeInTheDocument();
    });
  });

  it('does not render requirements section when requirements is null', async () => {
    mockGet.mockResolvedValueOnce({
      data: { status: 'success', data: { job: mockJob } },
    });

    renderAtPath('1');

    await waitFor(() => {
      expect(screen.getByText('Учител в детска градина')).toBeInTheDocument();
    });
    expect(screen.queryByText('Изисквания')).not.toBeInTheDocument();
  });

  it('shows disabled button and expired message when deadline has passed', async () => {
    const { isPast } = await import('date-fns');
    vi.mocked(isPast).mockReturnValue(true);

    const jobWithExpiredDeadline = {
      ...mockJob,
      applicationDeadline: '2025-01-01T00:00:00.000Z',
    };
    mockGet.mockResolvedValueOnce({
      data: { status: 'success', data: { job: jobWithExpiredDeadline } },
    });

    renderAtPath('1');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Кандидатствай' })).toBeDisabled();
    });
    expect(screen.getByText('Срокът за кандидатстване е изтекъл')).toBeInTheDocument();
  });

  it('shows enabled apply button when deadline is in the future', async () => {
    const { isPast } = await import('date-fns');
    vi.mocked(isPast).mockReturnValue(false);

    const jobWithFutureDeadline = {
      ...mockJob,
      applicationDeadline: '2027-01-01T00:00:00.000Z',
    };
    mockGet.mockResolvedValueOnce({
      data: { status: 'success', data: { job: jobWithFutureDeadline } },
    });

    renderAtPath('1');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Кандидатствай' })).not.toBeDisabled();
    });
    expect(screen.queryByText('Срокът за кандидатстване е изтекъл')).not.toBeInTheDocument();
  });

  it('does not show error for cancelled requests', async () => {
    mockGet.mockRejectedValueOnce({ name: 'CanceledError', code: 'ERR_CANCELED' });

    renderAtPath('1');

    await waitFor(() => {
      expect(screen.queryByText('Грешка при зареждане на позициите')).not.toBeInTheDocument();
    });
  });
});
