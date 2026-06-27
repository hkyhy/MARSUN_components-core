#!/usr/bin/env node
/**
 * After commit: if package.json version changed vs parent commit, create v{version} tag.
 * Push tags separately; GitHub Actions publish.yml runs on v* tag push.
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

function git(args, { allowFail = false } = {}) {
  try {
    return execSync(`git ${args}`, { encoding: 'utf8' }).trim();
  } catch (error) {
    if (allowFail) return null;
    throw error;
  }
}

const changed = git('diff-tree --no-commit-id --name-only -r HEAD', { allowFail: true });
if (!changed?.split('\n').includes('package.json')) {
  process.exit(0);
}

const current = JSON.parse(readFileSync('package.json', 'utf8')).version;
const previousJson = git('show HEAD~1:package.json', { allowFail: true });
if (!previousJson) process.exit(0);

const previous = JSON.parse(previousJson).version;
if (current === previous) process.exit(0);

const tag = `v${current}`;
if (git(`rev-parse --verify refs/tags/${tag}`, { allowFail: true })) {
  console.log(`[version-tag] Tag ${tag} already exists — skip`);
  process.exit(0);
}

git(`tag -a ${tag} -m "Release ${tag}"`);
console.log(`[version-tag] Created ${tag}`);
console.log(`[version-tag] Push to publish: git push origin HEAD --tags`);
