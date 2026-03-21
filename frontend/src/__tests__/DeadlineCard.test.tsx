import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DeadlineCard } from '@/components/public/DeadlineCard';

vi.mock('date-fns', async (importOriginal) => {
  const actual = await importOriginal<typeof import('date-fns')>();
  return {
    ...actual,
    format: vi.fn(() => '20.03.2026'),
    differenceInDays: vi.fn(() => 10), // default: not near expiry
  };
});

const baseDeadline = {
  id: 1,
  title: 'Тестов срок',
  description: '<p>Описание на срока</p>',
  deadlineDate: '2026-03-20T00:00:00Z',
  isUrgent: false,
  publishedAt: '2026-03-01T10:00:00Z',
};

describe('DeadlineCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders deadline title and formatted date', () => {
    render(<DeadlineCard deadline={baseDeadline} />);

    expect(screen.getByText('Тестов срок')).toBeInTheDocument();
    expect(screen.getByText('20.03.2026')).toBeInTheDocument();
  });

  it('renders description excerpt with HTML stripped', () => {
    render(<DeadlineCard deadline={baseDeadline} />);

    expect(screen.getByText('Описание на срока')).toBeInTheDocument();
  });

  it('shows 🚨 indicator for urgent deadlines', () => {
    render(<DeadlineCard deadline={{ ...baseDeadline, isUrgent: true }} />);

    expect(screen.getByLabelText('Спешен срок')).toBeInTheDocument();
  });

  it('does not show 🚨 for non-urgent deadlines', () => {
    render(<DeadlineCard deadline={baseDeadline} />);

    expect(screen.queryByLabelText('Спешен срок')).not.toBeInTheDocument();
  });

  it('shows near-expiry badge when daysUntil < 7', async () => {
    const { differenceInDays } = await import('date-fns');
    vi.mocked(differenceInDays).mockReturnValue(3);

    render(<DeadlineCard deadline={baseDeadline} />);

    expect(screen.getByText(/Остават 3 дни/)).toBeInTheDocument();
  });

  it('shows singular "ден" when daysUntil === 1', async () => {
    const { differenceInDays } = await import('date-fns');
    vi.mocked(differenceInDays).mockReturnValue(1);

    render(<DeadlineCard deadline={baseDeadline} />);

    expect(screen.getByText(/Остават 1 ден/)).toBeInTheDocument();
  });

  it('shows "по-малко от ден" when daysUntil === 0', async () => {
    const { differenceInDays } = await import('date-fns');
    vi.mocked(differenceInDays).mockReturnValue(0);

    render(<DeadlineCard deadline={baseDeadline} />);

    expect(screen.getByText(/по-малко от ден/)).toBeInTheDocument();
  });

  it('does not show near-expiry badge when daysUntil >= 7', async () => {
    const { differenceInDays } = await import('date-fns');
    vi.mocked(differenceInDays).mockReturnValue(10);

    render(<DeadlineCard deadline={baseDeadline} />);

    expect(screen.queryByText(/Остават/)).not.toBeInTheDocument();
  });

  it('applies red border for urgent deadlines', () => {
    const { container } = render(<DeadlineCard deadline={{ ...baseDeadline, isUrgent: true }} />);

    expect(container.querySelector('article')).toHaveClass('border-red-500');
  });

  it('uses article semantic element', () => {
    const { container } = render(<DeadlineCard deadline={baseDeadline} />);

    expect(container.querySelector('article')).toBeInTheDocument();
  });

  it('truncates long descriptions to 150 chars with ellipsis', () => {
    const longDesc = '<p>' + 'Б'.repeat(200) + '</p>';
    render(<DeadlineCard deadline={{ ...baseDeadline, description: longDesc }} />);

    const excerpt = screen.getByText(/Б+\.\.\./);
    expect(excerpt.textContent!.length).toBeLessThanOrEqual(153);
  });
});
