import { existsSync } from 'node:fs';
import path from 'node:path';

/**
 * 本地联调 @hkyhy/marsun-components-core，不改 package.json / lockfile。
 *
 * 环境变量（vite.config 进程，可写在 .env.local，勿提交）：
 *   MARSUN_CORE_LOCAL=1              启用，使用 defaultRelativePath
 *   MARSUN_CORE_LOCAL_PATH=<相对路径>  相对 vite.config.ts 所在目录，优先于 MARSUN_CORE_LOCAL 默认路径
 *
 * 联调前在 core 仓库执行 npm run build（或 watch），alias 指向包根目录，由 package exports 解析 dist。
 */
export function marsunCoreViteAlias(configDir, options = {}) {
  const { defaultRelativePath = '../../marsun_components-core' } = options;

  const raw =
    process.env.MARSUN_CORE_LOCAL_PATH?.trim() ||
    (process.env.MARSUN_CORE_LOCAL === '1' || process.env.MARSUN_CORE_LOCAL === 'true'
      ? defaultRelativePath
      : '');

  if (!raw) return {};

  const coreRoot = path.resolve(configDir, raw);
  const pkgJson = path.join(coreRoot, 'package.json');
  if (!existsSync(pkgJson)) {
    console.warn(`[marsun-core-local] 跳过 alias：未找到 ${pkgJson}`);
    return {};
  }

  console.info(`[marsun-core-local] @hkyhy/marsun-components-core → ${coreRoot}`);
  return {
    '@hkyhy/marsun-components-core': coreRoot,
  };
}
