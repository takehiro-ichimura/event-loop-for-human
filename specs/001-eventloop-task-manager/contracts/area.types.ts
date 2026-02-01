/**
 * Area Type Definitions
 *
 * エリア（Call Stack、Microtask Queue、Task Queue、Web API）関連の型定義を提供します。
 */

import { Task, AreaType } from './task.types';

/**
 * イベントループの状態
 *
 * 4つのエリアの現在の状態を保持します。
 */
export interface EventLoopState {
  /**
   * Call Stack（現在実行中のタスク）
   * 最大1つのタスクのみを保持します。
   */
  callStack: Task | null;

  /**
   * Microtask Queue（派生タスクのキュー）
   * Task Queueより優先的に処理されます。
   * 配列の順序が処理順序を表します。
   */
  microtaskQueue: Task[];

  /**
   * Task Queue（独立したタスクのキュー）
   * Microtask Queueが空の時に処理されます。
   * 配列の順序が処理順序を表します。
   */
  taskQueue: Task[];

  /**
   * Web API（ブロック中のタスク）
   * 他者の返事待ち、ビルド待ちなど、自分では進められないタスクを保持します。
   * 順序は特に意味を持ちません。
   */
  webAPI: Task[];
}

/**
 * エリアの統計情報
 */
export interface AreaStats {
  /**
   * エリア名
   */
  area: AreaType;

  /**
   * タスク数
   */
  count: number;

  /**
   * 見積もり時間の合計（分単位）
   * 見積もり時間が設定されていないタスクは除外されます。
   */
  totalEstimatedTime: number;
}

/**
 * イベントループ全体の統計情報
 */
export interface EventLoopStats {
  /**
   * 各エリアの統計
   */
  areas: {
    callStack: AreaStats;
    microtaskQueue: AreaStats;
    taskQueue: AreaStats;
    webAPI: AreaStats;
  };

  /**
   * タスクの総数
   */
  totalTasks: number;

  /**
   * 見積もり時間の総計（分単位）
   */
  totalEstimatedTime: number;
}

/**
 * エリア間のタスク移動操作
 */
export interface TaskMoveOperation {
  /**
   * 移動対象のタスクID
   */
  taskId: string;

  /**
   * 移動元のエリア
   */
  from: AreaType;

  /**
   * 移動先のエリア
   */
  to: AreaType;

  /**
   * 移動先での順序（キューの場合）
   * Call Stackの場合は無視されます。
   */
  order?: number;
}

/**
 * キュー内の並べ替え操作
 */
export interface ReorderOperation {
  /**
   * 対象のエリア（microtaskQueueまたはtaskQueueのみ）
   */
  area: 'microtaskQueue' | 'taskQueue';

  /**
   * 移動するタスクのID
   */
  taskId: string;

  /**
   * 新しいインデックス（0から始まる）
   */
  newIndex: number;
}

/**
 * エリアのメタデータ
 */
export interface AreaMetadata {
  /**
   * エリア名
   */
  area: AreaType;

  /**
   * 表示名（日本語）
   */
  displayName: string;

  /**
   * 説明
   */
  description: string;

  /**
   * 最大タスク数（nullは無制限）
   */
  maxTasks: number | null;

  /**
   * 並べ替え可能フラグ
   */
  sortable: boolean;

  /**
   * アクセントカラー（16進数）
   */
  accentColor: string;
}

/**
 * すべてのエリアのメタデータ定数
 */
export const AREA_METADATA: Record<AreaType, AreaMetadata> = {
  callStack: {
    area: 'callStack',
    displayName: 'Call Stack',
    description: '現在実行中のタスク（最大1つ）',
    maxTasks: 1,
    sortable: false,
    accentColor: '#ff00ff',
  },
  microtaskQueue: {
    area: 'microtaskQueue',
    displayName: 'Microtask Queue',
    description: '派生タスク（優先度高）',
    maxTasks: null,
    sortable: true,
    accentColor: '#00ffff',
  },
  taskQueue: {
    area: 'taskQueue',
    displayName: 'Task Queue',
    description: '独立したタスク（優先度低）',
    maxTasks: null,
    sortable: true,
    accentColor: '#00ff00',
  },
  webAPI: {
    area: 'webAPI',
    displayName: 'Web API',
    description: 'ブロック中のタスク（待機状態）',
    maxTasks: null,
    sortable: false,
    accentColor: '#ffaa00',
  },
};
