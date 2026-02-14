/**
 * WorkLogFilter Component
 *
 * 日付フィルタコンポーネント
 */

import React from 'react';
import type { DateFilter } from '@/types';
import { theme } from '@/styles/theme';

interface WorkLogFilterProps {
  filter: DateFilter;
  onFilterChange: (filter: DateFilter) => void;
}

/**
 * 日付をYYYY-MM-DD形式に変換
 */
function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 日付フィルタ
 */
export function WorkLogFilter({ filter, onFilterChange }: WorkLogFilterProps) {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filter,
      startDate: e.target.value,
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filter,
      endDate: e.target.value,
    });
  };

  const handlePresetToday = () => {
    const today = toDateString(new Date());
    onFilterChange({
      startDate: today,
      endDate: today,
    });
  };

  const handlePreset7Days = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    onFilterChange({
      startDate: toDateString(sevenDaysAgo),
      endDate: toDateString(today),
    });
  };

  const handlePreset30Days = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    onFilterChange({
      startDate: toDateString(thirtyDaysAgo),
      endDate: toDateString(today),
    });
  };

  const handleClear = () => {
    onFilterChange({
      startDate: '',
      endDate: '',
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.dateInputs}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>開始日</label>
          <input
            type="date"
            value={filter.startDate}
            onChange={handleStartDateChange}
            style={styles.dateInput}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>終了日</label>
          <input
            type="date"
            value={filter.endDate}
            onChange={handleEndDateChange}
            style={styles.dateInput}
          />
        </div>
      </div>
      <div style={styles.presetButtons}>
        <button onClick={handlePresetToday} style={styles.presetButton}>
          今日
        </button>
        <button onClick={handlePreset7Days} style={styles.presetButton}>
          過去7日
        </button>
        <button onClick={handlePreset30Days} style={styles.presetButton}>
          過去30日
        </button>
        <button onClick={handleClear} style={styles.clearButton}>
          クリア
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.sm,
    border: `1px solid ${theme.colors.border.default}`,
  },
  dateInputs: {
    display: 'flex',
    gap: theme.spacing.md,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xs,
    flex: 1,
  },
  label: {
    fontFamily: theme.fonts.mono,
    fontSize: '11px',
    color: theme.colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  dateInput: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background.primary,
    border: `1px solid ${theme.colors.border.default}`,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.mono,
    fontSize: '12px',
  },
  presetButtons: {
    display: 'flex',
    gap: theme.spacing.xs,
  },
  presetButton: {
    flex: 1,
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
  clearButton: {
    padding: theme.spacing.sm,
    backgroundColor: 'transparent',
    border: `1px solid ${theme.colors.border.inactive}`,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.text.muted,
    fontFamily: theme.fonts.mono,
    fontSize: '11px',
    cursor: 'pointer',
    transition: `all ${theme.animations.duration.fast} ${theme.animations.easing.ease}`,
  },
};
