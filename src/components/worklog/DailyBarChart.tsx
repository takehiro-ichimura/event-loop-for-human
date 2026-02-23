import React from 'react';
import { DailyStats } from '../../types';

interface DailyBarChartProps {
  /** 日別統計データ */
  dailyStats: DailyStats[];
}

/**
 * テキストベースのバーチャートコンポーネント
 *
 * DailyStats配列を受け取り、等幅フォントでASCIIバーチャート（`████░░░░ 5件` 形式）を表示する。
 * 最大値に対する比率でバーの長さを算出し、バー幅は20文字固定。
 */
export const DailyBarChart: React.FC<DailyBarChartProps> = ({ dailyStats }) => {
  if (dailyStats.length === 0) {
    return (
      <div style={{ color: 'var(--muted-text, #555)' }}>
        データがありません
      </div>
    );
  }

  // 最大完了数を取得
  const maxCount = Math.max(...dailyStats.map(stat => stat.completedCount));
  const BAR_WIDTH = 20;

  // バーを生成する関数
  const generateBar = (count: number): string => {
    if (maxCount === 0) return '░'.repeat(BAR_WIDTH);

    const filledWidth = Math.round((count / maxCount) * BAR_WIDTH);
    const emptyWidth = BAR_WIDTH - filledWidth;

    return '█'.repeat(filledWidth) + '░'.repeat(emptyWidth);
  };

  return (
    <div style={{ fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.8' }}>
      {dailyStats.map(stat => (
        <div key={stat.date} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ color: 'var(--muted-text, #555)', minWidth: '80px' }}>
            {stat.date}
          </span>
          <span style={{ color: 'var(--accent-green, #00ff00)', letterSpacing: '-1px' }}>
            {generateBar(stat.completedCount)}
          </span>
          <span style={{ color: 'var(--primary-text, #00ff00)', minWidth: '50px' }}>
            {stat.completedCount}件
          </span>
        </div>
      ))}
    </div>
  );
};
