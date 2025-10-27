import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('Running post-build tasks...');

// Ensure dist directory exists
const distDir = join(rootDir, 'dist');
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// Copy manifest.json
try {
  copyFileSync(
    join(rootDir, 'manifest.json'),
    join(distDir, 'manifest.json')
  );
  console.log('✓ Copied manifest.json');
} catch (err) {
  console.error('✗ Failed to copy manifest.json:', err.message);
}

// Copy popup.html
try {
  copyFileSync(
    join(rootDir, 'popup.html'),
    join(distDir, 'popup.html')
  );
  console.log('✓ Copied popup.html');
} catch (err) {
  console.error('✗ Failed to copy popup.html:', err.message);
}

// Ensure icons directory exists in dist
const distIconsDir = join(distDir, 'icons');
if (!existsSync(distIconsDir)) {
  mkdirSync(distIconsDir, { recursive: true });
}

// Copy icons
const iconsDir = join(rootDir, 'public', 'icons');
const icons = ['icon16.png', 'icon48.png', 'icon128.png'];

icons.forEach(icon => {
  const srcPath = join(iconsDir, icon);
  const destPath = join(distIconsDir, icon);
  
  if (existsSync(srcPath)) {
    try {
      copyFileSync(srcPath, destPath);
      console.log(`✓ Copied ${icon}`);
    } catch (err) {
      console.error(`✗ Failed to copy ${icon}:`, err.message);
    }
  } else {
    console.warn(`⚠ Icon ${icon} not found. Please generate icons using scripts/generate-icons.html`);
  }
});

console.log('\nPost-build tasks completed!');
console.log('\nNext steps:');
console.log('1. If you see icon warnings, generate icons using scripts/generate-icons.html');
console.log('2. Load the dist/ folder in Chrome (chrome://extensions/)');

