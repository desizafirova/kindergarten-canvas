import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EventCard } from '@/components/public/EventCard';

vi.mock('date-fns', async (importOriginal) => {
  const actual = await importOriginal<typeof import('date-fns')>();
  return {
    ...actual,
    format: vi.fn(() => '15.03.2026'),
  };
});

const baseEvent = {
  id: 1,
  title: 'Тестово събитие',
  description: '<p>Описание на събитието</p>',
  eventDate: '2026-03-15T10:00:00Z',
  eventEndDate: null,
  location: null,
  isImportant: false,
  imageUrl: null,
  publishedAt: '2026-03-01T10:00:00Z',
};

describe('EventCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders event title and formatted date', () => {
    render(<EventCard event={baseEvent} />);

    expect(screen.getByText('Тестово събитие')).toBeInTheDocument();
    expect(screen.getByText('15.03.2026')).toBeInTheDocument();
  });

  it('renders description excerpt with HTML stripped', () => {
    render(<EventCard event={baseEvent} />);

    expect(screen.getByText('Описание на събитието')).toBeInTheDocument();
  });

  it('renders location when present', () => {
    render(<EventCard event={{ ...baseEvent, location: 'Голямата зала' }} />);

    expect(screen.getByText(/Голямата зала/)).toBeInTheDocument();
  });

  it('does not render location when absent', () => {
    render(<EventCard event={baseEvent} />);

    expect(screen.queryByText('📍')).not.toBeInTheDocument();
  });

  it('shows ⭐ indicator for important events', () => {
    render(<EventCard event={{ ...baseEvent, isImportant: true }} />);

    expect(screen.getByLabelText('Важно събитие')).toBeInTheDocument();
  });

  it('does not show ⭐ for non-important events', () => {
    render(<EventCard event={baseEvent} />);

    expect(screen.queryByLabelText('Важно събитие')).not.toBeInTheDocument();
  });

  it('renders image when imageUrl is present', () => {
    render(<EventCard event={{ ...baseEvent, imageUrl: 'https://example.com/image.jpg' }} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('does not render image when imageUrl is null', () => {
    render(<EventCard event={baseEvent} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('truncates long descriptions to 150 chars with ellipsis', () => {
    const longDesc = '<p>' + 'А'.repeat(200) + '</p>';
    render(<EventCard event={{ ...baseEvent, description: longDesc }} />);

    const excerpt = screen.getByText(/А+\.\.\./);
    expect(excerpt.textContent!.length).toBeLessThanOrEqual(153); // 150 + "..."
  });

  it('uses article semantic element', () => {
    const { container } = render(<EventCard event={baseEvent} />);

    expect(container.querySelector('article')).toBeInTheDocument();
  });

  it('applies highlighted border for important events', () => {
    const { container } = render(<EventCard event={{ ...baseEvent, isImportant: true }} />);

    expect(container.querySelector('article')).toHaveClass('border-amber-400');
  });
});
