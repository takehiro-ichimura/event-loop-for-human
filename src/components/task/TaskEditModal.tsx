/**
 * TaskEditModal Component
 *
 * Modal component for editing tasks.
 * Allows editing of task name, estimated time, category, and memo.
 */

import React, { useState, useEffect } from 'react';
import type { Task } from '@/types';
import { theme } from '@/styles/theme';
import { validateTaskName } from '@/utils/validation';

export interface TaskEditModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: {
    name?: string;
    estimatedTime?: number | null;
    category?: string | null;
    memo?: string | null;
  }) => void;
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: theme.colors.background.secondary,
    border: `1px solid ${theme.colors.border.active}`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    width: '90%',
    maxWidth: '480px',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontFamily: theme.fonts.mono,
    fontSize: '16px',
    color: theme.colors.text.primary,
    margin: 0,
  },
  closeButton: {
    fontFamily: theme.fonts.mono,
    fontSize: '20px',
    color: theme.colors.text.muted,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: theme.spacing.xs,
    lineHeight: 1,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontFamily: theme.fonts.mono,
    fontSize: '12px',
    color: theme.colors.text.secondary,
    display: 'block',
    marginBottom: theme.spacing.xs,
  },
  input: {
    fontFamily: theme.fonts.mono,
    fontSize: '14px',
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.primary,
    border: `1px solid ${theme.colors.border.default}`,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    width: '100%',
    boxSizing: 'border-box' as const,
    outline: 'none',
  },
  textarea: {
    resize: 'vertical' as const,
    minHeight: '80px',
  },
  row: {
    display: 'flex',
    gap: theme.spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  error: {
    fontFamily: theme.fonts.mono,
    fontSize: '11px',
    color: theme.colors.text.error,
    marginTop: theme.spacing.xs,
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTop: `1px solid ${theme.colors.border.inactive}`,
  },
  button: {
    fontFamily: theme.fonts.mono,
    fontSize: '14px',
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    borderRadius: theme.borderRadius.sm,
    border: 'none',
    cursor: 'pointer',
  },
  cancelButton: {
    backgroundColor: theme.colors.background.hover,
    color: theme.colors.text.secondary,
  },
  saveButton: {
    backgroundColor: theme.colors.text.primary,
    color: theme.colors.background.primary,
  },
  meta: {
    fontFamily: theme.fonts.mono,
    fontSize: '11px',
    color: theme.colors.text.muted,
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTop: `1px solid ${theme.colors.border.inactive}`,
  },
} as const;

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(task.name);
  const [estimatedTime, setEstimatedTime] = useState(task.estimatedTime?.toString() || '');
  const [category, setCategory] = useState(task.category || '');
  const [memo, setMemo] = useState(task.memo || '');
  const [error, setError] = useState<string | null>(null);

  // Reset form when the task changes
  useEffect(() => {
    setName(task.name);
    setEstimatedTime(task.estimatedTime?.toString() || '');
    setCategory(task.category || '');
    setMemo(task.memo || '');
    setError(null);
  }, [task]);

  const handleSave = () => {
    const validation = validateTaskName(name);
    if (!validation.valid) {
      setError(validation.error || 'Invalid task name');
      return;
    }

    const updates: {
      name?: string;
      estimatedTime?: number | null;
      category?: string | null;
      memo?: string | null;
    } = {};

    if (name.trim() !== task.name) {
      updates.name = name.trim();
    }

    const parsedTime = estimatedTime ? parseInt(estimatedTime, 10) : null;
    if (parsedTime !== task.estimatedTime) {
      updates.estimatedTime = parsedTime;
    }

    const trimmedCategory = category.trim() || null;
    if (trimmedCategory !== task.category) {
      updates.category = trimmedCategory;
    }

    const trimmedMemo = memo.trim() || null;
    if (trimmedMemo !== task.memo) {
      updates.memo = trimmedMemo;
    }

    if (Object.keys(updates).length > 0) {
      onSave(updates);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  const createdDate = new Date(task.createdAt).toLocaleString('en-US');

  return (
    <div style={styles.overlay} onClick={onClose} onKeyDown={handleKeyDown}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>Edit Task</h3>
          <button style={styles.closeButton} onClick={onClose}>
            [x]
          </button>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Task Name *</label>
          <input
            type="text"
            style={styles.input}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            autoFocus
          />
          {error && <div style={styles.error}>{error}</div>}
        </div>

        <div style={{ ...styles.inputGroup, ...styles.row }}>
          <div style={styles.halfWidth}>
            <label style={styles.label}>Estimated Time (min)</label>
            <input
              type="number"
              style={styles.input}
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              placeholder="30"
              min="1"
            />
          </div>
          <div style={styles.halfWidth}>
            <label style={styles.label}>Category</label>
            <input
              type="text"
              style={styles.input}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Work, Personal..."
            />
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Memo</label>
          <textarea
            style={{ ...styles.input, ...styles.textarea }}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Additional notes..."
          />
        </div>

        <div style={styles.meta}>
          Created: {createdDate}
        </div>

        <div style={styles.buttonGroup}>
          <button
            style={{ ...styles.button, ...styles.cancelButton }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            style={{ ...styles.button, ...styles.saveButton }}
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskEditModal;
