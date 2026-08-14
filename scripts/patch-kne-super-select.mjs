/**
 * 修复 @kne/super-select SelectTree：扁平 parentId 在 mapping.processData 时被抹成 null，
 * 导致选中父节点后子节点 checkbox 不联动（parseTreeData 展示正常、勾选状态错）。
 * 幂等：可重复执行。
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function resolveSuperSelectDist() {
  try {
    const pkg = require.resolve('@kne/super-select/package.json');
    return join(dirname(pkg), 'dist');
  } catch {
    const fallback = join(root, 'node_modules/@kne/super-select/dist');
    return existsSync(fallback) ? fallback : null;
  }
}

const MARKER = 'hasExplicitParent';

const patches = [
  {
    file: 'index.js',
    from: `const processData = function (items, parentId) {
      if (parentId === void 0) {
        parentId = null;
      }
      items.forEach(item => {
        const node = _extends({}, item, {
          id: item[valueKey],
          label: item[labelKey],
          parentId
        });`,
    to: `const processData = function (items, parentId) {
      // parentId 未传时保留扁平数据上的 item.parentId（原逻辑一律写成 null，导致父子勾选联动失效）
      const hasExplicitParent = parentId !== void 0;
      items.forEach(item => {
        const resolvedParentId = hasExplicitParent ? parentId : item.parentId != null ? item.parentId : null;
        const node = _extends({}, item, {
          id: item[valueKey],
          label: item[labelKey],
          parentId: resolvedParentId
        });`,
  },
  {
    file: 'index.modern.js',
    from: `processData = (items, parentId = null) => {
      items.forEach(item => {
        const node = _extends({}, item, {
          id: item[valueKey],
          label: item[labelKey],
          parentId
        });`,
    to: `processData = (items, parentId) => {
      const hasExplicitParent = parentId !== void 0;
      items.forEach(item => {
        const resolvedParentId = hasExplicitParent ? parentId : item.parentId != null ? item.parentId : null;
        const node = _extends({}, item, {
          id: item[valueKey],
          label: item[labelKey],
          parentId: resolvedParentId
        });`,
  },
];

const dist = resolveSuperSelectDist();
if (!dist) {
  console.warn('[patch-kne-super-select] @kne/super-select not found, skip');
  process.exit(0);
}

let changed = 0;
for (const { file, from, to } of patches) {
  const path = join(dist, file);
  if (!existsSync(path)) continue;
  let source = readFileSync(path, 'utf8');
  if (source.includes(MARKER)) {
    console.log(`[patch-kne-super-select] ${file} already patched`);
    continue;
  }
  if (!source.includes(from)) {
    console.warn(`[patch-kne-super-select] ${file}: pattern not found, skip`);
    continue;
  }
  writeFileSync(path, source.replace(from, to));
  changed += 1;
  console.log(`[patch-kne-super-select] patched ${file}`);
}

if (changed === 0) {
  console.log('[patch-kne-super-select] no files changed');
}
