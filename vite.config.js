import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiPort = env.API_PORT || 8787;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      host: true,
      proxy: {
        // The AI + climate-index backend (server/index.js). Keeps the Gemini key off the browser.
        '/api': { target: `http://localhost:${apiPort}`, changeOrigin: true },
      },
    },
    build: {
      target: 'es2020',
      chunkSizeWarningLimit: 1900, // mapbox-gl is ~1.7 MB and is already split into its own lazy chunk
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/mapbox-gl')) return 'mapbox';
            if (id.match(/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//)) return 'react';
            if (id.match(/node_modules\/(@reduxjs|react-redux|redux|immer|reselect)/)) return 'state';
            return undefined;
          },
        },
      },
    },
  };
});
