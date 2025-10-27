export interface Prompt {
  id: string;
  title: string;
  content: string;
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

