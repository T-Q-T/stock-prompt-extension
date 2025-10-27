import React, { useState } from 'react';
import { Settings as SettingsIcon, Plus, X, Globe } from 'lucide-react';
import { Settings as SettingsType } from '@/types';

interface SettingsProps {
  settings: SettingsType;
  onSave: (settings: SettingsType) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onSave }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [domains, setDomains] = useState<string[]>(settings.enabledDomains);
  const [newDomain, setNewDomain] = useState('');
  const [isEnabled, setIsEnabled] = useState(settings.isEnabled);

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

  const handleSave = () => {
    onSave({
      enabledDomains: domains,
      isEnabled,
    });
    setIsOpen(false);
  };

  const handleCancel = () => {
    setDomains(settings.enabledDomains);
    setIsEnabled(settings.isEnabled);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-primary-600 transition-colors"
        title="Settings"
      >
        <SettingsIcon className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 bg-white z-10 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5" />
          Settings
        </h2>
        <button
          onClick={handleCancel}
          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
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

        {/* Enabled Domains */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Enabled Domains
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            The extension will only appear on these domains
          </p>

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
          Save Settings
        </button>
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

