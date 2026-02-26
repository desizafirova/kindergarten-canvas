import { useState, useEffect, useCallback } from 'react';
import { AxiosError } from 'axios';
import api from '@/lib/api';
import { NewsItem, NewsStatus } from '@/types/news';

/** Custom error class with additional context */
export class NewsError extends Error {
  public readonly statusCode?: number;
  public readonly isNetworkError: boolean;
  public readonly isAuthError: boolean;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'NewsError';
    this.statusCode = statusCode;
    this.isNetworkError = !statusCode;
    this.isAuthError = statusCode === 401 || statusCode === 403;
  }
}

interface UseNewsResult {
  data: NewsItem[];
  loading: boolean;
  error: NewsError | null;
  refetch: () => void;
  /** Update local data for optimistic UI updates */
  setData: React.Dispatch<React.SetStateAction<NewsItem[]>>;
}

/**
 * useNews - Custom hook for fetching news items from the API.
 *
 * Features:
 * - Fetches news items with optional status filtering
 * - Manages loading, error, and data states
 * - Enhanced error handling with specific error types
 * - Provides refetch function for manual refresh (e.g., after delete)
 * - Supports optimistic updates via setData
 *
 * @param status - Optional filter: 'DRAFT' | 'PUBLISHED' | undefined (all)
 * @returns {UseNewsResult} - { data, loading, error, refetch, setData }
 */
export function useNews(status?: NewsStatus): UseNewsResult {
  const [data, setData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<NewsError | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query string with optional status filter
      const queryParam = status ? `?status=${status}` : '';
      const response = await api.get(`/api/admin/v1/news${queryParam}`);

      // Extract news items from API response structure
      // Response format: { success: true, content: NewsItem[] }
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

      setError(new NewsError(errorMessage, statusCode));
    } finally {
      setLoading(false);
    }
  }, [status]);

  // Fetch news on mount and when status changes
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return {
    data,
    loading,
    error,
    refetch: fetchNews,
    setData,
  };
}
