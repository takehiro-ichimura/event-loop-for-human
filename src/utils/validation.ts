import type { Task } from '@/types/task.types';

/**
 * Validates a Task object and returns an array of error messages
 * @param task - Partial Task object to validate
 * @returns Array of error messages (empty if valid)
 */
export function validateTask(task: Partial<Task>): string[] {
  const errors: string[] = [];

  // Required field check: name
  if (!task.name || task.name.trim().length === 0) {
    errors.push('タスク名は必須です');
  }

  // Length check: name (1-200 characters)
  if (task.name && task.name.length > 200) {
    errors.push('タスク名は200文字以内で入力してください');
  }

  // Length check: category (0-50 characters)
  if (task.category && task.category.length > 50) {
    errors.push('カテゴリは50文字以内で入力してください');
  }

  // Length check: memo (0-1000 characters)
  if (task.memo && task.memo.length > 1000) {
    errors.push('メモは1000文字以内で入力してください');
  }

  // Estimated time check (must be >= 0 if provided)
  if (task.estimatedTime !== null && task.estimatedTime !== undefined) {
    if (task.estimatedTime < 0) {
      errors.push('見積もり時間は0以上で入力してください');
    }
  }

  return errors;
}

/**
 * Checks if a task is valid (has no validation errors)
 * @param task - Partial Task object to validate
 * @returns true if valid, false otherwise
 */
export function isTaskValid(task: Partial<Task>): boolean {
  return validateTask(task).length === 0;
}

/**
 * Result of task name validation
 */
export interface TaskNameValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates just the task name
 * @param name - Task name to validate
 * @returns Validation result with valid flag and optional error message
 */
export function validateTaskName(name: string): TaskNameValidationResult {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'タスク名は必須です' };
  }

  if (name.length > 200) {
    return { valid: false, error: 'タスク名は200文字以内で入力してください' };
  }

  return { valid: true };
}
