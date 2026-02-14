/**
 * Work Log Storage Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadWorkLogs,
  saveWorkLogs,
  clearWorkLogs,
  getWorkLogMetadata,
} from '@/utils/workLogStorage';
import type { LogEntry } from '@/types';
import { WORKLOG_STORAGE_KEY, WORKLOG_MAX_ENTRIES } from '@/types/worklog.types';

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

describe('workLogStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('loadWorkLogs', () => {
    it('should return empty array when storage is empty', () => {
      const result = loadWorkLogs();
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should load entries from storage', () => {
      const testDate = new Date('2026-02-15T10:00:00Z');
      vi.setSystemTime(testDate);

      const mockEntries: LogEntry[] = [
        {
          id: 'entry-1',
          taskId: 'task-1',
          taskName: 'Test Task',
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

      localStorageMock.setItem(WORKLOG_STORAGE_KEY, JSON.stringify(storageData));

      const result = loadWorkLogs();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockEntries);
    });

    it('should return empty array on parse error', () => {
      localStorageMock.setItem(WORKLOG_STORAGE_KEY, 'invalid-json');

      const result = loadWorkLogs();
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('saveWorkLogs', () => {
    it('should save entries to storage', () => {
      const testDate = new Date('2026-02-15T10:00:00Z');
      vi.setSystemTime(testDate);

      const mockEntries: LogEntry[] = [
        {
          id: 'entry-1',
          taskId: 'task-1',
          taskName: 'Test Task',
          operation: 'created',
          timestamp: testDate.toISOString(),
          fromArea: null,
          toArea: 'taskQueue',
          elapsedTime: null,
        },
      ];

      const result = saveWorkLogs(mockEntries);
      expect(result.success).toBe(true);

      const stored = localStorageMock.getItem(WORKLOG_STORAGE_KEY);
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.version).toBe('1.0.0');
      expect(parsed.entries).toEqual(mockEntries);
      expect(parsed.lastModified).toBe(testDate.toISOString());
    });

    it('should trim entries when exceeding max limit', () => {
      const testDate = new Date('2026-02-15T10:00:00Z');
      vi.setSystemTime(testDate);

      // Create more than WORKLOG_MAX_ENTRIES (5000)
      const mockEntries: LogEntry[] = Array.from({ length: WORKLOG_MAX_ENTRIES + 100 }, (_, i) => ({
        id: `entry-${i}`,
        taskId: `task-${i}`,
        taskName: `Task ${i}`,
        operation: 'created' as const,
        timestamp: new Date(testDate.getTime() + i * 1000).toISOString(),
        fromArea: null,
        toArea: 'taskQueue' as const,
        elapsedTime: null,
      }));

      const result = saveWorkLogs(mockEntries);
      expect(result.success).toBe(true);

      const stored = localStorageMock.getItem(WORKLOG_STORAGE_KEY);
      const parsed = JSON.parse(stored!);

      // Should keep only the first WORKLOG_MAX_ENTRIES (newest entries)
      expect(parsed.entries.length).toBe(WORKLOG_MAX_ENTRIES);
      expect(parsed.entries[0].id).toBe('entry-0');
      expect(parsed.entries[WORKLOG_MAX_ENTRIES - 1].id).toBe(`entry-${WORKLOG_MAX_ENTRIES - 1}`);
    });
  });

  describe('clearWorkLogs', () => {
    it('should clear all logs from storage', () => {
      const testDate = new Date('2026-02-15T10:00:00Z');
      vi.setSystemTime(testDate);

      const mockEntries: LogEntry[] = [
        {
          id: 'entry-1',
          taskId: 'task-1',
          taskName: 'Test Task',
          operation: 'created',
          timestamp: testDate.toISOString(),
          fromArea: null,
          toArea: 'taskQueue',
          elapsedTime: null,
        },
      ];

      saveWorkLogs(mockEntries);

      const clearResult = clearWorkLogs();
      expect(clearResult.success).toBe(true);

      const loadResult = loadWorkLogs();
      expect(loadResult.success).toBe(true);
      expect(loadResult.data).toEqual([]);
    });
  });

  describe('getWorkLogMetadata', () => {
    it('should return metadata for stored logs', () => {
      const testDate = new Date('2026-02-15T10:00:00Z');
      vi.setSystemTime(testDate);

      const mockEntries: LogEntry[] = [
        {
          id: 'entry-1',
          taskId: 'task-1',
          taskName: 'Test Task 1',
          operation: 'created',
          timestamp: testDate.toISOString(),
          fromArea: null,
          toArea: 'taskQueue',
          elapsedTime: null,
        },
        {
          id: 'entry-2',
          taskId: 'task-2',
          taskName: 'Test Task 2',
          operation: 'completed',
          timestamp: testDate.toISOString(),
          fromArea: null,
          toArea: null,
          elapsedTime: 5000,
        },
      ];

      saveWorkLogs(mockEntries);

      const result = getWorkLogMetadata();
      expect(result.success).toBe(true);
      expect(result.data?.entryCount).toBe(2);
      expect(result.data?.version).toBe('1.0.0');
      expect(result.data?.lastModified).toBe(testDate.toISOString());
      expect(result.data?.sizeInBytes).toBeGreaterThan(0);
    });

    it('should return zero count when storage is empty', () => {
      const result = getWorkLogMetadata();
      expect(result.success).toBe(true);
      expect(result.data?.entryCount).toBe(0);
      expect(result.data?.sizeInBytes).toBe(0);
    });
  });
});
