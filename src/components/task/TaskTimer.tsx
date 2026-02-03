/**
 * TaskTimer Component
 *
 * コールスタックで実行中のタスクの経過時間を表示するコンポーネント。
 */

import React from 'react';
import type { TaskTimerProps } from '@/types';
import { useTaskTimer } from '@/hooks/useTaskTimer';
import { theme } from '@/styles/theme';

const styles = {
  container: {
    fontFamily: theme.fonts.mono,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background.primary,
    border: `1px solid ${theme.colors.accent.callStack}44`,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontSize: '10px',
    color: theme.colors.text.muted,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },
  time: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    letterSpacing: '2px',
  },
  timeRunning: {
    color: theme.colors.accent.callStack,
  },
  timePaused: {
    color: `${theme.colors.accent.callStack}88`,
  },
  timestamps: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTop: `1px solid ${theme.colors.border.inactive}`,
  },
  timestampRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    marginBottom: theme.spacing.xs,
  },
  timestampLabel: {
    color: theme.colors.text.muted,
  },
  timestampValue: {
    color: theme.colors.text.secondary,
  },
  buttonGroup: {
    display: 'flex',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  button: {
    fontFamily: theme.fonts.mono,
    fontSize: '11px',
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.sm,
    border: 'none',
    cursor: 'pointer',
    transition: `all ${theme.animations.duration.fast} ${theme.animations.easing.ease}`,
    backgroundColor: theme.colors.accent.callStack,
    color: theme.colors.background.primary,
  },
  buttonPaused: {
    backgroundColor: `${theme.colors.accent.callStack}88`,
  },
} as const;

export const TaskTimer: React.FC<TaskTimerProps> = ({ taskId }) => {
  const timer = useTaskTimer(taskId);

  if (!taskId) return null;

  const timeStyle = {
    ...styles.time,
    ...(timer.isPaused ? styles.timePaused : styles.timeRunning),
  };

  const buttonStyle = {
    ...styles.button,
    ...(timer.isPaused ? styles.buttonPaused : {}),
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.label}>Elapsed</span>
        <span style={styles.label}>
          {timer.isPaused ? 'PAUSED' : 'RUNNING'}
        </span>
      </div>
      <div style={timeStyle}>{timer.formattedTime}</div>

      <div style={styles.timestamps}>
        <div style={styles.timestampRow}>
          <span style={styles.timestampLabel}>Started:</span>
          <span style={styles.timestampValue}>{timer.startTimestamp}</span>
        </div>
        {timer.resumeTimestamp && (
          <div style={styles.timestampRow}>
            <span style={styles.timestampLabel}>Resumed:</span>
            <span style={styles.timestampValue}>{timer.resumeTimestamp}</span>
          </div>
        )}
      </div>

      <div style={styles.buttonGroup}>
        {timer.isPaused ? (
          <button style={buttonStyle} onClick={timer.resume}>
            Resume
          </button>
        ) : (
          <button style={buttonStyle} onClick={timer.pause}>
            Pause
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskTimer;
