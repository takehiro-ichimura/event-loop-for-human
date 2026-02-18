/**
 * Task Type Definitions
 *
 * Provides type definitions related to tasks.
 * These are the core entities of EventLoop4Human.
 */

/**
 * The types of areas a task can belong to
 *
 * - callStack: The currently executing task (at most one)
 * - microtaskQueue: Queue for derived tasks (high priority)
 * - taskQueue: Queue for independent tasks (low priority)
 * - webAPI: Blocked tasks (waiting state)
 */
export type AreaType = 'callStack' | 'microtaskQueue' | 'taskQueue' | 'webAPI';

/**
 * Task Entity
 *
 * Represents a unit of work managed by the user.
 */
export interface Task {
  /**
   * Unique task identifier (UUID v4)
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  id: string;

  /**
   * Task name (required)
   * @minLength 1
   * @maxLength 200
   * @example "Write an email reply"
   */
  name: string;

  /**
   * Estimated time (in minutes)
   * @minimum 0
   * @example 30
   */
  estimatedTime: number | null;

  /**
   * Category name
   * @maxLength 50
   * @example "Work"
   */
  category: string | null;

  /**
   * Memo
   * @maxLength 1000
   * @example "Don't forget the attachments"
   */
  memo: string | null;

  /**
   * Creation date and time (ISO 8601 format)
   * @format date-time
   * @example "2026-02-02T12:34:56.789Z"
   */
  createdAt: string;

  /**
   * Current area the task belongs to
   */
  area: AreaType;

  /**
   * Position within the queue (integer starting from 0)
   * Ignored when in the Call Stack.
   * @minimum 0
   */
  order: number;
}

/**
 * Options for task creation
 */
export interface CreateTaskOptions {
  /**
   * Estimated time (in minutes)
   */
  estimatedTime?: number;

  /**
   * Category name
   */
  category?: string;

  /**
   * Memo
   */
  memo?: string;
}

/**
 * Input data for task creation
 */
export interface TaskInput {
  /**
   * Task name (required)
   */
  name: string;

  /**
   * Target area for the task
   */
  area: AreaType;

  /**
   * Optional attributes
   */
  options?: CreateTaskOptions;
}

/**
 * Input data for task update
 */
export interface TaskUpdate {
  /**
   * ID of the task to update
   */
  id: string;

  /**
   * Task name
   */
  name?: string;

  /**
   * Estimated time
   */
  estimatedTime?: number | null;

  /**
   * Category name
   */
  category?: string | null;

  /**
   * Memo
   */
  memo?: string | null;
}

/**
 * Validation error
 */
export interface ValidationError {
  /**
   * Name of the field where the error occurred
   */
  field: keyof Task;

  /**
   * Error message
   */
  message: string;
}

/**
 * Task validation result
 */
export interface TaskValidationResult {
  /**
   * Validation success flag
   */
  valid: boolean;

  /**
   * List of errors
   */
  errors: ValidationError[];
}
