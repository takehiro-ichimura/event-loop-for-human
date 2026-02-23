/**
 * Work Log Type Definitions
 *
 * タスク操作の履歴ログに関する型定義
 */

import type { AreaType } from './task.types';

/**
 * ログ操作種別
 */
export type LogOperation =
  | 'created'   // タスク作成
  | 'moved'     // エリア間移動（AUTO_DISPATCH, MOVE_TASK）
  | 'completed' // タスク完了
  | 'blocked'   // ブロック（Call Stack → Web API）
  | 'paused'    // タイマー一時停止
  | 'resumed';  // タイマー再開

/**
 * ログエントリ
 *
 * タスクの1回の操作を記録する最小単位
 */
export interface LogEntry {
  /** ログエントリの一意識別子（UUID v4） */
  id: string;

  /** 操作対象のタスクID */
  taskId: string;

  /** 操作対象のタスク名（スナップショット） */
  taskName: string;

  /** 操作の種別 */
  operation: LogOperation;

  /** 操作のタイムスタンプ（ISO 8601形式） */
  timestamp: string;

  /** 移動元エリア（moved, blocked の場合のみ） */
  fromArea: AreaType | null;

  /** 移動先エリア（created, moved, blocked の場合） */
  toArea: AreaType | null;

  /** 作成〜完了の経過時間（ミリ秒）。completed 操作の場合のみ */
  elapsedTime: number | null;
}

/**
 * ワークログストレージスキーマ
 */
export interface WorkLogStorageSchema {
  /** スキーマバージョン（セマンティックバージョニング） */
  version: string;

  /** ログエントリの配列（新しい順にソート済み） */
  entries: LogEntry[];

  /** 最終更新日時（ISO 8601形式） */
  lastModified: string;
}

/**
 * 日別統計
 */
export interface DailyStats {
  /** 日付（YYYY-MM-DD形式） */
  date: string;

  /** その日の完了タスク数 */
  completedCount: number;

  /** その日の完了タスク平均所要時間（ミリ秒） */
  averageElapsedTime: number | null;
}

/**
 * 作業サマリー
 *
 * 集計結果を表す一時的なデータ構造（ストレージに保存しない）
 */
export interface WorkSummary {
  /** 集計期間の開始日（YYYY-MM-DD形式） */
  periodStart: string;

  /** 集計期間の終了日（YYYY-MM-DD形式） */
  periodEnd: string;

  /** 期間内の完了タスク数 */
  completedCount: number;

  /** 完了タスクの平均所要時間（ミリ秒） */
  averageElapsedTime: number | null;

  /** 日別内訳 */
  dailyBreakdown: DailyStats[];
}

/**
 * 日付フィルタ
 */
export interface DateFilter {
  /** フィルタ開始日（YYYY-MM-DD形式、空文字列の場合は制限なし） */
  startDate: string;

  /** フィルタ終了日（YYYY-MM-DD形式、空文字列の場合は制限なし） */
  endDate: string;
}

/**
 * ログ記録パラメータ
 */
export interface RecordLogParams {
  /** タスクID */
  taskId: string;

  /** タスク名 */
  taskName: string;

  /** 操作種別 */
  operation: LogOperation;

  /** 移動元エリア */
  fromArea?: AreaType;

  /** 移動先エリア */
  toArea?: AreaType;

  /** 経過時間（ミリ秒、completed操作のみ） */
  elapsedTime?: number;
}

/**
 * ストレージ定数
 */

/** ログ用のLocalStorageキー */
export const WORKLOG_STORAGE_KEY = 'eventloop4human:logs' as const;

/** ログストレージの現在のバージョン */
export const WORKLOG_STORAGE_VERSION = '1.0.0' as const;

/** ログの最大保持件数 */
export const WORKLOG_MAX_ENTRIES = 5000 as const;

/** 表示時の初期読み込み件数 */
export const WORKLOG_PAGE_SIZE = 50 as const;
