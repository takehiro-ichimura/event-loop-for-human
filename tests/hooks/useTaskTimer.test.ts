/**
 * useTaskTimer Hook Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskTimer } from '@/hooks/useTaskTimer';
import { TIMER_STORAGE_KEY, TIMER_STORAGE_VERSION } from '@/types';
import type { TimerState, TimerStorageSchema } from '@/types';

// LocalStorageのモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

/** LocalStorageにタイマー状態を保存するヘルパー */
function seedTimerState(state: TimerState): void {
  const schema: TimerStorageSchema = {
    version: TIMER_STORAGE_VERSION,
    timerState: state,
    lastModified: new Date().toISOString(),
  };
  localStorageMock.setItem(TIMER_STORAGE_KEY, JSON.stringify(schema));
}

/** LocalStorageからタイマー状態を読み取るヘルパー */
function readStoredTimer(): TimerStorageSchema | null {
  const raw = localStorageMock.getItem(TIMER_STORAGE_KEY);
  if (!raw) return null;
  return JSON.parse(raw);
}

/** テスト用のTimerStateを生成するヘルパー */
function createTimerState(overrides: Partial<TimerState> = {}): TimerState {
  return {
    taskId: 'task-1',
    startTime: 10000,
    lastResumeTime: null,
    isPaused: false,
    pauseStartTime: null,
    totalPausedTime: 0,
    ...overrides,
  };
}

describe('useTaskTimer', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(60000)); // 60秒後
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('初期化', () => {
    it('taskIdがnullの場合、タイマーは非アクティブ', () => {
      const { result } = renderHook(() => useTaskTimer(null));

      expect(result.current.isRunning).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.elapsedTime).toBe(0);
      expect(result.current.formattedTime).toBe('00:00');
      expect(result.current.startTimestamp).toBe('');
      expect(result.current.resumeTimestamp).toBeNull();
    });

    it('taskIdがある場合、新しいタイマーを開始', () => {
      const { result } = renderHook(() => useTaskTimer('task-1'));

      expect(result.current.isRunning).toBe(true);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.elapsedTime).toBe(0);

      // LocalStorageに保存されていること
      const stored = readStoredTimer();
      expect(stored).not.toBeNull();
      expect(stored!.timerState!.taskId).toBe('task-1');
      expect(stored!.timerState!.startTime).toBe(60000);
    });

    it('LocalStorageに同じtaskIdの保存データがある場合、復元する', () => {
      const saved = createTimerState({
        taskId: 'task-1',
        startTime: 10000,
        totalPausedTime: 0,
      });
      seedTimerState(saved);

      const { result } = renderHook(() => useTaskTimer('task-1'));

      // startTime(10000)からの経過時間 = 60000 - 10000 = 50000ms
      expect(result.current.isRunning).toBe(true);
      expect(result.current.elapsedTime).toBe(50000);
    });

    it('LocalStorageに異なるtaskIdの保存データがある場合、新しいタイマーを開始', () => {
      const saved = createTimerState({
        taskId: 'old-task',
        startTime: 10000,
      });
      seedTimerState(saved);

      const { result } = renderHook(() => useTaskTimer('new-task'));

      expect(result.current.isRunning).toBe(true);
      expect(result.current.elapsedTime).toBe(0);

      const stored = readStoredTimer();
      expect(stored!.timerState!.taskId).toBe('new-task');
    });
  });

  describe('リロード時の復元（taskId: null → 実際のID）', () => {
    it('リロード時にtaskIdがnullから実際のIDに変わった場合、保存データから復元する', () => {
      // リロード前にLocalStorageにタイマーデータが保存されている状態をシミュレート
      const saved = createTimerState({
        taskId: 'task-1',
        startTime: 10000,
        totalPausedTime: 0,
      });
      seedTimerState(saved);

      // リロード直後: App状態読み込み前のためtaskIdはnull
      const { result, rerender } = renderHook(
        ({ taskId }) => useTaskTimer(taskId),
        { initialProps: { taskId: null as string | null } }
      );

      expect(result.current.isRunning).toBe(false);
      expect(result.current.elapsedTime).toBe(0);

      // LocalStorageのデータがまだ残っていることを確認
      expect(readStoredTimer()?.timerState?.taskId).toBe('task-1');

      // App状態が復元されてtaskIdが渡される
      rerender({ taskId: 'task-1' });

      // 保存データから復元されるべき（リセットされない）
      expect(result.current.isRunning).toBe(true);
      // startTime(10000)からの経過時間 = 60000 - 10000 = 50000ms
      expect(result.current.elapsedTime).toBe(50000);
    });

    it('リロード時にパウズ状態のタイマーも正しく復元する', () => {
      const saved = createTimerState({
        taskId: 'task-1',
        startTime: 10000,
        isPaused: true,
        pauseStartTime: 30000,
        totalPausedTime: 5000,
      });
      seedTimerState(saved);

      // null → 'task-1' の遷移
      const { result, rerender } = renderHook(
        ({ taskId }) => useTaskTimer(taskId),
        { initialProps: { taskId: null as string | null } }
      );

      rerender({ taskId: 'task-1' });

      expect(result.current.isPaused).toBe(true);
      expect(result.current.isRunning).toBe(false);
      // pauseStartTime(30000) - startTime(10000) - totalPausedTime(5000) = 15000ms
      expect(result.current.elapsedTime).toBe(15000);
    });
  });

  describe('taskID変更', () => {
    it('異なるtaskIdに変更した場合、新しいタイマーを開始', () => {
      const { result, rerender } = renderHook(
        ({ taskId }) => useTaskTimer(taskId),
        { initialProps: { taskId: 'task-1' as string | null } }
      );

      expect(result.current.isRunning).toBe(true);

      // 別のタスクに切り替え
      vi.setSystemTime(new Date(120000));
      rerender({ taskId: 'task-2' });

      expect(result.current.isRunning).toBe(true);
      expect(result.current.elapsedTime).toBe(0);

      const stored = readStoredTimer();
      expect(stored!.timerState!.taskId).toBe('task-2');
      expect(stored!.timerState!.startTime).toBe(120000);
    });

    it('taskIdがnullに変わった場合、タイマーをクリア', () => {
      const { result, rerender } = renderHook(
        ({ taskId }) => useTaskTimer(taskId),
        { initialProps: { taskId: 'task-1' as string | null } }
      );

      expect(result.current.isRunning).toBe(true);

      rerender({ taskId: null });

      expect(result.current.isRunning).toBe(false);
      expect(result.current.elapsedTime).toBe(0);

      // LocalStorageもクリアされること（removeItemで削除される）
      const stored = readStoredTimer();
      expect(stored === null || stored.timerState === null).toBe(true);
    });

    it('同じtaskIdで再レンダリングされてもタイマーはリセットされない', () => {
      const { result, rerender } = renderHook(
        ({ taskId }) => useTaskTimer(taskId),
        { initialProps: { taskId: 'task-1' as string | null } }
      );

      const initialStartTimestamp = result.current.startTimestamp;

      // 同じtaskIdで再レンダリング
      rerender({ taskId: 'task-1' });

      expect(result.current.startTimestamp).toBe(initialStartTimestamp);
    });
  });

  describe('ポーズ・レジューム', () => {
    it('pause()でタイマーを一時停止できる', () => {
      const { result } = renderHook(() => useTaskTimer('task-1'));

      expect(result.current.isRunning).toBe(true);
      expect(result.current.isPaused).toBe(false);

      act(() => {
        result.current.pause();
      });

      expect(result.current.isRunning).toBe(false);
      expect(result.current.isPaused).toBe(true);

      // LocalStorageにもポーズ状態が保存されること
      const stored = readStoredTimer();
      expect(stored!.timerState!.isPaused).toBe(true);
      expect(stored!.timerState!.pauseStartTime).toBe(60000);
    });

    it('resume()でタイマーを再開できる', () => {
      const { result } = renderHook(() => useTaskTimer('task-1'));

      act(() => {
        result.current.pause();
      });

      // 10秒後にレジューム
      vi.setSystemTime(new Date(70000));
      act(() => {
        result.current.resume();
      });

      expect(result.current.isRunning).toBe(true);
      expect(result.current.isPaused).toBe(false);

      const stored = readStoredTimer();
      expect(stored!.timerState!.isPaused).toBe(false);
      expect(stored!.timerState!.lastResumeTime).toBe(70000);
      expect(stored!.timerState!.totalPausedTime).toBe(10000);
    });
  });

  describe('インターバル更新', () => {
    it('1秒ごとに経過時間が更新される', () => {
      const { result } = renderHook(() => useTaskTimer('task-1'));

      expect(result.current.elapsedTime).toBe(0);

      // 1秒進める
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.elapsedTime).toBe(1000);

      // さらに2秒進める
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.elapsedTime).toBe(3000);
    });

    it('ポーズ中はインターバルが停止する', () => {
      const { result } = renderHook(() => useTaskTimer('task-1'));

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      const timeBeforePause = result.current.elapsedTime;

      act(() => {
        result.current.pause();
      });

      // ポーズ中に時間を進めても経過時間は変わらない
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(result.current.elapsedTime).toBe(timeBeforePause);
    });
  });

  describe('LocalStorage永続化', () => {
    it('タイマー状態が変更されるとLocalStorageに保存される', () => {
      renderHook(() => useTaskTimer('task-1'));

      const stored = readStoredTimer();
      expect(stored).not.toBeNull();
      expect(stored!.version).toBe(TIMER_STORAGE_VERSION);
      expect(stored!.timerState!.taskId).toBe('task-1');
    });

    it('taskIdがnullになるとLocalStorageからタイマーデータがクリアされる', () => {
      const { rerender } = renderHook(
        ({ taskId }) => useTaskTimer(taskId),
        { initialProps: { taskId: 'task-1' as string | null } }
      );

      expect(readStoredTimer()?.timerState).not.toBeNull();

      rerender({ taskId: null });

      // clearTimerState()はremoveItemを呼ぶ
      const stored = readStoredTimer();
      // saveTimerState(null)またはremoveItemでクリアされる
      expect(stored === null || stored.timerState === null).toBe(true);
    });
  });
});
