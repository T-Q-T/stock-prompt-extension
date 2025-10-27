import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync } from 'fs'

// Plugin to copy manifest and icons
function copyFilesPlugin() {
  return {
    name: 'copy-files',
    closeBundle() {
      const files = [
        { src: 'manifest.json', dest: 'dist/manifest.json' },
      ]
      
      files.forEach(({ src, dest }) => {
        try {
          copyFileSync(src, dest)
          console.log(`Copied ${src} to ${dest}`)
        } catch (err) {
          console.error(`Failed to copy ${src}:`, err)
        }
      })
      
      // Copy icons if they exist
      const iconsDir = 'public/icons'
      const distIconsDir = 'dist/icons'
      
      if (!existsSync(distIconsDir)) {
        mkdirSync(distIconsDir, { recursive: true })
      }
      
      const icons = ['icon16.png', 'icon48.png', 'icon128.png']
      icons.forEach(icon => {
        const src = `${iconsDir}/${icon}`
        const dest = `${distIconsDir}/${icon}`
        if (existsSync(src)) {
          copyFileSync(src, dest)
          console.log(`Copied ${icon}`)
        } else {
          console.warn(`Icon ${icon} not found in ${iconsDir}`)
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), copyFilesPlugin()],
  build: {
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content/index.tsx'),
        popup: resolve(__dirname, 'popup.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})

