import React, { useState } from 'react';
import { Download, Upload, FileJson, CheckCircle, AlertCircle } from 'lucide-react';
import { db } from '@/utils/indexedDB';
import { storage } from '@/utils/storage';
import { getApiToken, saveApiToken } from '@/utils/configStorage';
import { getQueryHistories } from '@/utils/stockApi';
import type { Prompt, Folder, Settings } from '@/types';
import type { StockQueryHistory } from '@/types/stock';

interface ExportData {
  version: string;
  exportTime: number;
  apiToken?: string;
  settings?: Settings;
  prompts?: Prompt[];
  folders?: Folder[];
  stockHistories?: StockQueryHistory[];
}

export const ImportExport: React.FC = () => {
  // 导出选项
  const [exportApiToken, setExportApiToken] = useState(true);
  const [exportSettings, setExportSettings] = useState(true);
  const [exportPrompts, setExportPrompts] = useState(true);
  const [exportStockHistories, setExportStockHistories] = useState(true);
  
  // 状态
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // 导出功能
  const handleExport = async () => {
    setExporting(true);
    setError('');
    setExportSuccess(false);

    try {
      const exportData: ExportData = {
        version: '1.0',
        exportTime: Date.now(),
      };

      // 导出API Token
      if (exportApiToken) {
        const token = await getApiToken();
        if (token) {
          exportData.apiToken = token;
        }
      }

      // 导出域名清单设置
      if (exportSettings) {
        exportData.settings = storage.getSettings();
      }

      // 导出Prompts和文件夹
      if (exportPrompts) {
        const [prompts, folders] = await Promise.all([
          db.getAll<Prompt>('prompts'),
          db.getAll<Folder>('folders'),
        ]);
        exportData.prompts = prompts;
        exportData.folders = folders;
      }

      // 导出查询历史
      if (exportStockHistories) {
        const histories = await getQueryHistories();
        if (histories && histories.length > 0) {
          exportData.stockHistories = histories;
        }
      }

      // 生成JSON文件
      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // 创建下载链接
      const link = document.createElement('a');
      link.href = url;
      link.download = `prompt-stock-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Export failed:', err);
      setError('导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  // 导入功能
  const handleImport = async (file: File) => {
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setError('请选择JSON格式的备份文件');
      return;
    }

    setImporting(true);
    setError('');
    setImportSuccess(false);

    try {
      const text = await file.text();
      const importData: ExportData = JSON.parse(text);

      // 验证数据格式
      if (!importData.version || !importData.exportTime) {
        throw new Error('无效的备份文件格式');
      }

      let importCount = 0;

      // 导入API Token
      if (importData.apiToken) {
        await saveApiToken(importData.apiToken);
        importCount++;
      }

      // 导入设置
      if (importData.settings) {
        storage.saveSettings(importData.settings);
        importCount++;
      }

      // 导入Prompts和文件夹
      if (importData.prompts || importData.folders) {
        // 导入文件夹
        if (importData.folders && importData.folders.length > 0) {
          for (const folder of importData.folders) {
            try {
              await db.put('folders', folder);
            } catch (err) {
              console.error('Failed to import folder:', folder.id, err);
            }
          }
          importCount++;
        }

        // 导入Prompts
        if (importData.prompts && importData.prompts.length > 0) {
          for (const prompt of importData.prompts) {
            try {
              await db.put('prompts', prompt);
            } catch (err) {
              console.error('Failed to import prompt:', prompt.id, err);
            }
          }
          importCount++;
        }
      }

      // 导入查询历史
      if (importData.stockHistories && importData.stockHistories.length > 0) {
        for (const history of importData.stockHistories) {
          try {
            await db.put('stockHistory', history);
          } catch (err) {
            console.error('Failed to import stock history:', history.id, err);
          }
        }
        importCount++;
      }

      if (importCount > 0) {
        setImportSuccess(true);
        setTimeout(() => {
          setImportSuccess(false);
          // 刷新页面以显示导入的数据
          window.location.reload();
        }, 2000);
      } else {
        setError('备份文件中没有可导入的数据');
      }
    } catch (err) {
      console.error('Import failed:', err);
      setError('导入失败，请确认文件格式正确');
    } finally {
      setImporting(false);
    }
  };

  // 文件选择处理
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImport(file);
    }
  };

  // 拖拽处理
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImport(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileJson className="w-5 h-5" />
          数据导入导出
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        {/* 导出功能 */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">导出数据</h3>
              <p className="text-sm text-gray-600">将您的数据导出为备份文件</p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200 hover:bg-green-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={exportApiToken}
                onChange={(e) => setExportApiToken(e.target.checked)}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">API Token</div>
                <div className="text-xs text-gray-500">导出股票查询API配置</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200 hover:bg-green-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={exportSettings}
                onChange={(e) => setExportSettings(e.target.checked)}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">域名清单</div>
                <div className="text-xs text-gray-500">导出插件设置和域名控制配置</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200 hover:bg-green-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={exportPrompts}
                onChange={(e) => setExportPrompts(e.target.checked)}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Prompt及文件夹</div>
                <div className="text-xs text-gray-500">导出所有Prompt内容和文件夹结构</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200 hover:bg-green-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={exportStockHistories}
                onChange={(e) => setExportStockHistories(e.target.checked)}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">查询历史</div>
                <div className="text-xs text-gray-500">导出所有股票查询历史记录</div>
              </div>
            </label>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting || (!exportApiToken && !exportSettings && !exportPrompts && !exportStockHistories)}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                导出中...
              </>
            ) : exportSuccess ? (
              <>
                <CheckCircle className="w-5 h-5" />
                导出成功！
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                导出备份文件
              </>
            )}
          </button>
        </div>

        {/* 导入功能 */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">导入数据</h3>
              <p className="text-sm text-gray-600">从备份文件恢复您的数据</p>
            </div>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-100'
                : 'border-blue-300 bg-white hover:bg-blue-50'
            }`}
          >
            <Upload className={`w-12 h-12 mx-auto mb-3 ${dragActive ? 'text-blue-600' : 'text-blue-400'}`} />
            <p className="text-sm font-medium text-gray-900 mb-1">
              {dragActive ? '释放文件以导入' : '拖拽备份文件到此处'}
            </p>
            <p className="text-xs text-gray-500 mb-4">或</p>
            <label className="inline-block">
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
                disabled={importing}
              />
              <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center gap-2 text-sm font-medium">
                <FileJson className="w-4 h-4" />
                选择文件
              </span>
            </label>
          </div>

          {importing && (
            <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">导入中...</span>
            </div>
          )}

          {importSuccess && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700">导入成功！页面即将刷新...</p>
            </div>
          )}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">操作失败</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">📝 使用说明</h4>
          <ul className="space-y-2 text-xs text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <span>导出的备份文件为JSON格式，包含您选择的所有数据</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <span>导入数据会与现有数据合并，相同ID的项目将被覆盖</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <span>建议定期导出备份，以防数据丢失</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <span>导入成功后页面会自动刷新以加载新数据</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

