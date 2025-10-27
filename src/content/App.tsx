import React, { useState, useEffect } from 'react';
import { FloatingButton } from '@/components/FloatingButton';
import { Sidebar } from '@/components/Sidebar';
import { isCurrentDomainEnabled } from '@/utils/storage';

export const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if extension should be visible on current domain
    const enabled = isCurrentDomainEnabled();
    console.log('🔍 Prompt Stock: Domain check result:', enabled);
    setIsVisible(enabled);

    if (!enabled) {
      console.log('⚠️ Prompt Stock: Extension disabled for this domain');
      console.log('💡 To enable: Open sidebar and add this domain in settings');
    } else {
      console.log('✅ Prompt Stock: Extension enabled! Look for the floating button on the right side');
    }

    // Listen for Ctrl+M shortcut
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        console.log('⌨️ Prompt Stock: Ctrl+M pressed, toggling sidebar');
        setIsSidebarOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {!isSidebarOpen && <FloatingButton onClick={() => setIsSidebarOpen(true)} />}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
};

