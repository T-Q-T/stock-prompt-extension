import React, { useState, useEffect } from 'react';
import { X, Search, MessageSquare, TrendingUp, History } from 'lucide-react';
import { Settings as SettingsType, Folder, Prompt } from '@/types';
import { storage } from '@/utils/storage';
import { PromptItem } from './PromptItem';
import { AddPromptForm } from './AddPromptForm';
import { Settings } from './Settings';
import { StockQuery } from './StockQuery';
import { StockHistory } from './StockHistory';
import { FolderItem } from './FolderItem';
import { AddFolderButton } from './AddFolderButton';
import type { StockQueryHistory } from '@/types/stock';
import * as promptStorage from '@/utils/promptStorage';

type TabType = 'prompts' | 'stock' | 'history';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('prompts');
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [settings, setSettings] = useState<SettingsType>(storage.getSettings());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHistory, setSelectedHistory] = useState<StockQueryHistory | undefined>();

  useEffect(() => {
    if (isOpen) {
      loadData();
      // 数据迁移
      promptStorage.migrateFromLocalStorage();
    }
  }, [isOpen]);

  const loadData = async () => {
    const [promptsData, foldersData] = await Promise.all([
      promptStorage.getPrompts(),
      promptStorage.getFolders(),
    ]);
    setPrompts(promptsData);
    setFolders(foldersData);
  };

  const handleAddPrompt = async (title: string, content: string) => {
    await promptStorage.addPrompt(title, content, null);
    loadData();
  };

  const handleEditPrompt = async (id: string, title: string, content: string) => {
    await promptStorage.updatePrompt(id, { title, content });
    loadData();
  };

  const handleDeletePrompt = async (id: string) => {
    await promptStorage.deletePrompt(id);
    loadData();
  };

  const handleAddFolder = async (name: string) => {
    await promptStorage.addFolder(name);
    loadData();
  };

  const handleEditFolder = async (id: string, name: string) => {
    await promptStorage.updateFolder(id, name);
    loadData();
  };

  const handleDeleteFolder = async (id: string) => {
    await promptStorage.deleteFolder(id);
    loadData();
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleSaveSettings = (newSettings: SettingsType) => {
    storage.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleSelectHistory = (history: StockQueryHistory) => {
    setSelectedHistory(history);
    setActiveTab('stock');
  };

  // 搜索功能
  const getFilteredData = () => {
    if (!searchQuery) {
      return { prompts, folders };
    }

    const lowerQuery = searchQuery.toLowerCase();
    const filteredPrompts = prompts.filter(
      (prompt) =>
        prompt.title.toLowerCase().includes(lowerQuery) ||
        prompt.content.toLowerCase().includes(lowerQuery)
    );
    const filteredFolders = folders.filter((folder) =>
      folder.name.toLowerCase().includes(lowerQuery)
    );

    return { prompts: filteredPrompts, folders: filteredFolders };
  };

  const { prompts: filteredPrompts, folders: filteredFolders } = getFilteredData();

  // 根据文件夹分组prompts
  const rootPrompts = filteredPrompts.filter(p => p.folderId === null);
  const getPromptsByFolder = (folderId: string) => filteredPrompts.filter(p => p.folderId === folderId);

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

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setActiveTab('prompts')}
            className={`flex-1 py-3 px-3 text-sm font-medium transition-colors relative ${
              activeTab === 'prompts'
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              <span>Prompt</span>
            </div>
            {activeTab === 'prompts' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('stock');
              setSelectedHistory(undefined);
            }}
            className={`flex-1 py-3 px-3 text-sm font-medium transition-colors relative ${
              activeTab === 'stock'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              <span>股票查询</span>
            </div>
            {activeTab === 'stock' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-3 text-sm font-medium transition-colors relative ${
              activeTab === 'history'
                ? 'text-green-600 bg-green-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <History className="w-4 h-4" />
              <span>查询历史</span>
            </div>
            {activeTab === 'history' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600" />
            )}
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'prompts' ? (
          <>
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  placeholder="搜索Prompts或文件夹..."
                />
              </div>
            </div>

            {/* Add Prompt Form */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <AddPromptForm onAdd={handleAddPrompt} />
            </div>

            {/* Prompts List with Folders */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-gray-50">
              <AddFolderButton onAdd={handleAddFolder} />

              {/* Folders */}
              {filteredFolders.map((folder) => (
                <FolderItem
                  key={folder.id}
                  folder={folder}
                  isExpanded={expandedFolders.has(folder.id)}
                  onToggle={() => toggleFolder(folder.id)}
                  onEdit={handleEditFolder}
                  onDelete={handleDeleteFolder}
                >
                  <div className="space-y-2 mt-2">
                    {getPromptsByFolder(folder.id).map((prompt) => (
                      <PromptItem
                        key={prompt.id}
                        prompt={prompt}
                        onEdit={handleEditPrompt}
                        onDelete={handleDeletePrompt}
                      />
                    ))}
                    {getPromptsByFolder(folder.id).length === 0 && (
                      <div className="text-center py-4 text-gray-400 text-xs">
                        文件夹为空
                      </div>
                    )}
                  </div>
                </FolderItem>
              ))}

              {/* Root Prompts */}
              {rootPrompts.length > 0 && (
                <div className="space-y-2 mt-3">
                  {rootPrompts.map((prompt) => (
                    <PromptItem
                      key={prompt.id}
                      prompt={prompt}
                      onEdit={handleEditPrompt}
                      onDelete={handleDeletePrompt}
                    />
                  ))}
                </div>
              )}

              {/* Empty State */}
              {filteredPrompts.length === 0 && filteredFolders.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-sm">
                    {searchQuery ? '没有找到匹配的内容' : '暂无Prompt，开始添加吧！'}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 bg-white">
              <p className="text-xs text-gray-500 text-center">
                Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">M</kbd> to toggle
              </p>
            </div>
          </>
        ) : activeTab === 'stock' ? (
          <div className="flex-1 overflow-hidden bg-gray-50">
            <StockQuery initialHistory={selectedHistory} />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50">
            <StockHistory onSelectHistory={handleSelectHistory} />
          </div>
        )}
      </div>
    </>
  );
};
