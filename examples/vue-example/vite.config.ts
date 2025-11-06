import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'fs': resolve(__dirname, 'src/stubs/fs.ts'),
      'path': resolve(__dirname, 'src/stubs/path.ts'),
    },
  },
  optimizeDeps: {
    exclude: ['fs', 'path'],
  },
});

