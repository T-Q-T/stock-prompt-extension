// Prompt存储服务（使用IndexedDB）

import { db } from './indexedDB';
import type { Prompt, Folder } from '@/types';

// 生成唯一ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// ===== Folder相关 =====

export const getFolders = async (): Promise<Folder[]> => {
  try {
    const folders = await db.getAll<Folder>('folders');
    return folders.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Failed to get folders:', error);
    return [];
  }
};

export const addFolder = async (name: string): Promise<Folder> => {
  const folders = await getFolders();
  const maxOrder = folders.length > 0 ? Math.max(...folders.map(f => f.order)) : -1;
  
  const folder: Folder = {
    id: generateId(),
    name,
    order: maxOrder + 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  await db.add('folders', folder);
  return folder;
};

export const updateFolder = async (id: string, name: string): Promise<void> => {
  const folder = await db.get<Folder>('folders', id);
  if (folder) {
    folder.name = name;
    folder.updatedAt = Date.now();
    await db.put('folders', folder);
  }
};

export const deleteFolder = async (id: string): Promise<void> => {
  // 删除文件夹下的所有prompts
  const prompts = await db.getByIndex<Prompt>('prompts', 'folderId', id);
  for (const prompt of prompts) {
    await db.delete('prompts', prompt.id);
  }
  
  // 删除文件夹
  await db.delete('folders', id);
};

export const reorderFolders = async (folders: Folder[]): Promise<void> => {
  for (let i = 0; i < folders.length; i++) {
    folders[i].order = i;
    await db.put('folders', folders[i]);
  }
};

// ===== Prompt相关 =====

export const getPrompts = async (): Promise<Prompt[]> => {
  try {
    const prompts = await db.getAll<Prompt>('prompts');
    return prompts.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Failed to get prompts:', error);
    return [];
  }
};

export const getPromptsByFolder = async (folderId: string | null): Promise<Prompt[]> => {
  try {
    if (folderId === null) {
      const allPrompts = await getPrompts();
      return allPrompts.filter(p => p.folderId === null);
    }
    return await db.getByIndex<Prompt>('prompts', 'folderId', folderId);
  } catch (error) {
    console.error('Failed to get prompts by folder:', error);
    return [];
  }
};

export const addPrompt = async (
  title: string,
  content: string,
  folderId: string | null = null
): Promise<Prompt> => {
  const prompts = await getPrompts();
  const maxOrder = prompts.length > 0 ? Math.max(...prompts.map(p => p.order)) : -1;
  
  const prompt: Prompt = {
    id: generateId(),
    title,
    content,
    folderId,
    order: maxOrder + 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  await db.add('prompts', prompt);
  return prompt;
};

export const updatePrompt = async (
  id: string,
  updates: Partial<Omit<Prompt, 'id' | 'createdAt'>>
): Promise<void> => {
  const prompt = await db.get<Prompt>('prompts', id);
  if (prompt) {
    Object.assign(prompt, updates, { updatedAt: Date.now() });
    await db.put('prompts', prompt);
  }
};

export const deletePrompt = async (id: string): Promise<void> => {
  await db.delete('prompts', id);
};

export const movePromptToFolder = async (promptId: string, folderId: string | null): Promise<void> => {
  await updatePrompt(promptId, { folderId });
};

export const reorderPrompts = async (prompts: Prompt[]): Promise<void> => {
  for (let i = 0; i < prompts.length; i++) {
    prompts[i].order = i;
    await db.put('prompts', prompts[i]);
  }
};

// ===== 搜索 =====

export const searchAll = async (query: string): Promise<{ prompts: Prompt[], folders: Folder[] }> => {
  const lowerQuery = query.toLowerCase();
  
  const allPrompts = await getPrompts();
  const allFolders = await getFolders();
  
  const prompts = allPrompts.filter(p =>
    p.title.toLowerCase().includes(lowerQuery) ||
    p.content.toLowerCase().includes(lowerQuery)
  );
  
  const folders = allFolders.filter(f =>
    f.name.toLowerCase().includes(lowerQuery)
  );
  
  return { prompts, folders };
};

// ===== 数据迁移 =====

export const migrateFromLocalStorage = async (): Promise<void> => {
  try {
    // 检查是否已经迁移
    const existingPrompts = await getPrompts();
    if (existingPrompts.length > 0) {
      console.log('Data already migrated');
      return;
    }
    
    // 从localStorage读取旧数据
    const oldData = localStorage.getItem('prompt_stock_prompts');
    if (!oldData) {
      console.log('No old data to migrate');
      return;
    }
    
    const oldPrompts = JSON.parse(oldData);
    console.log(`Migrating ${oldPrompts.length} prompts...`);
    
    // 迁移到IndexedDB
    for (const oldPrompt of oldPrompts) {
      const prompt: Prompt = {
        ...oldPrompt,
        folderId: null,
        order: oldPrompt.order || 0,
      };
      await db.add('prompts', prompt);
    }
    
    console.log('Migration completed');
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

