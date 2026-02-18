/**
 * ErrorBoundary Component
 *
 * Catches and displays errors.
 * Also shows warnings for LocalStorage errors and similar issues.
 */

import React, { Component, ReactNode } from 'react';
import { theme } from '@/styles/theme';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

const styles = {
  container: {
    backgroundColor: theme.colors.background.secondary,
    border: `1px solid ${theme.colors.text.error}44`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    margin: theme.spacing.md,
  },
  title: {
    fontFamily: theme.fonts.mono,
    fontSize: '16px',
    color: theme.colors.text.error,
    margin: `0 0 ${theme.spacing.md} 0`,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  message: {
    fontFamily: theme.fonts.mono,
    fontSize: '14px',
    color: theme.colors.text.primary,
    margin: `0 0 ${theme.spacing.md} 0`,
    whiteSpace: 'pre-wrap' as const,
  },
  details: {
    fontFamily: theme.fonts.mono,
    fontSize: '12px',
    color: theme.colors.text.muted,
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    overflowX: 'auto' as const,
  },
  button: {
    fontFamily: theme.fonts.mono,
    fontSize: '14px',
    color: theme.colors.background.primary,
    backgroundColor: theme.colors.text.error,
    border: 'none',
    borderRadius: theme.borderRadius.sm,
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    cursor: 'pointer',
    marginTop: theme.spacing.md,
  },
} as const;

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={styles.container}>
          <h2 style={styles.title}>
            ⚠️ An error occurred
          </h2>
          <p style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          {this.state.error?.stack && (
            <pre style={styles.details}>
              {this.state.error.stack}
            </pre>
          )}
          <button style={styles.button} onClick={this.handleReset}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * StorageWarning Component
 *
 * Displays warnings related to LocalStorage issues.
 */
export interface StorageWarningProps {
  message: string;
  onDismiss?: () => void;
}

const warningStyles = {
  container: {
    backgroundColor: `${theme.colors.text.warning}11`,
    border: `1px solid ${theme.colors.text.warning}44`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  icon: {
    fontSize: '16px',
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  message: {
    fontFamily: theme.fonts.mono,
    fontSize: '12px',
    color: theme.colors.text.warning,
    margin: 0,
  },
  dismiss: {
    fontFamily: theme.fonts.mono,
    fontSize: '14px',
    color: theme.colors.text.warning,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    lineHeight: 1,
  },
} as const;

export const StorageWarning: React.FC<StorageWarningProps> = ({
  message,
  onDismiss,
}) => {
  return (
    <div style={warningStyles.container}>
      <span style={warningStyles.icon}>⚠️</span>
      <div style={warningStyles.content}>
        <p style={warningStyles.message}>{message}</p>
      </div>
      {onDismiss && (
        <button style={warningStyles.dismiss} onClick={onDismiss}>
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorBoundary;
