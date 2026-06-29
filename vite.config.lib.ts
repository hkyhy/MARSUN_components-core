import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: resolve(__dirname, 'tsconfig.build.json'),
      include: ['src'],
      exclude: ['src/**/examples/**', 'src/**/doc/**', 'src/**/__tests__/**'],
      rollupTypes: false,
    }),
  ],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [resolve(__dirname, 'src/styles')],
        additionalData: `@use "mixins" as *;\n`,
      },
    },
  },
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'theme/index': resolve(__dirname, 'src/theme/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'antd',
        'react-router-dom',
        '@kne/button-group',
        'classnames',
        'dayjs',
        'lucide-react',
        'ahooks',
        'react-markdown',
        'remark-gfm',
        'mermaid',
        'prism-react-renderer',
        '@js-preview/excel',
        'docx-preview',
        'pptx-preview',
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});
