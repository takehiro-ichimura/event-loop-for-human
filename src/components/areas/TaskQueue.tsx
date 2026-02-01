/**
 * TaskQueue Component
 *
 * Task Queueエリアを表示するコンポーネント。
 * 独立したタスクのキューを管理します。
 */

import React from 'react';
import type { Task } from '@/types';
import { TaskList } from '@/components/task/TaskList';
import { theme } from '@/styles/theme';

export interface TaskQueueProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

const styles = {
  container: {
    backgroundColor: theme.colors.background.secondary,
    border: `1px solid ${theme.colors.accent.taskQueue}44`,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    backgroundColor: theme.colors.background.primary,
    borderBottom: `1px solid ${theme.colors.accent.taskQueue}44`,
    padding: theme.spacing.sm,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  indicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: theme.colors.accent.taskQueue,
    boxShadow: `0 0 8px ${theme.colors.accent.taskQueue}`,
  },
  title: {
    fontFamily: theme.fonts.mono,
    fontSize: '12px',
    fontWeight: 'bold' as const,
    color: theme.colors.accent.taskQueue,
    margin: 0,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },
  count: {
    fontFamily: theme.fonts.mono,
    fontSize: '11px',
    color: theme.colors.text.muted,
    backgroundColor: theme.colors.background.hover,
    padding: `2px ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.sm,
  },
  content: {
    padding: theme.spacing.md,
    flex: 1,
    overflowY: 'auto' as const,
  },
} as const;

export const TaskQueue: React.FC<TaskQueueProps> = ({
  tasks,
  onTaskClick,
}) => {
  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.indicator} />
          <h2 style={styles.title}>Task Queue</h2>
        </div>
        <span style={styles.count}>{tasks.length}</span>
      </div>
      <div style={styles.content}>
        <TaskList
          tasks={sortedTasks}
          emptyMessage="// No tasks in queue"
          onTaskClick={onTaskClick}
        />
      </div>
    </div>
  );
};

export default TaskQueue;
