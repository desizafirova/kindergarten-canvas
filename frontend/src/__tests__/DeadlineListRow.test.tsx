import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeadlineListRow } from '@/components/admin/DeadlineListRow';
import { Deadline } from '@/types/deadline';

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

const mockDeadline: Deadline = {
  id: 1,
  title: 'Записване за подготвителна група',
  description: null,
  deadlineDate: '2026-03-15T00:00:00.000Z',
  isUrgent: false,
  status: 'PUBLISHED',
  publishedAt: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('DeadlineListRow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders deadline title and formatted date', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<DeadlineListRow deadline={mockDeadline} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText('Записване за подготвителна група')).toBeInTheDocument();
    expect(screen.getByText('15.03.2026')).toBeInTheDocument();
  });

  it('shows 🚨 for urgent deadlines', () => {
    const urgentDeadline = { ...mockDeadline, isUrgent: true };
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<DeadlineListRow deadline={urgentDeadline} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByLabelText('Спешен срок')).toBeInTheDocument();
  });

  it('does not show 🚨 for non-urgent deadlines', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<DeadlineListRow deadline={mockDeadline} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.queryByLabelText('Спешен срок')).not.toBeInTheDocument();
  });

  it('shows StatusBadge with correct status', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<DeadlineListRow deadline={mockDeadline} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByTestId('status-badge')).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<DeadlineListRow deadline={mockDeadline} onEdit={onEdit} onDelete={onDelete} />);

    const editButton = screen.getByLabelText('Редактирай: Записване за подготвителна група');
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(1);
  });

  it('calls onDelete when delete button clicked', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<DeadlineListRow deadline={mockDeadline} onEdit={onEdit} onDelete={onDelete} />);

    const deleteButton = screen.getByLabelText('Изтрий: Записване за подготвителна група');
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('shows Loader2 spinner and hides buttons when isDeleting=true', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<DeadlineListRow deadline={mockDeadline} onEdit={onEdit} onDelete={onDelete} isDeleting={true} />);

    expect(screen.getByText('Зареждане...')).toBeInTheDocument();
    expect(screen.queryByLabelText('Редактирай: Записване за подготвителна група')).not.toBeInTheDocument();
  });
});
