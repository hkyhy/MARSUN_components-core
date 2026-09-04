import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import dts from 'vite-plugin-dts';

const EXTERNAL_PACKAGES = new Set([
  'react',
  'react-dom',
  'react/jsx-runtime',
  'antd',
  'react-router-dom',
  '@kne/button-group',
  '@kne/form-info',
  '@kne/is-empty',
  '@kne/react-form',
  '@kne/react-form-antd',
  '@kne/table-view',
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
  'lodash',
  '@ant-design/icons',
  '@kne/super-select',
  '@kne/super-select-plus',
  '@kne/react-intl',
  '@kne/overflow-items',
  '@kne/responsive-utils',
  'simplebar',
  'simplebar-react',
]);

function isExternal(id: string): boolean {
  // Bundle CSS/SCSS side-effects (e.g. @kne/super-select/dist/index.css, @kne/table-view/dist/index.css)
  if (/\.(css|scss|sass|less)(\?|$)/.test(id)) return false;
  if (EXTERNAL_PACKAGES.has(id)) return true;
  if (id === 'lodash' || id.startsWith('lodash/')) return true;
  if (id.startsWith('@kne/')) return true;
  if (id.startsWith('@ant-design/icons')) return true;
  if (id === 'simplebar' || id.startsWith('simplebar/')) return true;
  if (id === 'simplebar-react' || id.startsWith('simplebar-react/')) return true;
  return false;
}

function scssAdditionalData(content: string, filename: string): string {
  const normalized = filename.replace(/\\/g, '/');
  // Vendor SCSS uses @kne/responsive-utils; skip global mixins inject to avoid clashes
  if (
    normalized.includes('/ReactFilter/') ||
    normalized.includes('/InfoPage/') ||
    normalized.includes('/ReactModal/') ||
    normalized.includes('/FormInfo/') ||
    normalized.includes('/FlexBox/')
  ) {
    return content;
  }
  return `@use "mixins" as *;\n${content}`;
}

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
        additionalData: scssAdditionalData,
      },
    },
  },
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'theme/index': resolve(__dirname, 'src/theme/index.ts'),
        'agent-hub': resolve(__dirname, 'src/agent-hub.ts'),
        file: resolve(__dirname, 'src/file.ts'),
        llm: resolve(__dirname, 'src/llm.ts'),
        'form-info': resolve(__dirname, 'src/form-info.ts'),
        iam: resolve(__dirname, 'src/iam.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: isExternal,
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});
