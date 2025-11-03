// 股票相关类型定义

export type Region = 'SH' | 'SZ' | 'HK';

export type KType = '1' | '2' | '3' | '4' | '5' | '8' | '9' | '10';

export interface KTypeOption {
  value: KType;
  label: string;
}

export const K_TYPE_OPTIONS: KTypeOption[] = [
  { value: '1', label: '1分钟' },
  { value: '2', label: '5分钟' },
  { value: '3', label: '15分钟' },
  { value: '4', label: '30分钟' },
  { value: '5', label: '1小时' },
  { value: '8', label: '1天' },
  { value: '9', label: '1周' },
  { value: '10', label: '1月' },
];

export interface KLineParams {
  region: Region;
  code: string;
  kType: KType;
  limit: number;
  et?: string;
}

// API返回的原始数据格式
export interface KLineRawData {
  tu: number;   // 成交金额
  c: number;    // 该K线收盘价
  t: number;    // 时间戳
  v: number;    // 成交数量
  h: number;    // 该K线最高价
  l: number;    // 该K线最低价
  o: number;    // 该K线开盘价
}

// 处理后的数据格式（用于展示）
export interface KLineDataItem {
  timestamp: number;      // 时间戳
  time: string;           // 格式化时间
  open: number;           // 开盘价
  close: number;          // 收盘价
  high: number;           // 最高价
  low: number;            // 最低价
  volume: number;         // 成交数量
  turnover: number;       // 成交金额
}

// MA均线数据
export interface MALineDataItem {
  timestamp: number;      // 时间戳
  time: string;           // 格式化时间
  ma5?: number;           // MA5均线
  ma10?: number;          // MA10均线
  ma20?: number;          // MA20均线
}

export interface KLineResponse {
  code: number;
  msg: string | null;
  data: KLineRawData[];
}

// 股票查询历史记录（带完整数据）
export interface StockQueryHistory {
  id: string;
  stockCode: string;
  stockName?: string;            // 股票名称（可选）
  region: Region;
  kType: KType;
  limit: number;
  queryTime: number;
  resultCount: number;
  klineData: KLineDataItem[];    // K线完整数据
  maData: MALineDataItem[];      // MA均线数据
  costPrice?: number;            // 成本价（可选）
  holdingShares?: number;        // 持仓股数（可选）
}

