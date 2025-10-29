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
      if (!data) {
        // 第一次使用，返回默认设置
        console.log('📝 First time initialization - using default settings');
        return { ...DEFAULT_SETTINGS };
      }
      
      const savedSettings = JSON.parse(data);
      // 确保所有字段都存在，使用默认值填充缺失的字段
      const settings: Settings = {
        isEnabled: savedSettings.isEnabled !== undefined ? savedSettings.isEnabled : DEFAULT_SETTINGS.isEnabled,
        enabledDomains: Array.isArray(savedSettings.enabledDomains) ? savedSettings.enabledDomains : DEFAULT_SETTINGS.enabledDomains,
        domainListMode: savedSettings.domainListMode || DEFAULT_SETTINGS.domainListMode,
      };
      
      console.log('📝 Loaded settings from storage:', settings);
      return settings;
    } catch (error) {
      console.error('Failed to get settings:', error);
      return { ...DEFAULT_SETTINGS };
    }
  },

  saveSettings: (settings: Settings): void => {
    try {
      const settingsJson = JSON.stringify(settings);
      console.log('💾 Saving to localStorage:', STORAGE_KEYS.SETTINGS, settingsJson);
      localStorage.setItem(STORAGE_KEYS.SETTINGS, settingsJson);
      // 立即验证保存是否成功
      const verification = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      console.log('✓ Verification - saved data:', verification);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },
};

export const isCurrentDomainEnabled = (): boolean => {
  const settings = storage.getSettings();
  console.log('⚙️ Prompt Stock Settings:', settings);
  
  // 如果插件被全局禁用
  if (!settings.isEnabled) {
    console.log('❌ Extension is globally disabled');
    return false;
  }
  
  const currentUrl = window.location.href;
  const currentHostname = window.location.hostname;
  console.log('🌐 Current URL:', currentUrl);
  console.log('🌐 Current Hostname:', currentHostname);
  console.log('📋 Domain list mode:', settings.domainListMode);
  console.log('📋 Domains:', settings.enabledDomains);
  
  // 确保domainListMode有值，默认为blacklist
  const mode = settings.domainListMode || 'blacklist';
  
  // 如果域名列表为空
  if (!settings.enabledDomains || settings.enabledDomains.length === 0) {
    // 反清单模式（黑名单）：空列表表示所有域名都允许
    if (mode === 'blacklist') {
      console.log('✅ Blacklist mode with empty list - enabled on all domains');
      return true;
    }
    // 正清单模式（白名单）：空列表表示所有域名都不允许
    console.log('❌ Whitelist mode with empty list - disabled on all domains');
    return false;
  }
  
  // 检查当前域名是否在列表中
  const isInList = settings.enabledDomains.some(domain => {
    // 规范化域名（移除协议和路径）
    const normalizedDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    // 支持完整URL匹配和域名匹配
    const matches = currentUrl.startsWith(domain) || 
                   currentHostname.includes(normalizedDomain) || 
                   normalizedDomain.includes(currentHostname);
    console.log(`  ${matches ? '✅' : '❌'} ${domain}`);
    return matches;
  });
  
  // 正清单模式（白名单）：在列表中才显示
  if (mode === 'whitelist') {
    console.log(isInList ? '✅ Whitelist mode - domain is in list' : '❌ Whitelist mode - domain not in list');
    return isInList;
  }
  
  // 反清单模式（黑名单）：不在列表中才显示
  console.log(isInList ? '❌ Blacklist mode - domain is in blacklist' : '✅ Blacklist mode - domain not in blacklist');
  return !isInList;
};

