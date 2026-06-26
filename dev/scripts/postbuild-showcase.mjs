import { copyFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../../dist-showcase');

copyFileSync(resolve(outDir, 'index.html'), resolve(outDir, '404.html'));
writeFileSync(resolve(outDir, '.nojekyll'), '');

console.log('✅ showcase postbuild: 404.html + .nojekyll');
