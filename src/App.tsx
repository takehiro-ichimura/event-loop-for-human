/**
 * App Component
 *
 * EventLoop4Humanのルートコンポーネント。
 * useEventLoopフックを使用してイベントループの状態を管理し、
 * MainLayoutを通じて4つのエリアを表示します。
 * LocalStorageとの同期によりデータを永続化します。
 */

import { useEffect, useState } from 'react';
import { useEventLoop } from '@/hooks/useEventLoop';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { MainLayout } from '@/components/layout/MainLayout';
import { ErrorBoundary, StorageWarning } from '@/components/layout/ErrorBoundary';
import { CallStack } from '@/components/areas/CallStack';
import { MicrotaskQueue } from '@/components/areas/MicrotaskQueue';
import { TaskQueue } from '@/components/areas/TaskQueue';
import { WebAPI } from '@/components/areas/WebAPI';
import { TaskForm } from '@/components/task/TaskForm';
import type { AreaType } from '@/types';
import { theme } from '@/styles/theme';

const loadingStyles = {
  container: {
    minHeight: '100vh',
    backgroundColor: theme.colors.background.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: theme.fonts.mono,
    fontSize: '16px',
    color: theme.colors.text.primary,
  },
} as const;

function AppContent() {
  const {
    state,
    addTask,
    completeTask,
    blockTask,
    moveTask,
    loadState,
  } = useEventLoop();

  const {
    savedState,
    isLoaded,
    error: storageError,
    save,
  } = useLocalStorage();

  const [initialized, setInitialized] = useState(false);
  const [warningDismissed, setWarningDismissed] = useState(false);

  // 初回マウント時にLocalStorageからデータを復元
  useEffect(() => {
    if (isLoaded && savedState && !initialized) {
      loadState(savedState);
      setInitialized(true);
    } else if (isLoaded && !savedState && !initialized) {
      setInitialized(true);
    }
  }, [isLoaded, savedState, initialized, loadState]);

  // 状態変更時にLocalStorageに保存（debounce付き）
  useEffect(() => {
    if (initialized) {
      save(state);
    }
  }, [state, initialized, save]);

  const handleAddTask = (
    name: string,
    area: AreaType,
    options?: { estimatedTime?: number; category?: string; memo?: string }
  ) => {
    addTask(name, area, options);
  };

  // ローディング中
  if (!isLoaded || !initialized) {
    return (
      <div style={loadingStyles.container}>
        <p style={loadingStyles.text}>// Loading...</p>
      </div>
    );
  }

  return (
    <>
      {storageError && !warningDismissed && (
        <StorageWarning
          message={storageError}
          onDismiss={() => setWarningDismissed(true)}
        />
      )}
      <MainLayout
        callStack={
          <CallStack
            task={state.callStack}
            onComplete={completeTask}
            onBlock={blockTask}
          />
        }
        microtaskQueue={
          <MicrotaskQueue tasks={state.microtaskQueue} />
        }
        taskQueue={
          <TaskQueue tasks={state.taskQueue} />
        }
        webAPI={
          <WebAPI
            tasks={state.webAPI}
            onMoveTask={moveTask}
          />
        }
        sidebar={
          <TaskForm
            onSubmit={handleAddTask}
            defaultArea="taskQueue"
            availableAreas={['taskQueue', 'microtaskQueue']}
          />
        }
      />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
