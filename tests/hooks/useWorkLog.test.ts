/**
 * useWorkLog Hook Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWorkLog } from '@/hooks/useWorkLog';
import type { LogEntry } from '@/types';

// LocalStorageのモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useWorkLog', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with empty entries', () => {
    const { result } = renderHook(() => useWorkLog());

    expect(result.current.entries).toEqual([]);
    expect(result.current.filteredEntries).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.dateFilter).toEqual({ startDate: '', endDate: '' });
  });

  it('should record a log entry', () => {
    const testDate = new Date('2026-02-15T10:00:00Z');
    vi.setSystemTime(testDate);

    const { result } = renderHook(() => useWorkLog());

    act(() => {
      result.current.recordLog({
        taskId: 'task-1',
        taskName: 'Test Task',
        operation: 'created',
        toArea: 'taskQueue',
      });
    });

    expect(result.current.entries.length).toBe(1);
    expect(result.current.entries[0].taskId).toBe('task-1');
    expect(result.current.entries[0].taskName).toBe('Test Task');
    expect(result.current.entries[0].operation).toBe('created');
    expect(result.current.entries[0].toArea).toBe('taskQueue');
    expect(result.current.entries[0].fromArea).toBeNull();
    expect(result.current.entries[0].elapsedTime).toBeNull();
    expect(result.current.totalCount).toBe(1);
  });

  it('should filter entries by date range', () => {
    const { result } = renderHook(() => useWorkLog());

    // Add entries with different dates
    act(() => {
      vi.setSystemTime(new Date('2026-02-10T10:00:00Z'));
      result.current.recordLog({
        taskId: 'task-1',
        taskName: 'Old Task',
        operation: 'created',
        toArea: 'taskQueue',
      });

      vi.setSystemTime(new Date('2026-02-15T10:00:00Z'));
      result.current.recordLog({
        taskId: 'task-2',
        taskName: 'Recent Task',
        operation: 'created',
        toArea: 'taskQueue',
      });

      vi.setSystemTime(new Date('2026-02-20T10:00:00Z'));
      result.current.recordLog({
        taskId: 'task-3',
        taskName: 'Future Task',
        operation: 'created',
        toArea: 'taskQueue',
      });
    });

    expect(result.current.totalCount).toBe(3);
    expect(result.current.filteredEntries.length).toBe(3);

    // Apply date filter
    act(() => {
      result.current.setDateFilter({
        startDate: '2026-02-12',
        endDate: '2026-02-18',
      });
    });

    expect(result.current.filteredEntries.length).toBe(1);
    expect(result.current.filteredEntries[0].taskName).toBe('Recent Task');
  });

  it('should calculate summary for a period', () => {
    const { result } = renderHook(() => useWorkLog());

    act(() => {
      vi.setSystemTime(new Date('2026-02-15T10:00:00Z'));
      result.current.recordLog({
        taskId: 'task-1',
        taskName: 'Task 1',
        operation: 'completed',
        elapsedTime: 1800000, // 30 minutes
      });

      vi.setSystemTime(new Date('2026-02-15T14:00:00Z'));
      result.current.recordLog({
        taskId: 'task-2',
        taskName: 'Task 2',
        operation: 'completed',
        elapsedTime: 3600000, // 60 minutes
      });

      vi.setSystemTime(new Date('2026-02-16T10:00:00Z'));
      result.current.recordLog({
        taskId: 'task-3',
        taskName: 'Task 3',
        operation: 'completed',
        elapsedTime: 900000, // 15 minutes
      });
    });

    const summary = result.current.getSummary('2026-02-15', '2026-02-15');

    expect(summary.completedCount).toBe(2);
    expect(summary.averageElapsedTime).toBe(2700000); // (30 + 60) / 2 = 45 minutes
    expect(summary.dailyBreakdown.length).toBe(1);
    expect(summary.dailyBreakdown[0].date).toBe('2026-02-15');
    expect(summary.dailyBreakdown[0].completedCount).toBe(2);
  });

  it('should clear all logs', () => {
    const { result } = renderHook(() => useWorkLog());

    act(() => {
      result.current.recordLog({
        taskId: 'task-1',
        taskName: 'Test Task',
        operation: 'created',
        toArea: 'taskQueue',
      });
    });

    expect(result.current.totalCount).toBe(1);

    act(() => {
      result.current.clearAllLogs();
    });

    expect(result.current.entries).toEqual([]);
    expect(result.current.totalCount).toBe(0);
  });

  it('should load entries from storage on mount', () => {
    const testDate = new Date('2026-02-15T10:00:00Z');
    vi.setSystemTime(testDate);

    const mockEntries: LogEntry[] = [
      {
        id: 'entry-1',
        taskId: 'task-1',
        taskName: 'Stored Task',
        operation: 'created',
        timestamp: testDate.toISOString(),
        fromArea: null,
        toArea: 'taskQueue',
        elapsedTime: null,
      },
    ];

    const storageData = {
      version: '1.0.0',
      entries: mockEntries,
      lastModified: testDate.toISOString(),
    };

    localStorageMock.setItem('eventloop4human:logs', JSON.stringify(storageData));

    const { result } = renderHook(() => useWorkLog());

    expect(result.current.totalCount).toBe(1);
    expect(result.current.entries[0].taskName).toBe('Stored Task');
  });
});
