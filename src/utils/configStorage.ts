// 配置存储管理（使用IndexedDB）

import { db } from './indexedDB';

interface ConfigItem {
  key: string;
  value: any;
}

const CONFIG_KEYS = {
  API_TOKEN: 'api_token',
  SELECTED_STOCK_PROMPT: 'selected_stock_prompt',
} as const;

/**
 * 获取API Token
 */
export const getApiToken = async (): Promise<string> => {
  try {
    const config = await db.get<ConfigItem>('config', CONFIG_KEYS.API_TOKEN);
    return config?.value || '';
  } catch (error) {
    console.error('Failed to get API token:', error);
    return '';
  }
};

/**
 * 保存API Token
 */
export const saveApiToken = async (token: string): Promise<void> => {
  try {
    const config: ConfigItem = {
      key: CONFIG_KEYS.API_TOKEN,
      value: token,
    };
    await db.put('config', config);
    console.log('✅ API Token saved successfully');
  } catch (error) {
    console.error('Failed to save API token:', error);
    throw error;
  }
};

/**
 * 检查是否已配置API Token
 */
export const hasApiToken = async (): Promise<boolean> => {
  const token = await getApiToken();
  return token.trim().length > 0;
};

/**
 * 获取选中的股票查询Prompt ID
 */
export const getSelectedStockPromptId = async (): Promise<string> => {
  try {
    const config = await db.get<ConfigItem>('config', CONFIG_KEYS.SELECTED_STOCK_PROMPT);
    return config?.value || '';
  } catch (error) {
    console.error('Failed to get selected stock prompt ID:', error);
    return '';
  }
};

/**
 * 保存选中的股票查询Prompt ID
 */
export const saveSelectedStockPromptId = async (promptId: string): Promise<void> => {
  try {
    const config: ConfigItem = {
      key: CONFIG_KEYS.SELECTED_STOCK_PROMPT,
      value: promptId,
    };
    await db.put('config', config);
  } catch (error) {
    console.error('Failed to save selected stock prompt ID:', error);
    throw error;
  }
};

