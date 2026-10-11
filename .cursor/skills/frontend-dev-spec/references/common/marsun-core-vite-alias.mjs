import { existsSync } from 'node:fs';
import path from 'node:path';

/**
 * @typedef {Object} MarsunCoreViteAliasOptions
 * @property {string} [defaultRelativePath]
 * @property {Record<string, string>} [env]
 * @property {boolean} [autoDetectSibling]
 */

/** 本地 core dist 在业务仓外时，须锁 peer 到业务 node_modules，否则双份 antd/React Context（表头英文 tip / page）。 */
const CONSUMER_PEER_PACKAGES = ['antd', 'react', 'react-dom'];

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
 * @param {string} configDir
 * @returns {{ find: string, replacement: string }[]}
 */
function consumerPeerAliases(configDir) {
  const nm = path.resolve(configDir, 'node_modules');
  /** @type {{ find: string, replacement: string }[]} */
  const aliases = [];
  for (const name of CONSUMER_PEER_PACKAGES) {
    const target = path.join(nm, name);
    if (!existsSync(target)) {
      console.warn(
        `[marsun-core-local] 未找到业务仓 ${name}（${target}），跳过 peer alias；可能仍出现双份依赖`,
      );
      continue;
    }
    aliases.push({ find: name, replacement: target });
  }
  return aliases;
}

/**
 * 本地联调 @hkyhy/marsun-components-core，不改 package.json / lockfile。
 *
 * 环境变量（写在 .env.local，勿提交；vite.config 须 loadEnv 并传入 env）：
 *   MARSUN_CORE_LOCAL=1              显式启用 sibling defaultRelativePath
 *   MARSUN_CORE_LOCAL=0              强制走 node_modules（一般不必写）
 *   MARSUN_CORE_LOCAL_PATH=<路径>    相对 vite.config.ts，优先于 MARSUN_CORE_LOCAL
 *
 * 默认不走本地链；仅上述 env 显式开启。autoDetectSibling 默认 false（勿再依赖 sibling 自动探测）。
 * 启用本地链时一并 alias antd/react/react-dom → 业务仓 node_modules，避免 ConfigProvider locale 失效。
 *
 * @param {string} configDir
 * @param {MarsunCoreViteAliasOptions} [options]
 */
export function marsunCoreViteAlias(configDir, options = {}) {
  const {
    defaultRelativePath = '../../marsun_components-core',
    env,
    autoDetectSibling = false,
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

  console.info(`[marsun-core-local] @hkyhy/marsun-components-core → ${coreRoot}/dist`);

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
    {
      find: '@hkyhy/marsun-components-core/agent-hub',
      replacement: path.join(coreRoot, 'dist/agent-hub.js'),
    },
    {
      find: '@hkyhy/marsun-components-core/file',
      replacement: path.join(coreRoot, 'dist/file.js'),
    },
    {
      find: '@hkyhy/marsun-components-core/llm',
      replacement: path.join(coreRoot, 'dist/llm.js'),
    },
    {
      find: '@hkyhy/marsun-components-core/form-info',
      replacement: path.join(coreRoot, 'dist/form-info.js'),
    },
    {
      find: '@hkyhy/marsun-components-core/editor',
      replacement: path.join(coreRoot, 'dist/editor.js'),
    },
    {
      find: '@hkyhy/marsun-components-core/iam',
      replacement: path.join(coreRoot, 'dist/iam.js'),
    },
    { find: '@hkyhy/marsun-components-core', replacement: distIndex },
    ...consumerPeerAliases(configDir),
  ];
}
