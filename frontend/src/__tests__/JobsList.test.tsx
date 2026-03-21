import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import JobsList from '@/pages/admin/JobsList';
import { useJobs } from '@/hooks/useJobs';
import api from '@/lib/api';

// Mock dependencies
vi.mock('@/hooks/useJobs');
vi.mock('@/lib/api');

vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    jobsList: {
      title: 'Кариери',
      subtitle: 'Управлявайте обявите за работа',
      emptyState: 'Няма добавени позиции. Създайте първата!',
      emptyFilteredState: 'Няма позиции в тази категория.',
      createButton: 'Създай позиция',
      filterAll: 'Всички',
      filterActive: 'Активни',
      filterClosed: 'Затворени',
      deleteSuccess: 'Позицията е изтрита успешно',
      deleteError: 'Грешка при изтриване на позицията',
      deleteConfirmMessage: 'Сигурни ли сте, че искате да изтриете тази позиция?',
      loadError: 'Грешка при зареждане на позициите',
      retryButton: 'Опитайте отново',
      itemDeleted: 'Позицията е премахната от списъка',
    },
    common: { loading: 'Зареждане...' },
    buttons: { edit: 'Редактирай', delete: 'Изтрий' },
    status: { draft: 'Чернова', published: 'Публикуван' },
    deleteConfirmDialog: {
      title: 'Изтриване',
      message: 'Сигурни ли сте, че искате да изтриете тази позиция?',
      confirmMessage: 'Това действие не може да бъде отменено.',
    },
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/components/ui/StatusBadge', () => ({
  StatusBadge: ({ status }: { status: string }) => (
    <span data-testid="status-badge">{status}</span>
  ),
}));

const mockJob = {
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

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <JobsList />
    </BrowserRouter>
  );
};

describe('JobsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders list with jobs', () => {
    (useJobs as any).mockReturnValue({
      data: [mockJob],
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    expect(screen.getByText('Учител в детска градина')).toBeInTheDocument();
  });

  it('shows "✓ Активна" for active jobs', () => {
    (useJobs as any).mockReturnValue({
      data: [mockJob],
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    expect(screen.getByText('✓ Активна')).toBeInTheDocument();
  });

  it('shows empty state when no jobs (filter=ALL)', () => {
    (useJobs as any).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    expect(screen.getByText('Няма добавени позиции. Създайте първата!')).toBeInTheDocument();
    expect(screen.getAllByText('Създай позиция').length).toBeGreaterThanOrEqual(1);
  });

  it('shows loading state with skeletons', () => {
    (useJobs as any).mockReturnValue({
      data: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    expect(screen.getByLabelText('Зареждане...')).toBeInTheDocument();
  });

  it('shows error state and retry button', () => {
    const mockRefetch = vi.fn();
    (useJobs as any).mockReturnValue({
      data: [],
      loading: false,
      error: { message: 'Network error' },
      refetch: mockRefetch,
      setData: vi.fn(),
    });

    renderComponent();

    expect(screen.getByText('Network error')).toBeInTheDocument();

    const retryButton = screen.getByText('Опитайте отново');
    fireEvent.click(retryButton);

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('opens delete dialog on delete button click', async () => {
    (useJobs as any).mockReturnValue({
      data: [mockJob],
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    const deleteButton = screen.getByLabelText('Изтрий: Учител в детска градина');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/Сигурни ли сте/)).toBeInTheDocument();
    });
  });

  it('navigates to edit page on edit button click', () => {
    (useJobs as any).mockReturnValue({
      data: [mockJob],
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    const editButton = screen.getByLabelText('Редактирай: Учител в детска градина');
    fireEvent.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/jobs/1/edit');
  });

  it('navigates to create page when create button clicked', () => {
    (useJobs as any).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    const createButtons = screen.getAllByText('Създай позиция');
    fireEvent.click(createButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/jobs/create');
  });

  it('performs optimistic delete and shows toast (no refetch on success)', async () => {
    const mockSetData = vi.fn();
    const mockRefetch = vi.fn();
    (useJobs as any).mockReturnValue({
      data: [mockJob],
      loading: false,
      error: null,
      refetch: mockRefetch,
      setData: mockSetData,
    });
    (api.delete as any).mockResolvedValue({ data: { success: true } });

    const { toast } = await import('sonner');

    renderComponent();

    // Open delete dialog
    const deleteButton = screen.getByLabelText('Изтрий: Учител в детска градина');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/Сигурни ли сте/)).toBeInTheDocument();
    });

    // Find and click the confirm button in the dialog (AlertDialogAction shows t.buttons.delete = 'Изтрий')
    const allDeleteButtons = screen.getAllByText('Изтрий');
    // The last one is the confirm button inside the dialog
    fireEvent.click(allDeleteButtons[allDeleteButtons.length - 1]);

    await waitFor(() => {
      // Optimistic update called
      expect(mockSetData).toHaveBeenCalled();
      // API delete called
      expect(api.delete).toHaveBeenCalledWith('/api/admin/v1/jobs/1');
      // Success toast shown
      expect(toast.success).toHaveBeenCalledWith('Позицията е изтрита успешно');
      // No refetch on success
      expect(mockRefetch).not.toHaveBeenCalled();
    });
  });
});
