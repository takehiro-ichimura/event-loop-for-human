/**
 * App Component
 *
 * Root component of EventLoop4Human.
 * Manages event loop state using the useEventLoop hook
 * and displays four areas through MainLayout.
 * Persists data via LocalStorage synchronization.
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
import { TaskEditModal } from '@/components/task/TaskEditModal';
import type { Task, AreaType } from '@/types';
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
    reorderQueue,
    updateTask,
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
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Restore data from LocalStorage on initial mount
  useEffect(() => {
    if (isLoaded && savedState && !initialized) {
      loadState(savedState);
      setInitialized(true);
    } else if (isLoaded && !savedState && !initialized) {
      setInitialized(true);
    }
  }, [isLoaded, savedState, initialized, loadState]);

  // Save to LocalStorage on state changes (with debounce)
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

  const handleReorderTaskQueue = (taskId: string, newIndex: number) => {
    reorderQueue('taskQueue', taskId, newIndex);
  };

  const handleReorderMicrotaskQueue = (taskId: string, newIndex: number) => {
    reorderQueue('microtaskQueue', taskId, newIndex);
  };

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
  };

  const handleSaveTask = (updates: {
    name?: string;
    estimatedTime?: number | null;
    category?: string | null;
    memo?: string | null;
  }) => {
    if (editingTask) {
      updateTask(editingTask.id, updates);
    }
  };

  // Loading
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
            onTaskClick={handleTaskClick}
          />
        }
        microtaskQueue={
          <MicrotaskQueue
            tasks={state.microtaskQueue}
            onReorder={handleReorderMicrotaskQueue}
            onTaskClick={handleTaskClick}
          />
        }
        taskQueue={
          <TaskQueue
            tasks={state.taskQueue}
            onReorder={handleReorderTaskQueue}
            onTaskClick={handleTaskClick}
          />
        }
        webAPI={
          <WebAPI
            tasks={state.webAPI}
            onMoveTask={moveTask}
            onTaskClick={handleTaskClick}
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
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          isOpen={true}
          onClose={() => setEditingTask(null)}
          onSave={handleSaveTask}
        />
      )}
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
