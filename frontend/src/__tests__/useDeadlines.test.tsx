import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDeadlines, getDeadline, createDeadline, updateDeadline, deleteDeadline, DeadlineError } from '@/hooks/useDeadlines';
import api from '@/lib/api';

// Mock api
vi.mock('@/lib/api');

describe('useDeadlines hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches all deadlines successfully (ALL filter, no query param)', async () => {
    const mockDeadlines = [
      {
        id: 1,
        title: 'Записване за група',
        deadlineDate: '2026-04-01T00:00:00.000Z',
        isUrgent: false,
        status: 'PUBLISHED',
        description: null,
        publishedAt: null,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ];

    (api.get as any).mockResolvedValue({ data: { success: true, content: mockDeadlines } });

    const { result } = renderHook(() => useDeadlines());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockDeadlines);
    expect(result.current.error).toBeNull();
    expect(api.get).toHaveBeenCalledWith('/api/admin/v1/admission-deadlines');
  });

  it('fetches active deadlines with ?upcoming=true query param', async () => {
    (api.get as any).mockResolvedValue({ data: { success: true, content: [] } });

    const { result } = renderHook(() => useDeadlines('ACTIVE'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(api.get).toHaveBeenCalledWith('/api/admin/v1/admission-deadlines?upcoming=true');
  });

  it('applies client-side EXPIRED filter (deadlineDate < today)', async () => {
    const expired = {
      id: 1,
      title: 'Изтекъл срок',
      deadlineDate: '2020-01-01T00:00:00.000Z',
      isUrgent: false,
      status: 'PUBLISHED',
    };
    const active = {
      id: 2,
      title: 'Активен срок',
      deadlineDate: '2030-01-01T00:00:00.000Z',
      isUrgent: false,
      status: 'PUBLISHED',
    };
    (api.get as any).mockResolvedValue({ data: { success: true, content: [active, expired] } });

    const { result } = renderHook(() => useDeadlines('EXPIRED'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].title).toBe('Изтекъл срок');
    // EXPIRED fetches all, no query param
    expect(api.get).toHaveBeenCalledWith('/api/admin/v1/admission-deadlines');
  });

  it('sorts results by deadlineDate ascending (nearest first)', async () => {
    const later = {
      id: 2,
      title: 'По-далечен срок',
      deadlineDate: '2026-06-01T00:00:00.000Z',
      isUrgent: false,
      status: 'PUBLISHED',
    };
    const sooner = {
      id: 1,
      title: 'По-близък срок',
      deadlineDate: '2026-03-15T00:00:00.000Z',
      isUrgent: false,
      status: 'PUBLISHED',
    };
    (api.get as any).mockResolvedValue({ data: { success: true, content: [later, sooner] } });

    const { result } = renderHook(() => useDeadlines());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data[0].title).toBe('По-близък срок');
    expect(result.current.data[1].title).toBe('По-далечен срок');
  });

  it('handles fetch error', async () => {
    (api.get as any).mockRejectedValue({ response: { status: 500 } });

    const { result } = renderHook(() => useDeadlines());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(DeadlineError);
    expect(result.current.data).toEqual([]);
  });
});

describe('getDeadline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches single deadline successfully', async () => {
    const mockDeadline = { id: 1, title: 'Срок', deadlineDate: '2026-04-01T00:00:00.000Z', status: 'PUBLISHED' };
    (api.get as any).mockResolvedValue({ data: { success: true, content: mockDeadline } });

    const result = await getDeadline(1);

    expect(result).toEqual(mockDeadline);
    expect(api.get).toHaveBeenCalledWith('/api/admin/v1/admission-deadlines/1');
  });

  it('throws DeadlineError for 404', async () => {
    (api.get as any).mockRejectedValue({ response: { status: 404 } });

    await expect(getDeadline(999)).rejects.toThrow(DeadlineError);
  });
});

describe('createDeadline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates deadline successfully', async () => {
    const data = {
      title: 'Записване за група',
      deadlineDate: '2026-04-01T00:00:00.000Z',
      description: null,
      isUrgent: false,
      status: 'DRAFT',
    };
    const mockResponse = { id: 1, ...data, publishedAt: null, createdAt: '2026-01-01', updatedAt: '2026-01-01' };

    (api.post as any).mockResolvedValue({ data: { success: true, content: mockResponse } });

    const result = await createDeadline(data);

    expect(result).toEqual(mockResponse);
    expect(api.post).toHaveBeenCalledWith('/api/admin/v1/admission-deadlines', data);
  });

  it('throws DeadlineError for 400 invalid data', async () => {
    (api.post as any).mockRejectedValue({ response: { status: 400, data: { message: 'Invalid data' } } });

    await expect(createDeadline({})).rejects.toThrow(DeadlineError);
  });
});

describe('updateDeadline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates deadline successfully', async () => {
    const updateData = { title: 'Обновен срок' };
    const mockResponse = { id: 1, ...updateData, deadlineDate: '2026-04-01T00:00:00.000Z', status: 'PUBLISHED' };

    (api.put as any).mockResolvedValue({ data: { success: true, content: mockResponse } });

    const result = await updateDeadline(1, updateData);

    expect(result).toEqual(mockResponse);
    expect(api.put).toHaveBeenCalledWith('/api/admin/v1/admission-deadlines/1', updateData);
  });

  it('throws DeadlineError for 404', async () => {
    (api.put as any).mockRejectedValue({ response: { status: 404 } });

    await expect(updateDeadline(999, { title: 'Test' })).rejects.toThrow(DeadlineError);
  });
});

describe('deleteDeadline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes deadline and calls correct endpoint', async () => {
    (api.delete as any).mockResolvedValue({ data: { success: true } });

    await deleteDeadline(1);

    expect(api.delete).toHaveBeenCalledWith('/api/admin/v1/admission-deadlines/1');
  });

  it('throws DeadlineError for 404', async () => {
    (api.delete as any).mockRejectedValue({ response: { status: 404 } });

    await expect(deleteDeadline(999)).rejects.toThrow(DeadlineError);
  });
});
