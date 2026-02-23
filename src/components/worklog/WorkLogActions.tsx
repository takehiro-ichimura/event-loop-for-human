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
    if (window.confirm(`全 ${totalCount} 件のログをクリアしますか？この操作は取り消せません。`)) {
      onClearAll();
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={handleClearAll} style={styles.clearButton}>
        全 {totalCount} 件をクリア
      </button>
      <div style={styles.exportButtons}>
        <button onClick={onExportCSV} style={styles.exportButton}>
          CSV出力
        </button>
        <button onClick={onExportJSON} style={styles.exportButton}>
          JSON出力
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
