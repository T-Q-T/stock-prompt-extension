import React, { useState, useEffect } from 'react';
import { History, Trash2, Clock, TrendingUp } from 'lucide-react';
import { StockQueryHistory } from '@/types/stock';
import { getQueryHistories, deleteQueryHistory, clearQueryHistories, getRegionName } from '@/utils/stockApi';
import { K_TYPE_OPTIONS } from '@/types/stock';
import { formatTimestamp } from '@/utils/stockApi';

interface StockHistoryProps {
  onSelectHistory: (history: StockQueryHistory) => void;
}

export const StockHistory: React.FC<StockHistoryProps> = ({ onSelectHistory }) => {
  const [histories, setHistories] = useState<StockQueryHistory[]>([]);

  useEffect(() => {
    loadHistories();
  }, []);

  const loadHistories = async () => {
    const data = await getQueryHistories();
    setHistories(data);
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

