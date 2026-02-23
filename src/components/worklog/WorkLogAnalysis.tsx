import React from 'react';
import { formatElapsedTime } from '../../utils/timer';
import { DailyBarChart } from './DailyBarChart';

interface WorkLogAnalysisProps {
  /** サマリー取得関数 */
  getSummary: (startDate: string, endDate: string) => {
    periodStart: string;
    periodEnd: string;
    completedCount: number;
    averageElapsedTime: number | null;
    dailyBreakdown: Array<{
      date: string;
      completedCount: number;
      averageElapsedTime: number | null;
    }>;
  };
  /** 現在の日付フィルタ */
  dateFilter: { startDate: string; endDate: string };
}

/**
 * 作業ログ分析セクションコンポーネント
 *
 * (1) サマリー表示: 完了タスク数、平均所要時間（HH:mm:ss形式）
 * (2) 日別テーブル: 日付、完了数、平均時間の3カラム
 * (3) DailyBarChart の統合
 */
export const WorkLogAnalysis: React.FC<WorkLogAnalysisProps> = ({
  getSummary,
  dateFilter,
}) => {
  // 現在のフィルタ期間でサマリーを取得
  const summary = getSummary(
    dateFilter.startDate || '1970-01-01',
    dateFilter.endDate || '2999-12-31'
  );

  return (
    <div
      style={{
        marginTop: '24px',
        padding: '16px',
        borderTop: '1px solid var(--border-color, #333)',
      }}
    >
      {/* サマリー */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ color: 'var(--accent-cyan, #00ffff)', marginBottom: '8px', fontSize: '16px' }}>
          Work Summary
        </h3>
        <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
          <div>
            <span style={{ color: 'var(--muted-text, #555)' }}>Completed: </span>
            <span style={{ color: 'var(--primary-text, #00ff00)', fontWeight: 'bold' }}>
              {summary.completedCount}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--muted-text, #555)' }}>Avg Time: </span>
            <span style={{ color: 'var(--primary-text, #00ff00)', fontWeight: 'bold' }}>
              {summary.averageElapsedTime !== null
                ? formatElapsedTime(summary.averageElapsedTime)
                : '--:--:--'}
            </span>
          </div>
        </div>
      </div>

      {/* 日別テーブル */}
      {summary.dailyBreakdown.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ color: 'var(--accent-cyan, #00ffff)', marginBottom: '8px', fontSize: '14px' }}>
            Daily Breakdown
          </h4>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
              fontFamily: 'monospace',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color, #333)' }}>
                <th style={{ textAlign: 'left', padding: '8px', color: 'var(--muted-text, #555)' }}>
                  Date
                </th>
                <th style={{ textAlign: 'right', padding: '8px', color: 'var(--muted-text, #555)' }}>
                  Done
                </th>
                <th style={{ textAlign: 'right', padding: '8px', color: 'var(--muted-text, #555)' }}>
                  Avg Time
                </th>
              </tr>
            </thead>
            <tbody>
              {summary.dailyBreakdown.map(stat => (
                <tr key={stat.date} style={{ borderBottom: '1px solid var(--border-color, #222)' }}>
                  <td style={{ padding: '8px', color: 'var(--primary-text, #00ff00)' }}>
                    {stat.date}
                  </td>
                  <td style={{ textAlign: 'right', padding: '8px', color: 'var(--primary-text, #00ff00)' }}>
                    {stat.completedCount}
                  </td>
                  <td style={{ textAlign: 'right', padding: '8px', color: 'var(--primary-text, #00ff00)' }}>
                    {stat.averageElapsedTime !== null
                      ? formatElapsedTime(stat.averageElapsedTime)
                      : '--:--:--'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* バーチャート */}
      {summary.dailyBreakdown.length > 0 && (
        <div>
          <h4 style={{ color: 'var(--accent-cyan, #00ffff)', marginBottom: '8px', fontSize: '14px' }}>
            Daily Completed Tasks
          </h4>
          <DailyBarChart dailyStats={summary.dailyBreakdown} />
        </div>
      )}

      {/* データなしメッセージ */}
      {summary.completedCount === 0 && (
        <div style={{ color: 'var(--muted-text, #555)', textAlign: 'center', padding: '16px' }}>
          No completed tasks in this period
        </div>
      )}
    </div>
  );
};
