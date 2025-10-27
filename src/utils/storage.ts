import { Prompt, Settings, DEFAULT_SETTINGS } from '@/types';

const STORAGE_KEYS = {
  PROMPTS: 'prompt_stock_prompts',
  SETTINGS: 'prompt_stock_settings',
};

export const storage = {
  // Prompts
  getPrompts: (): Prompt[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROMPTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get prompts:', error);
      return [];
    }
  },

  savePrompts: (prompts: Prompt[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(prompts));
    } catch (error) {
      console.error('Failed to save prompts:', error);
    }
  },

  addPrompt: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>): Prompt => {
    const prompts = storage.getPrompts();
    const newPrompt: Prompt = {
      ...prompt,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    prompts.unshift(newPrompt);
    storage.savePrompts(prompts);
    return newPrompt;
  },

  updatePrompt: (id: string, updates: Partial<Omit<Prompt, 'id' | 'createdAt'>>): void => {
    const prompts = storage.getPrompts();
    const index = prompts.findIndex(p => p.id === id);
    if (index !== -1) {
      prompts[index] = {
        ...prompts[index],
        ...updates,
        updatedAt: Date.now(),
      };
      storage.savePrompts(prompts);
    }
  },

  deletePrompt: (id: string): void => {
    const prompts = storage.getPrompts();
    const filtered = prompts.filter(p => p.id !== id);
    storage.savePrompts(filtered);
  },

  // Settings
  getSettings: (): Settings => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Failed to get settings:', error);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: (settings: Settings): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },
};

export const isCurrentDomainEnabled = (): boolean => {
  const settings = storage.getSettings();
  console.log('⚙️ Prompt Stock Settings:', settings);
  
  if (!settings.isEnabled) {
    console.log('❌ Extension is globally disabled');
    return false;
  }
  
  const currentUrl = window.location.href;
  console.log('🌐 Current URL:', currentUrl);
  console.log('📋 Enabled domains:', settings.enabledDomains);
  
  const isEnabled = settings.enabledDomains.some(domain => {
    const matches = currentUrl.startsWith(domain);
    console.log(`  ${matches ? '✅' : '❌'} ${domain}`);
    return matches;
  });
  
  return isEnabled;
};

