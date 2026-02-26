import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Auto-save status type definition
 */
export interface AutoSaveState {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
}

/**
 * Configuration options for useAutoSave hook
 */
export interface UseAutoSaveOptions {
  /**
   * Debounce delay in milliseconds before triggering auto-save.
   * @default 10000 (10 seconds)
   */
  debounceMs?: number;

  /**
   * Retry delay in milliseconds after failed save attempt.
   * @default 30000 (30 seconds)
   */
  retryDelayMs?: number;
}

/**
 * Custom hook for auto-saving form data with debounce and retry logic.
 *
 * @template T - The type of form data being saved
 * @param formData - The current form data to be auto-saved
 * @param onSave - Async function that performs the save operation
 * @param options - Configuration options for debounce and retry behavior
 *
 * @returns Object containing save state and manual save trigger function
 *
 * @example
 * ```tsx
 * const { saveState, triggerSave } = useAutoSave(
 *   formData,
 *   async (data) => {
 *     await api.saveNews(data);
 *   },
 *   { debounceMs: 10000 }
 * );
 * ```
 */
export function useAutoSave<T>(
  formData: T,
  onSave: (data: T) => Promise<void>,
  options: UseAutoSaveOptions = {}
) {
  const {
    debounceMs = 10000, // 10 seconds default
    retryDelayMs = 30000, // 30 seconds default
  } = options;

  const [saveState, setSaveState] = useState<AutoSaveState>({
    status: 'idle',
    lastSaved: null,
  });

  // Track previous form data for comparison
  const previousDataRef = useRef<T | null>(null);

  // Track active timers for cleanup
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track if component is mounted
  const isMountedRef = useRef(true);

  /**
   * Deep equality check for form data to prevent unnecessary saves
   */
  const hasDataChanged = useCallback((current: T, previous: T | null): boolean => {
    if (previous === null) return true;
    return JSON.stringify(current) !== JSON.stringify(previous);
  }, []);

  /**
   * Perform the save operation with error handling
   */
  const performSave = useCallback(async (data: T) => {
    if (!isMountedRef.current) return;

    setSaveState({ status: 'saving', lastSaved: null });

    try {
      await onSave(data);

      if (!isMountedRef.current) return;

      setSaveState({
        status: 'saved',
        lastSaved: new Date(),
      });

      // Update previous data reference after successful save
      previousDataRef.current = data;

      // Clear any existing reset timer
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }

      // Reset to idle after showing 'saved' state
      resetTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setSaveState((prev) => ({
            ...prev,
            status: 'idle',
          }));
        }
      }, 3500); // Match AutoSaveIndicator fade timing (3s delay + 500ms fade)
    } catch (error) {
      console.error('[useAutoSave] Save failed:', error);

      if (!isMountedRef.current) return;

      setSaveState({
        status: 'error',
        lastSaved: null,
      });

      // Schedule retry after delay
      retryTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setSaveState((prev) => ({ ...prev, status: 'idle' }));
          performSave(data);
        }
      }, retryDelayMs);
    }
  }, [onSave, retryDelayMs]);

  /**
   * Manual save trigger function (for user-initiated saves)
   */
  const triggerSave = useCallback(async () => {
    // Cancel any pending debounced save
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Cancel any pending retry
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    await performSave(formData);
  }, [formData, performSave]);

  /**
   * Auto-save effect with debounce
   */
  useEffect(() => {
    // Don't trigger auto-save if data hasn't changed
    if (!hasDataChanged(formData, previousDataRef.current)) {
      return;
    }

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Don't auto-save if currently saving or in error state
    if (saveState.status === 'saving' || saveState.status === 'error') {
      return;
    }

    // Set up debounced save
    debounceTimerRef.current = setTimeout(() => {
      performSave(formData);
    }, debounceMs);

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [formData, debounceMs, saveState.status, hasDataChanged, performSave]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }

      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  return {
    saveState,
    triggerSave,
  };
}
