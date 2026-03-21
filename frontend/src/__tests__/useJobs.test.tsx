import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useJobs, getJob, createJob, updateJob, deleteJob, JobError } from '@/hooks/useJobs';
import api from '@/lib/api';

// Mock api
vi.mock('@/lib/api');

const mockJob = {
  id: 1,
  title: 'Учител в детска градина',
  description: '<p>Описание на позицията</p>',
  requirements: null,
  contactEmail: 'hr@kindergarten.bg',
  applicationDeadline: null,
  isActive: true,
  status: 'PUBLISHED' as const,
  publishedAt: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('useJobs hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches all jobs successfully (no query param for ALL)', async () => {
    (api.get as any).mockResolvedValue({ data: { success: true, content: [mockJob] } });

    const { result } = renderHook(() => useJobs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([mockJob]);
    expect(result.current.error).toBeNull();
    expect(api.get).toHaveBeenCalledWith('/api/admin/v1/jobs');
  });

  it('fetches active jobs with ?isActive=true when filter=ACTIVE', async () => {
    (api.get as any).mockResolvedValue({ data: { success: true, content: [] } });

    const { result } = renderHook(() => useJobs('ACTIVE'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(api.get).toHaveBeenCalledWith('/api/admin/v1/jobs?isActive=true');
  });

  it('fetches closed jobs with ?isActive=false when filter=CLOSED', async () => {
    (api.get as any).mockResolvedValue({ data: { success: true, content: [] } });

    const { result } = renderHook(() => useJobs('CLOSED'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(api.get).toHaveBeenCalledWith('/api/admin/v1/jobs?isActive=false');
  });

  it('handles fetch error gracefully', async () => {
    (api.get as any).mockRejectedValue({ response: { status: 500 } });

    const { result } = renderHook(() => useJobs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(JobError);
    expect(result.current.data).toEqual([]);
  });

  it('refetch() triggers new API call', async () => {
    (api.get as any).mockResolvedValue({ data: { success: true, content: [mockJob] } });

    const { result } = renderHook(() => useJobs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(api.get).toHaveBeenCalledTimes(1);

    result.current.refetch();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });
});

describe('getJob', () => {
  it('fetches single job successfully', async () => {
    (api.get as any).mockResolvedValue({ data: { success: true, content: mockJob } });

    const result = await getJob(1);

    expect(result).toEqual(mockJob);
    expect(api.get).toHaveBeenCalledWith('/api/admin/v1/jobs/1');
  });

  it('throws JobError for 404', async () => {
    (api.get as any).mockRejectedValue({ response: { status: 404 } });

    await expect(getJob(999)).rejects.toThrow(JobError);
  });
});

describe('createJob', () => {
  it('creates job successfully', async () => {
    const jobData = {
      title: 'Учител',
      description: '<p>Описание</p>',
      contactEmail: 'hr@test.bg',
      isActive: true,
      status: 'DRAFT' as const,
    };
    (api.post as any).mockResolvedValue({ data: { success: true, content: { id: 1, ...jobData } } });

    const result = await createJob(jobData);

    expect(result).toMatchObject(jobData);
    expect(api.post).toHaveBeenCalledWith('/api/admin/v1/jobs', jobData);
  });

  it('throws JobError for 400 invalid data', async () => {
    (api.post as any).mockRejectedValue({ response: { status: 400, data: { message: 'Invalid data' } } });

    await expect(createJob({})).rejects.toThrow(JobError);
  });
});

describe('updateJob', () => {
  it('updates job successfully', async () => {
    const updateData = { title: 'Обновена позиция' };
    (api.put as any).mockResolvedValue({ data: { success: true, content: { id: 1, ...updateData } } });

    const result = await updateJob(1, updateData);

    expect(result).toMatchObject(updateData);
    expect(api.put).toHaveBeenCalledWith('/api/admin/v1/jobs/1', updateData);
  });

  it('throws JobError for 404', async () => {
    (api.put as any).mockRejectedValue({ response: { status: 404 } });

    await expect(updateJob(999, { title: 'Test' })).rejects.toThrow(JobError);
  });
});

describe('deleteJob', () => {
  it('deletes job successfully', async () => {
    (api.delete as any).mockResolvedValue({ data: { success: true } });

    await deleteJob(1);

    expect(api.delete).toHaveBeenCalledWith('/api/admin/v1/jobs/1');
  });

  it('throws JobError for 404', async () => {
    (api.delete as any).mockRejectedValue({ response: { status: 404 } });

    await expect(deleteJob(999)).rejects.toThrow(JobError);
  });
});
