/**
 * WorkLogPanel Component
 *
 * ログタブのメインパネル
 */

import React from 'react';
import type { LogEntry, DateFilter, WorkSummary } from '@/types';
import { WorkLogFilter } from './WorkLogFilter';
import { WorkLogList } from './WorkLogList';
import { WorkLogActions } from './WorkLogActions';
import { WorkLogAnalysis } from './WorkLogAnalysis';
import { theme } from '@/styles/theme';

interface WorkLogPanelProps {
  filteredEntries: LogEntry[];
  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;
  clearAllLogs: () => void;
  exportLogs: (format: 'csv' | 'json') => void;
  totalCount: number;
  getSummary: (startDate: string, endDate: string) => WorkSummary;
}

/**
 * ログタブのメインパネル
 */
export function WorkLogPanel({
  filteredEntries,
  dateFilter,
  setDateFilter,
  clearAllLogs,
  exportLogs,
  totalCount,
  getSummary,
}: WorkLogPanelProps) {
  const handleExportCSV = () => {
    exportLogs('csv');
  };

  const handleExportJSON = () => {
    exportLogs('json');
  };

  return (
    <div style={styles.container}>
      <WorkLogFilter filter={dateFilter} onFilterChange={setDateFilter} />
      <WorkLogList entries={filteredEntries} />
      <WorkLogAnalysis getSummary={getSummary} dateFilter={dateFilter} />
      <WorkLogActions
        totalCount={totalCount}
        onClearAll={clearAllLogs}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    height: '100%',
    overflow: 'auto',
  },
};
