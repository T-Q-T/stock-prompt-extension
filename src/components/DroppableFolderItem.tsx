import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Folder } from '@/types';
import { Folder as FolderIcon, ChevronRight, ChevronDown, Edit2, Trash2 } from 'lucide-react';

interface DroppableFolderItemProps {
  folder: Folder;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  children?: React.ReactNode;
}

export const DroppableFolderItem: React.FC<DroppableFolderItemProps> = ({
  folder,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  children,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: folder.id,
    data: {
      type: 'folder',
    },
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `droppable-${folder.id}`,
    data: {
      type: 'folder',
      folderId: folder.id,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // 合并两个ref - 应用到容器上
  const setContainerRefs = (node: HTMLDivElement | null) => {
    setSortableRef(node);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`确定要删除文件夹"${folder.name}"及其所有内容吗？`)) {
      onDelete(folder.id);
    }
  };

  return (
    <div 
      ref={setContainerRefs} 
      style={style} 
      className={`mb-2 ${isOver ? 'ring-2 ring-primary-400 ring-offset-2 rounded-lg' : ''}`}
    >
      {/* 文件夹头部 - 可拖拽和可接收drop */}
      <div
        ref={setDroppableRef}
        className={`flex items-center justify-between p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all cursor-pointer group ${
          isOver ? 'bg-primary-100 border-2 border-primary-400 border-dashed scale-[1.02]' : 'border-2 border-transparent'
        }`}
        onClick={onToggle}
      >
        {/* 拖拽手柄 - 只有这部分应用listeners */}
        <div className="flex items-center gap-2 flex-1" {...attributes} {...listeners}>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          )}
          <FolderIcon className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-sm text-gray-900">{folder.name}</span>
        </div>
        
        {/* 操作按钮 - 不应用listeners */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const newName = prompt('编辑文件夹名称:', folder.name);
              if (newName && newName.trim()) {
                onEdit(folder.id, newName.trim());
              }
            }}
            className="p-1 rounded hover:bg-gray-300 text-gray-600"
            title="编辑"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 rounded hover:bg-red-100 text-gray-600 hover:text-red-600"
            title="删除"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {/* 子内容 - 不应用任何拖拽属性 */}
      {isExpanded && children && (
        <div className={`ml-6 mt-1 transition-all ${isOver ? 'opacity-70' : ''}`}>
          {children}
        </div>
      )}
      
      {/* 拖拽提示 - 当文件夹未展开且有元素悬停时显示 */}
      {!isExpanded && isOver && (
        <div className="ml-6 mt-1 p-2 bg-primary-50 border-2 border-dashed border-primary-300 rounded text-xs text-primary-600 text-center">
          释放以添加到此文件夹
        </div>
      )}
    </div>
  );
};

