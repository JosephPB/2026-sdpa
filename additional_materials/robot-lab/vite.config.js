import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('codemirror') || id.includes('@lezer')) return 'editor';
          if (id.includes('node_modules/react')) return 'react';
        },
      },
    },
  },
});
