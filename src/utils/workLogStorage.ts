/**
 * Work Log Storage Utilities
 *
 * ログデータのLocalStorage操作ユーティリティ
 * storage.tsのパターンを踏襲
 */

import type {
  LogEntry,
  WorkLogStorageSchema,
  StorageResult,
} from '@/types';
import {
  WORKLOG_STORAGE_KEY,
  WORKLOG_STORAGE_VERSION,
  WORKLOG_MAX_ENTRIES,
  StorageErrorType,
} from '@/types';

/**
 * デフォルトのWorkLogStorageSchemaを作成
 */
function createDefaultStorage(): WorkLogStorageSchema {
  return {
    version: WORKLOG_STORAGE_VERSION,
    entries: [],
    lastModified: new Date().toISOString(),
  };
}

/**
 * LocalStorageが利用可能かチェック
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__worklog_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * SessionStorageにフォールバック可能かチェック
 */
function isSessionStorageAvailable(): boolean {
  try {
    const testKey = '__worklog_storage_test__';
    window.sessionStorage.setItem(testKey, testKey);
    window.sessionStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * ストレージエラーを分類
 */
function classifyStorageError(error: unknown): {
  type: string;
  message: string;
  originalError: unknown;
  suggestion?: string;
} {
  if (error instanceof DOMException) {
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      return {
        type: StorageErrorType.QUOTA_EXCEEDED,
        message: 'ログストレージの容量が不足しています',
        originalError: error,
        suggestion: '古いログは自動削除されますが、それでも不足する場合は手動でクリアしてください',
      };
    }
    if (error.name === 'SecurityError') {
      return {
        type: StorageErrorType.SECURITY_ERROR,
        message: 'プライベートモードではLocalStorageが使用できません',
        originalError: error,
        suggestion: '通常モードでブラウザを開いてください',
      };
    }
  }

  if (error instanceof SyntaxError) {
    return {
      type: StorageErrorType.PARSE_ERROR,
      message: 'ログデータの形式が不正です',
      originalError: error,
      suggestion: 'ログをリセットして再度お試しください',
    };
  }

  return {
    type: StorageErrorType.UNKNOWN_ERROR,
    message: error instanceof Error ? error.message : '不明なエラーが発生しました',
    originalError: error,
  };
}

/**
 * バージョン比較（セマンティックバージョニング）
 */
function semverLt(a: string, b: string): boolean {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const partA = partsA[i] ?? 0;
    const partB = partsB[i] ?? 0;
    if (partA < partB) return true;
    if (partA > partB) return false;
  }

  return false;
}

/**
 * ストレージデータのマイグレーション
 */
function migrateStorage(data: unknown): WorkLogStorageSchema {
  if (!data || typeof data !== 'object') {
    console.warn('Work log storage data is invalid, returning default');
    return createDefaultStorage();
  }

  const typedData = data as Record<string, unknown>;
  const version = typeof typedData.version === 'string' ? typedData.version : '0.0.0';

  // バージョン1.0.0未満の場合、デフォルト値で初期化
  if (semverLt(version, '1.0.0')) {
    console.warn('Legacy work log storage detected, resetting to default');
    return createDefaultStorage();
  }

  // 将来的なバージョンアップ時の変換処理をここに追加
  // if (semverLt(version, '2.0.0')) { ... }

  return data as WorkLogStorageSchema;
}

/**
 * ログデータを読み込み
 */
export function loadWorkLogs(): StorageResult<LogEntry[]> {
  try {
    const storage = isLocalStorageAvailable() ? window.localStorage :
                    isSessionStorageAvailable() ? window.sessionStorage : null;

    if (!storage) {
      return {
        success: true,
        data: [],
      };
    }

    const raw = storage.getItem(WORKLOG_STORAGE_KEY);

    if (!raw) {
      return {
        success: true,
        data: [],
      };
    }

    const parsed = JSON.parse(raw);
    const migrated = migrateStorage(parsed);

    return {
      success: true,
      data: migrated.entries,
    };
  } catch (error) {
    const storageError = classifyStorageError(error);
    console.error('Failed to load work logs:', storageError);

    // パースエラーの場合は空配列を返す
    if (storageError.type === StorageErrorType.PARSE_ERROR) {
      return {
        success: true,
        data: [],
      };
    }

    return {
      success: false,
      error: storageError.message,
    };
  }
}

/**
 * ログデータを保存（5000件超過時の自動トリミング含む）
 */
export function saveWorkLogs(entries: LogEntry[]): StorageResult<void> {
  try {
    const storage = isLocalStorageAvailable() ? window.localStorage :
                    isSessionStorageAvailable() ? window.sessionStorage : null;

    if (!storage) {
      return {
        success: false,
        error: 'ストレージが利用できません',
      };
    }

    // 5000件超過時は古い順（配列末尾）から削除
    const trimmedEntries = entries.length > WORKLOG_MAX_ENTRIES
      ? entries.slice(0, WORKLOG_MAX_ENTRIES)
      : entries;

    const schema: WorkLogStorageSchema = {
      version: WORKLOG_STORAGE_VERSION,
      entries: trimmedEntries,
      lastModified: new Date().toISOString(),
    };

    storage.setItem(WORKLOG_STORAGE_KEY, JSON.stringify(schema));

    return { success: true };
  } catch (error) {
    const storageError = classifyStorageError(error);
    console.error('Failed to save work logs:', storageError);
    return {
      success: false,
      error: storageError.message,
    };
  }
}

/**
 * ログデータをクリア
 */
export function clearWorkLogs(): StorageResult<void> {
  try {
    const storage = isLocalStorageAvailable() ? window.localStorage :
                    isSessionStorageAvailable() ? window.sessionStorage : null;

    if (storage) {
      storage.removeItem(WORKLOG_STORAGE_KEY);
    }

    return { success: true };
  } catch (error) {
    const storageError = classifyStorageError(error);
    console.error('Failed to clear work logs:', storageError);
    return {
      success: false,
      error: storageError.message,
    };
  }
}

/**
 * ログストレージのメタ情報を取得
 */
export function getWorkLogMetadata(): StorageResult<{
  entryCount: number;
  sizeInBytes: number;
  version: string;
  lastModified: string;
}> {
  try {
    const storage = isLocalStorageAvailable() ? window.localStorage :
                    isSessionStorageAvailable() ? window.sessionStorage : null;

    if (!storage) {
      return {
        success: false,
        error: 'ストレージが利用できません',
      };
    }

    const raw = storage.getItem(WORKLOG_STORAGE_KEY);

    if (!raw) {
      return {
        success: true,
        data: {
          entryCount: 0,
          sizeInBytes: 0,
          version: WORKLOG_STORAGE_VERSION,
          lastModified: '',
        },
      };
    }

    const parsed = JSON.parse(raw) as WorkLogStorageSchema;
    const sizeInBytes = new Blob([raw]).size;

    return {
      success: true,
      data: {
        entryCount: parsed.entries.length,
        sizeInBytes,
        version: parsed.version,
        lastModified: parsed.lastModified,
      },
    };
  } catch (error) {
    const storageError = classifyStorageError(error);
    console.error('Failed to get work log metadata:', storageError);
    return {
      success: false,
      error: storageError.message,
    };
  }
}
