/**
 * Storage Type Definitions
 *
 * Provides type definitions related to LocalStorage.
 */

import { EventLoopState } from './area.types';

/**
 * Schema for data stored in LocalStorage
 */
export interface StorageSchema {
  /**
   * Schema version (semantic versioning)
   * Used during migrations.
   * @example "1.0.0"
   */
  version: string;

  /**
   * Current state of the event loop
   */
  state: EventLoopState;

  /**
   * Last modified date and time (ISO 8601 format)
   * This information is for debugging purposes.
   * @format date-time
   * @example "2026-02-02T12:34:56.789Z"
   */
  lastModified: string;
}

/**
 * LocalStorage key constant
 */
export const STORAGE_KEY = 'eventloop4human:state' as const;

/**
 * Current storage schema version
 */
export const STORAGE_VERSION = '1.0.0' as const;

/**
 * Result of a storage operation
 */
export interface StorageResult<T> {
  /**
   * Operation success flag
   */
  success: boolean;

  /**
   * Result data (on success)
   */
  data?: T;

  /**
   * Error message (on failure)
   */
  error?: string;
}

/**
 * Storage metadata
 */
export interface StorageMetadata {
  /**
   * Data size (in bytes)
   */
  sizeInBytes: number;

  /**
   * Overall LocalStorage usage ratio (range 0-1)
   * This is an approximate value.
   */
  usageRatio: number;

  /**
   * Last modified date and time
   */
  lastModified: string;

  /**
   * Schema version
   */
  version: string;
}

/**
 * Types of storage errors
 */
export enum StorageErrorType {
  /**
   * Quota exceeded error
   */
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',

  /**
   * Security error (e.g., private browsing mode)
   */
  SECURITY_ERROR = 'SECURITY_ERROR',

  /**
   * JSON parse error
   */
  PARSE_ERROR = 'PARSE_ERROR',

  /**
   * Schema version mismatch
   */
  VERSION_MISMATCH = 'VERSION_MISMATCH',

  /**
   * Other errors
   */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Detailed information about a storage error
 */
export interface StorageError {
  /**
   * Type of error
   */
  type: StorageErrorType;

  /**
   * Error message
   */
  message: string;

  /**
   * Original exception object
   */
  originalError?: unknown;

  /**
   * Suggested recovery action
   */
  suggestion?: string;
}

/**
 * Migration function type
 */
export type MigrationFunction = (data: any) => StorageSchema;

/**
 * Migration definition
 */
export interface MigrationDefinition {
  /**
   * Source version for the migration
   */
  fromVersion: string;

  /**
   * Target version for the migration
   */
  toVersion: string;

  /**
   * Migration function
   */
  migrate: MigrationFunction;

  /**
   * Description of the migration
   */
  description: string;
}

/**
 * Storage configuration
 */
export interface StorageConfig {
  /**
   * Debounce time for saving (in milliseconds)
   * @default 300
   */
  debounceMs: number;

  /**
   * Capacity warning threshold (range 0-1)
   * @default 0.8
   */
  warningThreshold: number;

  /**
   * Auto-migration enabled flag
   * @default true
   */
  autoMigrate: boolean;

  /**
   * Fallback storage on error
   * @default 'sessionStorage'
   */
  fallbackStorage: 'sessionStorage' | 'memory' | null;
}

/**
 * Default storage configuration
 */
export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  debounceMs: 300,
  warningThreshold: 0.8,
  autoMigrate: true,
  fallbackStorage: 'sessionStorage',
};
