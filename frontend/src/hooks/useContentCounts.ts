/**
 * useContentCounts Hook
 * Fetches content counts (draft/published) for all 6 content types from the API
 * Returns loading state and gracefully handles errors with default counts
 */

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export interface ContentCounts {
  news: { draft: number; published: number };
  careers: { draft: number; published: number };
  events: { draft: number; published: number };
  deadlines: { draft: number; published: number };
  gallery: { draft: number; published: number };
  teachers: { draft: number; published: number };
}

// Helper function to provide default/fallback counts
function getDefaultCounts(): ContentCounts {
  return {
    news: { draft: 0, published: 0 },
    careers: { draft: 0, published: 0 },
    events: { draft: 0, published: 0 },
    deadlines: { draft: 0, published: 0 },
    gallery: { draft: 0, published: 0 },
    teachers: { draft: 0, published: 0 },
  };
}

export function useContentCounts() {
  const [data, setData] = useState<ContentCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await api.get('/api/v1/stats/content-counts');

        // API returns { success: true, content: {...} }
        const counts = response.data.content;
        setData(counts || getDefaultCounts());
      } catch (err) {
        setError(err as Error);
        // Graceful fallback: show 0 counts if API fails
        setData(getDefaultCounts());
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []); // Empty dependency array - fetch only once on mount

  return { data, loading, error };
}
