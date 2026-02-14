/**
 * App Component
 *
 * EventLoop4Humanのルートコンポーネント。
 * useEventLoopフックを使用してイベントループの状態を管理し、
 * MainLayoutを通じて4つのエリアを表示します。
 * LocalStorageとの同期によりデータを永続化します。
 */

import { useEffect, useState, useRef } from 'react';
import { useEventLoop } from '@/hooks/useEventLoop';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useWorkLog } from '@/hooks/useWorkLog';
import { MainLayout } from '@/components/layout/MainLayout';
import { ErrorBoundary, StorageWarning } from '@/components/layout/ErrorBoundary';
import { CallStack } from '@/components/areas/CallStack';
import { MicrotaskQueue } from '@/components/areas/MicrotaskQueue';
import { TaskQueue } from '@/components/areas/TaskQueue';
import { WebAPI } from '@/components/areas/WebAPI';
import { TaskForm } from '@/components/task/TaskForm';
import { TaskEditModal } from '@/components/task/TaskEditModal';
import { SidebarTabs } from '@/components/sidebar/SidebarTabs';
import { WorkLogPanel } from '@/components/worklog/WorkLogPanel';
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

  const {
    recordLog,
    filteredEntries,
    dateFilter,
    setDateFilter,
    clearAllLogs,
    exportLogs,
    totalCount,
    getSummary,
  } = useWorkLog();

  const [initialized, setInitialized] = useState(false);
  const [warningDismissed, setWarningDismissed] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // 前回のstateを保持（ログ記録用）
  const prevStateRef = useRef(state);

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

  // State変化を監視してログ記録
  useEffect(() => {
    if (!initialized) return;

    const prev = prevStateRef.current;

    // タスク作成を検知（各キューの増加）
    const prevTaskQueueIds = new Set(prev.taskQueue.map(t => t.id));
    const newTaskQueueTasks = state.taskQueue.filter(t => !prevTaskQueueIds.has(t.id));
    newTaskQueueTasks.forEach(task => {
      recordLog({
        taskId: task.id,
        taskName: task.name,
        operation: 'created',
        toArea: 'taskQueue',
      });
    });

    const prevMicrotaskIds = new Set(prev.microtaskQueue.map(t => t.id));
    const newMicrotaskTasks = state.microtaskQueue.filter(t => !prevMicrotaskIds.has(t.id));
    newMicrotaskTasks.forEach(task => {
      recordLog({
        taskId: task.id,
        taskName: task.name,
        operation: 'created',
        toArea: 'microtaskQueue',
      });
    });

    // タスク完了を検知（callStackがnullになった）
    if (prev.callStack && !state.callStack) {
      recordLog({
        taskId: prev.callStack.id,
        taskName: prev.callStack.name,
        operation: 'completed',
        elapsedTime: 0, // TODO: タイマーから経過時間を取得
      });
    }

    // ブロックを検知（callStack → webAPI）
    const prevWebAPIIds = new Set(prev.webAPI.map(t => t.id));
    const newWebAPITasks = state.webAPI.filter(t => !prevWebAPIIds.has(t.id));
    newWebAPITasks.forEach(task => {
      if (prev.callStack?.id === task.id) {
        recordLog({
          taskId: task.id,
          taskName: task.name,
          operation: 'blocked',
          fromArea: 'callStack',
          toArea: 'webAPI',
        });
      }
    });

    // Auto-Dispatch/移動を検知（callStackに新しいタスクが入った）
    if (!prev.callStack && state.callStack) {
      const fromArea = prev.microtaskQueue.find(t => t.id === state.callStack?.id)
        ? 'microtaskQueue'
        : prev.taskQueue.find(t => t.id === state.callStack?.id)
        ? 'taskQueue'
        : prev.webAPI.find(t => t.id === state.callStack?.id)
        ? 'webAPI'
        : null;

      if (fromArea) {
        recordLog({
          taskId: state.callStack.id,
          taskName: state.callStack.name,
          operation: 'moved',
          fromArea,
          toArea: 'callStack',
        });
      }
    }

    prevStateRef.current = state;
  }, [state, initialized, recordLog]);

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
          <SidebarTabs
            tasksTab={
              <TaskForm
                onSubmit={handleAddTask}
                defaultArea="taskQueue"
                availableAreas={['taskQueue', 'microtaskQueue']}
              />
            }
            logsTab={
              <WorkLogPanel
                filteredEntries={filteredEntries}
                dateFilter={dateFilter}
                setDateFilter={setDateFilter}
                clearAllLogs={clearAllLogs}
                exportLogs={exportLogs}
                totalCount={totalCount}
                getSummary={getSummary}
              />
            }
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
