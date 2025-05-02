import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  external: ['react'],
  esbuildOptions(options) {
    options.banner = {
      js: '/**\n * @preserve\n * @a11ytools/focus-management\n * Focus management utilities for building accessible web applications\n * @license MIT\n */\n'
    };
  },
}); 