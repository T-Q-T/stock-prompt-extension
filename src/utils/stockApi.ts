import { Region, KLineParams, KLineResponse, KLineDataItem, KLineRawData, StockQueryHistory } from '@/types/stock';
import { db } from './indexedDB';
import { generateMAData } from './ma';

const API_BASE_URL = 'https://api.itick.org';
const API_TOKEN = 'fa237211dcdb49c4a5a0d525680c4bc287c485c1a8bb4b23ae67d8e6515fe902';

/**
 * 根据股票代码自动识别市场
 * @param code 股票代码
 * @returns 市场代码
 */
export const getRegionByCode = (code: string): Region => {
  if (!code) return 'SH';
  
  const firstChar = code.charAt(0);
  
  // 上证：6开头
  if (firstChar === '6') {
    return 'SH';
  }
  
  // 深证：0、3开头
  if (firstChar === '0' || firstChar === '3') {
    return 'SZ';
  }
  
  // 港股：其他
  return 'HK';
};

/**
 * 获取股票K线数据
 * @param params 查询参数
 * @returns K线数据
 */
export const fetchKLineData = async (params: KLineParams): Promise<KLineResponse> => {
  try {
    const url = new URL(`${API_BASE_URL}/stock/kline`);
    url.searchParams.append('region', params.region);
    url.searchParams.append('code', params.code);
    url.searchParams.append('kType', params.kType);
    url.searchParams.append('limit', params.limit.toString());
    
    if (params.et) {
      url.searchParams.append('et', params.et);
    }

    console.log('📊 Fetching stock data:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'token': API_TOKEN,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📊 Stock data received:', data);
    
    return data;
  } catch (error) {
    console.error('Failed to fetch stock data:', error);
    throw error;
  }
};

/**
 * 格式化时间戳为可读日期
 * @param timestamp 时间戳（毫秒）
 * @param format 格式类型
 * @returns 格式化后的日期字符串
 */
export const formatTimestamp = (timestamp: number, format: 'datetime' | 'date' | 'time' = 'datetime'): string => {
  const date = new Date(timestamp);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  if (format === 'date') {
    return `${year}-${month}-${day}`;
  }
  
  if (format === 'time') {
    return `${hours}:${minutes}:${seconds}`;
  }
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * 获取市场名称
 */
export const getRegionName = (region: Region): string => {
  const names: Record<Region, string> = {
    SH: '上证',
    SZ: '深证',
    HK: '港股',
  };
  return names[region];
};

/**
 * 转换API原始数据为展示数据
 */
export const transformKLineData = (rawData: KLineRawData[]): KLineDataItem[] => {
  return rawData.map(item => ({
    timestamp: item.t,
    time: formatTimestamp(item.t, 'datetime'),
    open: item.o,
    close: item.c,
    high: item.h,
    low: item.l,
    volume: item.v,
    turnover: item.tu,
  }));
};

/**
 * 保存查询历史（使用IndexedDB）
 */
export const saveQueryHistory = async (
  history: Omit<StockQueryHistory, 'id' | 'queryTime' | 'klineData' | 'maData'>,
  klineData: KLineDataItem[]
): Promise<void> => {
  try {
    const maData = generateMAData(klineData);
    
    const newHistory: StockQueryHistory = {
      ...history,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      queryTime: Date.now(),
      klineData,
      maData,
    };
    
    await db.add('stockHistory', newHistory);
    
    // 保持最多50条，删除旧的
    const histories = await getQueryHistories();
    if (histories.length > 50) {
      histories.sort((a, b) => b.queryTime - a.queryTime);
      for (let i = 50; i < histories.length; i++) {
        await db.delete('stockHistory', histories[i].id);
      }
    }
  } catch (error) {
    console.error('Failed to save query history:', error);
  }
};

/**
 * 获取查询历史（从IndexedDB）
 */
export const getQueryHistories = async (): Promise<StockQueryHistory[]> => {
  try {
    const histories = await db.getAll<StockQueryHistory>('stockHistory');
    return histories.sort((a, b) => b.queryTime - a.queryTime);
  } catch (error) {
    console.error('Failed to get query histories:', error);
    return [];
  }
};

/**
 * 删除查询历史
 */
export const deleteQueryHistory = async (id: string): Promise<void> => {
  try {
    await db.delete('stockHistory', id);
  } catch (error) {
    console.error('Failed to delete query history:', error);
  }
};

/**
 * 清空查询历史
 */
export const clearQueryHistories = async (): Promise<void> => {
  try {
    await db.clear('stockHistory');
  } catch (error) {
    console.error('Failed to clear query histories:', error);
  }
};

