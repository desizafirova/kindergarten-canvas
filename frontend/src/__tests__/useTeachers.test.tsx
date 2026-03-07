import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher, TeacherError } from '@/hooks/useTeachers';
import api from '@/lib/api';

// Mock api
vi.mock('@/lib/api');

describe('useTeachers hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches all teachers successfully', async () => {
    const mockTeachers = [
      { id: 1, firstName: 'Мария', lastName: 'Петрова', position: 'Учител', status: 'PUBLISHED' },
      { id: 2, firstName: 'Иван', lastName: 'Стефанов', position: 'Директор', status: 'DRAFT' },
    ];

    (api.get as any).mockResolvedValue({ data: { content: mockTeachers } });

    const { result } = renderHook(() => useTeachers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockTeachers);
    expect(result.current.error).toBeNull();
    expect(api.get).toHaveBeenCalledWith('/api/admin/v1/teachers');
  });

  it('handles fetch error', async () => {
    (api.get as any).mockRejectedValue({ response: { status: 500 } });

    const { result } = renderHook(() => useTeachers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(TeacherError);
    expect(result.current.data).toEqual([]);
  });
});

describe('getTeacher', () => {
  it('fetches single teacher successfully', async () => {
    const mockTeacher = { id: 1, firstName: 'Мария', lastName: 'Петрова', position: 'Учител', status: 'PUBLISHED' };
    (api.get as any).mockResolvedValue({ data: { status: 'success', content: mockTeacher } });

    const result = await getTeacher(1);

    expect(result).toEqual(mockTeacher);
    expect(api.get).toHaveBeenCalledWith('/api/admin/v1/teachers/1');
  });

  it('throws error for non-existent teacher', async () => {
    (api.get as any).mockRejectedValue({ response: { status: 404 } });

    await expect(getTeacher(999)).rejects.toThrow(TeacherError);
  });
});

describe('createTeacher', () => {
  it('creates teacher successfully', async () => {
    const teacherData = {
      firstName: 'Мария',
      lastName: 'Петрова',
      position: 'Учител',
      bio: null,
      photoUrl: null,
      status: 'DRAFT' as const,
    };
    const mockResponse = { id: 1, ...teacherData, displayOrder: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01' };

    (api.post as any).mockResolvedValue({ data: { status: 'success', content: mockResponse } });

    const result = await createTeacher(teacherData);

    expect(result).toEqual(mockResponse);
    expect(api.post).toHaveBeenCalledWith('/api/admin/v1/teachers', teacherData);
  });

  it('throws error for invalid data', async () => {
    (api.post as any).mockRejectedValue({ response: { status: 400, data: { message: 'Invalid data' } } });

    const teacherData = {
      firstName: '',
      lastName: 'Петрова',
      position: 'Учител',
      bio: null,
      photoUrl: null,
      status: 'DRAFT' as const,
    };

    await expect(createTeacher(teacherData)).rejects.toThrow(TeacherError);
  });
});

describe('updateTeacher', () => {
  it('updates teacher successfully', async () => {
    const updateData = { position: 'Директор' };
    const mockResponse = { id: 1, firstName: 'Мария', lastName: 'Петрова', ...updateData };

    (api.put as any).mockResolvedValue({ data: { status: 'success', content: mockResponse } });

    const result = await updateTeacher(1, updateData);

    expect(result).toEqual(mockResponse);
    expect(api.put).toHaveBeenCalledWith('/api/admin/v1/teachers/1', updateData);
  });

  it('throws error for non-existent teacher', async () => {
    (api.put as any).mockRejectedValue({ response: { status: 404 } });

    await expect(updateTeacher(999, { position: 'Директор' })).rejects.toThrow(TeacherError);
  });
});

describe('deleteTeacher', () => {
  it('deletes teacher successfully', async () => {
    (api.delete as any).mockResolvedValue({ data: { status: 'success' } });

    await deleteTeacher(1);

    expect(api.delete).toHaveBeenCalledWith('/api/admin/v1/teachers/1');
  });

  it('throws error for non-existent teacher', async () => {
    (api.delete as any).mockRejectedValue({ response: { status: 404 } });

    await expect(deleteTeacher(999)).rejects.toThrow(TeacherError);
  });
});
