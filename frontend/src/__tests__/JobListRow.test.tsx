import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JobListRow } from '@/components/admin/JobListRow';
import { Job } from '@/types/job';

vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    buttons: { edit: 'Редактирай', delete: 'Изтрий' },
    status: { draft: 'Чернова', published: 'Публикуван' },
    common: { loading: 'Зареждане...' },
    jobsList: { applicationDeadlinePrefix: 'Краен срок:' },
  }),
}));

vi.mock('@/components/ui/StatusBadge', () => ({
  StatusBadge: ({ status }: { status: string }) => (
    <span data-testid="status-badge">{status}</span>
  ),
}));

const mockJob: Job = {
  id: 1,
  title: 'Учител в детска градина',
  description: '<p>Описание</p>',
  requirements: null,
  contactEmail: 'hr@kindergarten.bg',
  applicationDeadline: null,
  isActive: true,
  status: 'PUBLISHED',
  publishedAt: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('JobListRow', () => {
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and StatusBadge', () => {
    render(<JobListRow job={mockJob} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText('Учител в детска градина')).toBeInTheDocument();
    expect(screen.getByTestId('status-badge')).toBeInTheDocument();
  });

  it('shows "✓ Активна" when isActive=true', () => {
    render(<JobListRow job={mockJob} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText('✓ Активна')).toBeInTheDocument();
  });

  it('shows "✗ Затворена" when isActive=false', () => {
    const closedJob = { ...mockJob, isActive: false };
    render(<JobListRow job={closedJob} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText('✗ Затворена')).toBeInTheDocument();
  });

  it('shows formatted applicationDeadline when present', () => {
    const jobWithDeadline = { ...mockJob, applicationDeadline: '2026-03-31T00:00:00.000Z' };
    render(<JobListRow job={jobWithDeadline} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText(/31\.03\.2026/)).toBeInTheDocument();
  });

  it('does not show deadline when applicationDeadline is null', () => {
    render(<JobListRow job={mockJob} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.queryByText(/Краен срок/)).not.toBeInTheDocument();
  });

  it('calls onEdit with correct id when edit button clicked', () => {
    render(<JobListRow job={mockJob} onEdit={onEdit} onDelete={onDelete} />);

    fireEvent.click(screen.getByLabelText('Редактирай: Учител в детска градина'));

    expect(onEdit).toHaveBeenCalledWith(1);
  });

  it('calls onDelete with correct id when delete button clicked', () => {
    render(<JobListRow job={mockJob} onEdit={onEdit} onDelete={onDelete} />);

    fireEvent.click(screen.getByLabelText('Изтрий: Учител в детска градина'));

    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('shows spinner and dim opacity when isDeleting=true', () => {
    render(<JobListRow job={mockJob} onEdit={onEdit} onDelete={onDelete} isDeleting={true} />);

    expect(screen.getByText('Зареждане...')).toBeInTheDocument();
    expect(screen.queryByLabelText('Редактирай: Учител в детска градина')).not.toBeInTheDocument();
  });
});
