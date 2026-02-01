/**
 * MainLayout Component
 *
 * 4つのエリア（Call Stack、Microtask Queue、Task Queue、Web API）を
 * グリッドレイアウトで配置するメインレイアウトコンポーネント。
 */

import React from 'react';
import { theme } from '@/styles/theme';

export interface MainLayoutProps {
  callStack: React.ReactNode;
  microtaskQueue: React.ReactNode;
  taskQueue: React.ReactNode;
  webAPI: React.ReactNode;
  sidebar?: React.ReactNode;
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: theme.colors.background.primary,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    backgroundColor: theme.colors.background.secondary,
    borderBottom: `1px solid ${theme.colors.border.default}`,
    padding: theme.spacing.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontFamily: theme.fonts.mono,
    fontSize: '18px',
    fontWeight: 'bold' as const,
    color: theme.colors.text.primary,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  logoIcon: {
    fontSize: '24px',
  },
  main: {
    flex: 1,
    display: 'flex',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  content: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridTemplateRows: 'repeat(2, 1fr)',
    gap: theme.spacing.md,
    minHeight: '0',
  },
  sidebar: {
    width: '320px',
    flexShrink: 0,
  },
  area: {
    minHeight: '200px',
  },
} as const;

export const MainLayout: React.FC<MainLayoutProps> = ({
  callStack,
  microtaskQueue,
  taskQueue,
  webAPI,
  sidebar,
}) => {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.logo}>
          <span style={styles.logoIcon}>🔄</span>
          EventLoop4Human
        </h1>
      </header>

      <main style={styles.main}>
        <div style={styles.content}>
          <div style={styles.area}>{callStack}</div>
          <div style={styles.area}>{microtaskQueue}</div>
          <div style={styles.area}>{taskQueue}</div>
          <div style={styles.area}>{webAPI}</div>
        </div>
        {sidebar && <aside style={styles.sidebar}>{sidebar}</aside>}
      </main>
    </div>
  );
};

export default MainLayout;
