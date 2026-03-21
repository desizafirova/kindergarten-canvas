import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { JobCreate } from '@/pages/admin/JobCreate';
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
      errors: {
        titleRequired: 'Заглавието е задължително',
        descriptionRequired: 'Описанието е задължително',
        contactEmailRequired: 'Имейлът за контакт е задължителен',
        contactEmailInvalid: 'Невалиден имейл формат',
        saveFailed: 'Грешка при запазване',
        publishFailed: 'Грешка при публикуване',
      },
      success: {
        saved: 'Позицията е запазена успешно',
        published: 'Позицията е публикувана успешно!',
      },
      breadcrumb: {
        careers: 'Кариери',
        create: 'Създаване',
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

// Mock DatePickerField (complex Radix internals)
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

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <JobCreate />
    </BrowserRouter>
  );
};

describe('JobCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with all fields', () => {
    renderComponent();

    expect(screen.getByLabelText('Заглавие на позицията')).toBeInTheDocument();
    expect(screen.getByTestId('rich-text-editor-description')).toBeInTheDocument();
    expect(screen.getByTestId('rich-text-editor-requirements')).toBeInTheDocument();
    expect(screen.getByLabelText('Имейл за кандидатури')).toBeInTheDocument();
    expect(screen.getByTestId('applicationDeadline')).toBeInTheDocument();
    expect(screen.getByText('Запази чернова')).toBeInTheDocument();
    expect(screen.getByText('Публикувай')).toBeInTheDocument();
  });

  it('shows validation error for empty title on save draft attempt', async () => {
    const user = userEvent.setup();
    renderComponent();

    const saveDraftButton = screen.getByText('Запази чернова');
    await user.click(saveDraftButton);

    await waitFor(() => {
      expect(screen.getByText('Заглавието е задължително')).toBeInTheDocument();
    });
  });

  it('shows validation error for missing contactEmail', async () => {
    const user = userEvent.setup();
    renderComponent();

    // Fill title but not contactEmail
    await user.type(screen.getByLabelText('Заглавие на позицията'), 'Учител');
    // Fill description
    await user.click(screen.getByText('Type description'));

    const saveDraftButton = screen.getByText('Запази чернова');
    await user.click(saveDraftButton);

    await waitFor(() => {
      expect(screen.getByText('Имейлът за контакт е задължителен')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email format', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.type(screen.getByLabelText('Заглавие на позицията'), 'Учител');
    await user.click(screen.getByText('Type description'));
    await user.type(screen.getByLabelText('Имейл за кандидатури'), 'not-an-email');

    const saveDraftButton = screen.getByText('Запази чернова');
    await user.click(saveDraftButton);

    await waitFor(() => {
      expect(screen.getByText('Невалиден имейл формат')).toBeInTheDocument();
    });
  });

  it('saves draft with DRAFT status', async () => {
    const user = userEvent.setup();
    (api.post as any).mockResolvedValue({ data: { success: true, content: { id: 1 } } });

    renderComponent();

    await user.type(screen.getByLabelText('Заглавие на позицията'), 'Учител в детска градина');
    await user.click(screen.getByText('Type description'));
    await user.type(screen.getByLabelText('Имейл за кандидатури'), 'hr@kindergarten.bg');

    const saveDraftButton = screen.getByText('Запази чернова');
    await user.click(saveDraftButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/admin/v1/jobs',
        expect.objectContaining({
          title: 'Учител в детска градина',
          contactEmail: 'hr@kindergarten.bg',
          status: 'DRAFT',
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Позицията е запазена успешно');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/jobs');
    });
  });

  it('publishes with PUBLISHED status and shows success toast', async () => {
    const user = userEvent.setup();
    (api.post as any).mockResolvedValue({ data: { success: true, content: { id: 1 } } });

    renderComponent();

    await user.type(screen.getByLabelText('Заглавие на позицията'), 'Учител в детска градина');
    await user.click(screen.getByText('Type description'));
    await user.type(screen.getByLabelText('Имейл за кандидатури'), 'hr@kindergarten.bg');

    const publishButton = screen.getByText('Публикувай');
    await user.click(publishButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/admin/v1/jobs',
        expect.objectContaining({
          status: 'PUBLISHED',
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Позицията е публикувана успешно!');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/jobs');
    });
  });

  it('shows error toast on save failure', async () => {
    const user = userEvent.setup();
    (api.post as any).mockRejectedValue(new Error('API Error'));

    renderComponent();

    await user.type(screen.getByLabelText('Заглавие на позицията'), 'Учител в детска градина');
    await user.click(screen.getByText('Type description'));
    await user.type(screen.getByLabelText('Имейл за кандидатури'), 'hr@kindergarten.bg');

    const saveDraftButton = screen.getByText('Запази чернова');
    await user.click(saveDraftButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Грешка при запазване');
    });
  });

  it('isActive checkbox is checked by default', () => {
    renderComponent();

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    // isActive defaults to true, so checkbox should be checked
    // (Radix checkbox uses data-state attribute)
    expect(checkbox).toHaveAttribute('data-state', 'checked');
  });
});
