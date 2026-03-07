import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TeachersList from '@/pages/admin/TeachersList';
import { useTeachers } from '@/hooks/useTeachers';
import api from '@/lib/api';

// Mock dependencies
vi.mock('@/hooks/useTeachers');
vi.mock('@/lib/api');

vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    teachersList: {
      title: 'Учители',
      subtitle: 'Управлявайте профилите на учителите',
      emptyState: 'Няма добавени учители. Добавете първия!',
      emptyFilteredState: 'Няма учители в тази категория.',
      createButton: 'Добави учител',
      filterAll: 'Всички',
      filterDrafts: 'Чернови',
      filterPublished: 'Публикувани',
      deleteSuccess: 'Учителят е изтрит успешно',
      deleteError: 'Грешка при изтриване на учителя',
      itemDeleted: 'Учителят е премахнат от списъка',
    },
    common: { loading: 'Зареждане...' },
    buttons: { edit: 'Редактирай', delete: 'Изтрий' },
    status: { draft: 'Чернова', published: 'Публикуван' },
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

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <TeachersList />
    </BrowserRouter>
  );
};

describe('TeachersList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders list with teachers', async () => {
    const mockTeachers = [
      {
        id: 1,
        firstName: 'Мария',
        lastName: 'Петрова',
        position: 'Учител',
        status: 'PUBLISHED',
        photoUrl: null,
        bio: null,
        displayOrder: 1,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        firstName: 'Иван',
        lastName: 'Стефанов',
        position: 'Директор',
        status: 'DRAFT',
        photoUrl: null,
        bio: null,
        displayOrder: 2,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
    ];

    (useTeachers as any).mockReturnValue({
      data: mockTeachers,
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    expect(screen.getByText('Мария Петрова')).toBeInTheDocument();
    expect(screen.getByText('Иван Стефанов')).toBeInTheDocument();
    expect(screen.getByText('Учител')).toBeInTheDocument();
    expect(screen.getByText('Директор')).toBeInTheDocument();
  });

  it('shows empty state when no teachers', () => {
    (useTeachers as any).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    expect(screen.getByText('Няма добавени учители. Добавете първия!')).toBeInTheDocument();
    expect(screen.getByText('Добави учител')).toBeInTheDocument();
  });

  it('navigates to edit page on edit button click', async () => {
    const mockTeacher = {
      id: 1,
      firstName: 'Мария',
      lastName: 'Петрова',
      position: 'Учител',
      status: 'PUBLISHED',
      photoUrl: null,
      bio: null,
      displayOrder: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    (useTeachers as any).mockReturnValue({
      data: [mockTeacher],
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    const editButton = screen.getByLabelText('Редактирай: Мария Петрова');
    fireEvent.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/teachers/1/edit');
  });

  it('opens delete confirmation on delete button click', async () => {
    const mockTeacher = {
      id: 1,
      firstName: 'Мария',
      lastName: 'Петрова',
      position: 'Учител',
      status: 'PUBLISHED',
      photoUrl: null,
      bio: null,
      displayOrder: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    (useTeachers as any).mockReturnValue({
      data: [mockTeacher],
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    const deleteButton = screen.getByLabelText('Изтрий: Мария Петрова');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/Сигурни ли сте/)).toBeInTheDocument();
    });
  });

  it('shows StatusBadge for draft and published teachers', () => {
    const mockTeachers = [
      {
        id: 1,
        firstName: 'Мария',
        lastName: 'Петрова',
        position: 'Учител',
        status: 'PUBLISHED',
        photoUrl: null,
        bio: null,
        displayOrder: 1,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        firstName: 'Иван',
        lastName: 'Стефанов',
        position: 'Директор',
        status: 'DRAFT',
        photoUrl: null,
        bio: null,
        displayOrder: 2,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
    ];

    (useTeachers as any).mockReturnValue({
      data: mockTeachers,
      loading: false,
      error: null,
      refetch: vi.fn(),
      setData: vi.fn(),
    });

    renderComponent();

    const statusBadges = screen.getAllByText(/Публикуван|Чернова/);
    expect(statusBadges.length).toBeGreaterThanOrEqual(2);
  });

  it('shows loading state with skeletons', () => {
    (useTeachers as any).mockReturnValue({
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
    (useTeachers as any).mockReturnValue({
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
});
