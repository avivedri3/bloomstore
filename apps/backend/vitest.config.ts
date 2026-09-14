import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
  resolve: {
    alias: {
      '@bloomstore/shared-types': resolve(__dirname, '../../libs/shared-types/src/index.ts'),
    },
  },
});
