/**
 * WorkLogList Component
 *
 * ログエントリの一覧表示コンポーネント
 */

import React, { useState } from 'react';
import type { LogEntry } from '@/types';
import { theme } from '@/styles/theme';
import { WORKLOG_PAGE_SIZE } from '@/types';

interface WorkLogListProps {
  entries: LogEntry[];
}

/**
 * 操作種別に対応するアクセントカラーを取得
 */
function getOperationColor(operation: LogEntry['operation']): string {
  switch (operation) {
    case 'created':
      return theme.colors.accent.taskQueue; // 緑
    case 'moved':
      return theme.colors.accent.microtask; // シアン
    case 'completed':
      return theme.colors.accent.callStack; // マゼンタ
    case 'blocked':
      return theme.colors.accent.webAPI; // オレンジ
    case 'paused':
    case 'resumed':
      return theme.colors.text.muted; // muted green
    default:
      return theme.colors.text.primary;
  }
}

/**
 * タイムスタンプをHH:mm:ss形式に変換
 */
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/**
 * 経過時間をHH:mm:ss形式に変換
 */
function formatElapsedTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * ログエントリの一覧表示
 */
export function WorkLogList({ entries }: WorkLogListProps) {
  const [visibleCount, setVisibleCount] = useState<number>(WORKLOG_PAGE_SIZE);

  const visibleEntries = entries.slice(0, visibleCount);
  const hasMore = visibleCount < entries.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + WORKLOG_PAGE_SIZE);
  };

  if (entries.length === 0) {
    return (
      <div style={styles.emptyMessage}>
        ログがありません
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.list}>
        {visibleEntries.map(entry => (
          <div key={entry.id} style={styles.entry}>
            <div style={styles.entryHeader}>
              <span style={styles.taskName}>{entry.taskName}</span>
              <span
                style={{
                  ...styles.operation,
                  color: getOperationColor(entry.operation),
                }}
              >
                {entry.operation}
              </span>
            </div>
            <div style={styles.entryDetails}>
              <span style={styles.timestamp}>{formatTime(entry.timestamp)}</span>
              {entry.fromArea && entry.toArea && (
                <span style={styles.areaMove}>
                  {entry.fromArea} → {entry.toArea}
                </span>
              )}
              {!entry.fromArea && entry.toArea && (
                <span style={styles.areaMove}>
                  → {entry.toArea}
                </span>
              )}
              {entry.elapsedTime !== null && (
                <span style={styles.elapsedTime}>
                  経過: {formatElapsedTime(entry.elapsedTime)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <button onClick={handleLoadMore} style={styles.loadMoreButton}>
          もっと見る ({entries.length - visibleCount}件)
        </button>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
  },
  entry: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderLeft: `2px solid ${theme.colors.border.default}`,
    borderRadius: theme.borderRadius.sm,
  },
  entryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  taskName: {
    fontFamily: theme.fonts.mono,
    fontSize: '14px',
    color: theme.colors.text.primary,
    fontWeight: 'bold',
  },
  operation: {
    fontFamily: theme.fonts.mono,
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  entryDetails: {
    display: 'flex',
    gap: theme.spacing.md,
    fontSize: '11px',
    fontFamily: theme.fonts.mono,
    color: theme.colors.text.secondary,
  },
  timestamp: {},
  areaMove: {},
  elapsedTime: {},
  emptyMessage: {
    padding: theme.spacing.lg,
    textAlign: 'center',
    fontFamily: theme.fonts.mono,
    color: theme.colors.text.muted,
  },
  loadMoreButton: {
    padding: theme.spacing.md,
    backgroundColor: 'transparent',
    border: `1px solid ${theme.colors.border.default}`,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.mono,
    fontSize: '12px',
    cursor: 'pointer',
    transition: `all ${theme.animations.duration.fast} ${theme.animations.easing.ease}`,
  },
};
