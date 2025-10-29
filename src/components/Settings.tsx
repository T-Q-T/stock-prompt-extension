import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Plus, X, Globe, Key } from 'lucide-react';
import { Settings as SettingsType } from '@/types';
import { getApiToken, saveApiToken } from '@/utils/configStorage';

interface SettingsProps {
  settings: SettingsType;
  onSave: (settings: SettingsType) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onSave }) => {
  const [domains, setDomains] = useState<string[]>(settings.enabledDomains);
  const [newDomain, setNewDomain] = useState('');
  const [isEnabled, setIsEnabled] = useState(settings.isEnabled);
  const [domainListMode, setDomainListMode] = useState(settings.domainListMode || 'blacklist');
  const [apiToken, setApiToken] = useState('');
  const [apiTokenSaved, setApiTokenSaved] = useState(false);

  // 当settings prop变化时，更新内部state
  useEffect(() => {
    console.log('Settings prop updated:', settings);
    setDomains(settings.enabledDomains || []);
    setIsEnabled(settings.isEnabled);
    setDomainListMode(settings.domainListMode || 'blacklist');
  }, [settings]);

  // 加载API Token
  useEffect(() => {
    const loadApiToken = async () => {
      const token = await getApiToken();
      setApiToken(token);
    };
    loadApiToken();
  }, []);

  const handleAddDomain = () => {
    if (newDomain.trim() && !domains.includes(newDomain.trim())) {
      const updatedDomains = [...domains, newDomain.trim()];
      setDomains(updatedDomains);
      setNewDomain('');
    }
  };

  const handleRemoveDomain = (domain: string) => {
    setDomains(domains.filter(d => d !== domain));
  };

  const handleSave = async () => {
    console.log('Saving settings:', { enabledDomains: domains, isEnabled, domainListMode });
    
    // 保存API Token
    if (apiToken.trim()) {
      try {
        await saveApiToken(apiToken.trim());
        setApiTokenSaved(true);
        setTimeout(() => setApiTokenSaved(false), 2000);
      } catch (error) {
        console.error('Failed to save API token:', error);
      }
    }
    
    // 保存其他设置
    onSave({
      enabledDomains: domains,
      isEnabled,
      domainListMode,
    });
  };

  const handleReset = async () => {
    setDomains(settings.enabledDomains || []);
    setIsEnabled(settings.isEnabled);
    setDomainListMode(settings.domainListMode || 'blacklist');
    // 重新加载API Token
    const token = await getApiToken();
    setApiToken(token);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5" />
          插件设置
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {/* API Token Configuration */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Key className="w-4 h-4" />
            股票API配置
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                API Token
              </label>
              <input
                type="password"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="请输入您的API Token"
              />
              <p className="text-xs text-gray-500 mt-2">
                请于 <a 
                  href="https://itick.org/dashboard" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  https://itick.org/dashboard
                </a> 注册账号并获取API Keys
              </p>
            </div>
            {apiTokenSaved && (
              <div className="bg-green-50 border border-green-200 rounded-md p-2">
                <p className="text-xs text-green-600">✓ API Token已保存</p>
              </div>
            )}
          </div>
        </div>

        {/* Enable/Disable Toggle */}
        <div className="mb-6">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm font-medium text-gray-900">Enable Extension</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </div>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Toggle to enable or disable the extension globally
          </p>
        </div>

        {/* Domain List Mode */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            域名控制模式
          </h3>
          <div className="space-y-2">
            <label className={`flex items-start cursor-pointer p-3 border-2 rounded-lg transition-colors hover:bg-gray-50 ${domainListMode === 'blacklist' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
              <input
                type="radio"
                name="domainListMode"
                value="blacklist"
                checked={domainListMode === 'blacklist'}
                onChange={(e) => setDomainListMode(e.target.value as any)}
                className="mt-0.5 w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <div className="ml-3 flex-1">
                <div className="text-sm font-medium text-gray-900">反清单模式（黑名单）</div>
                <div className="text-xs text-gray-500 mt-1">
                  默认在所有网站显示，只在填写的域名列表中隐藏悬浮球
                </div>
              </div>
            </label>
            <label className={`flex items-start cursor-pointer p-3 border-2 rounded-lg transition-colors hover:bg-gray-50 ${domainListMode === 'whitelist' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
              <input
                type="radio"
                name="domainListMode"
                value="whitelist"
                checked={domainListMode === 'whitelist'}
                onChange={(e) => setDomainListMode(e.target.value as any)}
                className="mt-0.5 w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <div className="ml-3 flex-1">
                <div className="text-sm font-medium text-gray-900">正清单模式（白名单）</div>
                <div className="text-xs text-gray-500 mt-1">
                  默认在所有网站隐藏，只在填写的域名列表中显示悬浮球
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Domain List */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            清单列表
          </h3>

          {/* Domain List */}
          <div className="space-y-2 mb-3">
            {domains.map((domain) => (
              <div
                key={domain}
                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md border border-gray-200"
              >
                <span className="text-sm text-gray-700 truncate flex-1">{domain}</span>
                <button
                  onClick={() => handleRemoveDomain(domain)}
                  className="ml-2 p-1 rounded-md hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {domains.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                No domains configured
              </p>
            )}
          </div>

          {/* Add Domain */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddDomain()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="https://example.com"
            />
            <button
              onClick={handleAddDomain}
              className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 flex gap-2">
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
        >
          保存设置
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors"
        >
          重置
        </button>
      </div>
    </div>
  );
};

