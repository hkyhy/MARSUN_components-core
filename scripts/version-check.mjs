#!/usr/bin/env node
/**
 * 升版前核对：工作区 version 须为 max(HEAD commit, npm latest) 的 patch+1，禁止跳号。
 *
 *   node scripts/version-check.mjs
 *   node scripts/version-check.mjs --apply   # 写回 package.json version（不 commit）
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const pkgPath = join(root, 'package.json');

function parseSemver(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(v).trim());
  if (!m) throw new Error(`invalid semver: ${v}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function cmp(a, b) {
  const pa = parseSemver(a);
  const pb = parseSemver(b);
  for (let i = 0; i < 3; i += 1) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

function bumpPatch(v) {
  const [maj, min, pat] = parseSemver(v);
  return `${maj}.${min}.${pat + 1}`;
}

function readPkgVersion() {
  return JSON.parse(readFileSync(pkgPath, 'utf8')).version;
}

function gitHeadVersion() {
  try {
    const raw = execSync('git show HEAD:package.json', { cwd: root, encoding: 'utf8' });
    return JSON.parse(raw).version;
  } catch {
    return null;
  }
}

function npmLatestVersion() {
  try {
    return execSync('npm view @hkyhy/marsun-components-core version', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

const apply = process.argv.includes('--apply');
const working = readPkgVersion();
const head = gitHeadVersion();
const npmLatest = npmLatestVersion();

const baseline = [head, npmLatest].filter(Boolean).reduce(
  (best, v) => (best === null || cmp(v, best) > 0 ? v : best),
  null,
);

const suggested = baseline ? bumpPatch(baseline) : working;

console.log('marsun_components-core version check');
console.log(`  working (package.json):  ${working}`);
console.log(`  last git commit:         ${head ?? '(none)'}`);
console.log(`  npm latest:              ${npmLatest ?? '(unpublished / unreachable)'}`);
console.log(`  baseline (max):          ${baseline ?? '(none)'}`);
console.log(`  suggested next patch:    ${suggested}`);

let ok = true;
if (baseline && cmp(working, suggested) > 0) {
  console.error(`\n✗ 工作区 ${working} 高于建议下一版 ${suggested}（相对 baseline ${baseline} 跳号）`);
  ok = false;
} else if (baseline && cmp(working, baseline) < 0) {
  console.error(`\n✗ 工作区 ${working} 低于 baseline ${baseline}，不可回退`);
  ok = false;
} else if (baseline && working !== suggested && cmp(working, baseline) === 0) {
  console.warn(`\n⚠ 工作区仍为 ${working}，发布前应升为 ${suggested}`);
  ok = false;
} else {
  console.log('\n✓ version 与 baseline 一致或为建议下一版');
}

if (apply) {
  if (working !== suggested) {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    pkg.version = suggested;
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
    console.log(`\n→ 已写回 package.json version = ${suggested}`);
    process.exit(0);
  }
  console.log('\n→ version 已是建议值，未修改');
  process.exit(0);
}

process.exit(ok ? 0 : 1);
