/**
 * Timer Type Definitions
 *
 * タスクタイマー機能の型定義を提供します。
 */

/**
 * タイマーの状態を表すインターフェース
 */
export interface TimerState {
  /**
   * 対象タスクのID
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  taskId: string;

  /**
   * タイマー開始時刻（Unix timestamp ms）
   * タスクがCall Stackに入った時刻
   * @example 1706875200000
   */
  startTime: number;

  /**
   * 最新の再開時刻（Unix timestamp ms）
   * 一度も一時停止していない場合はnull
   * @example 1706875500000
   */
  lastResumeTime: number | null;

  /**
   * 一時停止中フラグ
   */
  isPaused: boolean;

  /**
   * 一時停止開始時刻（Unix timestamp ms）
   * isPaused === falseの場合はnull
   * @example 1706875300000
   */
  pauseStartTime: number | null;

  /**
   * 累積一時停止時間（ms）
   * 複数回一時停止した場合の合計
   * @example 120000 (2分)
   */
  totalPausedTime: number;
}

/**
 * タイマー状態のLocalStorageスキーマ
 */
export interface TimerStorageSchema {
  /**
   * スキーマバージョン
   * @example "1.0.0"
   */
  version: string;

  /**
   * タイマー状態
   * タイマーが無効（タスクがCall Stackにない）場合はnull
   */
  timerState: TimerState | null;

  /**
   * 最終更新日時（ISO 8601形式）
   * @format date-time
   * @example "2026-02-02T12:34:56.789Z"
   */
  lastModified: string;
}

/**
 * useTaskTimerフックの戻り値
 */
export interface UseTaskTimerReturn {
  /**
   * 経過時間（ms）
   */
  elapsedTime: number;

  /**
   * フォーマット済み経過時間
   */
  formattedTime: string;

  /**
   * フォーマット済み開始時刻
   */
  startTimestamp: string;

  /**
   * フォーマット済み再開時刻（なければnull）
   */
  resumeTimestamp: string | null;

  /**
   * 一時停止中フラグ
   */
  isPaused: boolean;

  /**
   * タイマー動作中フラグ
   */
  isRunning: boolean;

  /**
   * タイマーを一時停止
   */
  pause: () => void;

  /**
   * タイマーを再開
   */
  resume: () => void;
}

/**
 * TaskTimerコンポーネントのProps
 */
export interface TaskTimerProps {
  /**
   * 対象タスクのID
   */
  taskId: string | null;
}

/**
 * タイマー状態のバリデーション結果
 */
export interface TimerValidationResult {
  /**
   * バリデーション成功フラグ
   */
  valid: boolean;

  /**
   * エラーのリスト
   */
  errors: string[];
}

/**
 * タイマー用のストレージキー
 */
export const TIMER_STORAGE_KEY = 'eventloop4human:timer' as const;

/**
 * タイマースキーマの現在のバージョン
 */
export const TIMER_STORAGE_VERSION = '1.0.0' as const;
