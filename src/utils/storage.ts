/**
 * Storage Utilities
 *
 * LocalStorage操作のためのユーティリティ関数を提供します。
 * エラーハンドリング、マイグレーション、フォールバック機能を含みます。
 */

import type {
  StorageSchema,
  StorageResult,
  StorageError,
  StorageMetadata,
  EventLoopState,
} from '@/types';
import {
  STORAGE_KEY,
  STORAGE_VERSION,
  StorageErrorType,
} from '@/types';

/**
 * デフォルトのEventLoopStateを作成
 */
function createDefaultState(): EventLoopState {
  return {
    callStack: null,
    microtaskQueue: [],
    taskQueue: [],
    webAPI: [],
  };
}

/**
 * デフォルトのStorageSchemaを作成
 */
function createDefaultStorage(): StorageSchema {
  return {
    version: STORAGE_VERSION,
    state: createDefaultState(),
    lastModified: new Date().toISOString(),
  };
}

/**
 * LocalStorageが利用可能かチェック
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
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
    const testKey = '__storage_test__';
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
function classifyStorageError(error: unknown): StorageError {
  if (error instanceof DOMException) {
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      return {
        type: StorageErrorType.QUOTA_EXCEEDED,
        message: 'LocalStorageの容量が不足しています',
        originalError: error,
        suggestion: '古いタスクを削除するか、ブラウザの設定で容量を増やしてください',
      };
    }
    if (error.name === 'SecurityError') {
      return {
        type: StorageErrorType.SECURITY_ERROR,
        message: 'プライベートモードではLocalStorageが使用できません',
        originalError: error,
        suggestion: '通常モードでブラウザを開くか、一時的なセッションとして使用してください',
      };
    }
  }

  if (error instanceof SyntaxError) {
    return {
      type: StorageErrorType.PARSE_ERROR,
      message: '保存データの形式が不正です',
      originalError: error,
      suggestion: 'データをリセットして再度お試しください',
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
export function migrateStorage(data: unknown): StorageSchema {
  // データがない場合はデフォルト値を返す
  if (!data || typeof data !== 'object') {
    console.warn('Storage data is invalid, returning default');
    return createDefaultStorage();
  }

  const typedData = data as Record<string, unknown>;
  const version = typeof typedData.version === 'string' ? typedData.version : '0.0.0';

  // バージョン1.0.0未満の場合、デフォルト値で初期化
  if (semverLt(version, '1.0.0')) {
    console.warn('Legacy storage detected, resetting to default');
    return createDefaultStorage();
  }

  // 将来的なバージョンアップ時の変換処理をここに追加
  // if (semverLt(version, '2.0.0')) { ... }

  return data as StorageSchema;
}

/**
 * LocalStorageにデータを保存
 */
export function saveToLocalStorage(state: EventLoopState): StorageResult<void> {
  try {
    const storage = isLocalStorageAvailable() ? window.localStorage :
                    isSessionStorageAvailable() ? window.sessionStorage : null;

    if (!storage) {
      return {
        success: false,
        error: 'ストレージが利用できません',
      };
    }

    const schema: StorageSchema = {
      version: STORAGE_VERSION,
      state,
      lastModified: new Date().toISOString(),
    };

    storage.setItem(STORAGE_KEY, JSON.stringify(schema));

    return { success: true };
  } catch (error) {
    const storageError = classifyStorageError(error);
    console.error('Failed to save to storage:', storageError);
    return {
      success: false,
      error: storageError.message,
    };
  }
}

/**
 * LocalStorageからデータを読み込み
 */
export function loadFromLocalStorage(): StorageResult<EventLoopState> {
  try {
    const storage = isLocalStorageAvailable() ? window.localStorage :
                    isSessionStorageAvailable() ? window.sessionStorage : null;

    if (!storage) {
      return {
        success: true,
        data: createDefaultState(),
      };
    }

    const raw = storage.getItem(STORAGE_KEY);

    if (!raw) {
      return {
        success: true,
        data: createDefaultState(),
      };
    }

    const parsed = JSON.parse(raw);
    const migrated = migrateStorage(parsed);

    return {
      success: true,
      data: migrated.state,
    };
  } catch (error) {
    const storageError = classifyStorageError(error);
    console.error('Failed to load from storage:', storageError);

    // パースエラーの場合はデフォルト値を返す
    if (storageError.type === StorageErrorType.PARSE_ERROR) {
      return {
        success: true,
        data: createDefaultState(),
      };
    }

    return {
      success: false,
      error: storageError.message,
    };
  }
}

/**
 * LocalStorageのデータをクリア
 */
export function clearStorage(): StorageResult<void> {
  try {
    const storage = isLocalStorageAvailable() ? window.localStorage :
                    isSessionStorageAvailable() ? window.sessionStorage : null;

    if (storage) {
      storage.removeItem(STORAGE_KEY);
    }

    return { success: true };
  } catch (error) {
    const storageError = classifyStorageError(error);
    console.error('Failed to clear storage:', storageError);
    return {
      success: false,
      error: storageError.message,
    };
  }
}

/**
 * ストレージのメタ情報を取得
 */
export function getStorageMetadata(): StorageResult<StorageMetadata> {
  try {
    const storage = isLocalStorageAvailable() ? window.localStorage :
                    isSessionStorageAvailable() ? window.sessionStorage : null;

    if (!storage) {
      return {
        success: false,
        error: 'ストレージが利用できません',
      };
    }

    const raw = storage.getItem(STORAGE_KEY);

    if (!raw) {
      return {
        success: true,
        data: {
          sizeInBytes: 0,
          usageRatio: 0,
          lastModified: '',
          version: STORAGE_VERSION,
        },
      };
    }

    const parsed = JSON.parse(raw) as StorageSchema;
    const sizeInBytes = new Blob([raw]).size;

    // LocalStorageの容量を概算（一般的に5MB）
    const estimatedQuota = 5 * 1024 * 1024;
    let totalUsed = 0;

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key) {
        const value = storage.getItem(key);
        if (value) {
          totalUsed += new Blob([key, value]).size;
        }
      }
    }

    return {
      success: true,
      data: {
        sizeInBytes,
        usageRatio: totalUsed / estimatedQuota,
        lastModified: parsed.lastModified,
        version: parsed.version,
      },
    };
  } catch (error) {
    const storageError = classifyStorageError(error);
    console.error('Failed to get storage metadata:', storageError);
    return {
      success: false,
      error: storageError.message,
    };
  }
}

/**
 * ストレージの健全性チェック
 */
export function checkStorageHealth(): {
  localStorage: boolean;
  sessionStorage: boolean;
  hasData: boolean;
  error?: string;
} {
  const localStorageAvailable = isLocalStorageAvailable();
  const sessionStorageAvailable = isSessionStorageAvailable();

  let hasData = false;

  if (localStorageAvailable) {
    hasData = window.localStorage.getItem(STORAGE_KEY) !== null;
  } else if (sessionStorageAvailable) {
    hasData = window.sessionStorage.getItem(STORAGE_KEY) !== null;
  }

  return {
    localStorage: localStorageAvailable,
    sessionStorage: sessionStorageAvailable,
    hasData,
    error: !localStorageAvailable && !sessionStorageAvailable
      ? 'ストレージが利用できません。データは一時的にメモリに保存されます。'
      : undefined,
  };
}
