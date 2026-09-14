/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { resolve } from 'path';
import { getBuildDate, getPackageVersion } from '../../tools/build-metadata.cjs';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const base = process.env.VITE_BASE_URL || (isProduction ? '/BloomStore/' : '/');

  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/apps/frontend',
    base,
    server: {
      port: 3000,
      host: 'localhost',
      proxy: {
        '/api': {
          target: 'http://localhost:3030',
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 4300,
      host: '0.0.0.0',
    },
    plugins: [react({ jsxRuntime: 'automatic' }), nxViteTsPaths()],
    define: {
      __BUILD_DATE__: JSON.stringify(getBuildDate()),
      __APP_VERSION__: JSON.stringify(getPackageVersion()),
    },
    resolve: {
      alias: {
        '@bloomstore/shared-types': resolve(__dirname, '../../libs/shared-types/src/index.ts'),
      },
    },
    css: {
      postcss: './postcss.config.cjs',
    },
    build: {
      outDir: '../../dist/apps/frontend',
      reportCompressedSize: true,
      sourcemap: true,
      minify: isProduction,
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          },
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test-setup.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      coverage: {
        reportsDirectory: '../../coverage/apps/frontend',
        provider: 'v8',
      },
    },
  };
});
