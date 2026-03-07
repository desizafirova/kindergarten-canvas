import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EventsList from '@/pages/admin/EventsList';
import { useEvents } from '@/hooks/useEvents';
import api from '@/lib/api';

// Mock dependencies
vi.mock('@/hooks/useEvents');
vi.mock('@/lib/api');

vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    eventsList: {
      title: 'Събития',
      subtitle: 'Управлявайте събитията',
      emptyState: 'Няма добавени събития. Създайте първото!',
      emptyFilteredState: 'Няма събития в тази категория.',
      createButton: 'Създай събитие',
      filterAll: 'Всички',
      filterUpcoming: 'Предстоящи',
      filterPast: 'Минали',
      deleteSuccess: 'Събитието е изтрито успешно',
      deleteError: 'Грешка при изтриване на събитието',
      deleteConfirmMessage: 'Сигурни ли сте, че искате да изтриете това събитие?',
      loadError: 'Грешка при зареждане на събитията',
      retryButton: 'Опитайте отново',
      itemDeleted: 'Събитието е премахнато от списъка',
    },
    common: { loading: 'Зареждане...' },
    buttons: { edit: 'Редактирай', delete: 'Изтрий' },
    status: { draft: 'Чернова', published: 'Публикуван' },
    deleteConfirmDialog: {
      title: 'Изтриване',
      message: 'Сигурни ли сте, че искате да изтриете това събитие?',
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

const mockEvent = {
  id: 1,
  title: 'Пролетен концерт',
  description: null,
  eventDate: '2026-04-15T00:00:00.000Z',
  eventEndDate: null,
  location: null,
  isImportant: false,
  imageUrl: null,
  status: 'PUBLISHED',
  publishedAt: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <EventsList />
    </BrowserRouter>
  );
};

describe('EventsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders list with events', () => {
    (useEvents as any).mockReturnValue({
      data: [mockEvent],
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    expect(screen.getByText('Пролетен концерт')).toBeInTheDocument();
  });

  it('shows ⭐ for important events', () => {
    const importantEvent = { ...mockEvent, isImportant: true };
    (useEvents as any).mockReturnValue({
      data: [importantEvent],
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    expect(screen.getByLabelText('Важно събитие')).toBeInTheDocument();
  });

  it('shows empty state when no events', () => {
    (useEvents as any).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    expect(screen.getByText('Няма добавени събития. Създайте първото!')).toBeInTheDocument();
    expect(screen.getAllByText('Създай събитие').length).toBeGreaterThanOrEqual(1);
  });

  it('shows loading state with skeletons', () => {
    (useEvents as any).mockReturnValue({
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
    (useEvents as any).mockReturnValue({
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
    (useEvents as any).mockReturnValue({
      data: [mockEvent],
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    const deleteButton = screen.getByLabelText('Изтрий: Пролетен концерт');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/Сигурни ли сте/)).toBeInTheDocument();
    });
  });

  it('navigates to edit page on edit button click', () => {
    (useEvents as any).mockReturnValue({
      data: [mockEvent],
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    const editButton = screen.getByLabelText('Редактирай: Пролетен концерт');
    fireEvent.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/events/1/edit');
  });

  it('navigates to create page when create button clicked', () => {
    (useEvents as any).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    // Click the create button in the header
    const createButtons = screen.getAllByText('Създай събитие');
    fireEvent.click(createButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/events/create');
  });
});
