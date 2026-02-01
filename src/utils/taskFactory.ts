import type { Task, AreaType } from '@/types/task.types';

/**
 * Options for creating a task
 */
export interface CreateTaskOptions {
  estimatedTime?: number;
  category?: string;
  memo?: string;
}

/**
 * Creates a new Task object with auto-generated ID and timestamp
 * @param name - Task name (required)
 * @param area - Area where the task will be placed (required)
 * @param options - Optional task properties (estimatedTime, category, memo)
 * @returns A new Task object
 */
export function createTask(
  name: string,
  area: AreaType,
  options?: CreateTaskOptions
): Task {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    estimatedTime: options?.estimatedTime ?? null,
    category: options?.category ?? null,
    memo: options?.memo ?? null,
    createdAt: new Date().toISOString(),
    area,
    order: 0, // Will be set when added to a queue
  };
}
