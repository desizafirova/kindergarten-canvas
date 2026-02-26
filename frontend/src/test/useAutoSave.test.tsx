/**
 * useAutoSave Hook Unit Tests
 * Tests debounce logic, state transitions, error handling, and cleanup
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAutoSave } from '@/hooks/useAutoSave';

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Debounce Logic', () => {
    it('triggers save after default 10 seconds of inactivity', async () => {
      const mockOnSave = vi.fn().mockResolvedValue(undefined);
      const formData = { title: 'Test', content: 'Content' };

      const { result } = renderHook(() =>
        useAutoSave(formData, mockOnSave)
      );

      // Initially idle
      expect(result.current.saveState.status).toBe('idle');

      // Fast-forward 9 seconds (not enough)
      act(() => {
        vi.advanceTimersByTime(9000);
      });

      expect(mockOnSave).not.toHaveBeenCalled();

      // Fast-forward 1 more second (total 10s)
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Should trigger save
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(formData);
      });
    });

    it('resets debounce timer when form data changes', async () => {
      const mockOnSave = vi.fn().mockResolvedValue(undefined);

      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave(data, mockOnSave),
        { initialProps: { data: { title: 'Test 1' } } }
      );

      // Fast-forward 8 seconds
      act(() => {
        vi.advanceTimersByTime(8000);
      });

      // Change form data (should reset timer)
      rerender({ data: { title: 'Test 2' } });

      // Fast-forward 8 more seconds (total 16s, but only 8s since last change)
      act(() => {
        vi.advanceTimersByTime(8000);
      });

      // Should not have triggered yet
      expect(mockOnSave).not.toHaveBeenCalled();

      // Fast-forward 2 more seconds (10s since last change)
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // Should trigger save now
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({ title: 'Test 2' });
      });
    });

    it('uses custom debounce delay when provided', async () => {
      const mockOnSave = vi.fn().mockResolvedValue(undefined);
      const formData = { title: 'Test' };

      renderHook(() =>
        useAutoSave(formData, mockOnSave, { debounceMs: 5000 })
      );

      // Fast-forward 4 seconds (not enough for 5s delay)
      act(() => {
        vi.advanceTimersByTime(4000);
      });

      expect(mockOnSave).not.toHaveBeenCalled();

      // Fast-forward 1 more second (total 5s)
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Should trigger save
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });
  });

  describe('Save State Transitions', () => {
    it('transitions from idle → saving → saved on successful save', async () => {
      const mockOnSave = vi.fn().mockResolvedValue(undefined);
      const formData = { title: 'Test' };

      const { result } = renderHook(() =>
        useAutoSave(formData, mockOnSave)
      );

      // Initially idle
      expect(result.current.saveState.status).toBe('idle');

      // Trigger debounce
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // Should transition to saving
      await waitFor(() => {
        expect(result.current.saveState.status).toBe('saving');
      });

      // Resolve save promise
      await waitFor(() => {
        expect(result.current.saveState.status).toBe('saved');
      });
    });

    it('transitions from idle → saving → error on failed save', async () => {
      const mockOnSave = vi.fn().mockRejectedValue(new Error('Save failed'));
      const formData = { title: 'Test' };
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() =>
        useAutoSave(formData, mockOnSave)
      );

      // Initially idle
      expect(result.current.saveState.status).toBe('idle');

      // Trigger debounce
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // Should transition to saving then error
      await waitFor(() => {
        expect(result.current.saveState.status).toBe('error');
      });

      consoleSpy.mockRestore();
    });

    it('resets to idle after showing saved state', async () => {
      const mockOnSave = vi.fn().mockResolvedValue(undefined);
      const formData = { title: 'Test' };

      const { result } = renderHook(() =>
        useAutoSave(formData, mockOnSave)
      );

      // Trigger save
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // Wait for saved state
      await waitFor(() => {
        expect(result.current.saveState.status).toBe('saved');
      });

      // Fast-forward past reset timer (3.5s)
      act(() => {
        vi.advanceTimersByTime(3500);
      });

      // Should reset to idle
      await waitFor(() => {
        expect(result.current.saveState.status).toBe('idle');
      });
    });
  });

  describe('Error Handling and Retry', () => {
    it('retries save after default 30 seconds on error', async () => {
      const mockOnSave = vi
        .fn()
        .mockRejectedValueOnce(new Error('First fail'))
        .mockResolvedValueOnce(undefined);
      const formData = { title: 'Test' };
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const { result } = renderHook(() =>
        useAutoSave(formData, mockOnSave)
      );

      // Trigger initial save (will fail)
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // Wait for error state
      await waitFor(() => {
        expect(result.current.saveState.status).toBe('error');
      });

      expect(mockOnSave).toHaveBeenCalledTimes(1);

      // Fast-forward 29 seconds (not enough for retry)
      act(() => {
        vi.advanceTimersByTime(29000);
      });

      expect(mockOnSave).toHaveBeenCalledTimes(1);

      // Fast-forward 1 more second (total 30s for retry)
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Should retry and succeed
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(2);
        expect(result.current.saveState.status).toBe('saved');
      });

      consoleSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });

    it('uses custom retry delay when provided', async () => {
      const mockOnSave = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValueOnce(undefined);
      const formData = { title: 'Test' };
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      renderHook(() =>
        useAutoSave(formData, mockOnSave, { retryDelayMs: 15000 })
      );

      // Trigger save (will fail)
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1);
      });

      // Fast-forward 14 seconds (not enough for 15s retry)
      act(() => {
        vi.advanceTimersByTime(14000);
      });

      expect(mockOnSave).toHaveBeenCalledTimes(1);

      // Fast-forward 1 more second (total 15s)
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Should retry
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(2);
      });

      consoleSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });
  });

  describe('Manual Save Trigger', () => {
    it('cancels pending debounced save', async () => {
      const mockOnSave = vi.fn().mockResolvedValue(undefined);
      const formData = { title: 'Test' };

      const { result } = renderHook(() =>
        useAutoSave(formData, mockOnSave)
      );

      // Fast-forward 8 seconds (debounce not complete)
      act(() => {
        vi.advanceTimersByTime(8000);
      });

      expect(mockOnSave).not.toHaveBeenCalled();

      // Trigger manual save
      await act(async () => {
        await result.current.triggerSave();
      });

      // Should save immediately
      expect(mockOnSave).toHaveBeenCalledTimes(1);

      // Fast-forward remaining 2 seconds
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // Should not trigger again (debounce was cancelled)
      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    it('cancels pending retry timer', async () => {
      const mockOnSave = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValue(undefined);
      const formData = { title: 'Test' };
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() =>
        useAutoSave(formData, mockOnSave)
      );

      // Trigger save (will fail)
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      await waitFor(() => {
        expect(result.current.saveState.status).toBe('error');
      });

      expect(mockOnSave).toHaveBeenCalledTimes(1);

      // Trigger manual save before retry
      await act(async () => {
        await result.current.triggerSave();
      });

      // Should save immediately
      expect(mockOnSave).toHaveBeenCalledTimes(2);

      // Fast-forward 30 seconds
      act(() => {
        vi.advanceTimersByTime(30000);
      });

      // Should not trigger retry (was cancelled)
      expect(mockOnSave).toHaveBeenCalledTimes(2);

      consoleSpy.mockRestore();
    });
  });

  describe('Cleanup on Unmount', () => {
    it('clears debounce timer on unmount', () => {
      const mockOnSave = vi.fn().mockResolvedValue(undefined);
      const formData = { title: 'Test' };

      const { unmount } = renderHook(() =>
        useAutoSave(formData, mockOnSave)
      );

      // Fast-forward 5 seconds
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Unmount before debounce completes
      unmount();

      // Fast-forward past debounce time
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // Should not trigger save after unmount
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('clears retry timer on unmount', async () => {
      const mockOnSave = vi.fn().mockRejectedValue(new Error('Fail'));
      const formData = { title: 'Test' };
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { unmount } = renderHook(() =>
        useAutoSave(formData, mockOnSave)
      );

      // Trigger save (will fail)
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1);
      });

      // Unmount before retry
      unmount();

      // Fast-forward past retry time
      act(() => {
        vi.advanceTimersByTime(30000);
      });

      // Should not retry after unmount
      expect(mockOnSave).toHaveBeenCalledTimes(1);

      consoleSpy.mockRestore();
    });

    it('prevents state updates after unmount', async () => {
      const mockOnSave = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );
      const formData = { title: 'Test' };

      const { unmount } = renderHook(() =>
        useAutoSave(formData, mockOnSave)
      );

      // Trigger save
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // Unmount while save is in progress
      unmount();

      // Resolve save
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Should not throw error (isMountedRef prevents state updates)
      expect(() => {
        vi.runAllTimers();
      }).not.toThrow();
    });
  });

  describe('Deep Equality Check', () => {
    it('prevents save when form data has not changed', async () => {
      const mockOnSave = vi.fn().mockResolvedValue(undefined);
      const formData = { title: 'Test', content: 'Content' };

      const { rerender } = renderHook(
        ({ data }) => useAutoSave(data, mockOnSave),
        { initialProps: { data: formData } }
      );

      // Trigger initial save
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1);
      });

      // Rerender with same data (different object reference but same values)
      rerender({ data: { title: 'Test', content: 'Content' } });

      // Fast-forward debounce time
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // Should not trigger another save (data hasn't changed)
      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    it('triggers save when form data changes', async () => {
      const mockOnSave = vi.fn().mockResolvedValue(undefined);

      const { rerender } = renderHook(
        ({ data }) => useAutoSave(data, mockOnSave),
        { initialProps: { data: { title: 'Test 1' } } }
      );

      // Trigger initial save
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1);
      });

      // Change data
      rerender({ data: { title: 'Test 2' } });

      // Fast-forward debounce time
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // Should trigger new save
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(2);
        expect(mockOnSave).toHaveBeenLastCalledWith({ title: 'Test 2' });
      });
    });
  });

  describe('Last Saved Timestamp', () => {
    it('updates lastSaved timestamp on successful save', async () => {
      const mockOnSave = vi.fn().mockResolvedValue(undefined);
      const formData = { title: 'Test' };

      const { result } = renderHook(() =>
        useAutoSave(formData, mockOnSave)
      );

      // Initially null
      expect(result.current.saveState.lastSaved).toBeNull();

      // Trigger save
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // Should update lastSaved
      await waitFor(() => {
        expect(result.current.saveState.lastSaved).toBeInstanceOf(Date);
      });
    });

    it('does not update lastSaved on save error', async () => {
      const mockOnSave = vi.fn().mockRejectedValue(new Error('Fail'));
      const formData = { title: 'Test' };
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() =>
        useAutoSave(formData, mockOnSave)
      );

      // Initially null
      expect(result.current.saveState.lastSaved).toBeNull();

      // Trigger save (will fail)
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      await waitFor(() => {
        expect(result.current.saveState.status).toBe('error');
      });

      // Should remain null
      expect(result.current.saveState.lastSaved).toBeNull();

      consoleSpy.mockRestore();
    });
  });

  describe('State Management During Save', () => {
    it('does not trigger auto-save while already saving', async () => {
      let resolveSave: () => void;
      const mockOnSave = vi.fn().mockImplementation(
        () => new Promise((resolve) => { resolveSave = resolve as () => void; })
      );
      const formData = { title: 'Test' };

      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave(data, mockOnSave),
        { initialProps: { data: formData } }
      );

      // Trigger save
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      await waitFor(() => {
        expect(result.current.saveState.status).toBe('saving');
      });

      // Change data while saving
      rerender({ data: { title: 'Test 2' } });

      // Fast-forward debounce time
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // Should not trigger another save while first is in progress
      expect(mockOnSave).toHaveBeenCalledTimes(1);

      // Resolve first save
      act(() => {
        resolveSave!();
      });

      await waitFor(() => {
        expect(result.current.saveState.status).toBe('saved');
      });
    });

    it('does not trigger auto-save while in error state', async () => {
      const mockOnSave = vi.fn().mockRejectedValue(new Error('Fail'));
      const formData = { title: 'Test' };
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave(data, mockOnSave),
        { initialProps: { data: formData } }
      );

      // Trigger save (will fail)
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      await waitFor(() => {
        expect(result.current.saveState.status).toBe('error');
      });

      expect(mockOnSave).toHaveBeenCalledTimes(1);

      // Change data while in error state
      rerender({ data: { title: 'Test 2' } });

      // Fast-forward debounce time (but not retry time)
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // Should not trigger another save while in error state
      expect(mockOnSave).toHaveBeenCalledTimes(1);

      consoleSpy.mockRestore();
    });
  });
});
