/**
 * useContentCounts Hook Tests
 * Tests API integration and error handling for content counts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useContentCounts } from '@/hooks/useContentCounts';
import api from '@/lib/api';

// Mock the API module
vi.mock('@/lib/api');

describe('useContentCounts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches data from API endpoint successfully', async () => {
    const mockData = {
      news: { draft: 2, published: 5 },
      careers: { draft: 1, published: 3 },
      events: { draft: 0, published: 2 },
      deadlines: { draft: 3, published: 1 },
      gallery: { draft: 4, published: 6 },
      teachers: { draft: 0, published: 8 },
    };

    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        success: true,
        content: mockData,
      },
    });

    const { result } = renderHook(() => useContentCounts());

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(api.get).toHaveBeenCalledWith('/api/v1/stats/content-counts');
    expect(api.get).toHaveBeenCalledTimes(1);
  });

  it('returns loading state initially', () => {
    vi.mocked(api.get).mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useContentCounts());

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('handles API errors gracefully with default counts', async () => {
    const error = new Error('Network error');
    vi.mocked(api.get).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useContentCounts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should return default counts on error
    expect(result.current.data).toEqual({
      news: { draft: 0, published: 0 },
      careers: { draft: 0, published: 0 },
      events: { draft: 0, published: 0 },
      deadlines: { draft: 0, published: 0 },
      gallery: { draft: 0, published: 0 },
      teachers: { draft: 0, published: 0 },
    });

    expect(result.current.error).toEqual(error);
  });

  it('uses default counts when API returns null/empty content', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        success: true,
        content: null, // Empty response
      },
    });

    const { result } = renderHook(() => useContentCounts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should use default counts
    expect(result.current.data).toEqual({
      news: { draft: 0, published: 0 },
      careers: { draft: 0, published: 0 },
      events: { draft: 0, published: 0 },
      deadlines: { draft: 0, published: 0 },
      gallery: { draft: 0, published: 0 },
      teachers: { draft: 0, published: 0 },
    });
  });

  it('fetches data only once on mount', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        success: true,
        content: {
          news: { draft: 0, published: 0 },
          careers: { draft: 0, published: 0 },
          events: { draft: 0, published: 0 },
          deadlines: { draft: 0, published: 0 },
          gallery: { draft: 0, published: 0 },
          teachers: { draft: 0, published: 0 },
        },
      },
    });

    const { rerender } = renderHook(() => useContentCounts());

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(1);
    });

    // Rerender shouldn't trigger another fetch
    rerender();
    expect(api.get).toHaveBeenCalledTimes(1);
  });
});
