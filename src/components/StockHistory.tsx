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
  const [includeCostPrice, setIncludeCostPrice] = useState(true);
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadHistories();
    loadPrompts();
  }, []);

  const loadHistories = async () => {
    const data = await getQueryHistories();
    setHistories(data);
    // 默认全选
    setSelectedHistoryIds(new Set(data.map(h => h.id)));
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

  // 切换单个历史记录的选中状态
  const toggleHistorySelection = (historyId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newSelected = new Set(selectedHistoryIds);
    if (newSelected.has(historyId)) {
      newSelected.delete(historyId);
    } else {
      newSelected.add(historyId);
    }
    setSelectedHistoryIds(newSelected);
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedHistoryIds.size === histories.length) {
      // 当前全选，则取消全选
      setSelectedHistoryIds(new Set());
    } else {
      // 否则全选
      setSelectedHistoryIds(new Set(histories.map(h => h.id)));
    }
  };

  const handleCopyAll = async () => {
    if (selectedHistoryIds.size === 0) return;

    // 只复制选中的历史记录
    const selectedHistories = histories.filter(h => selectedHistoryIds.has(h.id));

    // 生成所有历史记录的文本
    const allHistoriesText = selectedHistories.map(history => {
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

    // 如果选择了复制成本价，统一在所有历史记录后面添加持仓数据部分
    let holdingDataText = '';
    if (includeCostPrice) {
      const holdingRecords = selectedHistories
        .filter(history => history.costPrice !== undefined || history.holdingShares !== undefined)
        .map(history => {
          const displayName = history.stockName || getRegionName(history.region);
          const costPriceText = history.costPrice !== undefined ? `成本：${history.costPrice.toFixed(2)}元/股` : '';
          const holdingSharesText = history.holdingShares !== undefined ? `持仓：${history.holdingShares}股` : '';
          const parts = [costPriceText, holdingSharesText].filter(Boolean);
          return `【${displayName}】- ${parts.join(' ')}`;
        });

      if (holdingRecords.length > 0) {
        holdingDataText = '\n\n' + '='.repeat(80) + '\n\n【持仓数据】\n' + holdingRecords.join('\n');
      }
    }

    // 组合历史记录和持仓数据
    let finalText = allHistoriesText + holdingDataText;

    // 如果选择了prompt，则组合prompt内容
    if (selectedPromptId) {
      const selectedPrompt = prompts.find(p => p.id === selectedPromptId);
      if (selectedPrompt) {
        finalText = `${selectedPrompt.content}\n\n${finalText}`;
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
        <p className="text-gray-400 text-sm">暂无股票历史</p>
        <p className="text-gray-400 text-xs mt-1">查询股票后会自动保存历史记录</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">我的股票</h3>
          <span className="text-xs text-gray-500">({histories.length})</span>
        </div>
        <button
          onClick={handleClearAll}
          className="text-xs text-red-600 hover:text-red-700 transition-colors"
        >
          清空全部
        </button>
      </div>

      {/* 全选/取消全选 */}
      {histories.length > 0 && (
        <div className="mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedHistoryIds.size === histories.length}
              onChange={toggleSelectAll}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              全选 ({selectedHistoryIds.size}/{histories.length})
            </span>
          </label>
        </div>
      )}

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

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCostPrice}
                onChange={(e) => setIncludeCostPrice(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                复制时包含成本价和持仓数据
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              勾选后，复制的数据会包含您填写的成本价和持仓股数信息
            </p>
          </div>

          <button
            onClick={handleCopyAll}
            disabled={copied || selectedHistoryIds.size === 0}
            className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制所选股票数据 ({selectedHistoryIds.size})
              </>
            )}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {histories.map((history) => (
          <div
            key={history.id}
            className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:shadow-md transition-all group"
          >
            <div className="flex items-start gap-3">
              {/* 复选框 */}
              <div className="flex items-center pt-0.5">
                <input
                  type="checkbox"
                  checked={selectedHistoryIds.has(history.id)}
                  onChange={(e) => toggleHistorySelection(history.id, e)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
              </div>
              
              {/* 内容区域 */}
              <div 
                className="flex-1 cursor-pointer"
                onClick={() => onSelectHistory(history)}
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

