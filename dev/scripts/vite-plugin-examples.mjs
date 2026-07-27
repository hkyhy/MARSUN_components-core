/**
 * Vite 插件：监听 src/components 下 meta.json / Demo 变化，自动重新生成
 * examples-registry.ts、layouts/menu-config.ts、routes.tsx
 */

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectExamples, GENERATED_PATHS } from './collect-examples.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const COMPONENTS_DIR = resolve(ROOT, 'src', 'components');

export default function viteExamplesPlugin() {
  return {
    name: 'vite-plugin-examples-collect',

    configureServer(server) {
      collectExamples();

      server.watcher.add(COMPONENTS_DIR);
      server.watcher.on('all', (event, file) => {
        if (!file || !file.startsWith(COMPONENTS_DIR)) return;
        if (!['add', 'addDir', 'change', 'unlink', 'unlinkDir'].includes(event)) return;

        const isMeta = file.endsWith('meta.json');
        const isDemo =
          file.endsWith('Demo.tsx') ||
          /[/\\]examples[/\\][^/\\]+Demo[/\\]/.test(file);
        if (!isMeta && !isDemo) return;

        console.log(`\n🔄 检测到示例变化: ${event} ${file.replace(ROOT, '')}`);
        collectExamples();

        for (const genPath of GENERATED_PATHS) {
          const mod = server.moduleGraph.getModuleById(genPath);
          if (mod) server.moduleGraph.invalidateModule(mod);
        }
        server.ws.send({ type: 'full-reload' });
      });
    },
  };
}
