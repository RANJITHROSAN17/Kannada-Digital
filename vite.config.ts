/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Kannada Saathi build configuration.
 *
 * `VITE_BASE_PATH` lets the same static build be served from a sub-directory
 * (e.g. GitHub Pages: https://<user>.github.io/kannada-saathi/). It defaults to
 * "/" so `npm run dev` and hosts such as Netlify/Vercel need no configuration.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const base = env.VITE_BASE_PATH || '/';

  return {
    base,
    plugins: [react()],
    // The dev/preview server is bound to all interfaces so the app can be
    // reached through a tunnel or a container proxy during a demo.
    server: { host: '0.0.0.0', port: 5173, allowedHosts: true },
    preview: { host: '0.0.0.0', port: 4173, allowedHosts: true },
    build: {
      sourcemap: true,
      // Keep the demo payload small: the phrase dataset is plain TypeScript.
      chunkSizeWarningLimit: 700,
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      restoreMocks: true,
    },
  };
});
