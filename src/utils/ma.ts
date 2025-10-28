// 均线计算工具

import { KLineDataItem, MALineDataItem } from '@/types/stock';

/**
 * 计算MA均线
 * @param data K线数据
 * @param period 均线周期
 * @returns MA值数组
 */
export const calculateMA = (data: KLineDataItem[], period: number): (number | undefined)[] => {
  const result: (number | undefined)[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(undefined);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      result.push(sum / period);
    }
  }
  
  return result;
};

/**
 * 生成MA均线数据
 * @param klineData K线数据
 * @returns MA数据
 */
export const generateMAData = (klineData: KLineDataItem[]): MALineDataItem[] => {
  const ma5 = calculateMA(klineData, 5);
  const ma10 = calculateMA(klineData, 10);
  const ma20 = calculateMA(klineData, 20);
  
  return klineData.map((item, index) => ({
    timestamp: item.timestamp,
    time: item.time,
    ma5: ma5[index],
    ma10: ma10[index],
    ma20: ma20[index],
  }));
};

/**
 * 简化MA数据（只保留核心字段）
 * @param maData 完整MA数据
 * @returns 简化的MA数据（用于复制）
 */
export const simplifyMAData = (maData: MALineDataItem[]): any[] => {
  return maData.map(item => ({
    time: item.time,
    ma5: item.ma5?.toFixed(2) || '-',
    ma10: item.ma10?.toFixed(2) || '-',
    ma20: item.ma20?.toFixed(2) || '-',
  }));
};

