import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { TeacherEdit } from '@/pages/admin/TeacherEdit';
import api from '@/lib/api';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/lib/api');

vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    teacherForm: {
      firstNameLabel: 'Име',
      lastNameLabel: 'Фамилия',
      positionLabel: 'Длъжност',
      bioLabel: 'Биография (по избор)',
      photoLabel: 'Снимка (по избор)',
      publish: 'Публикувай',
      update: 'Обнови',
      errors: {
        updateFailed: 'Грешка при обновяване',
        publishFailed: 'Грешка при публикуване',
      },
      success: {
        updated: 'Учителят е обновен успешно',
        published: 'Учителят е публикуван успешно',
      },
      breadcrumb: {
        teachers: 'Учители',
        edit: 'Редактиране',
      },
    },
    common: { loading: 'Зареждане...' },
    buttons: { save: 'Запази' },
    teachersList: { loadError: 'Грешка при зареждане на учителите' },
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

const renderComponent = (teacherId = '1') => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/admin/teachers/:id/edit" element={<TeacherEdit />} />
      </Routes>
    </BrowserRouter>,
    { initialEntries: [`/admin/teachers/${teacherId}/edit`] }
  );
};

describe('TeacherEdit', () => {
  const mockTeacher = {
    id: 1,
    firstName: 'Мария',
    lastName: 'Петрова',
    position: 'Учител',
    bio: 'Опитна учителка',
    photoUrl: null,
    status: 'DRAFT',
    displayOrder: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and pre-populates form with existing data', async () => {
    (api.get as any).mockResolvedValue({ data: { status: 'success', content: mockTeacher } });

    renderComponent();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/admin/v1/teachers/1');
    });

    await waitFor(() => {
      const firstNameInput = screen.getByLabelText('Име') as HTMLInputElement;
      const lastNameInput = screen.getByLabelText('Фамилия') as HTMLInputElement;
      const positionInput = screen.getByLabelText('Длъжност') as HTMLInputElement;

      expect(firstNameInput.value).toBe('Мария');
      expect(lastNameInput.value).toBe('Петрова');
      expect(positionInput.value).toBe('Учител');
    });
  });

  it('updates teacher on update button click', async () => {
    const user = userEvent.setup();
    (api.get as any).mockResolvedValue({ data: { status: 'success', content: mockTeacher } });
    (api.put as any).mockResolvedValue({ data: { status: 'success', content: { ...mockTeacher, position: 'Директор' } } });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByLabelText('Име')).toBeInTheDocument();
    });

    const positionInput = screen.getByLabelText('Длъжност');
    await user.clear(positionInput);
    await user.type(positionInput, 'Директор');

    const updateButton = screen.getByText('Запази');
    await user.click(updateButton);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        '/api/admin/v1/teachers/1',
        expect.objectContaining({
          position: 'Директор',
        })
      );
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it('publishes draft teacher', async () => {
    const user = userEvent.setup();
    (api.get as any).mockResolvedValue({ data: { status: 'success', content: mockTeacher } });
    (api.put as any).mockResolvedValue({ data: { status: 'success', content: { ...mockTeacher, status: 'PUBLISHED' } } });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Публикувай')).toBeInTheDocument();
    });

    const publishButton = screen.getByText('Публикувай');
    await user.click(publishButton);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        '/api/admin/v1/teachers/1',
        expect.objectContaining({
          status: 'PUBLISHED',
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Учителят е публикуван успешно');
    });
  });

  it('shows error state when teacher load fails', async () => {
    (api.get as any).mockRejectedValue({ response: { status: 404 } });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Учителят не е намерен')).toBeInTheDocument();
    });
  });

  it('shows only Update button for published teacher', async () => {
    const publishedTeacher = { ...mockTeacher, status: 'PUBLISHED' };
    (api.get as any).mockResolvedValue({ data: { status: 'success', content: publishedTeacher } });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Обнови')).toBeInTheDocument();
      expect(screen.queryByText('Публикувай')).not.toBeInTheDocument();
      expect(screen.queryByText('Запази')).not.toBeInTheDocument();
    });
  });

  it('navigates to list after publish', async () => {
    const user = userEvent.setup();
    (api.get as any).mockResolvedValue({ data: { status: 'success', content: mockTeacher } });
    (api.put as any).mockResolvedValue({ data: { status: 'success', content: { ...mockTeacher, status: 'PUBLISHED' } } });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Публикувай')).toBeInTheDocument();
    });

    const publishButton = screen.getByText('Публикувай');
    await user.click(publishButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/teachers');
    });
  });
});
