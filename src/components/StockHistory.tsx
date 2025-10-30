import React, { useState, useEffect } from 'react';
import { History, Trash2, Clock, TrendingUp, Copy, Check, FileText } from 'lucide-react';
import { StockQueryHistory } from '@/types/stock';
import { getQueryHistories, deleteQueryHistory, clearQueryHistories, getRegionName } from '@/utils/stockApi';
import { K_TYPE_OPTIONS } from '@/types/stock';
import { formatTimestamp } from '@/utils/stockApi';
import { copyToClipboard } from '@/utils/clipboard';
import * as promptStorage from '@/utils/promptStorage';
import type { Prompt } from '@/types';

interface StockHistoryProps {
  onSelectHistory: (history: StockQueryHistory) => void;
}

export const StockHistory: React.FC<StockHistoryProps> = ({ onSelectHistory }) => {
  const [histories, setHistories] = useState<StockQueryHistory[]>([]);
  const [copied, setCopied] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string>('');

  useEffect(() => {
    loadHistories();
    loadPrompts();
  }, []);

  const loadHistories = async () => {
    const data = await getQueryHistories();
    setHistories(data);
  };

  const loadPrompts = async () => {
    const allPrompts = await promptStorage.getPrompts();
    setPrompts(allPrompts);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteQueryHistory(id);
    loadHistories();
  };

  const handleClearAll = async () => {
    if (window.confirm('确定要清空所有查询历史吗？')) {
      await clearQueryHistories();
      loadHistories();
    }
  };

  const handleCopyAll = async () => {
    if (histories.length === 0) return;

    // 生成所有历史记录的文本
    const allHistoriesText = histories.map(history => {
      // K线数据表格
      const klineHeader = '时间\t开盘价\t收盘价\t最高价\t最低价\t成交量\t成交额';
      const klineRows = history.klineData.map(item => 
        `${item.time}\t${item.open}\t${item.close}\t${item.high}\t${item.low}\t${item.volume}\t${item.turnover.toFixed(2)}`
      );

      // MA数据表格
      const maHeader = '时间\tMA5\tMA10\tMA20';
      const maRows = history.maData.map(item => 
        `${item.time}\t${item.ma5?.toFixed(2) || '-'}\t${item.ma10?.toFixed(2) || '-'}\t${item.ma20?.toFixed(2) || '-'}`
      );

      // 使用股票名称或默认的市场名称
      const displayName = history.stockName || getRegionName(history.region);

      return `股票代码: ${history.stockCode} (${displayName})
K线周期: ${K_TYPE_OPTIONS.find(opt => opt.value === history.kType)?.label}
数据条数: ${history.resultCount}

【K线数据】
${klineHeader}
${klineRows.join('\n')}

【均线数据】
${maHeader}
${maRows.join('\n')}`;
    }).join('\n\n' + '='.repeat(80) + '\n\n');

    // 如果选择了prompt，则组合prompt内容和历史数据
    let finalText = allHistoriesText;
    if (selectedPromptId) {
      const selectedPrompt = prompts.find(p => p.id === selectedPromptId);
      if (selectedPrompt) {
        finalText = `${selectedPrompt.content}\n\n${allHistoriesText}`;
      }
    }

    const success = await copyToClipboard(finalText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (histories.length === 0) {
    return (
      <div className="p-8 text-center">
        <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">暂无查询历史</p>
        <p className="text-gray-400 text-xs mt-1">查询股票后会自动保存历史记录</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">查询历史</h3>
          <span className="text-xs text-gray-500">({histories.length})</span>
        </div>
        <button
          onClick={handleClearAll}
          className="text-xs text-red-600 hover:text-red-700 transition-colors"
        >
          清空全部
        </button>
      </div>

      {/* Prompt选择和复制全部 */}
      {histories.length > 0 && (
        <div className="mb-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              选择Prompt模板（可选）
            </label>
            <select
              value={selectedPromptId}
              onChange={(e) => setSelectedPromptId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">不使用Prompt模板</option>
              {prompts.map((prompt) => (
                <option key={prompt.id} value={prompt.id}>
                  {prompt.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              选择后，复制时会自动添加Prompt内容
            </p>
          </div>

          <button
            onClick={handleCopyAll}
            disabled={copied}
            className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                已复制全部
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制全部历史记录
              </>
            )}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {histories.map((history) => (
          <div
            key={history.id}
            onClick={() => onSelectHistory(history)}
            className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-gray-900">{history.stockCode}</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                    {history.stockName || getRegionName(history.region)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span>
                    {K_TYPE_OPTIONS.find(opt => opt.value === history.kType)?.label}
                  </span>
                  <span>·</span>
                  <span>{history.resultCount} 条数据</span>
                  <span>·</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimestamp(history.queryTime, 'datetime')}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => handleDelete(history.id, e)}
                className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

