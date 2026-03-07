import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventListRow } from '@/components/admin/EventListRow';
import { Event, EventStatus } from '@/types/event';

vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    buttons: { edit: 'Редактирай', delete: 'Изтрий' },
    status: { draft: 'Чернова', published: 'Публикуван' },
    common: { loading: 'Зареждане...' },
  }),
}));

// Mock StatusBadge
vi.mock('@/components/ui/StatusBadge', () => ({
  StatusBadge: ({ status }: { status: string }) => (
    <span data-testid="status-badge">{status}</span>
  ),
}));

const mockEvent: Event = {
  id: 1,
  title: 'Пролетен концерт',
  description: null,
  eventDate: '2026-04-15T00:00:00.000Z',
  eventEndDate: null,
  location: null,
  isImportant: false,
  imageUrl: null,
  status: EventStatus.PUBLISHED,
  publishedAt: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('EventListRow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders event title and date', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<EventListRow event={mockEvent} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText('Пролетен концерт')).toBeInTheDocument();
    expect(screen.getByText('15.04.2026')).toBeInTheDocument();
  });

  it('shows ⭐ for important events', () => {
    const importantEvent = { ...mockEvent, isImportant: true };
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<EventListRow event={importantEvent} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByLabelText('Важно събитие')).toBeInTheDocument();
  });

  it('does not show ⭐ for non-important events', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<EventListRow event={mockEvent} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.queryByLabelText('Важно събитие')).not.toBeInTheDocument();
  });

  it('shows date range when eventEndDate is present', () => {
    const eventWithEndDate = { ...mockEvent, eventEndDate: '2026-04-17T00:00:00.000Z' };
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<EventListRow event={eventWithEndDate} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText(/15\.04\.2026.*17\.04\.2026/)).toBeInTheDocument();
  });

  it('shows StatusBadge with correct status', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<EventListRow event={mockEvent} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByTestId('status-badge')).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<EventListRow event={mockEvent} onEdit={onEdit} onDelete={onDelete} />);

    const editButton = screen.getByLabelText('Редактирай: Пролетен концерт');
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(1);
  });

  it('calls onDelete when delete button clicked', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<EventListRow event={mockEvent} onEdit={onEdit} onDelete={onDelete} />);

    const deleteButton = screen.getByLabelText('Изтрий: Пролетен концерт');
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('shows loading state when isDeleting=true', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<EventListRow event={mockEvent} onEdit={onEdit} onDelete={onDelete} isDeleting={true} />);

    expect(screen.getByText('Зареждане...')).toBeInTheDocument();
    expect(screen.queryByLabelText('Редактирай: Пролетен концерт')).not.toBeInTheDocument();
  });
});
