import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DeadlinesList from '@/pages/admin/DeadlinesList';
import { useDeadlines } from '@/hooks/useDeadlines';
import api from '@/lib/api';

// Mock dependencies
vi.mock('@/hooks/useDeadlines');
vi.mock('@/lib/api');

vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    deadlinesList: {
      title: 'Срокове',
      subtitle: 'Управлявайте сроковете за записване',
      emptyState: 'Няма добавени срокове. Създайте първия!',
      emptyFilteredState: 'Няма срокове в тази категория.',
      createButton: 'Създай срок',
      filterAll: 'Всички',
      filterActive: 'Активни',
      filterExpired: 'Изтекли',
      deleteSuccess: 'Срокът е изтрит успешно',
      deleteError: 'Грешка при изтриване на срока',
      loadError: 'Грешка при зареждане на сроковете',
      retryButton: 'Опитайте отново',
      itemDeleted: 'Срокът е премахнат от списъка',
      deleteConfirmMessage: 'Сигурни ли сте, че искате да изтриете този срок?',
    },
    common: { loading: 'Зареждане...' },
    buttons: { edit: 'Редактирай', delete: 'Изтрий' },
    status: { draft: 'Чернова', published: 'Публикуван' },
    deleteConfirmDialog: {
      title: 'Изтриване',
      message: 'Сигурни ли сте, че искате да изтриете този срок?',
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

// Mock StatusBadge
vi.mock('@/components/ui/StatusBadge', () => ({
  StatusBadge: ({ status }: { status: string }) => (
    <span data-testid="status-badge">{status}</span>
  ),
}));

const mockDeadline = {
  id: 1,
  title: 'Записване за подготвителна група',
  description: null,
  deadlineDate: '2026-04-15T00:00:00.000Z',
  isUrgent: false,
  status: 'PUBLISHED',
  publishedAt: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <DeadlinesList />
    </BrowserRouter>
  );
};

describe('DeadlinesList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders list with deadlines', () => {
    (useDeadlines as any).mockReturnValue({
      data: [mockDeadline],
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    expect(screen.getByText('Записване за подготвителна група')).toBeInTheDocument();
  });

  it('shows 🚨 for urgent deadlines', () => {
    const urgentDeadline = { ...mockDeadline, isUrgent: true };
    (useDeadlines as any).mockReturnValue({
      data: [urgentDeadline],
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    expect(screen.getByLabelText('Спешен срок')).toBeInTheDocument();
  });

  it('shows empty state when no deadlines exist', () => {
    (useDeadlines as any).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    expect(screen.getByText('Няма добавени срокове. Създайте първия!')).toBeInTheDocument();
    expect(screen.getAllByText('Създай срок').length).toBeGreaterThanOrEqual(1);
  });

  it('shows loading skeletons during data fetch', () => {
    (useDeadlines as any).mockReturnValue({
      data: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    expect(screen.getByLabelText('Зареждане...')).toBeInTheDocument();
  });

  it('shows error state and retry button on load failure', () => {
    const mockRefetch = vi.fn();
    (useDeadlines as any).mockReturnValue({
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
    (useDeadlines as any).mockReturnValue({
      data: [mockDeadline],
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    const deleteButton = screen.getByLabelText('Изтрий: Записване за подготвителна група');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/Сигурни ли сте/)).toBeInTheDocument();
    });
  });

  it('navigates to edit page on edit button click', () => {
    (useDeadlines as any).mockReturnValue({
      data: [mockDeadline],
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    const editButton = screen.getByLabelText('Редактирай: Записване за подготвителна група');
    fireEvent.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/deadlines/1/edit');
  });

  it('navigates to create page when create button clicked', () => {
    (useDeadlines as any).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    const createButtons = screen.getAllByText('Създай срок');
    fireEvent.click(createButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/deadlines/create');
  });

  it('performs optimistic delete and shows success toast', async () => {
    const mockSetData = vi.fn();
    const { toast } = await import('sonner');
    (api.delete as any).mockResolvedValue({ data: { success: true } });

    (useDeadlines as any).mockReturnValue({
      data: [mockDeadline],
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: mockSetData,
    });

    renderComponent();

    // Open delete dialog
    const deleteButton = screen.getByLabelText('Изтрий: Записване за подготвителна група');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/Сигурни ли сте/)).toBeInTheDocument();
    });

    // Confirm delete
    const confirmButton = screen.getByRole('button', { name: /Изтрий/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalled();
      expect(api.delete).toHaveBeenCalledWith('/api/admin/v1/admission-deadlines/1');
      expect(toast.success).toHaveBeenCalledWith('Срокът е изтрит успешно');
    });
  });
});
