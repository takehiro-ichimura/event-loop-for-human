/**
 * SortableTaskCard Component
 *
 * ドラッグ&ドロップ可能なタスクカードコンポーネント。
 * @dnd-kit/sortableを使用してリスト内の並べ替えをサポートします。
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/types';
import { TaskCard, TaskCardProps } from './TaskCard';
import { theme } from '@/styles/theme';

export interface SortableTaskCardProps extends Omit<TaskCardProps, 'isDragging'> {
  id: string;
}

const styles = {
  dragHandle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    cursor: 'grab',
    color: theme.colors.text.muted,
    fontSize: '12px',
    userSelect: 'none' as const,
  },
  wrapper: {
    position: 'relative' as const,
  },
  handleWrapper: {
    position: 'absolute' as const,
    left: '-24px',
    top: '50%',
    transform: 'translateY(-50%)',
  },
} as const;

export const SortableTaskCard: React.FC<SortableTaskCardProps> = ({
  id,
  task,
  ...props
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div style={styles.wrapper}>
        <div
          style={styles.handleWrapper}
          {...attributes}
          {...listeners}
        >
          <div style={styles.dragHandle}>⋮⋮</div>
        </div>
        <TaskCard
          task={task}
          isDragging={isDragging}
          {...props}
        />
      </div>
    </div>
  );
};

export default SortableTaskCard;
