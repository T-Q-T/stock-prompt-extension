import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import '@/styles/content.css';

// Create a container for our React app
const initExtension = () => {
  console.log('🎨 Prompt Stock: Initializing extension...');
  console.log('📍 Current URL:', window.location.href);
  
  // Check if already initialized
  if (document.getElementById('prompt-stock-root')) {
    console.log('⚠️ Prompt Stock: Already initialized');
    return;
  }

  const rootElement = document.createElement('div');
  rootElement.id = 'prompt-stock-root';
  document.body.appendChild(rootElement);
  console.log('✅ Prompt Stock: Root element created');

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('✅ Prompt Stock: React app rendered');
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  console.log('⏳ Prompt Stock: Waiting for DOM...');
  document.addEventListener('DOMContentLoaded', initExtension);
} else {
  initExtension();
}

