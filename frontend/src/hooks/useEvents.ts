import { useState, useEffect, useCallback } from 'react';
import { AxiosError } from 'axios';
import api from '@/lib/api';
import { Event } from '@/types/event';

export type EventFilter = 'ALL' | 'UPCOMING' | 'PAST';

/** Custom error class with additional context */
export class EventError extends Error {
  public readonly statusCode?: number;
  public readonly isNetworkError: boolean;
  public readonly isAuthError: boolean;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'EventError';
    this.statusCode = statusCode;
    this.isNetworkError = !statusCode;
    this.isAuthError = statusCode === 401 || statusCode === 403;
  }
}

interface UseEventsResult {
  data: Event[];
  loading: boolean;
  error: EventError | null;
  refetch: () => void;
  /** Update local data for optimistic UI updates */
  setData: React.Dispatch<React.SetStateAction<Event[]>>;
}

const buildQueryString = (filter: EventFilter): string => {
  if (filter === 'UPCOMING') return '?upcoming=true';
  return ''; // ALL and PAST fetch all from API; PAST filters client-side
};

/**
 * useEvents - Custom hook for fetching events from the API.
 *
 * Features:
 * - Fetches events with optional time-based filter
 * - For PAST filter: fetches all then filters client-side (eventDate < today)
 * - Manages loading, error, and data states
 * - Enhanced error handling with specific error types
 * - Provides refetch function for manual refresh
 * - Supports optimistic updates via setData
 *
 * @param filter - Optional filter: 'ALL' | 'UPCOMING' | 'PAST' (defaults to 'ALL')
 * @returns {UseEventsResult} - { data, loading, error, refetch, setData }
 */
export function useEvents(filter: EventFilter = 'ALL'): UseEventsResult {
  const [data, setData] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<EventError | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryString = buildQueryString(filter);
      const response = await api.get(`/api/admin/v1/events${queryString}`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'API returned non-success status');
      }

      let events: Event[] = response.data.content || [];

      // Client-side filter for PAST: eventDate < today
      if (filter === 'PAST') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        events = events.filter(event => new Date(event.eventDate) < today);
      }

      // Sort by eventDate ascending (upcoming first) per AC 1
      events = [...events].sort(
        (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
      );

      setData(events);
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

      setError(new EventError(errorMessage, statusCode));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    data,
    loading,
    error,
    refetch: fetchEvents,
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
 * getEvent - Fetch a single event by ID.
 */
export async function getEvent(id: number): Promise<Event> {
  try {
    const response = await api.get<JSendResponse<Event>>(`/api/admin/v1/events/${id}`);

    if (response.data.success && response.data.content) {
      return response.data.content;
    }

    throw new EventError('Грешка при зареждане на събитието');
  } catch (err) {
    const axiosError = err as AxiosError<{ message?: string }>;
    const statusCode = axiosError.response?.status;

    if (statusCode === 404) {
      throw new EventError('Събитието не е намерено', 404);
    } else if (statusCode === 401) {
      throw new EventError('Сесията е изтекла. Моля, влезте отново.', 401);
    } else if (statusCode === 403) {
      throw new EventError('Нямате права за достъп до тази функция.', 403);
    }

    throw new EventError(axiosError.response?.data?.message || 'Грешка при зареждане на събитието', statusCode);
  }
}

/**
 * createEvent - Create a new event.
 */
export async function createEvent(data: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt'>): Promise<Event> {
  try {
    const response = await api.post<JSendResponse<Event>>('/api/admin/v1/events', data);

    if (response.data.success && response.data.content) {
      return response.data.content;
    }

    throw new EventError('Грешка при създаване на събитието');
  } catch (err) {
    const axiosError = err as AxiosError<{ message?: string }>;
    const statusCode = axiosError.response?.status;

    if (statusCode === 400) {
      throw new EventError(axiosError.response?.data?.message || 'Невалидни данни', 400);
    } else if (statusCode === 401) {
      throw new EventError('Сесията е изтекла. Моля, влезте отново.', 401);
    } else if (statusCode === 403) {
      throw new EventError('Нямате права за създаване на събития.', 403);
    }

    throw new EventError(axiosError.response?.data?.message || 'Грешка при създаване на събитието', statusCode);
  }
}

/**
 * updateEvent - Update an existing event.
 */
export async function updateEvent(id: number, data: Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt'>>): Promise<Event> {
  try {
    const response = await api.put<JSendResponse<Event>>(`/api/admin/v1/events/${id}`, data);

    if (response.data.success && response.data.content) {
      return response.data.content;
    }

    throw new EventError('Грешка при обновяване на събитието');
  } catch (err) {
    const axiosError = err as AxiosError<{ message?: string }>;
    const statusCode = axiosError.response?.status;

    if (statusCode === 404) {
      throw new EventError('Събитието не е намерено', 404);
    } else if (statusCode === 400) {
      throw new EventError(axiosError.response?.data?.message || 'Невалидни данни', 400);
    } else if (statusCode === 401) {
      throw new EventError('Сесията е изтекла. Моля, влезте отново.', 401);
    } else if (statusCode === 403) {
      throw new EventError('Нямате права за обновяване на събития.', 403);
    }

    throw new EventError(axiosError.response?.data?.message || 'Грешка при обновяване на събитието', statusCode);
  }
}

/**
 * deleteEvent - Delete an event by ID.
 */
export async function deleteEvent(id: number): Promise<void> {
  try {
    const response = await api.delete<JSendResponse>(`/api/admin/v1/events/${id}`);

    if (!response.data.success) {
      throw new EventError('Грешка при изтриване на събитието');
    }
  } catch (err) {
    const axiosError = err as AxiosError<{ message?: string }>;
    const statusCode = axiosError.response?.status;

    if (statusCode === 404) {
      throw new EventError('Събитието не е намерено', 404);
    } else if (statusCode === 401) {
      throw new EventError('Сесията е изтекла. Моля, влезте отново.', 401);
    } else if (statusCode === 403) {
      throw new EventError('Нямате права за изтриване на събития.', 403);
    }

    throw new EventError(axiosError.response?.data?.message || 'Грешка при изтриване на събитието', statusCode);
  }
}
