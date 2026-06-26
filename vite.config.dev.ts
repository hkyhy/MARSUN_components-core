import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname);
const SRC = resolve(ROOT, 'src');
const showcaseBase = process.env.VITE_BASE_PATH ?? '/';

// dev 模式：将 src/components 下 doc/*.mock.json 映射到 /mock/...
function mockDocPlugin(): Plugin {
  return {
    name: 'mock-doc',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        if (!url.startsWith('/mock/')) return next();

        const relPath = url.replace('/mock/', '');
        const filePath = resolve(SRC, 'components', relPath);
        if (!existsSync(filePath) || !filePath.endsWith('.mock.json')) {
          res.statusCode = 404;
          res.end('Not found');
          return;
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(readFileSync(filePath, 'utf-8'));
      });
    },
  };
}

export default defineConfig({
  base: showcaseBase,
  root: resolve(ROOT, 'dev'),
  plugins: [react(), mockDocPlugin()],
  resolve: {
    alias: { '@': SRC },
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [resolve(ROOT, 'src/styles')],
        additionalData: `@use "mixins" as *;\n`,
      },
    },
  },
  build: {
    outDir: resolve(ROOT, 'dist-showcase'),
    emptyOutDir: true,
  },
  server: {
    port: 5175,
  },
  publicDir: false,
});
