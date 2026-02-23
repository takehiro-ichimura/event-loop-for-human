/**
 * useEventLoop Hook
 *
 * A custom hook that provides state management and logic for the event loop.
 * Manages four areas: Call Stack, Microtask Queue, Task Queue, and Web API.
 */

import { useReducer, useEffect, useCallback } from 'react';
import type { Task, AreaType, EventLoopState } from '@/types';
import { createTask, CreateTaskOptions } from '@/utils/taskFactory';

/**
 * Event loop action types
 */
export type EventLoopAction =
  | { type: 'COMPLETE_TASK' }
  | { type: 'ADD_TASK'; payload: { name: string; area: AreaType; options?: CreateTaskOptions } }
  | { type: 'AUTO_DISPATCH' }
  | { type: 'BLOCK_TASK' }
  | { type: 'MOVE_TASK'; payload: { taskId: string; to: AreaType } }
  | { type: 'REORDER_QUEUE'; payload: { area: 'microtaskQueue' | 'taskQueue'; taskId: string; newIndex: number } }
  | { type: 'UPDATE_TASK'; payload: { id: string; name?: string; estimatedTime?: number | null; category?: string | null; memo?: string | null } }
  | { type: 'LOAD_STATE'; payload: EventLoopState };

/**
 * Initial state
 */
const initialState: EventLoopState = {
  callStack: null,
  microtaskQueue: [],
  taskQueue: [],
  webAPI: [],
};

/**
 * Helper function to assign order indices to tasks in a queue
 */
function assignOrders(tasks: Task[]): Task[] {
  return tasks.map((task, index) => ({ ...task, order: index }));
}

/**
 * Event loop reducer
 */
function eventLoopReducer(state: EventLoopState, action: EventLoopAction): EventLoopState {
  switch (action.type) {
    case 'COMPLETE_TASK': {
      // Only tasks on the Call Stack can be completed
      if (!state.callStack) {
        return state;
      }
      return {
        ...state,
        callStack: null,
      };
    }

    case 'ADD_TASK': {
      const { name, area, options } = action.payload;
      const newTask = createTask(name, area, options);

      switch (area) {
        case 'callStack':
          // Can only add when the Call Stack is empty
          if (state.callStack) {
            return state;
          }
          return {
            ...state,
            callStack: newTask,
          };

        case 'microtaskQueue':
          return {
            ...state,
            microtaskQueue: assignOrders([...state.microtaskQueue, newTask]),
          };

        case 'taskQueue':
          return {
            ...state,
            taskQueue: assignOrders([...state.taskQueue, newTask]),
          };

        case 'webAPI':
          return {
            ...state,
            webAPI: [...state.webAPI, newTask],
          };

        default:
          return state;
      }
    }

    case 'AUTO_DISPATCH': {
      // Do nothing if the Call Stack is not empty
      if (state.callStack) {
        return state;
      }

      // Prioritize the Microtask Queue
      if (state.microtaskQueue.length > 0) {
        const nextTask = state.microtaskQueue[0]!;
        const remainingMicrotasks = state.microtaskQueue.slice(1);
        const callStackTask: Task = {
          id: nextTask.id,
          name: nextTask.name,
          estimatedTime: nextTask.estimatedTime,
          category: nextTask.category,
          memo: nextTask.memo,
          createdAt: nextTask.createdAt,
          area: 'callStack',
          order: nextTask.order,
        };
        return {
          ...state,
          callStack: callStackTask,
          microtaskQueue: assignOrders(remainingMicrotasks),
        };
      }

      // Check the Task Queue
      if (state.taskQueue.length > 0) {
        const nextTask = state.taskQueue[0]!;
        const remainingTasks = state.taskQueue.slice(1);
        const callStackTask: Task = {
          id: nextTask.id,
          name: nextTask.name,
          estimatedTime: nextTask.estimatedTime,
          category: nextTask.category,
          memo: nextTask.memo,
          createdAt: nextTask.createdAt,
          area: 'callStack',
          order: nextTask.order,
        };
        return {
          ...state,
          callStack: callStackTask,
          taskQueue: assignOrders(remainingTasks),
        };
      }

      return state;
    }

    case 'BLOCK_TASK': {
      // Move the task on the Call Stack to Web API
      if (!state.callStack) {
        return state;
      }
      const blockedTask: Task = {
        id: state.callStack.id,
        name: state.callStack.name,
        estimatedTime: state.callStack.estimatedTime,
        category: state.callStack.category,
        memo: state.callStack.memo,
        createdAt: state.callStack.createdAt,
        area: 'webAPI',
        order: state.callStack.order,
      };
      return {
        ...state,
        callStack: null,
        webAPI: [...state.webAPI, blockedTask],
      };
    }

    case 'MOVE_TASK': {
      const { taskId, to } = action.payload;

      // Find the task in Web API
      const taskIndex = state.webAPI.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        return state;
      }

      const task = state.webAPI[taskIndex]!;
      const newWebAPI = state.webAPI.filter(t => t.id !== taskId);

      switch (to) {
        case 'microtaskQueue': {
          const movedTask: Task = {
            id: task.id,
            name: task.name,
            estimatedTime: task.estimatedTime,
            category: task.category,
            memo: task.memo,
            createdAt: task.createdAt,
            area: 'microtaskQueue',
            order: task.order,
          };
          return {
            ...state,
            webAPI: newWebAPI,
            microtaskQueue: assignOrders([...state.microtaskQueue, movedTask]),
          };
        }

        case 'taskQueue': {
          const movedTask: Task = {
            id: task.id,
            name: task.name,
            estimatedTime: task.estimatedTime,
            category: task.category,
            memo: task.memo,
            createdAt: task.createdAt,
            area: 'taskQueue',
            order: task.order,
          };
          return {
            ...state,
            webAPI: newWebAPI,
            taskQueue: assignOrders([...state.taskQueue, movedTask]),
          };
        }

        default:
          return state;
      }
    }

    case 'REORDER_QUEUE': {
      const { area, taskId, newIndex } = action.payload;
      const queue = [...state[area]];

      const currentIndex = queue.findIndex(t => t.id === taskId);
      if (currentIndex === -1) {
        return state;
      }

      // Remove from the array and insert at the new position
      const removedTasks = queue.splice(currentIndex, 1);
      if (removedTasks.length === 0 || !removedTasks[0]) {
        return state;
      }
      queue.splice(newIndex, 0, removedTasks[0]);

      return {
        ...state,
        [area]: assignOrders(queue),
      };
    }

    case 'UPDATE_TASK': {
      const { id, name, estimatedTime, category, memo } = action.payload;

      // Check the Call Stack
      if (state.callStack?.id === id) {
        const updatedTask: Task = {
          id: state.callStack.id,
          name: name !== undefined ? name : state.callStack.name,
          estimatedTime: estimatedTime !== undefined ? estimatedTime : state.callStack.estimatedTime,
          category: category !== undefined ? category : state.callStack.category,
          memo: memo !== undefined ? memo : state.callStack.memo,
          createdAt: state.callStack.createdAt,
          area: state.callStack.area,
          order: state.callStack.order,
        };
        return {
          ...state,
          callStack: updatedTask,
        };
      }

      // Check the Microtask Queue
      const microtaskIndex = state.microtaskQueue.findIndex(t => t.id === id);
      if (microtaskIndex !== -1) {
        const newQueue = [...state.microtaskQueue];
        const existingTask = newQueue[microtaskIndex]!;
        newQueue[microtaskIndex] = {
          id: existingTask.id,
          name: name !== undefined ? name : existingTask.name,
          estimatedTime: estimatedTime !== undefined ? estimatedTime : existingTask.estimatedTime,
          category: category !== undefined ? category : existingTask.category,
          memo: memo !== undefined ? memo : existingTask.memo,
          createdAt: existingTask.createdAt,
          area: existingTask.area,
          order: existingTask.order,
        };
        return {
          ...state,
          microtaskQueue: newQueue,
        };
      }

      // Check the Task Queue
      const taskIndex = state.taskQueue.findIndex(t => t.id === id);
      if (taskIndex !== -1) {
        const newQueue = [...state.taskQueue];
        const existingTask = newQueue[taskIndex]!;
        newQueue[taskIndex] = {
          id: existingTask.id,
          name: name !== undefined ? name : existingTask.name,
          estimatedTime: estimatedTime !== undefined ? estimatedTime : existingTask.estimatedTime,
          category: category !== undefined ? category : existingTask.category,
          memo: memo !== undefined ? memo : existingTask.memo,
          createdAt: existingTask.createdAt,
          area: existingTask.area,
          order: existingTask.order,
        };
        return {
          ...state,
          taskQueue: newQueue,
        };
      }

      // Check Web API
      const webAPIIndex = state.webAPI.findIndex(t => t.id === id);
      if (webAPIIndex !== -1) {
        const newWebAPI = [...state.webAPI];
        const existingTask = newWebAPI[webAPIIndex]!;
        newWebAPI[webAPIIndex] = {
          id: existingTask.id,
          name: name !== undefined ? name : existingTask.name,
          estimatedTime: estimatedTime !== undefined ? estimatedTime : existingTask.estimatedTime,
          category: category !== undefined ? category : existingTask.category,
          memo: memo !== undefined ? memo : existingTask.memo,
          createdAt: existingTask.createdAt,
          area: existingTask.area,
          order: existingTask.order,
        };
        return {
          ...state,
          webAPI: newWebAPI,
        };
      }

      return state;
    }

    case 'LOAD_STATE': {
      return action.payload;
    }

    default:
      return state;
  }
}

/**
 * Return type of the useEventLoop hook
 */
export interface UseEventLoopReturn {
  state: EventLoopState;
  addTask: (name: string, area: AreaType, options?: CreateTaskOptions) => void;
  completeTask: () => void;
  blockTask: () => void;
  moveTask: (taskId: string, to: AreaType) => void;
  reorderQueue: (area: 'microtaskQueue' | 'taskQueue', taskId: string, newIndex: number) => void;
  updateTask: (id: string, updates: { name?: string; estimatedTime?: number | null; category?: string | null; memo?: string | null }) => void;
  loadState: (newState: EventLoopState) => void;
}

/**
 * State management hook for the event loop
 */
export function useEventLoop(): UseEventLoopReturn {
  const [state, dispatch] = useReducer(eventLoopReducer, initialState);

  // Automatically dispatch the next task when the Call Stack becomes empty
  useEffect(() => {
    if (state.callStack === null) {
      // Wait until the next microtask before dispatching (for animation purposes)
      const timer = setTimeout(() => {
        dispatch({ type: 'AUTO_DISPATCH' });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [state.callStack, state.microtaskQueue.length, state.taskQueue.length]);

  const addTask = useCallback((name: string, area: AreaType, options?: CreateTaskOptions) => {
    dispatch({ type: 'ADD_TASK', payload: { name, area, options } });
  }, []);

  const completeTask = useCallback(() => {
    dispatch({ type: 'COMPLETE_TASK' });
  }, []);

  const blockTask = useCallback(() => {
    dispatch({ type: 'BLOCK_TASK' });
  }, []);

  const moveTask = useCallback((taskId: string, to: AreaType) => {
    dispatch({ type: 'MOVE_TASK', payload: { taskId, to } });
  }, []);

  const reorderQueue = useCallback((area: 'microtaskQueue' | 'taskQueue', taskId: string, newIndex: number) => {
    dispatch({ type: 'REORDER_QUEUE', payload: { area, taskId, newIndex } });
  }, []);

  const updateTask = useCallback((id: string, updates: { name?: string; estimatedTime?: number | null; category?: string | null; memo?: string | null }) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, ...updates } });
  }, []);

  const loadState = useCallback((newState: EventLoopState) => {
    dispatch({ type: 'LOAD_STATE', payload: newState });
  }, []);

  return {
    state,
    addTask,
    completeTask,
    blockTask,
    moveTask,
    reorderQueue,
    updateTask,
    loadState,
  };
}
