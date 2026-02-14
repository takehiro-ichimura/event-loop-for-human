/**
 * SidebarTabs Component
 *
 * 2タブ切替コンポーネント（タスク追加 / ログ）
 */

import React, { useState } from 'react';
import { theme } from '@/styles/theme';

type TabType = 'tasks' | 'logs';

interface SidebarTabsProps {
  /** タスク追加タブの内容 */
  tasksTab: React.ReactNode;

  /** ログタブの内容 */
  logsTab: React.ReactNode;
}

/**
 * サイドバーのタブ切替UI
 */
export function SidebarTabs({ tasksTab, logsTab }: SidebarTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('tasks');

  return (
    <div style={styles.container}>
      {/* タブヘッダー */}
      <div style={styles.tabHeader}>
        <button
          onClick={() => setActiveTab('tasks')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'tasks' ? styles.tabButtonActive : {}),
          }}
        >
          タスク追加
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'logs' ? styles.tabButtonActive : {}),
          }}
        >
          ログ
        </button>
      </div>

      {/* タブコンテンツ */}
      <div style={styles.tabContent}>
        {activeTab === 'tasks' ? tasksTab : logsTab}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  tabHeader: {
    display: 'flex',
    borderBottom: `1px solid ${theme.colors.border.default}`,
  },
  tabButton: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: 'transparent',
    border: 'none',
    color: theme.colors.text.muted,
    fontFamily: theme.fonts.mono,
    fontSize: '14px',
    cursor: 'pointer',
    transition: `all ${theme.animations.duration.fast} ${theme.animations.easing.ease}`,
    borderBottom: '2px solid transparent',
  },
  tabButtonActive: {
    color: theme.colors.text.primary,
    borderBottomColor: theme.colors.border.active,
  },
  tabContent: {
    flex: 1,
    overflow: 'auto',
  },
};
