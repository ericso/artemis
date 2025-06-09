import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/__tests__/**/*.{test,spec}.ts'],
    setupFiles: ['src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/setup.ts',
      ]
    },
    alias: {
      '@': resolve(__dirname, './src'),
      '@routes': resolve(__dirname, './src/routes'),
      '@middleware': resolve(__dirname, './src/middleware'),
      '@controllers': resolve(__dirname, './src/controllers'),
      '@models': resolve(__dirname, './src/models'),
      '@services': resolve(__dirname, './src/services'),
      '@utils': resolve(__dirname, './src/utils'),
      '@config': resolve(__dirname, './src/config'),
      '@db': resolve(__dirname, './src/db')
    },
    silent: true,
    onConsoleLog: () => false
  }
}); 