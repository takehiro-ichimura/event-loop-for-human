/**
 * App Component
 *
 * EventLoop4Humanのルートコンポーネント。
 * useEventLoopフックを使用してイベントループの状態を管理し、
 * MainLayoutを通じて4つのエリアを表示します。
 */

import { useEventLoop } from '@/hooks/useEventLoop';
import { MainLayout } from '@/components/layout/MainLayout';
import { CallStack } from '@/components/areas/CallStack';
import { MicrotaskQueue } from '@/components/areas/MicrotaskQueue';
import { TaskQueue } from '@/components/areas/TaskQueue';
import { WebAPI } from '@/components/areas/WebAPI';
import { TaskForm } from '@/components/task/TaskForm';
import type { AreaType } from '@/types';

function App() {
  const {
    state,
    addTask,
    completeTask,
    blockTask,
    moveTask,
  } = useEventLoop();

  const handleAddTask = (
    name: string,
    area: AreaType,
    options?: { estimatedTime?: number; category?: string; memo?: string }
  ) => {
    addTask(name, area, options);
  };

  return (
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
  );
}

export default App;
