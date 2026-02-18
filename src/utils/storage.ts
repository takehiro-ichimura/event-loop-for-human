/**
 * Storage Utilities
 *
 * Provides utility functions for LocalStorage operations.
 * Includes error handling, migration, and fallback functionality.
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
 * Creates a default EventLoopState
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
 * Creates a default StorageSchema
 */
function createDefaultStorage(): StorageSchema {
  return {
    version: STORAGE_VERSION,
    state: createDefaultState(),
    lastModified: new Date().toISOString(),
  };
}

/**
 * Checks if LocalStorage is available
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
 * Checks if SessionStorage is available as a fallback
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
 * Classifies a storage error
 */
function classifyStorageError(error: unknown): StorageError {
  if (error instanceof DOMException) {
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      return {
        type: StorageErrorType.QUOTA_EXCEEDED,
        message: 'LocalStorage quota exceeded',
        originalError: error,
        suggestion: 'Delete old tasks or increase browser storage capacity',
      };
    }
    if (error.name === 'SecurityError') {
      return {
        type: StorageErrorType.SECURITY_ERROR,
        message: 'LocalStorage is not available in private browsing mode',
        originalError: error,
        suggestion: 'Open the browser in normal mode or use as a temporary session',
      };
    }
  }

  if (error instanceof SyntaxError) {
    return {
      type: StorageErrorType.PARSE_ERROR,
      message: 'Saved data format is invalid',
      originalError: error,
      suggestion: 'Reset data and try again',
    };
  }

  return {
    type: StorageErrorType.UNKNOWN_ERROR,
    message: error instanceof Error ? error.message : 'An unknown error occurred',
    originalError: error,
  };
}

/**
 * Compares semantic versions (returns true if a < b)
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
 * Migrates storage data to the current schema
 */
export function migrateStorage(data: unknown): StorageSchema {
  // Return default if data is missing or invalid
  if (!data || typeof data !== 'object') {
    console.warn('Storage data is invalid, returning default');
    return createDefaultStorage();
  }

  const typedData = data as Record<string, unknown>;
  const version = typeof typedData.version === 'string' ? typedData.version : '0.0.0';

  // Initialize with defaults if version is below 1.0.0
  if (semverLt(version, '1.0.0')) {
    console.warn('Legacy storage detected, resetting to default');
    return createDefaultStorage();
  }

  // Add future version migration logic here
  // if (semverLt(version, '2.0.0')) { ... }

  return data as StorageSchema;
}

/**
 * Saves data to LocalStorage
 */
export function saveToLocalStorage(state: EventLoopState): StorageResult<void> {
  try {
    const storage = isLocalStorageAvailable() ? window.localStorage :
                    isSessionStorageAvailable() ? window.sessionStorage : null;

    if (!storage) {
      return {
        success: false,
        error: 'Storage is not available',
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
 * Loads data from LocalStorage
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

    // Return default state on parse errors
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
 * Clears data from LocalStorage
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
 * Retrieves storage metadata
 */
export function getStorageMetadata(): StorageResult<StorageMetadata> {
  try {
    const storage = isLocalStorageAvailable() ? window.localStorage :
                    isSessionStorageAvailable() ? window.sessionStorage : null;

    if (!storage) {
      return {
        success: false,
        error: 'Storage is not available',
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

    // Estimate LocalStorage capacity (typically 5MB)
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
 * Checks storage health status
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
      ? 'Storage is not available. Data will be temporarily stored in memory.'
      : undefined,
  };
}
