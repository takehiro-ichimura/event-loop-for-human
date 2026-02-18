/**
 * TaskQueue Component
 *
 * Displays the Task Queue area.
 * Manages a queue of independent tasks.
 * Supports drag-and-drop reordering.
 */

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Task } from '@/types';
import { SortableTaskCard } from '@/components/task/SortableTaskCard';
import { theme } from '@/styles/theme';

export interface TaskQueueProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onReorder?: (taskId: string, newIndex: number) => void;
}

const styles = {
  container: {
    backgroundColor: theme.colors.background.secondary,
    border: `1px solid ${theme.colors.accent.taskQueue}44`,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    backgroundColor: theme.colors.background.primary,
    borderBottom: `1px solid ${theme.colors.accent.taskQueue}44`,
    padding: theme.spacing.sm,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  indicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: theme.colors.accent.taskQueue,
    boxShadow: `0 0 8px ${theme.colors.accent.taskQueue}`,
  },
  title: {
    fontFamily: theme.fonts.mono,
    fontSize: '12px',
    fontWeight: 'bold' as const,
    color: theme.colors.accent.taskQueue,
    margin: 0,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },
  count: {
    fontFamily: theme.fonts.mono,
    fontSize: '11px',
    color: theme.colors.text.muted,
    backgroundColor: theme.colors.background.hover,
    padding: `2px ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.sm,
  },
  content: {
    padding: theme.spacing.md,
    paddingLeft: '40px',
    flex: 1,
    overflowY: 'auto' as const,
  },
  empty: {
    fontFamily: theme.fonts.mono,
    fontSize: '12px',
    color: theme.colors.text.muted,
    textAlign: 'center' as const,
    padding: theme.spacing.lg,
    border: `1px dashed ${theme.colors.border.inactive}`,
    borderRadius: theme.borderRadius.md,
  },
} as const;

export const TaskQueue: React.FC<TaskQueueProps> = ({
  tasks,
  onTaskClick,
  onReorder,
}) => {
  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && onReorder) {
      const newIndex = sortedTasks.findIndex((t) => t.id === over.id);
      if (newIndex !== -1) {
        onReorder(active.id as string, newIndex);
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.indicator} />
          <h2 style={styles.title}>Task Queue</h2>
        </div>
        <span style={styles.count}>{tasks.length}</span>
      </div>
      <div style={styles.content}>
        {sortedTasks.length === 0 ? (
          <div style={styles.empty}>// No tasks in queue</div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedTasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {sortedTasks.map((task) => (
                <SortableTaskCard
                  key={task.id}
                  id={task.id}
                  task={task}
                  onClick={onTaskClick ? () => onTaskClick(task) : undefined}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default TaskQueue;
