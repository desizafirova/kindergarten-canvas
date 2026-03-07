import { useState, useEffect, useCallback } from 'react';
import { AxiosError } from 'axios';
import api from '@/lib/api';
import { Teacher, TeacherStatus } from '@/types/teacher';

/** Custom error class with additional context */
export class TeacherError extends Error {
  public readonly statusCode?: number;
  public readonly isNetworkError: boolean;
  public readonly isAuthError: boolean;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'TeacherError';
    this.statusCode = statusCode;
    this.isNetworkError = !statusCode;
    this.isAuthError = statusCode === 401 || statusCode === 403;
  }
}

interface UseTeachersResult {
  data: Teacher[];
  loading: boolean;
  error: TeacherError | null;
  refetch: () => void;
  /** Update local data for optimistic UI updates */
  setData: React.Dispatch<React.SetStateAction<Teacher[]>>;
}

/**
 * useTeachers - Custom hook for fetching teachers from the API.
 *
 * Features:
 * - Fetches teachers with optional status filtering
 * - Manages loading, error, and data states
 * - Enhanced error handling with specific error types
 * - Provides refetch function for manual refresh (e.g., after delete)
 * - Supports optimistic updates via setData
 *
 * @param status - Optional filter: 'DRAFT' | 'PUBLISHED' | undefined (all)
 * @returns {UseTeachersResult} - { data, loading, error, refetch, setData }
 */
export function useTeachers(status?: TeacherStatus): UseTeachersResult {
  const [data, setData] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<TeacherError | null>(null);

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query string with optional status filter
      const queryParam = status ? `?status=${status}` : '';
      const response = await api.get(`/api/admin/v1/teachers${queryParam}`);

      // Validate API response status before using content
      // Admin API format: { success: boolean, message: string, content: Teacher[] }
      if (!response.data.success) {
        throw new Error(response.data.message || 'API returned non-success status');
      }

      // Extract teachers from API response structure
      setData(response.data.content || []);
    } catch (err) {
      // Enhanced error handling
      const axiosError = err as AxiosError<{ message?: string }>;

      let errorMessage = 'Възникна неочаквана грешка';
      let statusCode: number | undefined;

      if (axiosError.response) {
        // Server responded with error status
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
        // Network error - no response received
        errorMessage = 'Грешка при свързване със сървъра. Проверете интернет връзката.';
      }

      setError(new TeacherError(errorMessage, statusCode));
    } finally {
      setLoading(false);
    }
  }, [status]);

  // Fetch teachers on mount and when status changes
  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  return {
    data,
    loading,
    error,
    refetch: fetchTeachers,
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
 * getTeacher - Fetch a single teacher by ID.
 *
 * @param id - Teacher ID
 * @returns Promise<Teacher>
 * @throws TeacherError on failure
 */
export async function getTeacher(id: number): Promise<Teacher> {
  try {
    const response = await api.get<JSendResponse<Teacher>>(`/api/admin/v1/teachers/${id}`);

    if (response.data.success && response.data.content) {
      return response.data.content;
    }

    throw new TeacherError('Грешка при зареждане на учителя');
  } catch (err) {
    const axiosError = err as AxiosError<{ message?: string }>;
    const statusCode = axiosError.response?.status;

    if (statusCode === 404) {
      throw new TeacherError('Учителят не е намерен', 404);
    } else if (statusCode === 401) {
      throw new TeacherError('Сесията е изтекла. Моля, влезте отново.', 401);
    } else if (statusCode === 403) {
      throw new TeacherError('Нямате права за достъп до тази функция.', 403);
    }

    throw new TeacherError(axiosError.response?.data?.message || 'Грешка при зареждане на учителя', statusCode);
  }
}

/**
 * createTeacher - Create a new teacher.
 *
 * @param data - Teacher data (without ID)
 * @returns Promise<Teacher> - Created teacher with ID
 * @throws TeacherError on failure
 */
export async function createTeacher(data: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt' | 'displayOrder'>): Promise<Teacher> {
  try {
    const response = await api.post<JSendResponse<Teacher>>('/api/admin/v1/teachers', data);

    if (response.data.success && response.data.content) {
      return response.data.content;
    }

    throw new TeacherError('Грешка при създаване на учителя');
  } catch (err) {
    const axiosError = err as AxiosError<{ message?: string }>;
    const statusCode = axiosError.response?.status;

    if (statusCode === 400) {
      throw new TeacherError(axiosError.response?.data?.message || 'Невалидни данни', 400);
    } else if (statusCode === 401) {
      throw new TeacherError('Сесията е изтекла. Моля, влезте отново.', 401);
    } else if (statusCode === 403) {
      throw new TeacherError('Нямате права за създаване на учители.', 403);
    }

    throw new TeacherError(axiosError.response?.data?.message || 'Грешка при създаване на учителя', statusCode);
  }
}

/**
 * updateTeacher - Update an existing teacher.
 *
 * @param id - Teacher ID
 * @param data - Partial teacher data to update
 * @returns Promise<Teacher> - Updated teacher
 * @throws TeacherError on failure
 */
export async function updateTeacher(id: number, data: Partial<Omit<Teacher, 'id' | 'createdAt' | 'updatedAt' | 'displayOrder'>>): Promise<Teacher> {
  try {
    const response = await api.put<JSendResponse<Teacher>>(`/api/admin/v1/teachers/${id}`, data);

    if (response.data.success && response.data.content) {
      return response.data.content;
    }

    throw new TeacherError('Грешка при обновяване на учителя');
  } catch (err) {
    const axiosError = err as AxiosError<{ message?: string }>;
    const statusCode = axiosError.response?.status;

    if (statusCode === 404) {
      throw new TeacherError('Учителят не е намерен', 404);
    } else if (statusCode === 400) {
      throw new TeacherError(axiosError.response?.data?.message || 'Невалидни данни', 400);
    } else if (statusCode === 401) {
      throw new TeacherError('Сесията е изтекла. Моля, влезте отново.', 401);
    } else if (statusCode === 403) {
      throw new TeacherError('Нямате права за обновяване на учители.', 403);
    }

    throw new TeacherError(axiosError.response?.data?.message || 'Грешка при обновяване на учителя', statusCode);
  }
}

/**
 * deleteTeacher - Delete a teacher by ID.
 *
 * @param id - Teacher ID
 * @returns Promise<void>
 * @throws TeacherError on failure
 */
export async function deleteTeacher(id: number): Promise<void> {
  try {
    const response = await api.delete<JSendResponse>(`/api/admin/v1/teachers/${id}`);

    if (!response.data.success) {
      throw new TeacherError('Грешка при изтриване на учителя');
    }
  } catch (err) {
    const axiosError = err as AxiosError<{ message?: string }>;
    const statusCode = axiosError.response?.status;

    if (statusCode === 404) {
      throw new TeacherError('Учителят не е намерен', 404);
    } else if (statusCode === 401) {
      throw new TeacherError('Сесията е изтекла. Моля, влезте отново.', 401);
    } else if (statusCode === 403) {
      throw new TeacherError('Нямате права за изтриване на учители.', 403);
    }

    throw new TeacherError(axiosError.response?.data?.message || 'Грешка при изтриване на учителя', statusCode);
  }
}
