import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  useGalleries,
  getGallery,
  createGallery,
  updateGallery,
  deleteGallery,
  GalleryError,
} from '@/hooks/useGalleries';
import api from '@/lib/api';

// Mock api
vi.mock('@/lib/api');

const mockGallery = {
  id: 1,
  title: 'Пролетна галерия',
  description: 'Описание',
  coverImageUrl: null,
  status: 'PUBLISHED' as const,
  publishedAt: '2026-03-01T00:00:00Z',
  createdAt: '2026-03-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
  imageCount: 5,
};

const mockGalleryDetail = {
  ...mockGallery,
  imageCount: undefined,
  images: [],
};

describe('useGalleries hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and returns galleries', async () => {
    (api.get as any).mockResolvedValue({ data: { success: true, content: [mockGallery] } });

    const { result } = renderHook(() => useGalleries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([mockGallery]);
    expect(result.current.error).toBeNull();
    expect(api.get).toHaveBeenCalledWith('/api/admin/v1/galleries');
  });

  it('passes ?status=DRAFT when filter=DRAFT', async () => {
    (api.get as any).mockResolvedValue({ data: { success: true, content: [] } });

    const { result } = renderHook(() => useGalleries('DRAFT'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(api.get).toHaveBeenCalledWith('/api/admin/v1/galleries?status=DRAFT');
  });

  it('passes ?status=PUBLISHED when filter=PUBLISHED', async () => {
    (api.get as any).mockResolvedValue({ data: { success: true, content: [] } });

    const { result } = renderHook(() => useGalleries('PUBLISHED'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(api.get).toHaveBeenCalledWith('/api/admin/v1/galleries?status=PUBLISHED');
  });

  it('handles loading state correctly', async () => {
    (api.get as any).mockResolvedValue({ data: { success: true, content: [] } });

    const { result } = renderHook(() => useGalleries());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('handles fetch error gracefully', async () => {
    (api.get as any).mockRejectedValue({ response: { status: 500 } });

    const { result } = renderHook(() => useGalleries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(GalleryError);
    expect(result.current.data).toEqual([]);
  });

  it('refetch() triggers new API call', async () => {
    (api.get as any).mockResolvedValue({ data: { success: true, content: [mockGallery] } });

    const { result } = renderHook(() => useGalleries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(api.get).toHaveBeenCalledTimes(1);

    result.current.refetch();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });
});

describe('getGallery', () => {
  it('fetches single gallery successfully', async () => {
    (api.get as any).mockResolvedValue({ data: { success: true, content: mockGalleryDetail } });

    const result = await getGallery(1);

    expect(result).toEqual(mockGalleryDetail);
    expect(api.get).toHaveBeenCalledWith('/api/admin/v1/galleries/1');
  });

  it('throws GalleryError for 404', async () => {
    (api.get as any).mockRejectedValue({ response: { status: 404 } });

    await expect(getGallery(999)).rejects.toThrow(GalleryError);
  });
});

describe('createGallery', () => {
  it('creates gallery successfully', async () => {
    const galleryData = { title: 'Нова галерия', status: 'DRAFT' as const };
    (api.post as any).mockResolvedValue({ data: { success: true, content: { id: 1, ...galleryData, imageCount: 0, description: null, coverImageUrl: null, publishedAt: null, createdAt: '', updatedAt: '' } } });

    const result = await createGallery(galleryData);

    expect(result).toMatchObject(galleryData);
    expect(api.post).toHaveBeenCalledWith('/api/admin/v1/galleries', galleryData);
  });

  it('throws GalleryError for 400 invalid data', async () => {
    (api.post as any).mockRejectedValue({ response: { status: 400, data: { message: 'Invalid data' } } });

    await expect(createGallery({})).rejects.toThrow(GalleryError);
  });
});

describe('updateGallery', () => {
  it('updates gallery successfully', async () => {
    const updateData = { title: 'Обновена галерия' };
    (api.put as any).mockResolvedValue({ data: { success: true, content: { id: 1, ...updateData, imageCount: 0, description: null, coverImageUrl: null, status: 'DRAFT', publishedAt: null, createdAt: '', updatedAt: '' } } });

    const result = await updateGallery(1, updateData);

    expect(result).toMatchObject(updateData);
    expect(api.put).toHaveBeenCalledWith('/api/admin/v1/galleries/1', updateData);
  });

  it('throws GalleryError for 404', async () => {
    (api.put as any).mockRejectedValue({ response: { status: 404 } });

    await expect(updateGallery(999, { title: 'Test' })).rejects.toThrow(GalleryError);
  });
});

describe('deleteGallery', () => {
  it('deletes gallery successfully', async () => {
    (api.delete as any).mockResolvedValue({ data: { success: true } });

    await deleteGallery(1);

    expect(api.delete).toHaveBeenCalledWith('/api/admin/v1/galleries/1');
  });

  it('throws GalleryError for 404', async () => {
    (api.delete as any).mockRejectedValue({ response: { status: 404 } });

    await expect(deleteGallery(999)).rejects.toThrow(GalleryError);
  });
});
