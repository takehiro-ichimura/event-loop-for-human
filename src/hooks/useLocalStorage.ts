/**
 * useLocalStorage Hook
 *
 * LocalStorageとの自動同期を提供するカスタムフック。
 * debounce機能付きで状態変更を効率的に保存します。
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import type { EventLoopState } from '@/types';
import { saveToLocalStorage, loadFromLocalStorage, checkStorageHealth } from '@/utils/storage';

export interface UseLocalStorageOptions {
  /**
   * debounce時間（ミリ秒）
   * @default 300
   */
  debounceMs?: number;

  /**
   * 初回マウント時に自動読み込みするか
   * @default true
   */
  loadOnMount?: boolean;
}

export interface UseLocalStorageReturn {
  /**
   * 保存されていた状態（初回読み込み後）
   */
  savedState: EventLoopState | null;

  /**
   * 読み込みが完了したか
   */
  isLoaded: boolean;

  /**
   * エラーメッセージ
   */
  error: string | null;

  /**
   * ストレージの健全性
   */
  storageHealth: {
    localStorage: boolean;
    sessionStorage: boolean;
    hasData: boolean;
  };

  /**
   * 状態を保存（debounce付き）
   */
  save: (state: EventLoopState) => void;

  /**
   * 即座に保存（debounceなし）
   */
  saveImmediate: (state: EventLoopState) => void;

  /**
   * 状態を読み込み
   */
  load: () => EventLoopState | null;
}

/**
 * LocalStorageとの同期を提供するフック
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

  // 即座に保存
  const saveImmediate = useCallback((state: EventLoopState) => {
    const result = saveToLocalStorage(state);
    if (!result.success && result.error) {
      setError(result.error);
    } else {
      setError(null);
    }
  }, []);

  // debounce付きで保存
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

  // 状態を読み込み
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

  // 初回マウント時に読み込み
  useEffect(() => {
    if (loadOnMount) {
      const loadedState = load();
      setSavedState(loadedState);
      setIsLoaded(true);

      // ストレージの健全性を更新
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

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        // 未保存の状態があれば保存
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
