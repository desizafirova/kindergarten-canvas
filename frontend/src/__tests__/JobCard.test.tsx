import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as dateFns from 'date-fns';
import { JobCard, type PublicJob } from '@/components/public/JobCard';

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

const baseJob: PublicJob = {
  id: 1,
  title: 'Учител',
  description: '<p>Описание на позицията</p>',
  requirements: null,
  applicationDeadline: null,
  isActive: true,
  publishedAt: '2026-03-01T00:00:00.000Z',
  createdAt: '2026-03-01T00:00:00.000Z',
};

const renderCard = (job: PublicJob) =>
  render(<MemoryRouter><JobCard job={job} /></MemoryRouter>);

describe('JobCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dateFns.isPast).mockReturnValue(false);
    vi.mocked(dateFns.format).mockReturnValue('15.03.2026');
  });

  it('renders title as a link to /jobs/:id', () => {
    renderCard(baseJob);

    const link = screen.getByRole('link', { name: 'Учител' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/jobs/1');
  });

  it('renders description excerpt with HTML stripped', () => {
    renderCard(baseJob);

    expect(screen.getByText('Описание на позицията')).toBeInTheDocument();
  });

  it('renders enabled apply button when no deadline', () => {
    renderCard(baseJob);

    const button = screen.getByRole('button', { name: 'Кандидатствай' });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('renders enabled apply button when deadline is in the future', () => {
    vi.mocked(dateFns.isPast).mockReturnValue(false);

    renderCard({ ...baseJob, applicationDeadline: '2027-01-01T00:00:00.000Z' });

    const button = screen.getByRole('button', { name: 'Кандидатствай' });
    expect(button).not.toBeDisabled();
    expect(screen.queryByText('Срокът за кандидатстване е изтекъл')).not.toBeInTheDocument();
  });

  it('renders disabled button and expired message when deadline has passed', () => {
    vi.mocked(dateFns.isPast).mockReturnValue(true);

    renderCard({ ...baseJob, applicationDeadline: '2025-01-01T00:00:00.000Z' });

    const button = screen.getByRole('button', { name: 'Кандидатствай' });
    expect(button).toBeDisabled();
    expect(screen.getByText('Срокът за кандидатстване е изтекъл')).toBeInTheDocument();
  });

  it('does not render deadline text when applicationDeadline is null', () => {
    renderCard(baseJob);

    expect(screen.queryByText(/Краен срок:/)).not.toBeInTheDocument();
  });

  it('renders deadline label when applicationDeadline is set', () => {
    vi.mocked(dateFns.isPast).mockReturnValue(false);

    renderCard({ ...baseJob, applicationDeadline: '2027-01-01T00:00:00.000Z' });

    expect(screen.getByText(/Краен срок:/)).toBeInTheDocument();
  });

  it('uses article semantic element', () => {
    const { container } = renderCard(baseJob);

    expect(container.querySelector('article')).toBeInTheDocument();
  });
});
