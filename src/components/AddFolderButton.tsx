import React, { useState } from 'react';
import { FolderPlus, X } from 'lucide-react';

interface AddFolderButtonProps {
  onAdd: (name: string) => void;
}

export const AddFolderButton: React.FC<AddFolderButtonProps> = ({ onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (name.trim()) {
      onAdd(name.trim());
      setName('');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setIsAdding(false);
  };

  if (isAdding) {
    return (
      <div className="bg-blue-50 border border-blue-300 rounded-lg p-2 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <FolderPlus className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-900">新建文件夹</span>
          <button
            onClick={handleCancel}
            className="ml-auto p-0.5 rounded hover:bg-blue-100 text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded mb-2"
          placeholder="输入文件夹名称..."
          autoFocus
        />
        <button
          onClick={handleAdd}
          className="w-full px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          创建
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className="w-full py-2 px-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 mb-3"
    >
      <FolderPlus className="w-4 h-4" />
      <span className="text-sm font-medium">新建文件夹</span>
    </button>
  );
};

