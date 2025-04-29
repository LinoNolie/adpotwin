import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://api.adpot.win',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  define: {
    // Ensure environment variables are properly handled
    'process.env': {}
  },
  // Add proper CORS handling
  optimizeDeps: {
    exclude: ['@react-three/fiber', '@react-three/drei']
  }
});
