import { useState, useEffect, useCallback } from 'react';
import { AxiosError } from 'axios';
import api from '@/lib/api';
import { Job } from '@/types/job';
import { JobFormData } from '@/schemas/job-form.schema';

export type JobFilter = 'ALL' | 'ACTIVE' | 'CLOSED';

/** Custom error class with additional context */
export class JobError extends Error {
  public readonly statusCode?: number;
  public readonly isNetworkError: boolean;
  public readonly isAuthError: boolean;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'JobError';
    this.statusCode = statusCode;
    this.isNetworkError = !statusCode;
    this.isAuthError = statusCode === 401 || statusCode === 403;
  }
}

interface UseJobsResult {
  data: Job[];
  loading: boolean;
  error: JobError | null;
  refetch: () => void;
  /** Update local data for optimistic UI updates */
  setData: React.Dispatch<React.SetStateAction<Job[]>>;
}

const buildQueryString = (filter: JobFilter): string => {
  if (filter === 'ACTIVE') return '?isActive=true';
  if (filter === 'CLOSED') return '?isActive=false';
  return ''; // ALL = fetch all from API
};

/**
 * useJobs - Custom hook for fetching jobs from the API.
 *
 * Features:
 * - Fetches jobs with optional isActive filter
 * - No client-side sorting — backend returns newest-first by default (createdAt DESC)
 * - Manages loading, error, and data states
 * - Enhanced error handling with specific error types
 * - Provides refetch function for manual refresh
 * - Supports optimistic updates via setData
 *
 * @param filter - Optional filter: 'ALL' | 'ACTIVE' | 'CLOSED' (defaults to 'ALL')
 * @returns {UseJobsResult} - { data, loading, error, refetch, setData }
 */
export function useJobs(filter: JobFilter = 'ALL'): UseJobsResult {
  const [data, setData] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<JobError | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryString = buildQueryString(filter);
      const response = await api.get(`/api/admin/v1/jobs${queryString}`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'API returned non-success status');
      }

      const jobs: Job[] = response.data.content || [];
      setData(jobs);
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

      setError(new JobError(errorMessage, statusCode));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    data,
    loading,
    error,
    refetch: fetchJobs,
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
 * getJob - Fetch a single job by ID.
 */
export async function getJob(id: number): Promise<Job> {
  try {
    const response = await api.get<JSendResponse<Job>>(`/api/admin/v1/jobs/${id}`);

    if (response.data.success && response.data.content) {
      return response.data.content;
    }

    throw new JobError('Грешка при зареждане на позицията');
  } catch (err) {
    const axiosError = err as AxiosError<{ message?: string }>;
    const statusCode = axiosError.response?.status;

    if (statusCode === 404) {
      throw new JobError('Позицията не е намерена', 404);
    } else if (statusCode === 401) {
      throw new JobError('Сесията е изтекла. Моля, влезте отново.', 401);
    } else if (statusCode === 403) {
      throw new JobError('Нямате права за достъп до тази функция.', 403);
    }

    throw new JobError(axiosError.response?.data?.message || 'Грешка при зареждане на позицията', statusCode);
  }
}

/**
 * createJob - Create a new job posting.
 */
export async function createJob(data: Partial<JobFormData>): Promise<Job> {
  try {
    const response = await api.post<JSendResponse<Job>>('/api/admin/v1/jobs', data);

    if (response.data.success && response.data.content) {
      return response.data.content;
    }

    throw new JobError('Грешка при създаване на позицията');
  } catch (err) {
    const axiosError = err as AxiosError<{ message?: string }>;
    const statusCode = axiosError.response?.status;

    if (statusCode === 400) {
      throw new JobError(axiosError.response?.data?.message || 'Невалидни данни', 400);
    } else if (statusCode === 401) {
      throw new JobError('Сесията е изтекла. Моля, влезте отново.', 401);
    } else if (statusCode === 403) {
      throw new JobError('Нямате права за създаване на позиции.', 403);
    }

    throw new JobError(axiosError.response?.data?.message || 'Грешка при създаване на позицията', statusCode);
  }
}

/**
 * updateJob - Update an existing job posting.
 */
export async function updateJob(id: number, data: Partial<JobFormData>): Promise<Job> {
  try {
    const response = await api.put<JSendResponse<Job>>(`/api/admin/v1/jobs/${id}`, data);

    if (response.data.success && response.data.content) {
      return response.data.content;
    }

    throw new JobError('Грешка при обновяване на позицията');
  } catch (err) {
    const axiosError = err as AxiosError<{ message?: string }>;
    const statusCode = axiosError.response?.status;

    if (statusCode === 404) {
      throw new JobError('Позицията не е намерена', 404);
    } else if (statusCode === 400) {
      throw new JobError(axiosError.response?.data?.message || 'Невалидни данни', 400);
    } else if (statusCode === 401) {
      throw new JobError('Сесията е изтекла. Моля, влезте отново.', 401);
    } else if (statusCode === 403) {
      throw new JobError('Нямате права за обновяване на позиции.', 403);
    }

    throw new JobError(axiosError.response?.data?.message || 'Грешка при обновяване на позицията', statusCode);
  }
}

/**
 * deleteJob - Delete a job posting by ID.
 */
export async function deleteJob(id: number): Promise<void> {
  try {
    const response = await api.delete<JSendResponse>(`/api/admin/v1/jobs/${id}`);

    if (!response.data.success) {
      throw new JobError('Грешка при изтриване на позицията');
    }
  } catch (err) {
    const axiosError = err as AxiosError<{ message?: string }>;
    const statusCode = axiosError.response?.status;

    if (statusCode === 404) {
      throw new JobError('Позицията не е намерена', 404);
    } else if (statusCode === 401) {
      throw new JobError('Сесията е изтекла. Моля, влезте отново.', 401);
    } else if (statusCode === 403) {
      throw new JobError('Нямате права за изтриване на позиции.', 403);
    }

    throw new JobError(axiosError.response?.data?.message || 'Грешка при изтриване на позицията', statusCode);
  }
}
