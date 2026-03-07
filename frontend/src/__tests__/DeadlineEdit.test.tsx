import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { DeadlineEdit } from '@/pages/admin/DeadlineEdit';
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
      update: 'Обнови',
      errors: {
        titleRequired: 'Заглавието е задължително',
        deadlineDateRequired: 'Крайната дата е задължителна',
        saveFailed: 'Грешка при запазване',
        publishFailed: 'Грешка при публикуване',
        updateFailed: 'Грешка при обновяване',
      },
      success: {
        saved: 'Срокът е запазен успешно',
        published: 'Срокът е публикуван успешно!',
        updated: 'Срокът е обновен успешно',
      },
      breadcrumb: {
        deadlines: 'Срокове',
        edit: 'Редактиране',
      },
    },
    deadlinesList: {
      loadError: 'Грешка при зареждане на сроковете',
    },
    common: { loading: 'Зареждане...' },
    buttons: { backToList: 'Обратно към списъка' },
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
      <button type="button" onClick={() => onChange('<p>test</p>')}>Type content</button>
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

const mockDraftDeadline = {
  id: 1,
  title: 'Записване за подготвителна група',
  description: null,
  deadlineDate: '2026-04-15T00:00:00.000Z',
  isUrgent: false,
  status: 'DRAFT',
  publishedAt: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockPublishedDeadline = { ...mockDraftDeadline, status: 'PUBLISHED' };

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <DeadlineEdit />
    </BrowserRouter>
  );
};

describe('DeadlineEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner while fetching deadline', () => {
    (api.get as any).mockReturnValue(new Promise(() => {})); // never resolves

    renderComponent();

    expect(screen.getByText('Зареждане...')).toBeInTheDocument();
  });

  it('pre-populates form with deadline data', async () => {
    (api.get as any).mockResolvedValue({
      data: { success: true, content: mockDraftDeadline },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Записване за подготвителна група')).toBeInTheDocument();
    });
  });

  it('shows Save Draft and Publish buttons for DRAFT deadlines', async () => {
    (api.get as any).mockResolvedValue({
      data: { success: true, content: mockDraftDeadline },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Запази чернова')).toBeInTheDocument();
      expect(screen.getByText('Публикувай')).toBeInTheDocument();
    });
  });

  it('shows only Update button for PUBLISHED deadlines', async () => {
    (api.get as any).mockResolvedValue({
      data: { success: true, content: mockPublishedDeadline },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Обнови')).toBeInTheDocument();
      expect(screen.queryByText('Запази чернова')).not.toBeInTheDocument();
      expect(screen.queryByText('Публикувай')).not.toBeInTheDocument();
    });
  });

  it('shows error state for 404', async () => {
    (api.get as any).mockRejectedValue({ response: { status: 404 } });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Срокът не е намерен')).toBeInTheDocument();
      expect(screen.getByText('Обратно към списъка')).toBeInTheDocument();
    });
  });

  it('calls PUT on save draft and navigates away', async () => {
    const user = userEvent.setup();
    (api.get as any).mockResolvedValue({
      data: { success: true, content: mockDraftDeadline },
    });
    (api.put as any).mockResolvedValue({ data: { success: true, content: mockDraftDeadline } });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Записване за подготвителна група')).toBeInTheDocument();
    });

    const saveDraftButton = screen.getByText('Запази чернова');
    await user.click(saveDraftButton);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        '/api/admin/v1/admission-deadlines/1',
        expect.objectContaining({ title: 'Записване за подготвителна група' })
      );
      expect(toast.success).toHaveBeenCalledWith('Срокът е запазен успешно');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/deadlines');
    });
  });

  it('calls PUT with PUBLISHED status on publish and navigates away', async () => {
    const user = userEvent.setup();
    (api.get as any).mockResolvedValue({
      data: { success: true, content: mockDraftDeadline },
    });
    (api.put as any).mockResolvedValue({ data: { success: true, content: { ...mockDraftDeadline, status: 'PUBLISHED' } } });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Записване за подготвителна група')).toBeInTheDocument();
    });

    const publishButton = screen.getByText('Публикувай');
    await user.click(publishButton);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        '/api/admin/v1/admission-deadlines/1',
        expect.objectContaining({ status: 'PUBLISHED' })
      );
      expect(toast.success).toHaveBeenCalledWith('Срокът е публикуван успешно!');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/deadlines');
    });
  });

  it('stays on page after successful update for PUBLISHED deadline', async () => {
    const user = userEvent.setup();
    (api.get as any)
      .mockResolvedValueOnce({ data: { success: true, content: mockPublishedDeadline } })
      .mockResolvedValueOnce({ data: { success: true, content: mockPublishedDeadline } });
    (api.put as any).mockResolvedValue({ data: { success: true, content: mockPublishedDeadline } });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Обнови')).toBeInTheDocument();
    });

    const updateButton = screen.getByText('Обнови');
    await user.click(updateButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Срокът е обновен успешно');
      // Should NOT navigate away — stays on edit page
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
