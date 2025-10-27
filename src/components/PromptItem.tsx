import React, { useState } from 'react';
import { Edit2, Trash2, Copy, Check } from 'lucide-react';
import { Prompt } from '@/types';
import { copyToClipboard } from '@/utils/clipboard';

interface PromptItemProps {
  prompt: Prompt;
  onEdit: (id: string, title: string, content: string) => void;
  onDelete: (id: string) => void;
}

export const PromptItem: React.FC<PromptItemProps> = ({ prompt, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(prompt.title);
  const [editContent, setEditContent] = useState(prompt.content);
  const [copied, setCopied] = useState(false);

  const handleSave = () => {
    if (editTitle.trim() && editContent.trim()) {
      onEdit(prompt.id, editTitle, editContent);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(prompt.title);
    setEditContent(prompt.content);
    setIsEditing(false);
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(prompt.content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Prompt title"
        />
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          placeholder="Prompt content"
          rows={4}
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 px-3 py-1.5 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900 flex-1 pr-2">{prompt.title}</h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-primary-600 transition-colors"
            title="Copy"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-primary-600 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(prompt.id)}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-3">{prompt.content}</p>
    </div>
  );
};

