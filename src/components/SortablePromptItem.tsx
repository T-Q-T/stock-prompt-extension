import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PromptItem } from './PromptItem';
import type { Prompt } from '@/types';

interface SortablePromptItemProps {
  prompt: Prompt;
  onEdit: (id: string, title: string, content: string) => void;
  onDelete: (id: string) => void;
}

export const SortablePromptItem: React.FC<SortablePromptItemProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: props.prompt.id,
    data: {
      type: 'prompt',
      prompt: props.prompt,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <PromptItem {...props} />
    </div>
  );
};

