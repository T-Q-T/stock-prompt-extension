import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface AddPromptFormProps {
  onAdd: (title: string, content: string) => void;
}

export const AddPromptForm: React.FC<AddPromptFormProps> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (title.trim() && content.trim()) {
      onAdd(title, content);
      setTitle('');
      setContent('');
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setContent('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm"
      >
        <Plus className="w-5 h-5" />
        Add New Prompt
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">New Prompt</h3>
        <button
          onClick={handleCancel}
          className="p-1 rounded-md hover:bg-white/50 text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        placeholder="Enter prompt title..."
        autoFocus
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none bg-white"
        placeholder="Enter prompt content..."
        rows={5}
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="flex-1 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors shadow-sm"
        >
          Add Prompt
        </button>
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors border border-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

