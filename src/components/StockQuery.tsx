import React, { useState, useEffect } from 'react';
import { TrendingUp, Search, Copy, Check } from 'lucide-react';
import { K_TYPE_OPTIONS, KType } from '@/types/stock';
import { getRegionByCode, fetchKLineData, getRegionName, transformKLineData, saveQueryHistory } from '@/utils/stockApi';
import { generateMAData } from '@/utils/ma';
import { StockChart } from './StockChart';
import type { KLineDataItem, StockQueryHistory, MALineDataItem } from '@/types/stock';
import { copyToClipboard } from '@/utils/clipboard';

interface StockQueryProps {
  initialHistory?: StockQueryHistory;
}

export const StockQuery: React.FC<StockQueryProps> = ({ initialHistory }) => {
  const [stockCode, setStockCode] = useState('');
  const [kType, setKType] = useState<KType>('8');
  const [limit, setLimit] = useState('30');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState<KLineDataItem[] | null>(null);
  const [maData, setMaData] = useState<MALineDataItem[] | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialHistory) {
      setStockCode(initialHistory.stockCode);
      setKType(initialHistory.kType);
      setLimit(initialHistory.limit.toString());
      setChartData(initialHistory.klineData);
      setMaData(initialHistory.maData);
    }
  }, [initialHistory]);

  const handleQuery = async () => {
    if (!stockCode.trim()) {
      setError('请输入股票代码');
      return;
    }

    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      setError('条目数必须在1-1000之间');
      return;
    }

    setLoading(true);
    setError('');
    setChartData(null);
    setMaData(null);
    setCopied(false);

    try {
      const region = getRegionByCode(stockCode);
      console.log(`📊 Stock: ${stockCode} -> Region: ${region} (${getRegionName(region)})`);

      const response = await fetchKLineData({
        region,
        code: stockCode,
        kType,
        limit: limitNum,
      });

      if (response.code === 0 && response.data && response.data.length > 0) {
        const transformedData = transformKLineData(response.data);
        const maDataResult = generateMAData(transformedData);
        
        setChartData(transformedData);
        setMaData(maDataResult);
        
        // 保存查询历史（包含完整数据）
        await saveQueryHistory(
          {
            stockCode,
            region,
            kType,
            limit: limitNum,
            resultCount: transformedData.length,
          },
          transformedData
        );
      } else {
        setError(response.msg || '查询失败，请检查股票代码');
      }
    } catch (err) {
      console.error('Stock query error:', err);
      setError('网络请求失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyData = async () => {
    if (!chartData || !maData) return;

    // K线数据表格
    const klineHeader = '时间\t开盘价\t收盘价\t最高价\t最低价\t成交量\t成交额';
    const klineRows = chartData.map(item => 
      `${item.time}\t${item.open}\t${item.close}\t${item.high}\t${item.low}\t${item.volume}\t${item.turnover.toFixed(2)}`
    );

    // MA数据表格（简化）
    const maHeader = '时间\tMA5\tMA10\tMA20';
    const maRows = maData.map(item => 
      `${item.time}\t${item.ma5?.toFixed(2) || '-'}\t${item.ma10?.toFixed(2) || '-'}\t${item.ma20?.toFixed(2) || '-'}`
    );

    const text = `股票代码: ${stockCode} (${getRegionName(getRegionByCode(stockCode))})
K线周期: ${K_TYPE_OPTIONS.find(opt => opt.value === kType)?.label}
数据条数: ${chartData.length}

【K线数据】
${klineHeader}
${klineRows.join('\n')}

【均线数据】
${maHeader}
${maRows.join('\n')}`;

    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleQuery();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 查询表单 */}
      <div className="p-4 space-y-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">股票查询</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            股票代码
          </label>
          <input
            type="text"
            value={stockCode}
            onChange={(e) => setStockCode(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例如：600519、000001"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            自动识别：6-上证，0/3-深证，其他-港股
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              K线周期
            </label>
            <select
              value={kType}
              onChange={(e) => setKType(e.target.value as KType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {K_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              查询条数
            </label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1-1000"
              min="1"
              max="1000"
              disabled={loading}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleQuery}
            disabled={loading}
            className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                查询中...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                查询
              </>
            )}
          </button>

          {chartData && (
            <button
              onClick={handleCopyData}
              disabled={copied}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 font-medium"
              title="复制数据"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  复制
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 图表展示区域 */}
      {chartData && maData && (
        <div className="flex-1 overflow-hidden bg-white">
          <StockChart data={chartData} maData={maData} stockCode={stockCode} kType={kType} />
        </div>
      )}

      {/* 空状态或提示 */}
      {!chartData && !loading && !error && (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">输入股票代码开始查询</p>
            <p className="text-gray-400 text-xs mt-1">将显示K线+MA5/MA10/MA20均线</p>
          </div>
        </div>
      )}
    </div>
  );
};
