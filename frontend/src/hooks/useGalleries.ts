import { useState, useEffect, useCallback } from 'react';
import { AxiosError } from 'axios';
import api from '@/lib/api';
import { Gallery, GalleryDetail } from '@/types/gallery';
import { GalleryFormData } from '@/schemas/gallery-form.schema';

export type GalleryFilter = 'ALL' | 'DRAFT' | 'PUBLISHED';

/** Custom error class with additional context */
export class GalleryError extends Error {
  public readonly statusCode?: number;
  public readonly isNetworkError: boolean;
  public readonly isAuthError: boolean;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'GalleryError';
    this.statusCode = statusCode;
    this.isNetworkError = !statusCode;
    this.isAuthError = statusCode === 401 || statusCode === 403;
  }
}

interface UseGalleriesResult {
  data: Gallery[];
  loading: boolean;
  error: GalleryError | null;
  refetch: () => void;
  /** Update local data for optimistic UI updates */
  setData: React.Dispatch<React.SetStateAction<Gallery[]>>;
}

const buildQueryString = (filter: GalleryFilter): string => {
  if (filter === 'DRAFT') return '?status=DRAFT';
  if (filter === 'PUBLISHED') return '?status=PUBLISHED';
  return ''; // ALL = fetch all from API
};

/**
 * useGalleries - Custom hook for fetching galleries from the API.
 *
 * Features:
 * - Fetches galleries with optional status filter
 * - No client-side sorting — backend returns newest-first by default
 * - Manages loading, error, and data states
 * - Enhanced error handling with specific error types
 * - Provides refetch function for manual refresh
 * - Supports optimistic updates via setData
 *
 * @param filter - Optional filter: 'ALL' | 'DRAFT' | 'PUBLISHED' (defaults to 'ALL')
 * @returns {UseGalleriesResult} - { data, loading, error, refetch, setData }
 */
export function useGalleries(filter: GalleryFilter = 'ALL'): UseGalleriesResult {
  const [data, setData] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<GalleryError | null>(null);

  const fetchGalleries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryString = buildQueryString(filter);
      const response = await api.get(`/api/admin/v1/galleries${queryString}`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'API returned non-success status');
      }

      const galleries: Gallery[] = response.data.content || [];
      setData(galleries);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;

      let errorMessage = 'Възникна неочаквана грешка';
      let statusCode: number | undefined;

      if (axiosError.response) {
        statusCode = axiosError.response.status;

        if (statusCode === 401) {
          errorMessage = 'Сесията е изтекла. Моля, влезте отново.';
        } else if (statusCode === 403) {
          errorMessage = 'Нямате права за достъп до тази функция.';
        } else if (statusCode === 500) {
          errorMessage = 'Сървърна грешка. Моля, опитайте по-късно.';
        } else {
          errorMessage = axiosError.response.data?.message || 'Грешка при зареждане на данните.';
        }
      } else if (axiosError.request) {
        errorMessage = 'Грешка при свързване със сървъра. Проверете интернет връзката.';
      }

      setError(new GalleryError(errorMessage, statusCode));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchGalleries();
  }, [fetchGalleries]);

  return {
    data,
    loading,
    error,
    refetch: fetchGalleries,
    setData,
  };
}

// ============================================================================
// Individual CRUD API Functions
// ============================================================================

export interface JSendResponse<T = any> {
  success: boolean;
  message?: string;
  content?: T;
}

/**
 * getGallery - Fetch a single gallery by ID (with images).
 */
export async function getGallery(id: number): Promise<GalleryDetail> {
  try {
    const response = await api.get<JSendResponse<GalleryDetail>>(`/api/admin/v1/galleries/${id}`);

    if (response.data.success && response.data.content) {
      return response.data.content;
    }

    throw new GalleryError('Грешка при зареждане на галерията');
  } catch (err) {
    if (err instanceof GalleryError) throw err;

    const axiosError = err as AxiosError<{ message?: string }>;
    const statusCode = axiosError.response?.status;

    if (statusCode === 404) {
      throw new GalleryError('Галерията не е намерена', 404);
    } else if (statusCode === 401) {
      throw new GalleryError('Сесията е изтекла. Моля, влезте отново.', 401);
    } else if (statusCode === 403) {
      throw new GalleryError('Нямате права за достъп до тази функция.', 403);
    }

    throw new GalleryError(
      axiosError.response?.data?.message || 'Грешка при зареждане на галерията',
      statusCode
    );
  }
}

/**
 * createGallery - Create a new gallery.
 */
export async function createGallery(data: Partial<GalleryFormData>): Promise<Gallery> {
  try {
    const response = await api.post<JSendResponse<Gallery>>('/api/admin/v1/galleries', data);

    if (response.data.success && response.data.content) {
      return response.data.content;
    }

    throw new GalleryError('Грешка при създаване на галерията');
  } catch (err) {
    if (err instanceof GalleryError) throw err;

    const axiosError = err as AxiosError<{ message?: string }>;
    const statusCode = axiosError.response?.status;

    if (statusCode === 400) {
      throw new GalleryError(axiosError.response?.data?.message || 'Невалидни данни', 400);
    } else if (statusCode === 401) {
      throw new GalleryError('Сесията е изтекла. Моля, влезте отново.', 401);
    } else if (statusCode === 403) {
      throw new GalleryError('Нямате права за създаване на галерии.', 403);
    }

    throw new GalleryError(
      axiosError.response?.data?.message || 'Грешка при създаване на галерията',
      statusCode
    );
  }
}

/**
 * updateGallery - Update an existing gallery.
 */
export async function updateGallery(id: number, data: Partial<GalleryFormData>): Promise<Gallery> {
  try {
    const response = await api.put<JSendResponse<Gallery>>(`/api/admin/v1/galleries/${id}`, data);

    if (response.data.success && response.data.content) {
      return response.data.content;
    }

    throw new GalleryError('Грешка при обновяване на галерията');
  } catch (err) {
    if (err instanceof GalleryError) throw err;

    const axiosError = err as AxiosError<{ message?: string }>;
    const statusCode = axiosError.response?.status;

    if (statusCode === 404) {
      throw new GalleryError('Галерията не е намерена', 404);
    } else if (statusCode === 400) {
      throw new GalleryError(axiosError.response?.data?.message || 'Невалидни данни', 400);
    } else if (statusCode === 401) {
      throw new GalleryError('Сесията е изтекла. Моля, влезте отново.', 401);
    } else if (statusCode === 403) {
      throw new GalleryError('Нямате права за обновяване на галерии.', 403);
    }

    throw new GalleryError(
      axiosError.response?.data?.message || 'Грешка при обновяване на галерията',
      statusCode
    );
  }
}

/**
 * deleteGallery - Delete a gallery by ID (cascade removes all images).
 */
export async function deleteGallery(id: number): Promise<void> {
  try {
    const response = await api.delete<JSendResponse>(`/api/admin/v1/galleries/${id}`);

    if (!response.data.success) {
      throw new GalleryError('Грешка при изтриване на галерията');
    }
  } catch (err) {
    if (err instanceof GalleryError) throw err;

    const axiosError = err as AxiosError<{ message?: string }>;
    const statusCode = axiosError.response?.status;

    if (statusCode === 404) {
      throw new GalleryError('Галерията не е намерена', 404);
    } else if (statusCode === 401) {
      throw new GalleryError('Сесията е изтекла. Моля, влезте отново.', 401);
    } else if (statusCode === 403) {
      throw new GalleryError('Нямате права за изтриване на галерии.', 403);
    }

    throw new GalleryError(
      axiosError.response?.data?.message || 'Грешка при изтриване на галерията',
      statusCode
    );
  }
}
