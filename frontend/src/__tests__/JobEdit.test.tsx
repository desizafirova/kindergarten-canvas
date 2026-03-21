import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { JobEdit } from '@/pages/admin/JobEdit';
import api from '@/lib/api';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/lib/api');

vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    jobForm: {
      titleLabel: 'Заглавие на позицията',
      titlePlaceholder: 'напр. Учител в детска градина...',
      descriptionLabel: 'Описание',
      requirementsLabel: 'Изисквания (по избор)',
      contactEmailLabel: 'Имейл за кандидатури',
      contactEmailPlaceholder: 'hr@kindergarten.bg',
      applicationDeadlineLabel: 'Краен срок за кандидатстване (по избор)',
      isActiveLabel: 'Приема кандидатури',
      saveDraft: 'Запази чернова',
      publish: 'Публикувай',
      update: 'Обнови',
      errors: {
        titleRequired: 'Заглавието е задължително',
        descriptionRequired: 'Описанието е задължително',
        contactEmailRequired: 'Имейлът за контакт е задължителен',
        contactEmailInvalid: 'Невалиден имейл формат',
        saveFailed: 'Грешка при запазване',
        publishFailed: 'Грешка при публикуване',
        updateFailed: 'Грешка при обновяване',
      },
      success: {
        saved: 'Позицията е запазена успешно',
        published: 'Позицията е публикувана успешно!',
        updated: 'Позицията е обновена успешно',
      },
      breadcrumb: {
        careers: 'Кариери',
        edit: 'Редактиране',
      },
    },
    jobsList: {
      loadError: 'Грешка при зареждане на позициите',
    },
    buttons: {
      backToList: 'Обратно към списъка',
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
    useParams: () => ({ id: '1' }),
  };
});

// Mock DatePickerField
vi.mock('@/components/admin/DatePickerField', () => ({
  DatePickerField: ({ id, label, onChange, error }: any) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <button
        type="button"
        id={id}
        data-testid={id}
        onClick={() => onChange('2026-12-31T00:00:00.000Z')}
      >
        Pick date
      </button>
      {error && <span role="alert">{error}</span>}
    </div>
  ),
}));

// Mock both RichTextEditor instances
vi.mock('@/components/admin/RichTextEditor', () => ({
  RichTextEditor: ({ onChange, label, id }: any) => (
    <div data-testid={`rich-text-editor-${id || label}`}>
      <button type="button" onClick={() => onChange('<p>test content</p>')}>
        Type {label || id}
      </button>
    </div>
  ),
}));

// Mock ContentFormShell
vi.mock('@/components/admin/ContentFormShell', () => ({
  ContentFormShell: ({ children, actionButtons }: any) => (
    <div>
      <div data-testid="action-buttons">{actionButtons}</div>
      {children}
    </div>
  ),
}));

const mockDraftJob = {
  id: 1,
  title: 'Учител в детска градина',
  description: '<p>Описание</p>',
  requirements: null,
  contactEmail: 'hr@kindergarten.bg',
  applicationDeadline: null,
  isActive: true,
  status: 'DRAFT',
  publishedAt: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockPublishedJob = { ...mockDraftJob, status: 'PUBLISHED' };

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <JobEdit />
    </BrowserRouter>
  );
};

describe('JobEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner while fetching', () => {
    (api.get as any).mockReturnValue(new Promise(() => {})); // Never resolves

    renderComponent();

    expect(screen.getByText('Зареждане...')).toBeInTheDocument();
  });

  it('pre-populates form fields after fetch', async () => {
    (api.get as any).mockResolvedValue({ data: { success: true, content: mockDraftJob } });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Учител в детска градина')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('hr@kindergarten.bg')).toBeInTheDocument();
  });

  it('shows error state with back button if fetch fails', async () => {
    (api.get as any).mockRejectedValue({ response: { status: 404 } });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Позицията не е намерена')).toBeInTheDocument();
      expect(screen.getByText('Обратно към списъка')).toBeInTheDocument();
    });
  });

  it('shows Save Draft + Publish buttons for DRAFT jobs', async () => {
    (api.get as any).mockResolvedValue({ data: { success: true, content: mockDraftJob } });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Учител в детска градина')).toBeInTheDocument();
    });

    expect(screen.getByText('Запази чернова')).toBeInTheDocument();
    expect(screen.getByText('Публикувай')).toBeInTheDocument();
  });

  it('shows only Обнови button for PUBLISHED jobs', async () => {
    (api.get as any).mockResolvedValue({ data: { success: true, content: mockPublishedJob } });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Учител в детска градина')).toBeInTheDocument();
    });

    expect(screen.getByText('Обнови')).toBeInTheDocument();
    expect(screen.queryByText('Запази чернова')).not.toBeInTheDocument();
  });

  it('calls PUT /api/admin/v1/jobs/:id on save', async () => {
    const user = userEvent.setup();
    (api.get as any).mockResolvedValue({ data: { success: true, content: mockDraftJob } });
    (api.put as any).mockResolvedValue({ data: { success: true, content: mockDraftJob } });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Учител в детска градина')).toBeInTheDocument();
    });

    const saveDraftButton = screen.getByText('Запази чернова');
    await user.click(saveDraftButton);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        '/api/admin/v1/jobs/1',
        expect.objectContaining({ title: 'Учител в детска градина' })
      );
      expect(toast.success).toHaveBeenCalledWith('Позицията е запазена успешно');
    });
  });

  it('calls PUT with status PUBLISHED on publish', async () => {
    const user = userEvent.setup();
    (api.get as any).mockResolvedValue({ data: { success: true, content: mockDraftJob } });
    (api.put as any).mockResolvedValue({ data: { success: true, content: { ...mockDraftJob, status: 'PUBLISHED' } } });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Учител в детска градина')).toBeInTheDocument();
    });

    const publishButton = screen.getByText('Публикувай');
    await user.click(publishButton);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        '/api/admin/v1/jobs/1',
        expect.objectContaining({ status: 'PUBLISHED' })
      );
      expect(toast.success).toHaveBeenCalledWith('Позицията е публикувана успешно!');
    });
  });

  it('calls PUT on update for PUBLISHED jobs and stays on page', async () => {
    const user = userEvent.setup();
    (api.get as any).mockResolvedValue({ data: { success: true, content: mockPublishedJob } });
    (api.put as any).mockResolvedValue({ data: { success: true, content: mockPublishedJob } });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Обнови')).toBeInTheDocument();
    });

    const updateButton = screen.getByText('Обнови');
    await user.click(updateButton);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/api/admin/v1/jobs/1', expect.any(Object));
      expect(toast.success).toHaveBeenCalledWith('Позицията е обновена успешно');
      // Stays on page (no navigate to list)
      expect(mockNavigate).not.toHaveBeenCalledWith('/admin/jobs');
    });
  });
});
