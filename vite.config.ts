import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  base: '/',
  build: {
    outDir: isSsrBuild ? 'dist/server' : 'dist/client',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: isSsrBuild
        ? {}
        : {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                if (id.includes('recharts')) return 'charts';
                if (id.includes('date-fns') || id.includes('lucide-react')) return 'utils';
                if (id.includes('react')) return 'vendor';
              }
            },
          },
    },
  },
}))
