/**
 * EventLoop4Human Type Definitions
 *
 * Exports all type definitions.
 */

// Task types
export type {
  AreaType,
  Task,
  CreateTaskOptions,
  TaskInput,
  TaskUpdate,
  ValidationError,
  TaskValidationResult,
} from './task.types';

// Area types
export type {
  EventLoopState,
  AreaStats,
  EventLoopStats,
  TaskMoveOperation,
  ReorderOperation,
  AreaMetadata,
} from './area.types';

export { AREA_METADATA } from './area.types';

// Storage types
export type {
  StorageSchema,
  StorageResult,
  StorageMetadata,
  StorageError,
  MigrationFunction,
  MigrationDefinition,
  StorageConfig,
} from './storage.types';

export {
  STORAGE_KEY,
  STORAGE_VERSION,
  StorageErrorType,
  DEFAULT_STORAGE_CONFIG,
} from './storage.types';

// Timer types
export type {
  TimerState,
  TimerStorageSchema,
  UseTaskTimerReturn,
  TaskTimerProps,
  TimerValidationResult,
} from './timer.types';

export {
  TIMER_STORAGE_KEY,
  TIMER_STORAGE_VERSION,
} from './timer.types';

// Work Log types
export type {
  LogEntry,
  LogOperation,
  WorkLogStorageSchema,
  WorkSummary,
  DailyStats,
  DateFilter,
  RecordLogParams,
} from './worklog.types';

export {
  WORKLOG_STORAGE_KEY,
  WORKLOG_STORAGE_VERSION,
  WORKLOG_MAX_ENTRIES,
  WORKLOG_PAGE_SIZE,
} from './worklog.types';
