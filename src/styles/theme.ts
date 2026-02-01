// Theme configuration for EventLoop4Human
export const theme = {
  colors: {
    background: {
      primary: '#0a0a0a',      // Main background (almost black)
      secondary: '#1a1a1a',    // Panel background
      hover: '#2a2a2a',        // Hover state
    },
    text: {
      primary: '#00ff00',      // Main text (bright green)
      secondary: '#00cc00',    // Secondary text
      muted: '#008800',        // Muted green
      error: '#ff0000',        // Error
      warning: '#ffaa00',      // Warning
    },
    border: {
      default: '#00ff0044',    // Semi-transparent green
      active: '#00ff00',       // Active state (bright green)
      inactive: '#00880044',   // Inactive state
    },
    accent: {
      callStack: '#ff00ff',    // Call Stack (magenta)
      microtask: '#00ffff',    // Microtask Queue (cyan)
      taskQueue: '#00ff00',    // Task Queue (green)
      webAPI: '#ffaa00',       // Web API (orange)
    }
  },
  fonts: {
    mono: "'Fira Code', 'JetBrains Mono', 'Source Code Pro', 'Menlo', 'Monaco', 'Courier New', monospace",
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '400ms',
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
      easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
  }
} as const;

export type Theme = typeof theme;
