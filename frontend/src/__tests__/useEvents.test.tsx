import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useEvents, getEvent, createEvent, updateEvent, deleteEvent, EventError } from '@/hooks/useEvents';
import api from '@/lib/api';

// Mock api
vi.mock('@/lib/api');

describe('useEvents hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches all events successfully', async () => {
    const mockEvents = [
      {
        id: 1,
        title: 'Пролетен концерт',
        eventDate: '2026-04-01T00:00:00.000Z',
        eventEndDate: null,
        location: null,
        isImportant: false,
        status: 'PUBLISHED',
        description: null,
        imageUrl: null,
        publishedAt: null,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ];

    (api.get as any).mockResolvedValue({ data: { success: true, content: mockEvents } });

    const { result } = renderHook(() => useEvents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockEvents);
    expect(result.current.error).toBeNull();
    expect(api.get).toHaveBeenCalledWith('/api/admin/v1/events');
  });

  it('fetches upcoming events with query param', async () => {
    (api.get as any).mockResolvedValue({ data: { success: true, content: [] } });

    const { result } = renderHook(() => useEvents('UPCOMING'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(api.get).toHaveBeenCalledWith('/api/admin/v1/events?upcoming=true');
  });

  it('filters past events client-side', async () => {
    const past = {
      id: 1,
      title: 'Минало',
      eventDate: '2020-01-01T00:00:00.000Z',
      status: 'PUBLISHED',
    };
    const future = {
      id: 2,
      title: 'Бъдещо',
      eventDate: '2030-01-01T00:00:00.000Z',
      status: 'PUBLISHED',
    };
    (api.get as any).mockResolvedValue({ data: { success: true, content: [past, future] } });

    const { result } = renderHook(() => useEvents('PAST'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].title).toBe('Минало');
  });

  it('handles fetch error', async () => {
    (api.get as any).mockRejectedValue({ response: { status: 500 } });

    const { result } = renderHook(() => useEvents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(EventError);
    expect(result.current.data).toEqual([]);
  });
});

describe('getEvent', () => {
  it('fetches single event successfully', async () => {
    const mockEvent = { id: 1, title: 'Събитие', eventDate: '2026-04-01T00:00:00.000Z', status: 'PUBLISHED' };
    (api.get as any).mockResolvedValue({ data: { success: true, content: mockEvent } });

    const result = await getEvent(1);

    expect(result).toEqual(mockEvent);
    expect(api.get).toHaveBeenCalledWith('/api/admin/v1/events/1');
  });

  it('throws EventError for 404', async () => {
    (api.get as any).mockRejectedValue({ response: { status: 404 } });

    await expect(getEvent(999)).rejects.toThrow(EventError);
  });
});

describe('createEvent', () => {
  it('creates event successfully', async () => {
    const eventData = {
      title: 'Пролетен концерт',
      eventDate: '2026-04-01T00:00:00.000Z',
      eventEndDate: null,
      location: null,
      description: null,
      isImportant: false,
      imageUrl: null,
      status: 'DRAFT' as const,
    };
    const mockResponse = { id: 1, ...eventData, publishedAt: null, createdAt: '2026-01-01', updatedAt: '2026-01-01' };

    (api.post as any).mockResolvedValue({ data: { success: true, content: mockResponse } });

    const result = await createEvent(eventData);

    expect(result).toEqual(mockResponse);
    expect(api.post).toHaveBeenCalledWith('/api/admin/v1/events', eventData);
  });

  it('throws EventError for 400 invalid data', async () => {
    (api.post as any).mockRejectedValue({ response: { status: 400, data: { message: 'Invalid data' } } });

    await expect(createEvent({ title: '', eventDate: '', eventEndDate: null, location: null, description: null, isImportant: false, imageUrl: null, status: 'DRAFT' })).rejects.toThrow(EventError);
  });
});

describe('updateEvent', () => {
  it('updates event successfully', async () => {
    const updateData = { title: 'Обновено събитие' };
    const mockResponse = { id: 1, ...updateData, eventDate: '2026-04-01T00:00:00.000Z', status: 'PUBLISHED' };

    (api.put as any).mockResolvedValue({ data: { success: true, content: mockResponse } });

    const result = await updateEvent(1, updateData);

    expect(result).toEqual(mockResponse);
    expect(api.put).toHaveBeenCalledWith('/api/admin/v1/events/1', updateData);
  });

  it('throws EventError for 404', async () => {
    (api.put as any).mockRejectedValue({ response: { status: 404 } });

    await expect(updateEvent(999, { title: 'Test' })).rejects.toThrow(EventError);
  });
});

describe('deleteEvent', () => {
  it('deletes event successfully', async () => {
    (api.delete as any).mockResolvedValue({ data: { success: true } });

    await deleteEvent(1);

    expect(api.delete).toHaveBeenCalledWith('/api/admin/v1/events/1');
  });

  it('throws EventError for 404', async () => {
    (api.delete as any).mockRejectedValue({ response: { status: 404 } });

    await expect(deleteEvent(999)).rejects.toThrow(EventError);
  });
});
