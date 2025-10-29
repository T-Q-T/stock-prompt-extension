import React, { useState, useEffect } from 'react';
import { FloatingButton } from '@/components/FloatingButton';
import { Sidebar } from '@/components/Sidebar';
import { isCurrentDomainEnabled } from '@/utils/storage';

export const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // 立即检查是否应该显示，而不是等待useEffect
  const [isVisible, setIsVisible] = useState(() => isCurrentDomainEnabled());

  useEffect(() => {
    // 重新检查以确保状态正确
    const enabled = isCurrentDomainEnabled();
    console.log('🔍 Prompt Stock: Domain check result:', enabled);
    setIsVisible(enabled);

    if (!enabled) {
      console.log('⚠️ Prompt Stock: Extension disabled for this domain');
      console.log('💡 To enable: Open sidebar (Ctrl+M) and adjust domain settings');
    } else {
      console.log('✅ Prompt Stock: Extension enabled! Look for the floating button on the right side');
    }

    // 监听storage变化，以便设置更改后立即生效
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'prompt_stock_settings') {
        console.log('⚙️ Settings changed, rechecking domain...');
        const newEnabled = isCurrentDomainEnabled();
        setIsVisible(newEnabled);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    // Listen for Ctrl+M shortcut (always available, even when hidden by domain settings)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        console.log('⌨️ Prompt Stock: Ctrl+M pressed, toggling sidebar');
        setIsSidebarOpen((prev) => !prev);
        // 如果当前不可见，临时显示以便用户可以访问设置
        const currentEnabled = isCurrentDomainEnabled();
        if (!currentEnabled) {
          setIsVisible(true);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 当Sidebar关闭时，重新检查域名设置
  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    // 重新检查域名设置，因为用户可能在设置中进行了更改
    const enabled = isCurrentDomainEnabled();
    setIsVisible(enabled);
  };

  // 移除isVisible检查，改为只控制FloatingButton的显示
  // Sidebar始终可以通过快捷键打开
  return (
    <>
      {!isSidebarOpen && isVisible && <FloatingButton onClick={() => setIsSidebarOpen(true)} />}
      <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
    </>
  );
};

