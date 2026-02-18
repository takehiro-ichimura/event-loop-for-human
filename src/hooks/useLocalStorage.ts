/**
 * useLocalStorage Hook
 *
 * A custom hook that provides automatic synchronization with LocalStorage.
 * Efficiently persists state changes with built-in debounce functionality.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import type { EventLoopState } from '@/types';
import { saveToLocalStorage, loadFromLocalStorage, checkStorageHealth } from '@/utils/storage';

export interface UseLocalStorageOptions {
  /**
   * Debounce duration in milliseconds
   * @default 300
   */
  debounceMs?: number;

  /**
   * Whether to automatically load on initial mount
   * @default true
   */
  loadOnMount?: boolean;
}

export interface UseLocalStorageReturn {
  /**
   * The persisted state (after initial load)
   */
  savedState: EventLoopState | null;

  /**
   * Whether the initial load is complete
   */
  isLoaded: boolean;

  /**
   * Error message
   */
  error: string | null;

  /**
   * Storage health status
   */
  storageHealth: {
    localStorage: boolean;
    sessionStorage: boolean;
    hasData: boolean;
  };

  /**
   * Save state (with debounce)
   */
  save: (state: EventLoopState) => void;

  /**
   * Save immediately (without debounce)
   */
  saveImmediate: (state: EventLoopState) => void;

  /**
   * Load state
   */
  load: () => EventLoopState | null;
}

/**
 * Hook that provides synchronization with LocalStorage
 */
export function useLocalStorage(
  options: UseLocalStorageOptions = {}
): UseLocalStorageReturn {
  const { debounceMs = 300, loadOnMount = true } = options;

  const [savedState, setSavedState] = useState<EventLoopState | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storageHealth, setStorageHealth] = useState(() => {
    const health = checkStorageHealth();
    return {
      localStorage: health.localStorage,
      sessionStorage: health.sessionStorage,
      hasData: health.hasData,
    };
  });

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestStateRef = useRef<EventLoopState | null>(null);

  // Save immediately
  const saveImmediate = useCallback((state: EventLoopState) => {
    const result = saveToLocalStorage(state);
    if (!result.success && result.error) {
      setError(result.error);
    } else {
      setError(null);
    }
  }, []);

  // Save with debounce
  const save = useCallback((state: EventLoopState) => {
    latestStateRef.current = state;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (latestStateRef.current) {
        saveImmediate(latestStateRef.current);
      }
    }, debounceMs);
  }, [debounceMs, saveImmediate]);

  // Load state
  const load = useCallback((): EventLoopState | null => {
    const result = loadFromLocalStorage();
    if (result.success && result.data) {
      setError(null);
      return result.data;
    }
    if (result.error) {
      setError(result.error);
    }
    return null;
  }, []);

  // Load on initial mount
  useEffect(() => {
    if (loadOnMount) {
      const loadedState = load();
      setSavedState(loadedState);
      setIsLoaded(true);

      // Update storage health status
      const health = checkStorageHealth();
      setStorageHealth({
        localStorage: health.localStorage,
        sessionStorage: health.sessionStorage,
        hasData: health.hasData,
      });

      if (health.error) {
        setError(health.error);
      }
    }
  }, [loadOnMount, load]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        // Save any unsaved state before unmounting
        if (latestStateRef.current) {
          saveToLocalStorage(latestStateRef.current);
        }
      }
    };
  }, []);

  return {
    savedState,
    isLoaded,
    error,
    storageHealth,
    save,
    saveImmediate,
    load,
  };
}

export default useLocalStorage;
