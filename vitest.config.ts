import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true, // enables jest global APIs
    setupFiles: './src/__tests__/setupTests.ts',
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
  },
});
