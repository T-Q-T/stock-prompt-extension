import React, { useState, useEffect } from 'react';
import { TrendingUp, Search, Copy, Check, Key, ExternalLink, FileText } from 'lucide-react';
import { K_TYPE_OPTIONS, KType } from '@/types/stock';
import { getRegionByCode, fetchKLineData, getRegionName, transformKLineData, saveQueryHistory } from '@/utils/stockApi';
import { generateMAData } from '@/utils/ma';
import { StockChart } from './StockChart';
import type { KLineDataItem, StockQueryHistory, MALineDataItem } from '@/types/stock';
import type { Prompt } from '@/types';
import { copyToClipboard } from '@/utils/clipboard';
import { hasApiToken, getSelectedStockPromptId, saveSelectedStockPromptId } from '@/utils/configStorage';
import * as promptStorage from '@/utils/promptStorage';

interface StockQueryProps {
  initialHistory?: StockQueryHistory;
  onNavigateToSettings?: () => void;
}

export const StockQuery: React.FC<StockQueryProps> = ({ initialHistory, onNavigateToSettings }) => {
  const [stockCode, setStockCode] = useState('');
  const [stockName, setStockName] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [holdingShares, setHoldingShares] = useState('');
  const [kType, setKType] = useState<KType>('8');
  const [limit, setLimit] = useState('25');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState<KLineDataItem[] | null>(null);
  const [maData, setMaData] = useState<MALineDataItem[] | null>(null);
  const [copied, setCopied] = useState(false);
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  
  // Prompt选择相关
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string>('');

  // 检查是否已配置API Token
  useEffect(() => {
    const checkToken = async () => {
      const tokenExists = await hasApiToken();
      setHasToken(tokenExists);
    };
    checkToken();
  }, []);

  // 加载所有prompts
  useEffect(() => {
    const loadPrompts = async () => {
      const allPrompts = await promptStorage.getPrompts();
      setPrompts(allPrompts);
    };
    loadPrompts();
  }, []);

  // 加载已选择的prompt ID
  useEffect(() => {
    const loadSelectedPromptId = async () => {
      const savedId = await getSelectedStockPromptId();
      setSelectedPromptId(savedId);
    };
    loadSelectedPromptId();
  }, []);

  useEffect(() => {
    if (initialHistory) {
      setStockCode(initialHistory.stockCode);
      setStockName(initialHistory.stockName || '');
      setCostPrice(initialHistory.costPrice?.toString() || '');
      setHoldingShares(initialHistory.holdingShares?.toString() || '');
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
            stockName: stockName.trim() || undefined,
            costPrice: costPrice.trim() ? parseFloat(costPrice) : undefined,
            holdingShares: holdingShares.trim() ? parseFloat(holdingShares) : undefined,
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

    // 使用股票名称或默认的市场名称
    const displayName = stockName.trim() || getRegionName(getRegionByCode(stockCode));
    
    const stockDataText = `股票代码: ${stockCode} (${displayName})
K线周期: ${K_TYPE_OPTIONS.find(opt => opt.value === kType)?.label}
数据条数: ${chartData.length}

【K线数据】
${klineHeader}
${klineRows.join('\n')}

【均线数据】
${maHeader}
${maRows.join('\n')}`;

    // 如果选择了prompt，则组合prompt内容和股票数据
    let finalText = stockDataText;
    if (selectedPromptId) {
      const selectedPrompt = prompts.find(p => p.id === selectedPromptId);
      if (selectedPrompt) {
        finalText = `${selectedPrompt.content}\n\n${stockDataText}`;
      }
    }

    const success = await copyToClipboard(finalText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 处理prompt选择变化
  const handlePromptChange = async (promptId: string) => {
    setSelectedPromptId(promptId);
    await saveSelectedStockPromptId(promptId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleQuery();
    }
  };

  // 显示引导页（检查中）
  if (hasToken === null) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 显示引导页（未配置API Token）
  if (!hasToken) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-blue-600" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            欢迎使用股票查询功能
          </h3>
          
          <p className="text-gray-600 text-sm mb-6">
            使用此功能需要配置API Token
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-700 mb-3">
              <span className="font-medium">步骤1：</span> 前往以下网站注册账号并获取API Keys
            </p>
            <a 
              href="https://itick.org/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              打开 itick.org/dashboard
            </a>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-700 mb-3">
              <span className="font-medium">步骤2：</span> 配置您的API Token
            </p>
            <button
              onClick={onNavigateToSettings}
              className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Key className="w-4 h-4" />
              前往设置配置
            </button>
          </div>

          <p className="text-xs text-gray-500">
            配置完成后即可使用股票查询功能
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 查询表单 */}
      <div className="p-4 space-y-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">股票查询</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
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
              placeholder="例如：600519"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              6-上证，0/3-深证
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              股票名称
            </label>
            <input
              type="text"
              value={stockName}
              onChange={(e) => setStockName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如：合锻智能"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              选填，用于标识
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              成本价（元/股）
            </label>
            <input
              type="number"
              step="0.01"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如：15.80"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              选填，用于K线标注
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              持仓股数
            </label>
            <input
              type="number"
              step="1"
              value={holdingShares}
              onChange={(e) => setHoldingShares(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如：1000"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              选填，用于记录
            </p>
          </div>
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

        {/* Prompt选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            选择Prompt模板（可选）
          </label>
          <select
            value={selectedPromptId}
            onChange={(e) => handlePromptChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            disabled={loading}
          >
            <option value="">不使用Prompt模板</option>
            {prompts.map((prompt) => (
              <option key={prompt.id} value={prompt.id}>
                {prompt.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            选择后，复制数据时会自动添加Prompt内容
          </p>
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
          <StockChart 
            data={chartData} 
            maData={maData} 
            stockCode={stockCode} 
            kType={kType}
            costPrice={costPrice.trim() ? parseFloat(costPrice) : undefined}
          />
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
