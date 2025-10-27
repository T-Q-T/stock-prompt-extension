// Node.js script to create simple placeholder icons
// This creates solid color PNG files for quick testing

import { createWriteStream } from 'fs';
import { mkdirSync, existsSync } from 'fs';

const sizes = [16, 48, 128];
const colors = {
  16: '#667eea',
  48: '#7c3aed',
  128: '#6d28d9'
};

// Create public/icons directory if it doesn't exist
const iconsDir = 'public/icons';
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

console.log('To create icons quickly, you have two options:\n');
console.log('Option 1: Use the HTML generator');
console.log('  - Open scripts/generate-icons.html in your browser');
console.log('  - Click download buttons to save each icon\n');

console.log('Option 2: Use a simple placeholder');
console.log('  - Visit https://dummyimage.com/');
console.log('  - Or download any small PNG image');
console.log('  - Rename to icon16.png, icon48.png, icon128.png');
console.log('  - Place in public/icons/\n');

console.log('After adding icons, run: npm run build');

