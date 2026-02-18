/**
 * TaskForm Component
 *
 * Form for adding new tasks.
 * Allows input of task name, target area, and optional attributes.
 */

import React, { useState } from 'react';
import type { AreaType } from '@/types';
import { theme } from '@/styles/theme';
import { validateTaskName } from '@/utils/validation';

export interface TaskFormProps {
  onSubmit: (name: string, area: AreaType, options?: { estimatedTime?: number; category?: string; memo?: string }) => void;
  defaultArea?: AreaType;
  availableAreas?: AreaType[];
}

const styles = {
  form: {
    backgroundColor: theme.colors.background.secondary,
    border: `1px solid ${theme.colors.border.default}`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  title: {
    fontFamily: theme.fonts.mono,
    fontSize: '14px',
    color: theme.colors.text.primary,
    margin: `0 0 ${theme.spacing.md} 0`,
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
    transition: `border-color ${theme.animations.duration.fast} ${theme.animations.easing.ease}`,
  },
  inputFocus: {
    borderColor: theme.colors.border.active,
  },
  textarea: {
    resize: 'vertical' as const,
    minHeight: '60px',
  },
  select: {
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
    cursor: 'pointer',
  },
  row: {
    display: 'flex',
    gap: theme.spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  submitButton: {
    fontFamily: theme.fonts.mono,
    fontSize: '14px',
    color: theme.colors.background.primary,
    backgroundColor: theme.colors.text.primary,
    border: 'none',
    borderRadius: theme.borderRadius.sm,
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    width: '100%',
    cursor: 'pointer',
    transition: `all ${theme.animations.duration.fast} ${theme.animations.easing.ease}`,
  },
  submitButtonHover: {
    backgroundColor: theme.colors.text.secondary,
  },
  error: {
    fontFamily: theme.fonts.mono,
    fontSize: '11px',
    color: theme.colors.text.error,
    marginTop: theme.spacing.xs,
  },
  collapsibleHeader: {
    fontFamily: theme.fonts.mono,
    fontSize: '12px',
    color: theme.colors.text.muted,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
    userSelect: 'none' as const,
  },
} as const;

const areaLabels: Record<AreaType, string> = {
  callStack: 'Call Stack',
  microtaskQueue: 'Microtask Queue',
  taskQueue: 'Task Queue',
  webAPI: 'Web API',
};

export const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  defaultArea = 'taskQueue',
  availableAreas = ['taskQueue', 'microtaskQueue'],
}) => {
  const [name, setName] = useState('');
  const [area, setArea] = useState<AreaType>(defaultArea);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [category, setCategory] = useState('');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [isSubmitHovered, setIsSubmitHovered] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateTaskName(name);
    if (!validation.valid) {
      setError(validation.error || 'Invalid task name');
      return;
    }

    const options: { estimatedTime?: number; category?: string; memo?: string } = {};
    if (estimatedTime) {
      const time = parseInt(estimatedTime, 10);
      if (!isNaN(time) && time > 0) {
        options.estimatedTime = time;
      }
    }
    if (category.trim()) {
      options.category = category.trim();
    }
    if (memo.trim()) {
      options.memo = memo.trim();
    }

    onSubmit(name.trim(), area, Object.keys(options).length > 0 ? options : undefined);

    // Reset form
    setName('');
    setEstimatedTime('');
    setCategory('');
    setMemo('');
    setError(null);
    setShowOptions(false);
  };

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      <h3 style={styles.title}>+ Add Task</h3>

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
          placeholder="Enter task name..."
        />
        {error && <div style={styles.error}>{error}</div>}
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Add to</label>
        <select
          style={styles.select}
          value={area}
          onChange={(e) => setArea(e.target.value as AreaType)}
        >
          {availableAreas.map((a) => (
            <option key={a} value={a}>
              {areaLabels[a]}
            </option>
          ))}
        </select>
      </div>

      <div
        style={styles.collapsibleHeader}
        onClick={() => setShowOptions(!showOptions)}
      >
        {showOptions ? '▼' : '▶'} Optional Attributes
      </div>

      {showOptions && (
        <>
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
        </>
      )}

      <button
        type="submit"
        style={{
          ...styles.submitButton,
          ...(isSubmitHovered && styles.submitButtonHover),
        }}
        onMouseEnter={() => setIsSubmitHovered(true)}
        onMouseLeave={() => setIsSubmitHovered(false)}
      >
        Add Task
      </button>
    </form>
  );
};

export default TaskForm;
