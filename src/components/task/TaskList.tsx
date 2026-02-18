/**
 * TaskList Component
 *
 * Displays a list of tasks.
 * Also shows an empty state message when there are no tasks.
 */

import React from 'react';
import type { Task } from '@/types';
import { TaskCard, TaskCardProps } from './TaskCard';
import { theme } from '@/styles/theme';

export interface TaskListProps {
  tasks: Task[];
  emptyMessage?: string;
  onTaskClick?: (task: Task) => void;
  showCompleteButton?: boolean;
  showBlockButton?: boolean;
  onComplete?: (task: Task) => void;
  onBlock?: (task: Task) => void;
  renderTask?: (task: Task, defaultProps: TaskCardProps) => React.ReactNode;
}

const styles = {
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  empty: {
    fontFamily: theme.fonts.mono,
    fontSize: '12px',
    color: theme.colors.text.muted,
    textAlign: 'center' as const,
    padding: theme.spacing.lg,
    border: `1px dashed ${theme.colors.border.inactive}`,
    borderRadius: theme.borderRadius.md,
  },
} as const;

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  emptyMessage = 'No tasks',
  onTaskClick,
  showCompleteButton = false,
  showBlockButton = false,
  onComplete,
  onBlock,
  renderTask,
}) => {
  if (tasks.length === 0) {
    return <div style={styles.empty}>{emptyMessage}</div>;
  }

  return (
    <div style={styles.list}>
      {tasks.map((task) => {
        const defaultProps: TaskCardProps = {
          task,
          showCompleteButton,
          showBlockButton,
          onComplete: onComplete ? () => onComplete(task) : undefined,
          onBlock: onBlock ? () => onBlock(task) : undefined,
          onClick: onTaskClick ? () => onTaskClick(task) : undefined,
        };

        if (renderTask) {
          return <React.Fragment key={task.id}>{renderTask(task, defaultProps)}</React.Fragment>;
        }

        return <TaskCard key={task.id} {...defaultProps} />;
      })}
    </div>
  );
};

export default TaskList;
