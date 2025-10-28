import React, { useState } from 'react';
import { Folder as FolderIcon, ChevronRight, ChevronDown, Edit2, Trash2 } from 'lucide-react';
import type { Folder } from '@/types';

interface FolderItemProps {
  folder: Folder;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  children?: React.ReactNode;
}

export const FolderItem: React.FC<FolderItemProps> = ({
  folder,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  children,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);

  const handleSave = () => {
    if (editName.trim()) {
      onEdit(folder.id, editName.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditName(folder.name);
    setIsEditing(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`确定要删除文件夹"${folder.name}"及其所有内容吗？`)) {
      onDelete(folder.id);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-blue-50 border border-blue-300 rounded-lg p-2 mb-2">
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSave()}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          autoFocus
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSave}
            className="flex-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
          >
            保存
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
          >
            取消
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-2">
      <div
        className="flex items-center justify-between p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer group"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2 flex-1">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          )}
          <FolderIcon className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-sm text-gray-900">{folder.name}</span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
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
      {isExpanded && children && (
        <div className="ml-6 mt-1">
          {children}
        </div>
      )}
    </div>
  );
};

