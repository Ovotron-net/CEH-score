import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  base: '/',
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  build: {
    outDir: isSsrBuild ? 'dist/server' : 'dist/client',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: isSsrBuild
        ? {}
        : {
            manualChunks(id) {
              if (!id.includes('node_modules')) return;
              if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor')) return 'charts';
              if (id.includes('date-fns') || id.includes('lucide-react')) return 'utils';
              if (id.includes('@radix-ui') || id.includes('react-router') || id.includes('@tanstack')) return 'vendor';
              if (id.includes('react-dom') || id.includes('react/')) return 'vendor';
            },
          },
    },
  },
}))

