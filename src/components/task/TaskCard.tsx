/**
 * TaskCard Component
 *
 * Card component for displaying a task.
 * Provides complete button, attribute display, and edit functionality.
 */

import React from 'react';
import type { Task } from '@/types';
import { theme } from '@/styles/theme';

export interface TaskCardProps {
  task: Task;
  showCompleteButton?: boolean;
  showBlockButton?: boolean;
  onComplete?: () => void;
  onBlock?: () => void;
  onClick?: () => void;
  isDragging?: boolean;
}

const styles = {
  card: {
    backgroundColor: theme.colors.background.secondary,
    border: `1px solid ${theme.colors.border.default}`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    cursor: 'pointer',
    transition: `all ${theme.animations.duration.normal} ${theme.animations.easing.ease}`,
  },
  cardHover: {
    backgroundColor: theme.colors.background.hover,
    borderColor: theme.colors.border.active,
  },
  cardDragging: {
    opacity: 0.5,
    transform: 'scale(1.02)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  name: {
    fontFamily: theme.fonts.mono,
    fontSize: '14px',
    color: theme.colors.text.primary,
    margin: 0,
    flex: 1,
    wordBreak: 'break-word' as const,
  },
  attributes: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  attribute: {
    fontFamily: theme.fonts.mono,
    fontSize: '11px',
    color: theme.colors.text.secondary,
    backgroundColor: theme.colors.background.primary,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.sm,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  memo: {
    fontFamily: theme.fonts.mono,
    fontSize: '12px',
    color: theme.colors.text.muted,
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTop: `1px solid ${theme.colors.border.inactive}`,
  },
  buttonGroup: {
    display: 'flex',
    gap: theme.spacing.xs,
  },
  button: {
    fontFamily: theme.fonts.mono,
    fontSize: '11px',
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.sm,
    border: 'none',
    cursor: 'pointer',
    transition: `all ${theme.animations.duration.fast} ${theme.animations.easing.ease}`,
  },
  completeButton: {
    backgroundColor: theme.colors.accent.taskQueue,
    color: theme.colors.background.primary,
  },
  blockButton: {
    backgroundColor: theme.colors.accent.webAPI,
    color: theme.colors.background.primary,
  },
} as const;

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  showCompleteButton = false,
  showBlockButton = false,
  onComplete,
  onBlock,
  onClick,
  isDragging = false,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const handleCompleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComplete?.();
  };

  const handleBlockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBlock?.();
  };

  const cardStyle = {
    ...styles.card,
    ...(isHovered && styles.cardHover),
    ...(isDragging && styles.cardDragging),
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div style={styles.header}>
        <p style={styles.name}>{task.name}</p>
        <div style={styles.buttonGroup}>
          {showBlockButton && onBlock && (
            <button
              style={{ ...styles.button, ...styles.blockButton }}
              onClick={handleBlockClick}
            >
              Block
            </button>
          )}
          {showCompleteButton && onComplete && (
            <button
              style={{ ...styles.button, ...styles.completeButton }}
              onClick={handleCompleteClick}
            >
              Done
            </button>
          )}
        </div>
      </div>

      {(task.estimatedTime || task.category) && (
        <div style={styles.attributes}>
          {task.estimatedTime && (
            <span style={styles.attribute}>
              @ {task.estimatedTime}min
            </span>
          )}
          {task.category && (
            <span style={styles.attribute}>
              [#] {task.category}
            </span>
          )}
        </div>
      )}

      {task.memo && (
        <div style={styles.memo}>
          {task.memo}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
