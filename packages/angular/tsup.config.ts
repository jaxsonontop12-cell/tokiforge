import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: false,
  clean: true,
  minify: false,
  treeshake: true,
  external: ['@angular/core', '@angular/common', '@tokiforge/core'],
  noExternal: [],
  esbuildOptions(options) {
    options.keepNames = true;
    options.target = 'es2022';
    // Don't transform decorators - let Angular handle them
    options.tsconfig = './tsconfig.json';
  },
  tsconfig: './tsconfig.json',
  // Use TypeScript compiler for better decorator handling
  esbuildPlugins: [],
});

