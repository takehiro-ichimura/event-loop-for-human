/**
 * Timer Types Contract
 *
 * タスクタイマー機能の型定義コントラクト
 *
 * @feature 002-add-task-timer
 * @version 1.0.0
 */

// =============================================================================
// Core Types
// =============================================================================

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
   * @minimum 1
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
   * @minimum 0
   * @example 120000
   */
  totalPausedTime: number;
}

// =============================================================================
// Storage Types
// =============================================================================

/**
 * タイマー状態のLocalStorageスキーマ
 */
export interface TimerStorageSchema {
  /**
   * スキーマバージョン（セマンティックバージョニング）
   * @pattern ^\d+\.\d+\.\d+$
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
 * タイマー用のストレージキー
 */
export const TIMER_STORAGE_KEY = 'eventloop4human:timer' as const;

/**
 * タイマースキーマの現在のバージョン
 */
export const TIMER_STORAGE_VERSION = '1.0.0' as const;

// =============================================================================
// Hook Types
// =============================================================================

/**
 * useTaskTimerフックの戻り値
 */
export interface UseTaskTimerReturn {
  // 表示用データ
  /**
   * 経過時間（ms）
   * @minimum 0
   */
  elapsedTime: number;

  /**
   * フォーマット済み経過時間
   * @example "05:23" or "1:05:23"
   */
  formattedTime: string;

  /**
   * フォーマット済み開始時刻
   * @example "Feb 2 14:30:45"
   */
  startTimestamp: string;

  /**
   * フォーマット済み再開時刻（再開していない場合はnull）
   * @example "Feb 2 14:35:20" or null
   */
  resumeTimestamp: string | null;

  /**
   * 一時停止中フラグ
   */
  isPaused: boolean;

  /**
   * タイマー動作中フラグ（タスクがCall Stackにあり、一時停止していない）
   */
  isRunning: boolean;

  // アクション
  /**
   * タイマーを一時停止
   */
  pause: () => void;

  /**
   * タイマーを再開
   */
  resume: () => void;
}

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * TaskTimerコンポーネントのProps
 */
export interface TaskTimerProps {
  /**
   * 対象タスクのID（nullの場合はタイマー非表示）
   */
  taskId: string | null;

  /**
   * 一時停止コールバック（オプション）
   */
  onPause?: () => void;

  /**
   * 再開コールバック（オプション）
   */
  onResume?: () => void;
}

// =============================================================================
// Utility Types
// =============================================================================

/**
 * バリデーション結果
 */
export interface TimerValidationResult {
  /**
   * バリデーション成功フラグ
   */
  valid: boolean;

  /**
   * エラーメッセージのリスト
   */
  errors: string[];
}

/**
 * 時刻フォーマットの種類
 */
export type TimeFormatType = 'elapsed' | 'timestamp';
