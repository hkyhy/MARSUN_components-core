# marsun_components-core 版本号规范

> 维护 `@hkyhy/marsun-components-core` 的 `package.json` version 时必读。业务项目 semver 依赖须与**已发布**版本对齐，见 [component-mapping.md](./component-mapping.md)。

## 核心原则：package.json 与实版一致

**`package.json` 中的版本号必须反映真实可解析版本**，不得滞后、跳号或与 npm 脱节。

| 场景 | `marsun_components-core` 的 `version` | 业务项目的依赖 |
|------|--------------------------------------|----------------|
| 刚发布完毕 | `= npm 最新`（如 `0.1.15`） | `^0.1.15` |
| 开发下一 patch | `= npm 最新 + 1`（如 `0.1.16`） | 仍保持 `^0.1.15` 直至新版的 npm publish |
| CI 自动 release 后 | 本地须 `npm run version:sync` 或 pull 后对齐 | 发布成功后升为 `^0.1.x` |

核对命令：

```bash
npm view @hkyhy/marsun-components-core version --registry https://registry.npmjs.org
node -p "require('./package.json').version"   # core 仓库
```

## 升版前必核对（禁止跳号）

工作区 version **不得**相对「npm 最新版」一次跳多个 patch（如 0.1.12 → 0.1.21），**不得**落后于 npm（如 npm 0.1.15 而本地仍 0.1.13）。

| 来源 | 命令 | 含义 |
|------|------|------|
| npm **已发布** | `npm view @hkyhy/marsun-components-core version` | **权威实版** |
| 上次 **commit** | `git show HEAD:package.json` → `.version` | Git 台账 |
| 工作区 | `node -p "require('./package.json').version"` | 待提交 version |

在 `repos/marsun_components-core` 根目录：

```bash
node scripts/version-check.mjs                    # 检查；落后 / 跳号 exit 1
node scripts/version-check.mjs --apply-published  # 对齐 npm 最新（npm run version:sync）
node scripts/version-check.mjs --apply            # 设为 npm 最新 +1 patch（待发布）
```

## 发布顺序

1. `node scripts/version-check.mjs` — 应为 npm 最新 +1 patch  
2. `npm run build && npm test`  
3. `git commit` — `chore(release): v0.1.x`  
4. `npm publish` 或 tag 触发 CI publish  
5. **发布后** `npm run version:sync`（或 `--apply-published`）确保 `version` 回到 npm 实版  
6. 业务项目 `package.json` 改为 `^0.1.x`，`npm install`，commit lockfile

## chore(release) commit

- 仅含 version bump、`CHANGELOG`（若有）、与发布相关的 dist 说明  
- 不与功能 commit 混写  
- commit message：`chore(release): v0.1.x`
