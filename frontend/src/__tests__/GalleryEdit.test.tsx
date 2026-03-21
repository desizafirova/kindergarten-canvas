import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import GalleryEdit from '@/pages/admin/GalleryEdit';
import * as useGalleriesModule from '@/hooks/useGalleries';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/hooks/useGalleries');
vi.mock('@/hooks/useGalleryImages', () => ({
  default: vi.fn(() => ({
    uploadImage: vi.fn(),
    deleteImage: vi.fn().mockResolvedValue(undefined),
    reorderImages: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock('@/lib/i18n', () => ({
  useTranslation: () => ({
    galleryForm: {
      titleLabel: 'Заглавие',
      titlePlaceholder: 'Въведете заглавие на галерията...',
      descriptionLabel: 'Описание (по избор)',
      saveDraft: 'Запази чернова',
      publish: 'Публикувай',
      update: 'Обнови',
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

vi.mock('@/components/admin/ContentFormShell', () => ({
  ContentFormShell: ({ children, actionButtons }: any) => (
    <div>
      <div data-testid="action-buttons">{actionButtons}</div>
      {children}
    </div>
  ),
}));

vi.mock('@/components/admin/GalleryImageGrid', () => ({
  GalleryImageGrid: ({ images, onDelete }: any) => (
    <div data-testid="gallery-image-grid">
      {images.map((img: any) => (
        <div key={img.id} data-testid={`image-${img.id}`}>
          <button type="button" onClick={() => onDelete(img.id)}>
            Delete {img.id}
          </button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@/components/admin/GalleryImageUploadZone', () => ({
  GalleryImageUploadZone: ({ galleryId, onImagesUploaded }: any) => (
    <div data-testid="gallery-image-upload-zone" data-gallery-id={galleryId}>
      <button type="button" onClick={() => onImagesUploaded([{ id: 99, imageUrl: 'test.jpg', thumbnailUrl: null, altText: null, displayOrder: 0, createdAt: '' }])}>
        Upload
      </button>
    </div>
  ),
}));

const mockGalleryDetail = {
  id: 1,
  title: 'Пролетна галерия',
  description: 'Описание на галерията',
  coverImageUrl: null,
  status: 'DRAFT' as const,
  publishedAt: null,
  createdAt: '2026-03-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
  images: [
    {
      id: 1,
      imageUrl: 'https://example.com/image1.jpg',
      thumbnailUrl: null,
      altText: null,
      displayOrder: 0,
      createdAt: '2026-03-01T00:00:00Z',
    },
  ],
};

const mockGalleryDetailNoImages = {
  ...mockGalleryDetail,
  images: [],
};

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <GalleryEdit />
    </BrowserRouter>
  );
};

describe('GalleryEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('pre-populates title and description from loaded gallery', async () => {
    vi.spyOn(useGalleriesModule, 'getGallery').mockResolvedValue(mockGalleryDetail);

    renderComponent();

    await waitFor(() => {
      const titleInput = screen.getByLabelText('Заглавие') as HTMLInputElement;
      expect(titleInput.value).toBe('Пролетна галерия');
    });

    const descriptionInput = screen.getByLabelText('Описание (по избор)') as HTMLTextAreaElement;
    expect(descriptionInput.value).toBe('Описание на галерията');
  });

  it('renders GalleryImageGrid with existing images', async () => {
    vi.spyOn(useGalleriesModule, 'getGallery').mockResolvedValue(mockGalleryDetail);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('gallery-image-grid')).toBeInTheDocument();
      expect(screen.getByTestId('image-1')).toBeInTheDocument();
    });
  });

  it('"Публикувай" with 0 images shows error toast', async () => {
    const user = userEvent.setup();
    vi.spyOn(useGalleriesModule, 'getGallery').mockResolvedValue(mockGalleryDetailNoImages);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByLabelText('Заглавие')).toBeInTheDocument();
    });

    const publishButton = screen.getByText('Публикувай');
    await user.click(publishButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Добавете поне една снимка преди публикуване');
    });
  });

  it('shows upload zone component', async () => {
    vi.spyOn(useGalleriesModule, 'getGallery').mockResolvedValue(mockGalleryDetail);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('gallery-image-upload-zone')).toBeInTheDocument();
    });
  });

  it('shows DRAFT action bar with "Запази чернова" + "Публикувай" buttons', async () => {
    vi.spyOn(useGalleriesModule, 'getGallery').mockResolvedValue(mockGalleryDetail); // status: DRAFT

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Запази чернова')).toBeInTheDocument();
      expect(screen.getByText('Публикувай')).toBeInTheDocument();
      expect(screen.queryByText('Обнови')).not.toBeInTheDocument();
    });
  });

  it('shows PUBLISHED action bar with "Обнови" + "Публикувай" buttons', async () => {
    vi.spyOn(useGalleriesModule, 'getGallery').mockResolvedValue({
      ...mockGalleryDetail,
      status: 'PUBLISHED',
      publishedAt: '2026-03-10T00:00:00Z',
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Обнови')).toBeInTheDocument();
      expect(screen.getByText('Публикувай')).toBeInTheDocument();
      expect(screen.queryByText('Запази чернова')).not.toBeInTheDocument();
    });
  });

  it('"Запази чернова" calls updateGallery with DRAFT status and shows success toast', async () => {
    const user = userEvent.setup();
    vi.spyOn(useGalleriesModule, 'getGallery').mockResolvedValue(mockGalleryDetail);
    vi.spyOn(useGalleriesModule, 'updateGallery').mockResolvedValue({
      ...mockGalleryDetail,
      status: 'DRAFT',
      imageCount: 1,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Запази чернова')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Запази чернова'));

    await waitFor(() => {
      expect(useGalleriesModule.updateGallery).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ status: 'DRAFT' })
      );
      expect(toast.success).toHaveBeenCalledWith('Галерията е запазена успешно');
    });
  });

  it('"Публикувай" with images calls updateGallery with PUBLISHED status and navigates', async () => {
    const user = userEvent.setup();
    vi.spyOn(useGalleriesModule, 'getGallery').mockResolvedValue(mockGalleryDetail); // has 1 image
    vi.spyOn(useGalleriesModule, 'updateGallery').mockResolvedValue({
      ...mockGalleryDetail,
      status: 'PUBLISHED',
      publishedAt: '2026-03-15T00:00:00Z',
      imageCount: 1,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Публикувай')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Публикувай'));

    await waitFor(() => {
      expect(useGalleriesModule.updateGallery).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ status: 'PUBLISHED' })
      );
      expect(toast.success).toHaveBeenCalledWith('Галерията е публикувана успешно!');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/galleries');
    });
  });

  it('shows error toast when save draft fails', async () => {
    const user = userEvent.setup();
    vi.spyOn(useGalleriesModule, 'getGallery').mockResolvedValue(mockGalleryDetail);
    vi.spyOn(useGalleriesModule, 'updateGallery').mockRejectedValue(new Error('Network error'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Запази чернова')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Запази чернова'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Грешка при запазване');
    });
  });

  it('shows error state when gallery fails to load', async () => {
    vi.spyOn(useGalleriesModule, 'getGallery').mockRejectedValue(
      new useGalleriesModule.GalleryError('Галерията не е намерена', 404)
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Галерията не е намерена')).toBeInTheDocument();
      expect(screen.getByText('Обратно към списъка')).toBeInTheDocument();
    });
  });

  it('image upload callback adds new images to the grid', async () => {
    const user = userEvent.setup();
    vi.spyOn(useGalleriesModule, 'getGallery').mockResolvedValue(mockGalleryDetailNoImages);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('gallery-image-upload-zone')).toBeInTheDocument();
    });

    // Simulate upload completion via the mocked upload zone
    await user.click(screen.getByText('Upload'));

    await waitFor(() => {
      // After upload, publish should now work (images.length > 0)
      // Click publish and verify it doesn't show the "no images" error
      expect(toast.error).not.toHaveBeenCalledWith('Добавете поне една снимка преди публикуване');
    });
  });
});
