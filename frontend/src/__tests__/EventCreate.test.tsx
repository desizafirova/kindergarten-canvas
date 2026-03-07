import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { EventCreate } from '@/pages/admin/EventCreate';
import api from '@/lib/api';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/lib/api');

vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    eventForm: {
      titleLabel: 'Заглавие',
      titlePlaceholder: 'Въведете заглавие...',
      eventDateLabel: 'Дата на събитието',
      eventEndDateLabel: 'Крайна дата (по избор)',
      locationLabel: 'Място (по избор)',
      locationPlaceholder: 'напр. Сала...',
      descriptionLabel: 'Описание (по избор)',
      isImportantLabel: 'Важно събитие',
      imageLabel: 'Изображение (по избор)',
      saveDraft: 'Запази чернова',
      publish: 'Публикувай',
      errors: {
        titleRequired: 'Заглавието е задължително',
        eventDateRequired: 'Датата е задължителна',
        endBeforeStart: 'Крайната дата трябва да е след началната',
        saveFailed: 'Грешка при запазване',
        publishFailed: 'Грешка при публикуване',
      },
      success: {
        saved: 'Събитието е запазено успешно',
        published: 'Събитието е публикувано успешно!',
      },
      breadcrumb: {
        events: 'Събития',
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
        onClick={() => onChange('2026-04-15T00:00:00.000Z')}
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

// Mock ImageUploadZone
vi.mock('@/components/admin/ImageUploadZone', () => ({
  ImageUploadZone: ({ label }: any) => (
    <div data-testid="image-upload-zone">{label}</div>
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
      <EventCreate />
    </BrowserRouter>
  );
};

describe('EventCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with all fields', () => {
    renderComponent();

    expect(screen.getByLabelText('Заглавие')).toBeInTheDocument();
    expect(screen.getByTestId('eventDate')).toBeInTheDocument();
    expect(screen.getByTestId('eventEndDate')).toBeInTheDocument();
    expect(screen.getByLabelText('Място (по избор)')).toBeInTheDocument();
    expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument();
    expect(screen.getByTestId('image-upload-zone')).toBeInTheDocument();
    expect(screen.getByText('Запази чернова')).toBeInTheDocument();
    expect(screen.getByText('Публикувай')).toBeInTheDocument();
  });

  it('shows validation error for empty title on save attempt', async () => {
    const user = userEvent.setup();
    (api.post as any).mockResolvedValue({ data: { success: true, content: { id: 1 } } });
    renderComponent();

    // Click Save Draft without filling title - triggers handleSubmit validation
    const saveDraftButton = screen.getByText('Запази чернова');
    await user.click(saveDraftButton);

    await waitFor(() => {
      expect(screen.getByText('Заглавието е задължително')).toBeInTheDocument();
    });
  });

  it('saves draft with DRAFT status', async () => {
    const user = userEvent.setup();
    (api.post as any).mockResolvedValue({ data: { success: true, content: { id: 1 } } });

    renderComponent();

    await user.type(screen.getByLabelText('Заглавие'), 'Пролетен концерт');
    // Pick a date
    await user.click(screen.getByTestId('eventDate'));

    const saveDraftButton = screen.getByText('Запази чернова');
    await user.click(saveDraftButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/admin/v1/events',
        expect.objectContaining({
          title: 'Пролетен концерт',
          status: 'DRAFT',
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Събитието е запазено успешно');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/events');
    });
  });

  it('publishes with PUBLISHED status', async () => {
    const user = userEvent.setup();
    (api.post as any).mockResolvedValue({ data: { success: true, content: { id: 1 } } });

    renderComponent();

    await user.type(screen.getByLabelText('Заглавие'), 'Летен фестивал');
    // Pick a date
    await user.click(screen.getByTestId('eventDate'));

    const publishButton = screen.getByText('Публикувай');
    await user.click(publishButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/admin/v1/events',
        expect.objectContaining({
          title: 'Летен фестивал',
          status: 'PUBLISHED',
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Събитието е публикувано успешно!');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/events');
    });
  });

  it('shows error toast on save failure', async () => {
    const user = userEvent.setup();
    (api.post as any).mockRejectedValue(new Error('API Error'));

    renderComponent();

    await user.type(screen.getByLabelText('Заглавие'), 'Пролетен концерт');
    await user.click(screen.getByTestId('eventDate'));

    const saveDraftButton = screen.getByText('Запази чернова');
    await user.click(saveDraftButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Грешка при запазване');
    });
  });
});
