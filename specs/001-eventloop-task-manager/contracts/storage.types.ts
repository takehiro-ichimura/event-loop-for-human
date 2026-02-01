/**
 * Storage Type Definitions
 *
 * LocalStorage関連の型定義を提供します。
 */

import { EventLoopState } from './area.types';

/**
 * LocalStorageに保存されるデータのスキーマ
 */
export interface StorageSchema {
  /**
   * スキーマバージョン（セマンティックバージョニング）
   * マイグレーション時に使用されます。
   * @example "1.0.0"
   */
  version: string;

  /**
   * イベントループの現在の状態
   */
  state: EventLoopState;

  /**
   * 最終更新日時（ISO 8601形式）
   * デバッグ用の情報です。
   * @format date-time
   * @example "2026-02-02T12:34:56.789Z"
   */
  lastModified: string;
}

/**
 * LocalStorageのキー定数
 */
export const STORAGE_KEY = 'eventloop4human:state' as const;

/**
 * 現在のストレージスキーマバージョン
 */
export const STORAGE_VERSION = '1.0.0' as const;

/**
 * ストレージ操作の結果
 */
export interface StorageResult<T> {
  /**
   * 操作成功フラグ
   */
  success: boolean;

  /**
   * 結果データ（成功時）
   */
  data?: T;

  /**
   * エラーメッセージ（失敗時）
   */
  error?: string;
}

/**
 * ストレージのメタ情報
 */
export interface StorageMetadata {
  /**
   * データサイズ（バイト単位）
   */
  sizeInBytes: number;

  /**
   * LocalStorage全体の使用率（0-1の範囲）
   * 概算値です。
   */
  usageRatio: number;

  /**
   * 最終更新日時
   */
  lastModified: string;

  /**
   * スキーマバージョン
   */
  version: string;
}

/**
 * ストレージエラーの種類
 */
export enum StorageErrorType {
  /**
   * 容量超過エラー
   */
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',

  /**
   * セキュリティエラー（プライベートモードなど）
   */
  SECURITY_ERROR = 'SECURITY_ERROR',

  /**
   * JSONパースエラー
   */
  PARSE_ERROR = 'PARSE_ERROR',

  /**
   * スキーマバージョン不一致
   */
  VERSION_MISMATCH = 'VERSION_MISMATCH',

  /**
   * その他のエラー
   */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * ストレージエラーの詳細情報
 */
export interface StorageError {
  /**
   * エラーの種類
   */
  type: StorageErrorType;

  /**
   * エラーメッセージ
   */
  message: string;

  /**
   * 元の例外オブジェクト
   */
  originalError?: unknown;

  /**
   * 復旧方法の提案
   */
  suggestion?: string;
}

/**
 * マイグレーション関数の型
 */
export type MigrationFunction = (data: any) => StorageSchema;

/**
 * マイグレーション定義
 */
export interface MigrationDefinition {
  /**
   * マイグレーション元のバージョン
   */
  fromVersion: string;

  /**
   * マイグレーション先のバージョン
   */
  toVersion: string;

  /**
   * マイグレーション関数
   */
  migrate: MigrationFunction;

  /**
   * マイグレーションの説明
   */
  description: string;
}

/**
 * ストレージ設定
 */
export interface StorageConfig {
  /**
   * 保存時のdebounce時間（ミリ秒）
   * @default 300
   */
  debounceMs: number;

  /**
   * 容量警告の閾値（0-1の範囲）
   * @default 0.8
   */
  warningThreshold: number;

  /**
   * 自動マイグレーション有効フラグ
   * @default true
   */
  autoMigrate: boolean;

  /**
   * エラー時のフォールバック先
   * @default 'sessionStorage'
   */
  fallbackStorage: 'sessionStorage' | 'memory' | null;
}

/**
 * デフォルトのストレージ設定
 */
export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  debounceMs: 300,
  warningThreshold: 0.8,
  autoMigrate: true,
  fallbackStorage: 'sessionStorage',
};
