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

export type DomainListMode = 'whitelist' | 'blacklist';

export interface Settings {
  enabledDomains: string[];
  isEnabled: boolean;
  domainListMode: DomainListMode; // 'whitelist' = 正清单, 'blacklist' = 反清单
}

export const DEFAULT_SETTINGS: Settings = {
  enabledDomains: [],
  isEnabled: true,
  domainListMode: 'blacklist', // 默认反清单模式（黑名单），即默认所有域名都显示
};

