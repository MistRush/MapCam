import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy for historical image metadata
      '/api/history': {
        target: 'https://data-provider.chmi.cz',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/history/, '/api/playableImages/init/web-kamery'),
      },
      // Proxy for historical images
      '/api/image': {
        target: 'https://data-provider.chmi.cz',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/image/, '/api/kamery/data/obrazok'),
      },
    },
  },
})
