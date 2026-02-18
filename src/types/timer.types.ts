/**
 * Timer Type Definitions
 *
 * Provides type definitions for the task timer feature.
 */

/**
 * Interface representing the timer state
 */
export interface TimerState {
  /**
   * ID of the target task
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  taskId: string;

  /**
   * Timer start time (Unix timestamp ms)
   * The time when the task entered the Call Stack
   * @example 1706875200000
   */
  startTime: number;

  /**
   * Latest resume time (Unix timestamp ms)
   * Null if the timer has never been paused
   * @example 1706875500000
   */
  lastResumeTime: number | null;

  /**
   * Paused flag
   */
  isPaused: boolean;

  /**
   * Pause start time (Unix timestamp ms)
   * Null when isPaused === false
   * @example 1706875300000
   */
  pauseStartTime: number | null;

  /**
   * Accumulated paused time (ms)
   * Total across multiple pauses
   * @example 120000 (2 minutes)
   */
  totalPausedTime: number;
}

/**
 * LocalStorage schema for timer state
 */
export interface TimerStorageSchema {
  /**
   * Schema version
   * @example "1.0.0"
   */
  version: string;

  /**
   * Timer state
   * Null when the timer is inactive (no task in the Call Stack)
   */
  timerState: TimerState | null;

  /**
   * Last modified date and time (ISO 8601 format)
   * @format date-time
   * @example "2026-02-02T12:34:56.789Z"
   */
  lastModified: string;
}

/**
 * Return value of the useTaskTimer hook
 */
export interface UseTaskTimerReturn {
  /**
   * Elapsed time (ms)
   */
  elapsedTime: number;

  /**
   * Formatted elapsed time
   */
  formattedTime: string;

  /**
   * Formatted start time
   */
  startTimestamp: string;

  /**
   * Formatted resume time (null if none)
   */
  resumeTimestamp: string | null;

  /**
   * Paused flag
   */
  isPaused: boolean;

  /**
   * Timer running flag
   */
  isRunning: boolean;

  /**
   * Pause the timer
   */
  pause: () => void;

  /**
   * Resume the timer
   */
  resume: () => void;
}

/**
 * Props for the TaskTimer component
 */
export interface TaskTimerProps {
  /**
   * ID of the target task
   */
  taskId: string | null;
}

/**
 * Timer state validation result
 */
export interface TimerValidationResult {
  /**
   * Validation success flag
   */
  valid: boolean;

  /**
   * List of errors
   */
  errors: string[];
}

/**
 * Storage key for the timer
 */
export const TIMER_STORAGE_KEY = 'eventloop4human:timer' as const;

/**
 * Current timer schema version
 */
export const TIMER_STORAGE_VERSION = '1.0.0' as const;
