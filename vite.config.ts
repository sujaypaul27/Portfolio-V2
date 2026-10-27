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
    port: 5173,
    host: true,
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    // three.js alone is ~600 kB minified; it is isolated in its own cached,
    // lazily-loaded chunk, so the warning threshold is raised accordingly.
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('/three/') || id.includes('\\three\\')) return 'vendor-three';
          if (
            id.includes('@react-three') ||
            id.includes('postprocessing') ||
            id.includes('maath')
          ) {
            return 'vendor-r3f';
          }
          if (id.includes('gsap')) return 'vendor-gsap';
          if (
            id.includes('react-dom') ||
            id.includes('react-router') ||
            id.includes('/react/') ||
            id.includes('\\react\\') ||
            id.includes('scheduler')
          ) {
            return 'vendor-react';
          }
          return undefined;
        },
      },
    },
  },
});
