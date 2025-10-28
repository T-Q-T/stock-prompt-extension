export interface Prompt {
  id: string;
  title: string;
  content: string;
  folderId: string | null; // 所属文件夹ID，null表示根目录
  order: number;           // 排序顺序
  createdAt: number;
  updatedAt: number;
}

export interface Folder {
  id: string;
  name: string;
  order: number;          // 排序顺序
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  enabledDomains: string[];
  isEnabled: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  enabledDomains: ['https://chat.deepseek.com'],
  isEnabled: true,
};

