import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import scopePlugin from './postcss-scope-plugin.js';

export default {
  plugins: [
    tailwindcss,
    scopePlugin(),
    autoprefixer,
  ],
}

