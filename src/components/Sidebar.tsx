import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Prompt, Settings as SettingsType } from '@/types';
import { storage } from '@/utils/storage';
import { PromptItem } from './PromptItem';
import { AddPromptForm } from './AddPromptForm';
import { Settings } from './Settings';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [settings, setSettings] = useState<SettingsType>(storage.getSettings());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadPrompts();
    }
  }, [isOpen]);

  const loadPrompts = () => {
    setPrompts(storage.getPrompts());
  };

  const handleAddPrompt = (title: string, content: string) => {
    storage.addPrompt({ title, content });
    loadPrompts();
  };

  const handleEditPrompt = (id: string, title: string, content: string) => {
    storage.updatePrompt(id, { title, content });
    loadPrompts();
  };

  const handleDeletePrompt = (id: string) => {
    storage.deletePrompt(id);
    loadPrompts();
  };

  const handleSaveSettings = (newSettings: SettingsType) => {
    storage.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const filteredPrompts = prompts.filter(
    (prompt) =>
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="prompt-stock-overlay animate-fade-in" onClick={onClose} />
      <div className="prompt-stock-sidebar animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <h1 className="text-lg font-bold">Prompt Stock</h1>
          <div className="flex items-center gap-2">
            <Settings settings={settings} onSave={handleSaveSettings} />
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              placeholder="Search prompts..."
            />
          </div>
        </div>

        {/* Add Prompt Form */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <AddPromptForm onAdd={handleAddPrompt} />
        </div>

        {/* Prompts List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-gray-50">
          {filteredPrompts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">
                {searchQuery ? 'No prompts found' : 'No prompts yet. Add your first one!'}
              </p>
            </div>
          ) : (
            filteredPrompts.map((prompt) => (
              <PromptItem
                key={prompt.id}
                prompt={prompt}
                onEdit={handleEditPrompt}
                onDelete={handleDeletePrompt}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-white">
          <p className="text-xs text-gray-500 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">M</kbd> to toggle
          </p>
        </div>
      </div>
    </>
  );
};

