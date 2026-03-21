import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import GalleryCreate from '@/pages/admin/GalleryCreate';
import * as useGalleriesModule from '@/hooks/useGalleries';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/hooks/useGalleries');

vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    galleryForm: {
      titleLabel: 'Заглавие',
      titlePlaceholder: 'Въведете заглавие на галерията...',
      descriptionLabel: 'Описание (по избор)',
      saveDraft: 'Запази чернова',
      publish: 'Публикувай',
      noImagesError: 'Добавете поне една снимка преди публикуване',
      errors: {
        titleRequired: 'Заглавието е задължително',
        saveFailed: 'Грешка при запазване',
        publishFailed: 'Грешка при публикуване',
        updateFailed: 'Грешка при обновяване',
      },
      success: {
        saved: 'Галерията е запазена успешно',
        published: 'Галерията е публикувана успешно!',
        updated: 'Галерията е обновена успешно',
      },
      breadcrumb: {
        gallery: 'Галерия',
        create: 'Създаване',
        edit: 'Редактиране',
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
      <GalleryCreate />
    </BrowserRouter>
  );
};

describe('GalleryCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('form renders with title and description fields', () => {
    renderComponent();

    expect(screen.getByLabelText('Заглавие')).toBeInTheDocument();
    expect(screen.getByLabelText('Описание (по избор)')).toBeInTheDocument();
    expect(screen.getByText('Запази чернова')).toBeInTheDocument();
    expect(screen.getByText('Публикувай')).toBeInTheDocument();
  });

  it('title required — shows validation error when empty', async () => {
    const user = userEvent.setup();
    renderComponent();

    const saveDraftButton = screen.getByText('Запази чернова');
    await user.click(saveDraftButton);

    await waitFor(() => {
      expect(screen.getByText('Заглавието е задължително')).toBeInTheDocument();
    });
  });

  it('"Запази чернова" creates gallery with DRAFT status and navigates to edit', async () => {
    const user = userEvent.setup();
    vi.spyOn(useGalleriesModule, 'createGallery').mockResolvedValue({
      id: 42,
      title: 'Тест галерия',
      description: null,
      coverImageUrl: null,
      status: 'DRAFT',
      publishedAt: null,
      createdAt: '2026-03-15T00:00:00Z',
      updatedAt: '2026-03-15T00:00:00Z',
      imageCount: 0,
    });

    renderComponent();

    await user.type(screen.getByLabelText('Заглавие'), 'Тест галерия');

    const saveDraftButton = screen.getByText('Запази чернова');
    await user.click(saveDraftButton);

    await waitFor(() => {
      expect(useGalleriesModule.createGallery).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Тест галерия',
          status: 'DRAFT',
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Галерията е запазена успешно');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/galleries/42/edit');
    });
  });

  it('"Публикувай" creates gallery with PUBLISHED status and navigates to edit', async () => {
    const user = userEvent.setup();
    vi.spyOn(useGalleriesModule, 'createGallery').mockResolvedValue({
      id: 99,
      title: 'Публикувана галерия',
      description: null,
      coverImageUrl: null,
      status: 'PUBLISHED',
      publishedAt: '2026-03-15T00:00:00Z',
      createdAt: '2026-03-15T00:00:00Z',
      updatedAt: '2026-03-15T00:00:00Z',
      imageCount: 0,
    });

    renderComponent();

    await user.type(screen.getByLabelText('Заглавие'), 'Публикувана галерия');

    const publishButton = screen.getByText('Публикувай');
    await user.click(publishButton);

    await waitFor(() => {
      expect(useGalleriesModule.createGallery).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Публикувана галерия',
          status: 'PUBLISHED',
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Галерията е публикувана успешно!');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/galleries/99/edit');
    });
  });

  it('shows error toast when creation fails', async () => {
    const user = userEvent.setup();
    vi.spyOn(useGalleriesModule, 'createGallery').mockRejectedValue(new Error('API Error'));

    renderComponent();

    await user.type(screen.getByLabelText('Заглавие'), 'Тест');

    const saveDraftButton = screen.getByText('Запази чернова');
    await user.click(saveDraftButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Грешка при запазване');
    });
  });

  it('both buttons are disabled while saving', async () => {
    const user = userEvent.setup();
    let resolveCreate!: (value: any) => void;
    vi.spyOn(useGalleriesModule, 'createGallery').mockImplementation(
      () => new Promise((resolve) => { resolveCreate = resolve; })
    );

    renderComponent();

    await user.type(screen.getByLabelText('Заглавие'), 'Тест галерия');

    const saveDraftButton = screen.getByText('Запази чернова');
    const publishButton = screen.getByText('Публикувай');

    // Click save draft — triggers in-flight request
    await user.click(saveDraftButton);

    // Both buttons should now be disabled
    await waitFor(() => {
      expect(saveDraftButton).toBeDisabled();
      expect(publishButton).toBeDisabled();
    });

    // Resolve the promise to clean up
    resolveCreate({ id: 1, title: 'Тест галерия', description: null, coverImageUrl: null, status: 'DRAFT', publishedAt: null, createdAt: '', updatedAt: '', imageCount: 0 });
  });
});
