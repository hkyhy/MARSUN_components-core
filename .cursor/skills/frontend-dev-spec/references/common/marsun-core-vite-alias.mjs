import { existsSync } from 'node:fs';
import path from 'node:path';

/**
 * @typedef {Object} MarsunCoreViteAliasOptions
 * @property {string} [defaultRelativePath]
 * @property {Record<string, string>} [env]
 * @property {boolean} [autoDetectSibling]
 */

function resolveCoreRelativePath(configDir, options) {
  const env = options.env ?? process.env;
  const { defaultRelativePath, autoDetectSibling } = options;

  if (env.MARSUN_CORE_LOCAL === '0' || env.MARSUN_CORE_LOCAL === 'false') {
    return '';
  }

  const explicitPath = env.MARSUN_CORE_LOCAL_PATH?.trim();
  if (explicitPath) return explicitPath;

  if (env.MARSUN_CORE_LOCAL === '1' || env.MARSUN_CORE_LOCAL === 'true') {
    return defaultRelativePath;
  }

  if (autoDetectSibling) {
    const distIndex = path.join(path.resolve(configDir, defaultRelativePath), 'dist/index.js');
    if (existsSync(distIndex)) return defaultRelativePath;
  }

  return '';
}

/**
 * 本地联调 @hkyhy/marsun-components-core，不改 package.json / lockfile。
 *
 * 环境变量（写在 .env.local，勿提交；vite.config 须 loadEnv 并传入 env）：
 *   MARSUN_CORE_LOCAL=1              显式启用 sibling defaultRelativePath
 *   MARSUN_CORE_LOCAL=0              强制走 node_modules
 *   MARSUN_CORE_LOCAL_PATH=<路径>    相对 vite.config.ts，优先于 MARSUN_CORE_LOCAL
 *
 * monorepo：未设 env 时，若 sibling dist/index.js 存在则自动 alias。
 *
 * @param {string} configDir
 * @param {MarsunCoreViteAliasOptions} [options]
 */
export function marsunCoreViteAlias(configDir, options = {}) {
  const {
    defaultRelativePath = '../../marsun_components-core',
    env,
    autoDetectSibling = true,
  } = options;

  const raw = resolveCoreRelativePath(configDir, {
    defaultRelativePath,
    autoDetectSibling,
    env,
  });

  if (!raw) return [];

  const coreRoot = path.resolve(configDir, raw);
  const pkgJson = path.join(coreRoot, 'package.json');
  const distIndex = path.join(coreRoot, 'dist/index.js');
  if (!existsSync(pkgJson) || !existsSync(distIndex)) {
    console.warn(
      `[marsun-core-local] 跳过 alias：未找到 ${pkgJson} 或 ${distIndex}（请先在 core 执行 npm run build）`,
    );
    return [];
  }

  const viaEnv =
    env?.MARSUN_CORE_LOCAL === '1' ||
    env?.MARSUN_CORE_LOCAL === 'true' ||
    Boolean(env?.MARSUN_CORE_LOCAL_PATH?.trim()) ||
    process.env.MARSUN_CORE_LOCAL === '1' ||
    process.env.MARSUN_CORE_LOCAL === 'true' ||
    Boolean(process.env.MARSUN_CORE_LOCAL_PATH?.trim());

  console.info(
    `[marsun-core-local] @hkyhy/marsun-components-core → ${coreRoot}/dist${viaEnv ? '' : ' (monorepo auto)'}`,
  );

  return [
    {
      find: '@hkyhy/marsun-components-core/tokens',
      replacement: path.join(coreRoot, 'dist/theme/tokens.css'),
    },
    {
      find: '@hkyhy/marsun-components-core/styles',
      replacement: path.join(coreRoot, 'dist/styles/global.css'),
    },
    {
      find: '@hkyhy/marsun-components-core/theme',
      replacement: path.join(coreRoot, 'dist/theme/index.js'),
    },
    { find: '@hkyhy/marsun-components-core', replacement: distIndex },
  ];
}
