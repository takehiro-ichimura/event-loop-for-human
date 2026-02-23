/**
 * WorkLogActions Component
 *
 * ログ管理アクションコンポーネント
 */

import React from 'react';
import { theme } from '@/styles/theme';

interface WorkLogActionsProps {
  totalCount: number;
  onClearAll: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
}

/**
 * ログ管理アクション
 */
export function WorkLogActions({
  totalCount,
  onClearAll,
  onExportCSV,
  onExportJSON,
}: WorkLogActionsProps) {
  const handleClearAll = () => {
    if (window.confirm(`Clear all ${totalCount} logs? This action cannot be undone.`)) {
      onClearAll();
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={handleClearAll} style={styles.clearButton}>
        Clear All ({totalCount})
      </button>
      <div style={styles.exportButtons}>
        <button onClick={onExportCSV} style={styles.exportButton}>
          CSV Export
        </button>
        <button onClick={onExportJSON} style={styles.exportButton}>
          JSON Export
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.sm,
    border: `1px solid ${theme.colors.border.default}`,
  },
  clearButton: {
    padding: theme.spacing.sm,
    backgroundColor: 'transparent',
    border: `1px solid ${theme.colors.text.error}44`,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.text.error,
    fontFamily: theme.fonts.mono,
    fontSize: '11px',
    cursor: 'pointer',
    transition: `all ${theme.animations.duration.fast} ${theme.animations.easing.ease}`,
  },
  exportButtons: {
    display: 'flex',
    gap: theme.spacing.xs,
  },
  exportButton: {
    padding: theme.spacing.sm,
    backgroundColor: 'transparent',
    border: `1px solid ${theme.colors.border.default}`,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.mono,
    fontSize: '11px',
    cursor: 'pointer',
    transition: `all ${theme.animations.duration.fast} ${theme.animations.easing.ease}`,
  },
};
