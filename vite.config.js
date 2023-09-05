import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  rollupOptions: {
    output: {
      manualChunks: false,
      inlineDynamicImports: true,
      entryFileNames: '[name].js',   // currently does not work for the legacy bundle
      assetFileNames: '[name].[ext]', // currently does not work for images
    },
  }
})
