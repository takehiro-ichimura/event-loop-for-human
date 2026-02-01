/**
 * Task Type Definitions
 *
 * タスク関連の型定義を提供します。
 * EventLoop4Humanの中核となるエンティティです。
 */

/**
 * タスクが所属できるエリアの種類
 *
 * - callStack: 現在実行中のタスク（最大1つ）
 * - microtaskQueue: 派生タスクのキュー（優先度高）
 * - taskQueue: 独立したタスクのキュー（優先度低）
 * - webAPI: ブロック中のタスク（待機状態）
 */
export type AreaType = 'callStack' | 'microtaskQueue' | 'taskQueue' | 'webAPI';

/**
 * タスクエンティティ
 *
 * ユーザーが管理する作業単位を表します。
 */
export interface Task {
  /**
   * タスクの一意識別子（UUID v4）
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  id: string;

  /**
   * タスク名（必須）
   * @minLength 1
   * @maxLength 200
   * @example "メールの返信を書く"
   */
  name: string;

  /**
   * 見積もり時間（分単位）
   * @minimum 0
   * @example 30
   */
  estimatedTime: number | null;

  /**
   * カテゴリ名
   * @maxLength 50
   * @example "仕事"
   */
  category: string | null;

  /**
   * メモ
   * @maxLength 1000
   * @example "添付資料も忘れずに"
   */
  memo: string | null;

  /**
   * 作成日時（ISO 8601形式）
   * @format date-time
   * @example "2026-02-02T12:34:56.789Z"
   */
  createdAt: string;

  /**
   * 現在の所属エリア
   */
  area: AreaType;

  /**
   * キュー内の順序（0から始まる整数）
   * Call Stackでは無視されます。
   * @minimum 0
   */
  order: number;
}

/**
 * タスク作成時のオプション
 */
export interface CreateTaskOptions {
  /**
   * 見積もり時間（分単位）
   */
  estimatedTime?: number;

  /**
   * カテゴリ名
   */
  category?: string;

  /**
   * メモ
   */
  memo?: string;
}

/**
 * タスク作成のための入力データ
 */
export interface TaskInput {
  /**
   * タスク名（必須）
   */
  name: string;

  /**
   * 投入先のエリア
   */
  area: AreaType;

  /**
   * オプション属性
   */
  options?: CreateTaskOptions;
}

/**
 * タスク更新のための入力データ
 */
export interface TaskUpdate {
  /**
   * 更新対象のタスクID
   */
  id: string;

  /**
   * タスク名
   */
  name?: string;

  /**
   * 見積もり時間
   */
  estimatedTime?: number | null;

  /**
   * カテゴリ名
   */
  category?: string | null;

  /**
   * メモ
   */
  memo?: string | null;
}

/**
 * バリデーションエラー
 */
export interface ValidationError {
  /**
   * エラーが発生したフィールド名
   */
  field: keyof Task;

  /**
   * エラーメッセージ
   */
  message: string;
}

/**
 * タスクのバリデーション結果
 */
export interface TaskValidationResult {
  /**
   * バリデーション成功フラグ
   */
  valid: boolean;

  /**
   * エラーのリスト
   */
  errors: ValidationError[];
}
