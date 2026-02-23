/**
 * Work Log Export Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { exportToCSV, exportToJSON } from '@/utils/workLogExport';
import type { LogEntry } from '@/types';

// BlobとURL.createObjectURLのモック
global.Blob = class Blob {
  constructor(public parts: any[], public options?: BlobPropertyBag) {}
} as any;

const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = vi.fn();

global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

// document.bodyとanchor要素のモック
const mockClick = vi.fn();
const mockAnchor = {
  href: '',
  download: '',
  click: mockClick,
  style: {},
};

// document.bodyのモック
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
Object.defineProperty(document, 'body', {
  value: {
    appendChild: mockAppendChild,
    removeChild: mockRemoveChild,
  },
  configurable: true,
});

const originalCreateElement = document.createElement.bind(document);
vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
  if (tagName === 'a') {
    return mockAnchor as any;
  }
  return originalCreateElement(tagName);
});

describe('workLogExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAnchor.href = '';
    mockAnchor.download = '';
    mockAppendChild.mockClear();
    mockRemoveChild.mockClear();
  });

  describe('exportToCSV', () => {
    it('should export entries to CSV with BOM and headers', () => {
      const testDate = new Date('2026-02-15T10:00:00Z');
      const mockEntries: LogEntry[] = [
        {
          id: 'entry-1',
          taskId: 'task-1',
          taskName: 'Test Task',
          operation: 'completed',
          timestamp: testDate.toISOString(),
          fromArea: null,
          toArea: null,
          elapsedTime: 1800000,
        },
        {
          id: 'entry-2',
          taskId: 'task-2',
          taskName: 'Another Task',
          operation: 'created',
          timestamp: testDate.toISOString(),
          fromArea: null,
          toArea: 'taskQueue',
          elapsedTime: null,
        },
      ];

      exportToCSV(mockEntries);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      const blobArg = mockCreateObjectURL.mock.calls[0][0];
      expect(blobArg).toBeInstanceOf(Blob);

      // Blobの内容を確認
      const csvContent = blobArg.parts[0];
      expect(csvContent).toContain('\uFEFF'); // BOM
      expect(csvContent).toContain('ID,Task ID,Task Name,Operation,Timestamp,From,To,Elapsed(ms)');
      expect(csvContent).toContain('entry-1');
      expect(csvContent).toContain('Test Task');
      expect(csvContent).toContain('completed');
      expect(csvContent).toContain('1800000');

      expect(mockAnchor.download).toContain('worklog-');
      expect(mockAnchor.download).toContain('.csv');
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should handle empty entries', () => {
      exportToCSV([]);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      const blobArg = mockCreateObjectURL.mock.calls[0][0];
      const csvContent = blobArg.parts[0];

      expect(csvContent).toContain('\uFEFF'); // BOM
      expect(csvContent).toContain('ID,Task ID,Task Name,Operation,Timestamp,From,To,Elapsed(ms)');
      expect(csvContent.split('\n').length).toBe(1); // Header only (no data rows)
    });

    it('should escape special characters in task names', () => {
      const mockEntries: LogEntry[] = [
        {
          id: 'entry-1',
          taskId: 'task-1',
          taskName: 'Task with "quotes" and, commas',
          operation: 'created',
          timestamp: '2026-02-15T10:00:00Z',
          fromArea: null,
          toArea: 'taskQueue',
          elapsedTime: null,
        },
      ];

      exportToCSV(mockEntries);

      const blobArg = mockCreateObjectURL.mock.calls[0][0];
      const csvContent = blobArg.parts[0];

      expect(csvContent).toContain('"Task with ""quotes"" and, commas"');
    });
  });

  describe('exportToJSON', () => {
    it('should export entries to JSON with metadata', () => {
      const testDate = new Date('2026-02-15T10:00:00Z');
      vi.setSystemTime(testDate);

      const mockEntries: LogEntry[] = [
        {
          id: 'entry-1',
          taskId: 'task-1',
          taskName: 'Test Task',
          operation: 'completed',
          timestamp: testDate.toISOString(),
          fromArea: null,
          toArea: null,
          elapsedTime: 1800000,
        },
      ];

      exportToJSON(mockEntries);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      const blobArg = mockCreateObjectURL.mock.calls[0][0];
      expect(blobArg).toBeInstanceOf(Blob);

      // Blobの内容を確認
      const jsonContent = JSON.parse(blobArg.parts[0]);
      expect(jsonContent.exportedAt).toBe(testDate.toISOString());
      expect(jsonContent.totalEntries).toBe(1);
      expect(jsonContent.entries).toEqual(mockEntries);

      expect(mockAnchor.download).toContain('worklog-');
      expect(mockAnchor.download).toContain('.json');
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should handle empty entries', () => {
      const testDate = new Date('2026-02-15T10:00:00Z');
      vi.setSystemTime(testDate);

      exportToJSON([]);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      const blobArg = mockCreateObjectURL.mock.calls[0][0];
      const jsonContent = JSON.parse(blobArg.parts[0]);

      expect(jsonContent.exportedAt).toBe(testDate.toISOString());
      expect(jsonContent.totalEntries).toBe(0);
      expect(jsonContent.entries).toEqual([]);
    });
  });
});
