/**
 * Timer Utilities Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  formatElapsedTime,
  formatTimestamp,
  calculateElapsedTime,
  startTimer,
  pauseTimer,
  resumeTimer,
  validateTimerState,
} from '@/utils/timer';
import type { TimerState } from '@/types';

describe('formatElapsedTime', () => {
  it('should format seconds as MM:SS', () => {
    expect(formatElapsedTime(0)).toBe('00:00');
    expect(formatElapsedTime(1000)).toBe('00:01');
    expect(formatElapsedTime(65000)).toBe('01:05');
    expect(formatElapsedTime(599000)).toBe('09:59');
  });

  it('should format minutes as MM:SS', () => {
    expect(formatElapsedTime(60000)).toBe('01:00');
    expect(formatElapsedTime(3540000)).toBe('59:00');
  });

  it('should format hours as HH:MM:SS', () => {
    expect(formatElapsedTime(3600000)).toBe('1:00:00');
    expect(formatElapsedTime(3665000)).toBe('1:01:05');
    expect(formatElapsedTime(36000000)).toBe('10:00:00');
  });
});

describe('formatTimestamp', () => {
  it('should format timestamp as MMM D HH:MM:SS', () => {
    const date = new Date('2026-02-03T14:30:45');
    expect(formatTimestamp(date.getTime())).toBe('Feb 3 14:30:45');
  });

  it('should handle single digit day', () => {
    const date = new Date('2026-01-05T09:05:05');
    expect(formatTimestamp(date.getTime())).toBe('Jan 5 09:05:05');
  });

  it('should handle all months', () => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    months.forEach((month, index) => {
      const date = new Date(2026, index, 15, 12, 0, 0);
      expect(formatTimestamp(date.getTime())).toContain(month);
    });
  });
});

describe('calculateElapsedTime', () => {
  it('should calculate elapsed time when running', () => {
    const state: TimerState = {
      taskId: 'test-task',
      startTime: 1000,
      lastResumeTime: null,
      isPaused: false,
      pauseStartTime: null,
      totalPausedTime: 0,
    };

    expect(calculateElapsedTime(state, 5000)).toBe(4000);
  });

  it('should subtract paused time', () => {
    const state: TimerState = {
      taskId: 'test-task',
      startTime: 1000,
      lastResumeTime: null,
      isPaused: false,
      pauseStartTime: null,
      totalPausedTime: 2000,
    };

    expect(calculateElapsedTime(state, 5000)).toBe(2000);
  });

  it('should return fixed time when paused', () => {
    const state: TimerState = {
      taskId: 'test-task',
      startTime: 1000,
      lastResumeTime: null,
      isPaused: true,
      pauseStartTime: 3000,
      totalPausedTime: 0,
    };

    expect(calculateElapsedTime(state, 10000)).toBe(2000);
  });
});

describe('startTimer', () => {
  it('should create a new timer state', () => {
    vi.setSystemTime(new Date(1000));
    const state = startTimer('test-task');

    expect(state.taskId).toBe('test-task');
    expect(state.startTime).toBe(1000);
    expect(state.lastResumeTime).toBeNull();
    expect(state.isPaused).toBe(false);
    expect(state.pauseStartTime).toBeNull();
    expect(state.totalPausedTime).toBe(0);

    vi.useRealTimers();
  });
});

describe('pauseTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should pause a running timer', () => {
    vi.setSystemTime(new Date(5000));
    const state: TimerState = {
      taskId: 'test-task',
      startTime: 1000,
      lastResumeTime: null,
      isPaused: false,
      pauseStartTime: null,
      totalPausedTime: 0,
    };

    const paused = pauseTimer(state);

    expect(paused.isPaused).toBe(true);
    expect(paused.pauseStartTime).toBe(5000);
  });

  it('should not modify already paused timer', () => {
    const state: TimerState = {
      taskId: 'test-task',
      startTime: 1000,
      lastResumeTime: null,
      isPaused: true,
      pauseStartTime: 3000,
      totalPausedTime: 0,
    };

    const result = pauseTimer(state);

    expect(result).toBe(state);
  });
});

describe('resumeTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should resume a paused timer', () => {
    vi.setSystemTime(new Date(5000));
    const state: TimerState = {
      taskId: 'test-task',
      startTime: 1000,
      lastResumeTime: null,
      isPaused: true,
      pauseStartTime: 3000,
      totalPausedTime: 0,
    };

    const resumed = resumeTimer(state);

    expect(resumed.isPaused).toBe(false);
    expect(resumed.pauseStartTime).toBeNull();
    expect(resumed.lastResumeTime).toBe(5000);
    expect(resumed.totalPausedTime).toBe(2000);
  });

  it('should not modify already running timer', () => {
    const state: TimerState = {
      taskId: 'test-task',
      startTime: 1000,
      lastResumeTime: null,
      isPaused: false,
      pauseStartTime: null,
      totalPausedTime: 0,
    };

    const result = resumeTimer(state);

    expect(result).toBe(state);
  });
});

describe('validateTimerState', () => {
  it('should validate a valid state', () => {
    const state: TimerState = {
      taskId: 'test-task',
      startTime: 1000,
      lastResumeTime: null,
      isPaused: false,
      pauseStartTime: null,
      totalPausedTime: 0,
    };

    const result = validateTimerState(state);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject empty taskId', () => {
    const state: TimerState = {
      taskId: '',
      startTime: 1000,
      lastResumeTime: null,
      isPaused: false,
      pauseStartTime: null,
      totalPausedTime: 0,
    };

    const result = validateTimerState(state);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('taskId is required');
  });

  it('should reject non-positive startTime', () => {
    const state: TimerState = {
      taskId: 'test-task',
      startTime: 0,
      lastResumeTime: null,
      isPaused: false,
      pauseStartTime: null,
      totalPausedTime: 0,
    };

    const result = validateTimerState(state);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('startTime must be a positive number');
  });

  it('should reject paused state without pauseStartTime', () => {
    const state: TimerState = {
      taskId: 'test-task',
      startTime: 1000,
      lastResumeTime: null,
      isPaused: true,
      pauseStartTime: null,
      totalPausedTime: 0,
    };

    const result = validateTimerState(state);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('pauseStartTime is required when isPaused is true');
  });
});
