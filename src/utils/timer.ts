/**
 * Timer Utilities
 *
 * タスクタイマー機能のユーティリティ関数を提供します。
 */

import type { TimerState, TimerStorageSchema, TimerValidationResult } from '@/types';
import { TIMER_STORAGE_KEY, TIMER_STORAGE_VERSION } from '@/types';

/**
 * 経過時間を表示用フォーマットに変換
 * @param ms 経過時間（ms）
 * @returns フォーマット済み文字列（MM:SS または HH:MM:SS）
 */
export function formatElapsedTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * タイムスタンプを表示用フォーマットに変換
 * @param timestamp Unix timestamp (ms)
 * @returns フォーマット済み文字列（MMM D HH:MM:SS）
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const month = months[date.getMonth()];
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${month} ${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 経過時間を計算（一時停止時間を除く）
 * @param state タイマー状態
 * @param currentTime 現在時刻（テスト用に注入可能）
 * @returns 経過時間（ms）
 */
export function calculateElapsedTime(
  state: TimerState,
  currentTime: number = Date.now()
): number {
  if (state.isPaused && state.pauseStartTime !== null) {
    // 一時停止中は、一時停止開始時点までの時間を返す
    return state.pauseStartTime - state.startTime - state.totalPausedTime;
  }

  // 動作中は、現在時刻から開始時刻と累積一時停止時間を引く
  return currentTime - state.startTime - state.totalPausedTime;
}

/**
 * タイマーを開始
 * @param taskId 対象タスクのID
 * @returns 新しいTimerState
 */
export function startTimer(taskId: string): TimerState {
  return {
    taskId,
    startTime: Date.now(),
    lastResumeTime: null,
    isPaused: false,
    pauseStartTime: null,
    totalPausedTime: 0,
  };
}

/**
 * タイマーを一時停止
 * @param state 現在のタイマー状態
 * @returns 更新されたTimerState
 */
export function pauseTimer(state: TimerState): TimerState {
  if (state.isPaused) return state; // 既に一時停止中

  return {
    ...state,
    isPaused: true,
    pauseStartTime: Date.now(),
  };
}

/**
 * タイマーを再開
 * @param state 現在のタイマー状態
 * @returns 更新されたTimerState
 */
export function resumeTimer(state: TimerState): TimerState {
  if (!state.isPaused || state.pauseStartTime === null) return state; // 既に動作中

  const now = Date.now();
  const pauseDuration = now - state.pauseStartTime;

  return {
    ...state,
    isPaused: false,
    pauseStartTime: null,
    lastResumeTime: now,
    totalPausedTime: state.totalPausedTime + pauseDuration,
  };
}

/**
 * TimerStateのバリデーション
 * @param state 検証するタイマー状態
 * @returns バリデーション結果
 */
export function validateTimerState(state: TimerState): TimerValidationResult {
  const errors: string[] = [];

  // taskIdは空でない文字列
  if (!state.taskId || state.taskId.trim() === '') {
    errors.push('taskId is required');
  }

  // startTimeは正の数値
  if (state.startTime <= 0) {
    errors.push('startTime must be a positive number');
  }

  // totalPausedTimeは非負
  if (state.totalPausedTime < 0) {
    errors.push('totalPausedTime must be non-negative');
  }

  // isPausedがtrueの場合、pauseStartTimeは必須
  if (state.isPaused && state.pauseStartTime === null) {
    errors.push('pauseStartTime is required when isPaused is true');
  }

  // isPausedがfalseの場合、pauseStartTimeはnull
  if (!state.isPaused && state.pauseStartTime !== null) {
    errors.push('pauseStartTime must be null when isPaused is false');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * タイマー状態をLocalStorageに保存
 * @param state 保存するタイマー状態（nullの場合はクリア）
 */
export function saveTimerState(state: TimerState | null): void {
  try {
    const storageData: TimerStorageSchema = {
      version: TIMER_STORAGE_VERSION,
      timerState: state,
      lastModified: new Date().toISOString(),
    };
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(storageData));
  } catch (error) {
    console.error('Failed to save timer state:', error);
  }
}

/**
 * LocalStorageからタイマー状態を読み込み
 * @returns 読み込んだタイマー状態（存在しないまたは無効な場合はnull）
 */
export function loadTimerState(): TimerState | null {
  try {
    const stored = localStorage.getItem(TIMER_STORAGE_KEY);
    if (!stored) return null;

    const data: TimerStorageSchema = JSON.parse(stored);

    // バージョンチェック
    if (data.version !== TIMER_STORAGE_VERSION) {
      console.warn('Timer storage version mismatch, clearing state');
      localStorage.removeItem(TIMER_STORAGE_KEY);
      return null;
    }

    // 状態がない場合
    if (!data.timerState) return null;

    // バリデーション
    const validation = validateTimerState(data.timerState);
    if (!validation.valid) {
      console.warn('Invalid timer state in storage:', validation.errors);
      localStorage.removeItem(TIMER_STORAGE_KEY);
      return null;
    }

    return data.timerState;
  } catch (error) {
    console.error('Failed to load timer state:', error);
    return null;
  }
}

/**
 * LocalStorageからタイマー状態をクリア
 */
export function clearTimerState(): void {
  try {
    localStorage.removeItem(TIMER_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear timer state:', error);
  }
}
