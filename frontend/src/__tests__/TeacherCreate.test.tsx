import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { TeacherCreate } from '@/pages/admin/TeacherCreate';
import api from '@/lib/api';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/lib/api');

vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    teacherForm: {
      firstNameLabel: 'Име',
      firstNamePlaceholder: 'Въведете име...',
      lastNameLabel: 'Фамилия',
      lastNamePlaceholder: 'Въведете фамилия...',
      positionLabel: 'Длъжност',
      positionPlaceholder: 'напр. Учител, Директор...',
      bioLabel: 'Биография (по избор)',
      bioPlaceholder: 'Напишете биография...',
      photoLabel: 'Снимка (по избор)',
      saveDraft: 'Запази чернова',
      publish: 'Публикувай',
      errors: {
        firstNameRequired: 'Името е задължително',
        lastNameRequired: 'Фамилията е задължителна',
        positionRequired: 'Длъжността е задължителна',
        saveFailed: 'Грешка при запазване',
        publishFailed: 'Грешка при публикуване',
      },
      success: {
        saved: 'Учителят е запазен успешно',
        published: 'Учителят е публикуван успешно',
      },
      breadcrumb: {
        teachers: 'Учители',
        create: 'Добавяне',
      },
    },
    common: { loading: 'Зареждане...' },
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
      <TeacherCreate />
    </BrowserRouter>
  );
};

describe('TeacherCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with all required fields', () => {
    renderComponent();

    expect(screen.getByLabelText('Име')).toBeInTheDocument();
    expect(screen.getByLabelText('Фамилия')).toBeInTheDocument();
    expect(screen.getByLabelText('Длъжност')).toBeInTheDocument();
    expect(screen.getByText('Биография (по избор)')).toBeInTheDocument();
    expect(screen.getByText('Снимка (по избор)')).toBeInTheDocument();
    expect(screen.getByText('Запази чернова')).toBeInTheDocument();
    expect(screen.getByText('Публикувай')).toBeInTheDocument();
  });

  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup();
    renderComponent();

    const publishButton = screen.getByText('Публикувай');
    await user.click(publishButton);

    await waitFor(() => {
      expect(screen.getByText('Името е задължително')).toBeInTheDocument();
      expect(screen.getByText('Фамилията е задължителна')).toBeInTheDocument();
      expect(screen.getByText('Длъжността е задължителна')).toBeInTheDocument();
    });
  });

  it('saves draft with DRAFT status', async () => {
    const user = userEvent.setup();
    (api.post as any).mockResolvedValue({ data: { status: 'success', content: { id: 1 } } });

    renderComponent();

    await user.type(screen.getByLabelText('Име'), 'Мария');
    await user.type(screen.getByLabelText('Фамилия'), 'Петрова');
    await user.type(screen.getByLabelText('Длъжност'), 'Учител');

    const saveDraftButton = screen.getByText('Запази чернова');
    await user.click(saveDraftButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/admin/v1/teachers',
        expect.objectContaining({
          firstName: 'Мария',
          lastName: 'Петрова',
          position: 'Учител',
          status: 'DRAFT',
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Учителят е запазен успешно');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/teachers');
    });
  });

  it('publishes with PUBLISHED status', async () => {
    const user = userEvent.setup();
    (api.post as any).mockResolvedValue({ data: { status: 'success', content: { id: 1 } } });

    renderComponent();

    await user.type(screen.getByLabelText('Име'), 'Иван');
    await user.type(screen.getByLabelText('Фамилия'), 'Стефанов');
    await user.type(screen.getByLabelText('Длъжност'), 'Директор');

    const publishButton = screen.getByText('Публикувай');
    await user.click(publishButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/admin/v1/teachers',
        expect.objectContaining({
          firstName: 'Иван',
          lastName: 'Стефанов',
          position: 'Директор',
          status: 'PUBLISHED',
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Учителят е публикуван успешно');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/teachers');
    });
  });

  it('shows error toast on save failure', async () => {
    const user = userEvent.setup();
    (api.post as any).mockRejectedValue(new Error('API Error'));

    renderComponent();

    await user.type(screen.getByLabelText('Име'), 'Мария');
    await user.type(screen.getByLabelText('Фамилия'), 'Петрова');
    await user.type(screen.getByLabelText('Длъжност'), 'Учител');

    const saveDraftButton = screen.getByText('Запази чернова');
    await user.click(saveDraftButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Грешка при запазване');
    });
  });
});
