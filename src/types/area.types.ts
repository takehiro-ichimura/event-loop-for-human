/**
 * Area Type Definitions
 *
 * Provides type definitions for areas (Call Stack, Microtask Queue, Task Queue, Web API).
 */

import { Task, AreaType } from './task.types';

/**
 * Event loop state
 *
 * Holds the current state of all four areas.
 */
export interface EventLoopState {
  /**
   * Call Stack (currently executing task)
   * Holds at most one task.
   */
  callStack: Task | null;

  /**
   * Microtask Queue (derived task queue)
   * Processed with higher priority than Task Queue.
   * Array order represents processing order.
   */
  microtaskQueue: Task[];

  /**
   * Task Queue (independent task queue)
   * Processed when Microtask Queue is empty.
   * Array order represents processing order.
   */
  taskQueue: Task[];

  /**
   * Web API (blocked tasks)
   * Holds tasks that cannot proceed on their own, e.g. waiting for replies or builds.
   * Order is not significant.
   */
  webAPI: Task[];
}

/**
 * Area statistics
 */
export interface AreaStats {
  /**
   * Area name
   */
  area: AreaType;

  /**
   * Task count
   */
  count: number;

  /**
   * Total estimated time in minutes
   * Excludes tasks without an estimated time.
   */
  totalEstimatedTime: number;
}

/**
 * Overall event loop statistics
 */
export interface EventLoopStats {
  /**
   * Statistics for each area
   */
  areas: {
    callStack: AreaStats;
    microtaskQueue: AreaStats;
    taskQueue: AreaStats;
    webAPI: AreaStats;
  };

  /**
   * Total number of tasks
   */
  totalTasks: number;

  /**
   * Total estimated time in minutes
   */
  totalEstimatedTime: number;
}

/**
 * Task move operation between areas
 */
export interface TaskMoveOperation {
  /**
   * ID of the task to move
   */
  taskId: string;

  /**
   * Source area
   */
  from: AreaType;

  /**
   * Destination area
   */
  to: AreaType;

  /**
   * Order at destination (for queues)
   * Ignored for Call Stack.
   */
  order?: number;
}

/**
 * Reorder operation within a queue
 */
export interface ReorderOperation {
  /**
   * Target area (microtaskQueue or taskQueue only)
   */
  area: 'microtaskQueue' | 'taskQueue';

  /**
   * ID of the task to move
   */
  taskId: string;

  /**
   * New index (0-based)
   */
  newIndex: number;
}

/**
 * Area metadata
 */
export interface AreaMetadata {
  /**
   * Area name
   */
  area: AreaType;

  /**
   * Display name
   */
  displayName: string;

  /**
   * Description
   */
  description: string;

  /**
   * Maximum number of tasks (null means unlimited)
   */
  maxTasks: number | null;

  /**
   * Whether reordering is supported
   */
  sortable: boolean;

  /**
   * Accent color (hex)
   */
  accentColor: string;
}

/**
 * Metadata constants for all areas
 */
export const AREA_METADATA: Record<AreaType, AreaMetadata> = {
  callStack: {
    area: 'callStack',
    displayName: 'Call Stack',
    description: 'Currently executing task (max 1)',
    maxTasks: 1,
    sortable: false,
    accentColor: '#ff00ff',
  },
  microtaskQueue: {
    area: 'microtaskQueue',
    displayName: 'Microtask Queue',
    description: 'Derived tasks (high priority)',
    maxTasks: null,
    sortable: true,
    accentColor: '#00ffff',
  },
  taskQueue: {
    area: 'taskQueue',
    displayName: 'Task Queue',
    description: 'Independent tasks (low priority)',
    maxTasks: null,
    sortable: true,
    accentColor: '#00ff00',
  },
  webAPI: {
    area: 'webAPI',
    displayName: 'Web API',
    description: 'Blocked tasks (waiting)',
    maxTasks: null,
    sortable: false,
    accentColor: '#ffaa00',
  },
};
