import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { EventEdit } from '@/pages/admin/EventEdit';
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
      update: 'Обнови',
      errors: {
        titleRequired: 'Заглавието е задължително',
        eventDateRequired: 'Датата е задължителна',
        endBeforeStart: 'Крайната дата трябва да е след началната',
        saveFailed: 'Грешка при запазване',
        publishFailed: 'Грешка при публикуване',
        updateFailed: 'Грешка при обновяване',
      },
      success: {
        saved: 'Събитието е запазено успешно',
        published: 'Събитието е публикувано успешно!',
        updated: 'Събитието е обновено успешно',
      },
      breadcrumb: {
        events: 'Събития',
        edit: 'Редактиране',
      },
    },
    eventsList: {
      loadError: 'Грешка при зареждане на събитията',
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
      <button type="button" onClick={() => onChange('<p>test</p>')}>Type content</button>
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

const mockDraftEvent = {
  id: 1,
  title: 'Пролетен концерт',
  description: null,
  eventDate: '2026-04-15T00:00:00.000Z',
  eventEndDate: null,
  location: 'Сала',
  isImportant: false,
  imageUrl: null,
  status: 'DRAFT',
  publishedAt: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockPublishedEvent = { ...mockDraftEvent, status: 'PUBLISHED' };

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <EventEdit />
    </BrowserRouter>
  );
};

describe('EventEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner while fetching event', () => {
    (api.get as any).mockReturnValue(new Promise(() => {})); // never resolves

    renderComponent();

    expect(screen.getByText('Зареждане...')).toBeInTheDocument();
  });

  it('pre-populates form with event data', async () => {
    (api.get as any).mockResolvedValue({
      data: { success: true, content: mockDraftEvent },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Пролетен концерт')).toBeInTheDocument();
    });
  });

  it('shows Save Draft and Publish buttons for DRAFT events', async () => {
    (api.get as any).mockResolvedValue({
      data: { success: true, content: mockDraftEvent },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Запази чернова')).toBeInTheDocument();
      expect(screen.getByText('Публикувай')).toBeInTheDocument();
    });
  });

  it('shows only Update button for PUBLISHED events', async () => {
    (api.get as any).mockResolvedValue({
      data: { success: true, content: mockPublishedEvent },
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
      expect(screen.getByText('Събитието не е намерено')).toBeInTheDocument();
      expect(screen.getByText('Обратно към списъка')).toBeInTheDocument();
    });
  });

  it('calls PUT on save draft', async () => {
    const user = userEvent.setup();
    (api.get as any).mockResolvedValue({
      data: { success: true, content: mockDraftEvent },
    });
    (api.put as any).mockResolvedValue({ data: { success: true, content: mockDraftEvent } });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Пролетен концерт')).toBeInTheDocument();
    });

    const saveDraftButton = screen.getByText('Запази чернова');
    await user.click(saveDraftButton);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        '/api/admin/v1/events/1',
        expect.objectContaining({ title: 'Пролетен концерт' })
      );
      expect(toast.success).toHaveBeenCalledWith('Събитието е запазено успешно');
    });
  });

  it('calls PUT with PUBLISHED status on publish', async () => {
    const user = userEvent.setup();
    (api.get as any).mockResolvedValue({
      data: { success: true, content: mockDraftEvent },
    });
    (api.put as any).mockResolvedValue({ data: { success: true, content: { ...mockDraftEvent, status: 'PUBLISHED' } } });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Пролетен концерт')).toBeInTheDocument();
    });

    const publishButton = screen.getByText('Публикувай');
    await user.click(publishButton);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        '/api/admin/v1/events/1',
        expect.objectContaining({ status: 'PUBLISHED' })
      );
      expect(toast.success).toHaveBeenCalledWith('Събитието е публикувано успешно!');
    });
  });
});
