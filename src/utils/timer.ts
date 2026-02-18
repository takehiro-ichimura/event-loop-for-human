/**
 * Timer Utilities
 *
 * Provides utility functions for the task timer feature.
 */

import type { TimerState, TimerStorageSchema, TimerValidationResult } from '@/types';
import { TIMER_STORAGE_KEY, TIMER_STORAGE_VERSION } from '@/types';

/**
 * Format elapsed time for display
 * @param ms Elapsed time in milliseconds
 * @returns Formatted string (MM:SS or HH:MM:SS)
 */
export function formatElapsedTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Format a timestamp for display
 * @param timestamp Unix timestamp (ms)
 * @returns Formatted string (MMM D HH:MM:SS)
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const month = months[date.getMonth()];
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${month} ${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Calculate elapsed time (excluding paused duration)
 * @param state Timer state
 * @param currentTime Current time (injectable for testing)
 * @returns Elapsed time in milliseconds
 */
export function calculateElapsedTime(
  state: TimerState,
  currentTime: number = Date.now()
): number {
  if (state.isPaused && state.pauseStartTime !== null) {
    // While paused, return the time up to when the pause started
    return state.pauseStartTime - state.startTime - state.totalPausedTime;
  }

  // While running, subtract start time and accumulated pause time from current time
  return currentTime - state.startTime - state.totalPausedTime;
}

/**
 * Start a timer
 * @param taskId ID of the target task
 * @returns New TimerState
 */
export function startTimer(taskId: string): TimerState {
  return {
    taskId,
    startTime: Date.now(),
    lastResumeTime: null,
    isPaused: false,
    pauseStartTime: null,
    totalPausedTime: 0,
  };
}

/**
 * Pause the timer
 * @param state Current timer state
 * @returns Updated TimerState
 */
export function pauseTimer(state: TimerState): TimerState {
  if (state.isPaused) return state; // Already paused

  return {
    ...state,
    isPaused: true,
    pauseStartTime: Date.now(),
  };
}

/**
 * Resume the timer
 * @param state Current timer state
 * @returns Updated TimerState
 */
export function resumeTimer(state: TimerState): TimerState {
  if (!state.isPaused || state.pauseStartTime === null) return state; // Already running

  const now = Date.now();
  const pauseDuration = now - state.pauseStartTime;

  return {
    ...state,
    isPaused: false,
    pauseStartTime: null,
    lastResumeTime: now,
    totalPausedTime: state.totalPausedTime + pauseDuration,
  };
}

/**
 * Validate a TimerState
 * @param state Timer state to validate
 * @returns Validation result
 */
export function validateTimerState(state: TimerState): TimerValidationResult {
  const errors: string[] = [];

  // taskId must be a non-empty string
  if (!state.taskId || state.taskId.trim() === '') {
    errors.push('taskId is required');
  }

  // startTime must be a positive number
  if (state.startTime <= 0) {
    errors.push('startTime must be a positive number');
  }

  // totalPausedTime must be non-negative
  if (state.totalPausedTime < 0) {
    errors.push('totalPausedTime must be non-negative');
  }

  // pauseStartTime is required when isPaused is true
  if (state.isPaused && state.pauseStartTime === null) {
    errors.push('pauseStartTime is required when isPaused is true');
  }

  // pauseStartTime must be null when isPaused is false
  if (!state.isPaused && state.pauseStartTime !== null) {
    errors.push('pauseStartTime must be null when isPaused is false');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Save timer state to LocalStorage
 * @param state Timer state to save (null to clear)
 */
export function saveTimerState(state: TimerState | null): void {
  try {
    const storageData: TimerStorageSchema = {
      version: TIMER_STORAGE_VERSION,
      timerState: state,
      lastModified: new Date().toISOString(),
    };
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(storageData));
  } catch (error) {
    console.error('Failed to save timer state:', error);
  }
}

/**
 * Load timer state from LocalStorage
 * @returns Loaded timer state (null if not found or invalid)
 */
export function loadTimerState(): TimerState | null {
  try {
    const stored = localStorage.getItem(TIMER_STORAGE_KEY);
    if (!stored) return null;

    const data: TimerStorageSchema = JSON.parse(stored);

    // Version check
    if (data.version !== TIMER_STORAGE_VERSION) {
      console.warn('Timer storage version mismatch, clearing state');
      localStorage.removeItem(TIMER_STORAGE_KEY);
      return null;
    }

    // No state present
    if (!data.timerState) return null;

    // Validation
    const validation = validateTimerState(data.timerState);
    if (!validation.valid) {
      console.warn('Invalid timer state in storage:', validation.errors);
      localStorage.removeItem(TIMER_STORAGE_KEY);
      return null;
    }

    return data.timerState;
  } catch (error) {
    console.error('Failed to load timer state:', error);
    return null;
  }
}

/**
 * Clear timer state from LocalStorage
 */
export function clearTimerState(): void {
  try {
    localStorage.removeItem(TIMER_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear timer state:', error);
  }
}
