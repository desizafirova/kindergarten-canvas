import { useState, useEffect, useCallback } from 'react';
import { AxiosError } from 'axios';
import api from '@/lib/api';
import { Deadline } from '@/types/deadline';

export type DeadlineFilter = 'ALL' | 'ACTIVE' | 'EXPIRED';

/** Custom error class with additional context */
export class DeadlineError extends Error {
  public readonly statusCode?: number;
  public readonly isNetworkError: boolean;
  public readonly isAuthError: boolean;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'DeadlineError';
    this.statusCode = statusCode;
    this.isNetworkError = !statusCode;
    this.isAuthError = statusCode === 401 || statusCode === 403;
  }
}

interface UseDeadlinesResult {
  data: Deadline[];
  loading: boolean;
  error: DeadlineError | null;
  refetch: () => void;
  /** Update local data for optimistic UI updates */
  setData: React.Dispatch<React.SetStateAction<Deadline[]>>;
}

const buildQueryString = (filter: DeadlineFilter): string => {
  if (filter === 'ACTIVE') return '?upcoming=true';
  return ''; // ALL and EXPIRED fetch all from API; EXPIRED filters client-side
};

/**
 * useDeadlines - Custom hook for fetching deadlines from the API.
 *
 * Features:
 * - Fetches deadlines with optional filter (ALL / ACTIVE / EXPIRED)
 * - For EXPIRED filter: fetches all then filters client-side (deadlineDate < today)
 * - Manages loading, error, and data states
 * - Sorts by deadlineDate ascending (nearest first)
 * - Provides refetch function for manual refresh
 * - Supports optimistic updates via setData
 *
 * @param filter - Optional filter: 'ALL' | 'ACTIVE' | 'EXPIRED' (defaults to 'ALL')
 * @returns {UseDeadlinesResult} - { data, loading, error, refetch, setData }
 */
export function useDeadlines(filter: DeadlineFilter = 'ALL'): UseDeadlinesResult {
  const [data, setData] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DeadlineError | null>(null);

  const fetchDeadlines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryString = buildQueryString(filter);
      const response = await api.get(`/api/admin/v1/admission-deadlines${queryString}`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'API returned non-success status');
      }

      let deadlines: Deadline[] = response.data.content || [];

      // Client-side filter for EXPIRED: deadlineDate < today
      if (filter === 'EXPIRED') {
        const now = new Date();
        deadlines = deadlines.filter(d => new Date(d.deadlineDate) < now);
      }

      // Sort by deadlineDate ASC (nearest first) per AC1
      deadlines = [...deadlines].sort(
        (a, b) => new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime()
      );

      setData(deadlines);
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

      setError(new DeadlineError(errorMessage, statusCode));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchDeadlines();
  }, [fetchDeadlines]);

  return {
    data,
    loading,
    error,
    refetch: fetchDeadlines,
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
 * getDeadline - Fetch a single deadline by ID.
 */
export async function getDeadline(id: number): Promise<Deadline> {
  try {
    const response = await api.get<JSendResponse<Deadline>>(`/api/admin/v1/admission-deadlines/${id}`);

    if (response.data.success && response.data.content) {
      return response.data.content;
    }

    throw new DeadlineError('Грешка при зареждане на срока');
  } catch (err) {
    const axiosError = err as AxiosError<{ message?: string }>;
    const statusCode = axiosError.response?.status;

    if (statusCode === 404) {
      throw new DeadlineError('Срокът не е намерен', 404);
    } else if (statusCode === 401) {
      throw new DeadlineError('Сесията е изтекла. Моля, влезте отново.', 401);
    } else if (statusCode === 403) {
      throw new DeadlineError('Нямате права за достъп до тази функция.', 403);
    }

    throw new DeadlineError(axiosError.response?.data?.message || 'Грешка при зареждане на срока', statusCode);
  }
}

/**
 * createDeadline - Create a new deadline.
 */
export async function createDeadline(data: object): Promise<Deadline> {
  try {
    const response = await api.post<JSendResponse<Deadline>>('/api/admin/v1/admission-deadlines', data);

    if (response.data.success && response.data.content) {
      return response.data.content;
    }

    throw new DeadlineError('Грешка при създаване на срока');
  } catch (err) {
    const axiosError = err as AxiosError<{ message?: string }>;
    const statusCode = axiosError.response?.status;

    if (statusCode === 400) {
      throw new DeadlineError(axiosError.response?.data?.message || 'Невалидни данни', 400);
    } else if (statusCode === 401) {
      throw new DeadlineError('Сесията е изтекла. Моля, влезте отново.', 401);
    } else if (statusCode === 403) {
      throw new DeadlineError('Нямате права за създаване на срокове.', 403);
    }

    throw new DeadlineError(axiosError.response?.data?.message || 'Грешка при създаване на срока', statusCode);
  }
}

/**
 * updateDeadline - Update an existing deadline.
 */
export async function updateDeadline(id: number, data: object): Promise<Deadline> {
  try {
    const response = await api.put<JSendResponse<Deadline>>(`/api/admin/v1/admission-deadlines/${id}`, data);

    if (response.data.success && response.data.content) {
      return response.data.content;
    }

    throw new DeadlineError('Грешка при обновяване на срока');
  } catch (err) {
    const axiosError = err as AxiosError<{ message?: string }>;
    const statusCode = axiosError.response?.status;

    if (statusCode === 404) {
      throw new DeadlineError('Срокът не е намерен', 404);
    } else if (statusCode === 400) {
      throw new DeadlineError(axiosError.response?.data?.message || 'Невалидни данни', 400);
    } else if (statusCode === 401) {
      throw new DeadlineError('Сесията е изтекла. Моля, влезте отново.', 401);
    } else if (statusCode === 403) {
      throw new DeadlineError('Нямате права за обновяване на срокове.', 403);
    }

    throw new DeadlineError(axiosError.response?.data?.message || 'Грешка при обновяване на срока', statusCode);
  }
}

/**
 * deleteDeadline - Delete a deadline by ID.
 */
export async function deleteDeadline(id: number): Promise<void> {
  try {
    const response = await api.delete<JSendResponse>(`/api/admin/v1/admission-deadlines/${id}`);

    if (!response.data.success) {
      throw new DeadlineError('Грешка при изтриване на срока');
    }
  } catch (err) {
    const axiosError = err as AxiosError<{ message?: string }>;
    const statusCode = axiosError.response?.status;

    if (statusCode === 404) {
      throw new DeadlineError('Срокът не е намерен', 404);
    } else if (statusCode === 401) {
      throw new DeadlineError('Сесията е изтекла. Моля, влезте отново.', 401);
    } else if (statusCode === 403) {
      throw new DeadlineError('Нямате права за изтриване на срокове.', 403);
    }

    throw new DeadlineError(axiosError.response?.data?.message || 'Грешка при изтриване на срока', statusCode);
  }
}

export default useDeadlines;
