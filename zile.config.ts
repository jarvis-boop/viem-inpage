import { defineConfig } from 'zile';

export default defineConfig({
  entries: [
    {
      input: 'src/index.ts',
      outDir: 'dist',
    },
  ],
  dts: true,
  splitting: false,
  minify: false,
  sourcemap: true,
  target: 'node18',
  format: 'esm',
});
