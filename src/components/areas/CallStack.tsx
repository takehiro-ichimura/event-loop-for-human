/**
 * CallStack Component
 *
 * Displays the Call Stack area.
 * Shows the currently executing task (max 1) with complete and block actions.
 */

import React from 'react';
import type { Task } from '@/types';
import { TaskCard } from '@/components/task/TaskCard';
import { TaskTimer } from '@/components/task/TaskTimer';
import { theme } from '@/styles/theme';

export interface CallStackProps {
  task: Task | null;
  onComplete: () => void;
  onBlock: () => void;
  onTaskClick?: (task: Task) => void;
}

const styles = {
  container: {
    backgroundColor: theme.colors.background.secondary,
    border: `1px solid ${theme.colors.accent.callStack}44`,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    backgroundColor: theme.colors.background.primary,
    borderBottom: `1px solid ${theme.colors.accent.callStack}44`,
    padding: theme.spacing.sm,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  indicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: theme.colors.accent.callStack,
    boxShadow: `0 0 8px ${theme.colors.accent.callStack}`,
  },
  title: {
    fontFamily: theme.fonts.mono,
    fontSize: '12px',
    fontWeight: 'bold' as const,
    color: theme.colors.accent.callStack,
    margin: 0,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },
  content: {
    padding: theme.spacing.md,
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
  },
  empty: {
    fontFamily: theme.fonts.mono,
    fontSize: '12px',
    color: theme.colors.text.muted,
    textAlign: 'center' as const,
    padding: theme.spacing.lg,
  },
  hint: {
    fontFamily: theme.fonts.mono,
    fontSize: '11px',
    color: theme.colors.text.muted,
    textAlign: 'center' as const,
    marginTop: theme.spacing.sm,
    opacity: 0.7,
  },
} as const;

export const CallStack: React.FC<CallStackProps> = ({
  task,
  onComplete,
  onBlock,
  onTaskClick,
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.indicator} />
        <h2 style={styles.title}>Call Stack</h2>
      </div>
      <div style={styles.content}>
        {task ? (
          <>
            <TaskTimer taskId={task.id} />
            <TaskCard
              task={task}
              showCompleteButton
              showBlockButton
              onComplete={onComplete}
              onBlock={onBlock}
              onClick={onTaskClick ? () => onTaskClick(task) : undefined}
            />
          </>
        ) : (
          <div>
            <div style={styles.empty}>// Empty</div>
            <div style={styles.hint}>Waiting for next task...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallStack;
