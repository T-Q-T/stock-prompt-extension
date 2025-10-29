import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FolderItem } from './FolderItem';
import type { Folder } from '@/types';

interface SortableFolderItemProps {
  folder: Folder;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  children?: React.ReactNode;
}

export const SortableFolderItem: React.FC<SortableFolderItemProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.folder.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <FolderItem {...props} />
    </div>
  );
};

