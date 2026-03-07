import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { DeadlineCreate } from '@/pages/admin/DeadlineCreate';
import api from '@/lib/api';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/lib/api');

vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    deadlineForm: {
      titleLabel: 'Заглавие',
      titlePlaceholder: 'Въведете заглавие на срока...',
      deadlineDateLabel: 'Краен срок',
      descriptionLabel: 'Описание (по избор)',
      isUrgentLabel: 'Спешен срок',
      saveDraft: 'Запази чернова',
      publish: 'Публикувай',
      errors: {
        titleRequired: 'Заглавието е задължително',
        deadlineDateRequired: 'Крайната дата е задължителна',
        saveFailed: 'Грешка при запазване',
        publishFailed: 'Грешка при публикуване',
      },
      success: {
        saved: 'Срокът е запазен успешно',
        published: 'Срокът е публикуван успешно!',
      },
      breadcrumb: {
        deadlines: 'Срокове',
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
  DatePickerField: ({ id, label, onChange, error, required }: any) => (
    <div>
      <label htmlFor={id}>{label}{required ? ' *' : ''}</label>
      <button
        type="button"
        id={id}
        data-testid={id}
        onClick={() => onChange('2026-06-15T00:00:00.000Z')}
      >
        Pick date
      </button>
      {error && <span role="alert">{error}</span>}
    </div>
  ),
}));

// Mock RichTextEditor
vi.mock('@/components/admin/RichTextEditor', () => ({
  RichTextEditor: ({ onChange }: any) => (
    <div data-testid="rich-text-editor">
      <button type="button" onClick={() => onChange('<p>test content</p>')}>Type content</button>
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
      <DeadlineCreate />
    </BrowserRouter>
  );
};

describe('DeadlineCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    renderComponent();

    expect(screen.getByLabelText('Заглавие')).toBeInTheDocument();
    expect(screen.getByTestId('deadlineDate')).toBeInTheDocument();
    expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument();
    expect(screen.getByLabelText('Спешен срок')).toBeInTheDocument();
    expect(screen.getByText('Запази чернова')).toBeInTheDocument();
    expect(screen.getByText('Публикувай')).toBeInTheDocument();
  });

  it('shows validation error for empty title on save draft attempt', async () => {
    const user = userEvent.setup();
    (api.post as any).mockResolvedValue({ data: { success: true, content: { id: 1 } } });
    renderComponent();

    // Click Save Draft without filling title — triggers validation
    const saveDraftButton = screen.getByText('Запази чернова');
    await user.click(saveDraftButton);

    await waitFor(() => {
      expect(screen.getByText('Заглавието е задължително')).toBeInTheDocument();
    });
  });

  it('calls POST with DRAFT status on save draft', async () => {
    const user = userEvent.setup();
    (api.post as any).mockResolvedValue({ data: { success: true, content: { id: 1 } } });

    renderComponent();

    await user.type(screen.getByLabelText('Заглавие'), 'Записване за подготвителна група');
    await user.click(screen.getByTestId('deadlineDate'));

    const saveDraftButton = screen.getByText('Запази чернова');
    await user.click(saveDraftButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/admin/v1/admission-deadlines',
        expect.objectContaining({
          title: 'Записване за подготвителна група',
          status: 'DRAFT',
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Срокът е запазен успешно');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/deadlines');
    });
  });

  it('calls POST with PUBLISHED status on publish', async () => {
    const user = userEvent.setup();
    (api.post as any).mockResolvedValue({ data: { success: true, content: { id: 1 } } });

    renderComponent();

    await user.type(screen.getByLabelText('Заглавие'), 'Записване за основна група');
    await user.click(screen.getByTestId('deadlineDate'));

    const publishButton = screen.getByText('Публикувай');
    await user.click(publishButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/admin/v1/admission-deadlines',
        expect.objectContaining({
          title: 'Записване за основна група',
          status: 'PUBLISHED',
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Срокът е публикуван успешно!');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/deadlines');
    });
  });

  it('navigates to /admin/deadlines after successful create', async () => {
    const user = userEvent.setup();
    (api.post as any).mockResolvedValue({ data: { success: true, content: { id: 1 } } });

    renderComponent();

    await user.type(screen.getByLabelText('Заглавие'), 'Нов срок');
    await user.click(screen.getByTestId('deadlineDate'));
    await user.click(screen.getByText('Запази чернова'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/deadlines');
    });
  });

  it('shows error toast on save failure', async () => {
    const user = userEvent.setup();
    (api.post as any).mockRejectedValue(new Error('API Error'));

    renderComponent();

    await user.type(screen.getByLabelText('Заглавие'), 'Записване за подготвителна група');
    await user.click(screen.getByTestId('deadlineDate'));

    const saveDraftButton = screen.getByText('Запази чернова');
    await user.click(saveDraftButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Грешка при запазване');
    });
  });
});
