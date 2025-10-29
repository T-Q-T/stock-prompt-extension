import React, { useState, useEffect } from 'react';
import { X, Search, MessageSquare, TrendingUp, History, Settings as SettingsIcon, FileJson } from 'lucide-react';
import { Settings as SettingsType, Folder, Prompt } from '@/types';
import { storage } from '@/utils/storage';
import { AddPromptForm } from './AddPromptForm';
import { Settings } from './Settings';
import { StockQuery } from './StockQuery';
import { StockHistory } from './StockHistory';
import { ImportExport } from './ImportExport';
import { AddFolderButton } from './AddFolderButton';
import { DroppableFolderItem } from './DroppableFolderItem';
import { SortablePromptItem } from './SortablePromptItem';
import type { StockQueryHistory } from '@/types/stock';
import * as promptStorage from '@/utils/promptStorage';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

type TabType = 'prompts' | 'stock' | 'history' | 'settings' | 'import-export';

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
      initData();
    }
  }, [isOpen]);

  const initData = async () => {
    // 数据迁移和修复
    await promptStorage.migrateFromLocalStorage();
    await promptStorage.fixUndefinedFolderIds();
    // 加载数据
    await loadData();
  };

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
    console.log('💾 Saving settings:', newSettings);
    storage.saveSettings(newSettings);
    // 立即从storage读取以确保数据同步
    const savedSettings = storage.getSettings();
    console.log('✅ Settings saved and reloaded:', savedSettings);
    setSettings(savedSettings);
  };

  const handleSelectHistory = (history: StockQueryHistory) => {
    setSelectedHistory(history);
    setActiveTab('stock');
  };

  // 根目录的droppable区域
  const RootDroppableArea: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: 'droppable-root',
      data: {
        type: 'root',
        folderId: null,
      },
    });

    return (
      <div 
        ref={setNodeRef}
        className={isOver ? 'ring-2 ring-primary-400 rounded-lg p-2 -m-2' : ''}
      >
        {children}
      </div>
    );
  };

  // 拖拽传感器配置
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 移动8px后才开始拖拽，避免误触
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 统一的拖拽处理
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    const overData = over.data?.current;
    
    console.log('🎯 Drag End:', { activeId, overId, overData });
    
    // 判断拖拽的是文件夹还是prompt
    const draggedFolder = folders.find(f => f.id === activeId);
    const draggedPrompt = prompts.find(p => p.id === activeId);
    
    if (draggedFolder) {
      // 拖拽文件夹：只能在文件夹间排序
      const targetFolder = folders.find(f => f.id === overId);
      if (targetFolder) {
        const oldIndex = folders.findIndex(f => f.id === activeId);
        const newIndex = folders.findIndex(f => f.id === overId);
        if (oldIndex !== -1 && newIndex !== -1) {
          const newFolders = arrayMove(folders, oldIndex, newIndex);
          setFolders(newFolders);
          await promptStorage.reorderFolders(newFolders);
        }
      }
    } else if (draggedPrompt) {
      // 拖拽prompt
      console.log('📦 Dragging prompt:', draggedPrompt.title, 'to:', overData);
      
      // 优先检查over.data，这包含了droppable的类型信息
      // 必须同时检查type和folderId，确保是拖到droppable区域而不是sortable
      if (overData?.type === 'folder' && overData?.folderId !== undefined) {
        // 拖到文件夹的droppable区域
        const targetFolderId = overData.folderId as string;
        console.log('📁 Moving to folder:', targetFolderId);
        
        if (draggedPrompt.folderId !== targetFolderId) {
          await promptStorage.updatePrompt(draggedPrompt.id, { folderId: targetFolderId });
          await loadData();
        }
      } else if (overData?.type === 'root') {
        // 拖到根目录droppable区域
        console.log('🏠 Moving to root');
        
        if (draggedPrompt.folderId !== null) {
          await promptStorage.updatePrompt(draggedPrompt.id, { folderId: null });
          await loadData();
        }
      } else {
        // 拖到其他元素上（可能是prompt或文件夹）
        const targetPrompt = prompts.find(p => p.id === overId);
        const targetFolder = folders.find(f => f.id === overId);
        
        if (targetPrompt && draggedPrompt.folderId === targetPrompt.folderId) {
          // 拖到同一容器内的其他prompt上：排序
          console.log('🔄 Reordering within same container');
          
          const folderId = draggedPrompt.folderId;
          const folderPrompts = prompts.filter(p => p.folderId === folderId);
          const oldIndex = folderPrompts.findIndex(p => p.id === activeId);
          const newIndex = folderPrompts.findIndex(p => p.id === overId);
          
          if (oldIndex !== -1 && newIndex !== -1) {
            const reorderedPrompts = arrayMove(folderPrompts, oldIndex, newIndex);
            
            // 更新全局prompts状态
            const otherPrompts = prompts.filter(p => p.folderId !== folderId);
            const newAllPrompts = [...otherPrompts, ...reorderedPrompts];
            setPrompts(newAllPrompts);
            await promptStorage.reorderPrompts(reorderedPrompts);
          }
        } else if (targetFolder) {
          // 拖到文件夹项上但不是droppable区域（比如拖到文件夹之间）
          // 这种情况不做任何操作，保持prompt原位
          console.log('⚠️ Dropped between folders - no action taken');
        }
      }
    }
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
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
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
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 px-3 text-sm font-medium transition-colors relative ${
              activeTab === 'settings'
                ? 'text-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <SettingsIcon className="w-4 h-4" />
              <span>设置</span>
            </div>
            {activeTab === 'settings' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('import-export')}
            className={`flex-1 py-3 px-3 text-sm font-medium transition-colors relative ${
              activeTab === 'import-export'
                ? 'text-orange-600 bg-orange-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <FileJson className="w-4 h-4" />
              <span>导入导出</span>
            </div>
            {activeTab === 'import-export' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600" />
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

              {/* 统一的拖拽上下文，支持跨文件夹拖拽 */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={[
                    ...filteredFolders.map(f => f.id),
                    ...filteredPrompts.map(p => p.id),
                  ]}
                  strategy={verticalListSortingStrategy}
                >
                  {/* Folders */}
                  {filteredFolders.map((folder) => (
                    <DroppableFolderItem
                      key={folder.id}
                      folder={folder}
                      isExpanded={expandedFolders.has(folder.id)}
                      onToggle={() => toggleFolder(folder.id)}
                      onEdit={handleEditFolder}
                      onDelete={handleDeleteFolder}
                    >
                      <div className="space-y-2 mt-2">
                        {getPromptsByFolder(folder.id).map((prompt) => (
                          <SortablePromptItem
                            key={prompt.id}
                            prompt={prompt}
                            onEdit={handleEditPrompt}
                            onDelete={handleDeletePrompt}
                          />
                        ))}
                        {getPromptsByFolder(folder.id).length === 0 && (
                          <div className="text-center py-4 text-gray-400 text-xs">
                            文件夹为空（拖拽Prompt到这里）
                          </div>
                        )}
                      </div>
                    </DroppableFolderItem>
                  ))}

                  {/* Root Prompts */}
                  <RootDroppableArea>
                    {rootPrompts.length > 0 ? (
                      <div className="space-y-2 mt-3">
                        {rootPrompts.map((prompt) => (
                          <SortablePromptItem
                            key={prompt.id}
                            prompt={prompt}
                            onEdit={handleEditPrompt}
                            onDelete={handleDeletePrompt}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 mt-3 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-400 text-xs">
                          拖拽Prompt到这里移至根目录
                        </p>
                      </div>
                    )}
                  </RootDroppableArea>
                </SortableContext>
              </DndContext>

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
            <StockQuery 
              initialHistory={selectedHistory} 
              onNavigateToSettings={() => setActiveTab('settings')}
            />
          </div>
        ) : activeTab === 'history' ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50">
            <StockHistory onSelectHistory={handleSelectHistory} />
          </div>
        ) : activeTab === 'settings' ? (
          <div className="flex-1 flex flex-col bg-gray-50">
            <Settings settings={settings} onSave={handleSaveSettings} />
          </div>
        ) : activeTab === 'import-export' ? (
          <div className="flex-1 flex flex-col bg-gray-50">
            <ImportExport />
          </div>
        ) : null}
      </div>
    </>
  );
};
