/**
 * useWorkLog Hook
 *
 * 作業ログの記録・取得・分析・管理を統合するカスタムフック
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  LogEntry,
  RecordLogParams,
  DateFilter,
  WorkSummary,
  DailyStats,
} from '@/types';
import {
  loadWorkLogs,
  saveWorkLogs,
  clearWorkLogs as clearWorkLogsStorage,
} from '@/utils/workLogStorage';
import {
  exportToCSV,
  exportToJSON,
} from '@/utils/workLogExport';

/**
 * useWorkLog フックの戻り値の型
 */
export interface UseWorkLogReturn {
  /** 全ログエントリ（新しい順） */
  entries: LogEntry[];

  /** フィルタ適用後のログエントリ */
  filteredEntries: LogEntry[];

  /** 現在の日付フィルタ */
  dateFilter: DateFilter;

  /** 日付フィルタを設定 */
  setDateFilter: (filter: DateFilter) => void;

  /** ログエントリを記録 */
  recordLog: (params: RecordLogParams) => void;

  /** 指定期間のサマリーを計算 */
  getSummary: (startDate: string, endDate: string) => WorkSummary;

  /** 全ログをクリア */
  clearAllLogs: () => void;

  /** ログをエクスポート */
  exportLogs: (format: 'csv' | 'json') => void;

  /** ログ件数 */
  totalCount: number;

  /** ストレージ読み込み完了フラグ */
  isLoaded: boolean;
}

/**
 * UUID v4 を生成
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 日付フィルタを適用
 */
function applyDateFilter(entries: LogEntry[], filter: DateFilter): LogEntry[] {
  if (!filter.startDate && !filter.endDate) {
    return entries;
  }

  return entries.filter(entry => {
    const entryDate = entry.timestamp.split('T')[0] ?? ''; // YYYY-MM-DD部分を取得

    if (filter.startDate && entryDate < filter.startDate) {
      return false;
    }

    if (filter.endDate && entryDate > filter.endDate) {
      return false;
    }

    return true;
  });
}

/**
 * 作業ログを管理するカスタムフック
 */
export function useWorkLog(): UseWorkLogReturn {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    startDate: '',
    endDate: '',
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // 初回マウント時にLocalStorageから復元
  useEffect(() => {
    const result = loadWorkLogs();
    if (result.success && result.data) {
      setEntries(result.data);
    }
    setIsLoaded(true);
  }, []);

  // フィルタ適用後のエントリ
  const filteredEntries = applyDateFilter(entries, dateFilter);

  // ログエントリを記録
  const recordLog = useCallback((params: RecordLogParams) => {
    try {
      const newEntry: LogEntry = {
        id: generateUUID(),
        taskId: params.taskId,
        taskName: params.taskName,
        operation: params.operation,
        timestamp: new Date().toISOString(),
        fromArea: params.fromArea ?? null,
        toArea: params.toArea ?? null,
        elapsedTime: params.elapsedTime ?? null,
      };

      // 配列先頭に追加（新しい順）
      setEntries(prevEntries => {
        const updatedEntries = [newEntry, ...prevEntries];

        // LocalStorageに即座保存（5000件トリミングはsaveWorkLogs内で実施）
        saveWorkLogs(updatedEntries);

        return updatedEntries;
      });
    } catch (error) {
      console.error('Failed to record log:', error);
    }
  }, []);

  // 指定期間のサマリーを計算
  const getSummary = useCallback((startDate: string, endDate: string): WorkSummary => {
    const periodFilter: DateFilter = { startDate, endDate };
    const filteredByPeriod = applyDateFilter(entries, periodFilter);

    // 完了タスクのみ抽出
    const completedEntries = filteredByPeriod.filter(
      entry => entry.operation === 'completed' && entry.elapsedTime !== null
    );

    const completedCount = completedEntries.length;

    // 平均所要時間を計算
    const totalElapsed = completedEntries.reduce(
      (sum, entry) => sum + (entry.elapsedTime ?? 0),
      0
    );
    const averageElapsedTime = completedCount > 0 ? totalElapsed / completedCount : null;

    // 日別内訳を作成
    const dailyMap = new Map<string, { count: number; totalTime: number }>();

    completedEntries.forEach(entry => {
      const date = entry.timestamp.split('T')[0] ?? '';
      if (!date) return;

      const existing = dailyMap.get(date) ?? { count: 0, totalTime: 0 };
      dailyMap.set(date, {
        count: existing.count + 1,
        totalTime: existing.totalTime + (entry.elapsedTime ?? 0),
      });
    });

    const dailyBreakdown: DailyStats[] = Array.from(dailyMap.entries())
      .map(([date, stats]) => ({
        date,
        completedCount: stats.count,
        averageElapsedTime: stats.count > 0 ? stats.totalTime / stats.count : null,
      }))
      .sort((a, b) => a.date.localeCompare(b.date)); // 日付昇順

    return {
      periodStart: startDate,
      periodEnd: endDate,
      completedCount,
      averageElapsedTime,
      dailyBreakdown,
    };
  }, [entries]);

  // 全ログをクリア
  const clearAllLogs = useCallback(() => {
    const result = clearWorkLogsStorage();
    if (result.success) {
      setEntries([]);
    } else {
      console.error('Failed to clear logs:', result.error);
    }
  }, []);

  // ログをエクスポート
  const exportLogs = useCallback((format: 'csv' | 'json') => {
    const entriesToExport = filteredEntries.length > 0 ? filteredEntries : entries;

    if (format === 'csv') {
      exportToCSV(entriesToExport);
    } else {
      exportToJSON(entriesToExport);
    }
  }, [entries, filteredEntries]);

  return {
    entries,
    filteredEntries,
    dateFilter,
    setDateFilter,
    recordLog,
    getSummary,
    clearAllLogs,
    exportLogs,
    totalCount: entries.length,
    isLoaded,
  };
}
