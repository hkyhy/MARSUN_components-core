#!/usr/bin/env node
/**
 * 核对 package.json version 与 npm / Git 一致。
 *
 *   node scripts/version-check.mjs              # 检查
 *   node scripts/version-check.mjs --apply-published  # 对齐 npm 最新已发布版
 *   node scripts/version-check.mjs --apply      # 设为 npm 最新 +1 patch（待发布）
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

function writePkgVersion(version) {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  pkg.version = version;
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
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

const applyPublished = process.argv.includes('--apply-published');
const applyNext = process.argv.includes('--apply');
const working = readPkgVersion();
const head = gitHeadVersion();
const npmLatest = npmLatestVersion();
const nextPatch = npmLatest ? bumpPatch(npmLatest) : null;

console.log('marsun_components-core version check');
console.log(`  working (package.json):  ${working}`);
console.log(`  last git commit:         ${head ?? '(none)'}`);
console.log(`  npm latest (published):  ${npmLatest ?? '(unreachable)'}`);
if (npmLatest) console.log(`  next patch (unreleased): ${nextPatch}`);

let ok = true;
let target = null;

if (npmLatest) {
  if (cmp(working, npmLatest) < 0) {
    console.error(`\n✗ 工作区 ${working} 落后于 npm 已发布 ${npmLatest}，package.json 须与实发版一致`);
    console.error('  修复: node scripts/version-check.mjs --apply-published');
    ok = false;
    target = npmLatest;
  } else if (cmp(working, npmLatest) === 0) {
    console.log('\n✓ 与 npm 已发布版一致');
  } else if (cmp(working, nextPatch) === 0) {
    console.log('\n✓ 待发布下一 patch（npm +1）');
  } else if (cmp(working, nextPatch) > 0) {
    console.error(`\n✗ 工作区 ${working} 跳号（npm ${npmLatest}，下一版应为 ${nextPatch}）`);
    ok = false;
  } else {
    console.error(`\n✗ 工作区 ${working} 无效：应为 ${npmLatest}（已发布）或 ${nextPatch}（待发布）`);
    ok = false;
  }
} else {
  console.log('\n⚠ 无法查询 npm，仅跳过 npm 对齐检查');
}

if (applyPublished && npmLatest) {
  writePkgVersion(npmLatest);
  console.log(`\n→ 已写回 package.json version = ${npmLatest}（对齐 npm）`);
  process.exit(0);
}

if (applyNext && npmLatest) {
  const next = bumpPatch(npmLatest);
  writePkgVersion(next);
  console.log(`\n→ 已写回 package.json version = ${next}（待发布）`);
  process.exit(0);
}

process.exit(ok ? 0 : 1);
