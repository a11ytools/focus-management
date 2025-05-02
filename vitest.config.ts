import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/*.d.ts', '**/index.ts']
    },
    globals: true,
    setupFiles: ['./src/setupDOM.ts', './src/setupJestDom.ts']
  }
}); 