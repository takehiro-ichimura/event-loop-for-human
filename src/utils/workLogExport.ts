/**
 * Work Log Export Utilities
 *
 * ログデータのCSV/JSONエクスポート機能
 */

import type { LogEntry } from '@/types';

/**
 * CSV形式でエクスポート
 *
 * @param entries - エクスポートするログエントリ
 */
export function exportToCSV(entries: LogEntry[]): void {
  try {
    // UTF-8 BOM付きヘッダー
    const BOM = '\uFEFF';
    const headers = ['ID', 'Task ID', 'Task Name', 'Operation', 'Timestamp', 'From', 'To', 'Elapsed(ms)'];

    // CSVデータ作成
    const rows = entries.map(entry => [
      entry.id,
      entry.taskId,
      `"${entry.taskName.replace(/"/g, '""')}"`, // ダブルクォートのエスケープ
      entry.operation,
      entry.timestamp,
      entry.fromArea ?? '',
      entry.toArea ?? '',
      entry.elapsedTime?.toString() ?? '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const csvWithBOM = BOM + csvContent;

    // Blob作成とダウンロード
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `worklog-${new Date().toISOString().split('T')[0]}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // メモリ解放
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export CSV:', error);
  }
}

/**
 * JSON形式でエクスポート
 *
 * @param entries - エクスポートするログエントリ
 */
export function exportToJSON(entries: LogEntry[]): void {
  try {
    const exportData = {
      exportedAt: new Date().toISOString(),
      totalEntries: entries.length,
      entries,
    };

    const jsonContent = JSON.stringify(exportData, null, 2);

    // Blob作成とダウンロード
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `worklog-${new Date().toISOString().split('T')[0]}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // メモリ解放
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export JSON:', error);
  }
}
