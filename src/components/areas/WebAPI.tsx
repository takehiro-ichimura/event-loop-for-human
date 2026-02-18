/**
 * WebAPI Component
 *
 * Displays the Web API area.
 * Manages blocked (waiting) tasks.
 */

import React from 'react';
import type { Task, AreaType } from '@/types';
import { theme } from '@/styles/theme';

export interface WebAPIProps {
  tasks: Task[];
  onMoveTask?: (taskId: string, to: AreaType) => void;
  onTaskClick?: (task: Task) => void;
}

const styles = {
  container: {
    backgroundColor: theme.colors.background.secondary,
    border: `1px solid ${theme.colors.accent.webAPI}44`,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    backgroundColor: theme.colors.background.primary,
    borderBottom: `1px solid ${theme.colors.accent.webAPI}44`,
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
    backgroundColor: theme.colors.accent.webAPI,
    boxShadow: `0 0 8px ${theme.colors.accent.webAPI}`,
  },
  title: {
    fontFamily: theme.fonts.mono,
    fontSize: '12px',
    fontWeight: 'bold' as const,
    color: theme.colors.accent.webAPI,
    margin: 0,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },
  blocked: {
    fontFamily: theme.fonts.mono,
    fontSize: '10px',
    color: theme.colors.accent.webAPI,
    backgroundColor: `${theme.colors.accent.webAPI}22`,
    padding: `2px ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.sm,
    textTransform: 'uppercase' as const,
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
  empty: {
    fontFamily: theme.fonts.mono,
    fontSize: '12px',
    color: theme.colors.text.muted,
    textAlign: 'center' as const,
    padding: theme.spacing.lg,
    border: `1px dashed ${theme.colors.border.inactive}`,
    borderRadius: theme.borderRadius.md,
  },
  taskCard: {
    backgroundColor: theme.colors.background.secondary,
    border: `1px solid ${theme.colors.border.default}`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    cursor: 'pointer',
    transition: `all ${theme.animations.duration.normal} ${theme.animations.easing.ease}`,
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  taskName: {
    fontFamily: theme.fonts.mono,
    fontSize: '14px',
    color: theme.colors.text.primary,
    margin: 0,
    flex: 1,
    wordBreak: 'break-word' as const,
  },
  buttonGroup: {
    display: 'flex',
    gap: theme.spacing.xs,
  },
  moveButton: {
    fontFamily: theme.fonts.mono,
    fontSize: '10px',
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.sm,
    border: 'none',
    cursor: 'pointer',
    transition: `all ${theme.animations.duration.fast} ${theme.animations.easing.ease}`,
    backgroundColor: theme.colors.background.hover,
    color: theme.colors.text.secondary,
  },
  moveToMicrotask: {
    backgroundColor: `${theme.colors.accent.microtask}22`,
    color: theme.colors.accent.microtask,
  },
  moveToTask: {
    backgroundColor: `${theme.colors.accent.taskQueue}22`,
    color: theme.colors.accent.taskQueue,
  },
} as const;

export const WebAPI: React.FC<WebAPIProps> = ({
  tasks,
  onMoveTask,
  onTaskClick,
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.indicator} />
          <h2 style={styles.title}>Web API</h2>
          <span style={styles.blocked}>Blocked</span>
        </div>
        <span style={styles.count}>{tasks.length}</span>
      </div>
      <div style={styles.content}>
        {tasks.length === 0 ? (
          <div style={styles.empty}>// No blocked tasks</div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              style={styles.taskCard}
              onClick={() => onTaskClick?.(task)}
            >
              <div style={styles.taskHeader}>
                <p style={styles.taskName}>{task.name}</p>
              </div>
              {onMoveTask && (
                <div style={styles.buttonGroup}>
                  <button
                    style={{ ...styles.moveButton, ...styles.moveToMicrotask }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveTask(task.id, 'microtaskQueue');
                    }}
                  >
                    → Microtask
                  </button>
                  <button
                    style={{ ...styles.moveButton, ...styles.moveToTask }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveTask(task.id, 'taskQueue');
                    }}
                  >
                    → Task Queue
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WebAPI;
