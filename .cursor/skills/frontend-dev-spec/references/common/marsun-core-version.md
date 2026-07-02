# marsun_components-core 版本号规范

> 维护 `@hkyhy/marsun-components-core` 的 `package.json` version 时必读。业务项目 semver 依赖须与**已发布**版本对齐，见 [component-mapping.md](./component-mapping.md)。

## 核心原则：package.json 与实版一致

**`package.json` 中的版本号必须反映真实可解析版本**，不得滞后、跳号或与 npm 脱节。

| 场景 | `marsun_components-core` 的 `version` | 业务项目的依赖 |
|------|--------------------------------------|----------------|
| feat/fix 开发中 | `= npm 最新`（如 `0.1.17`） | `^` + npm 最新 |
| 准备发版（chore commit 内） | `= npm 最新 + 1 patch` | 仍保持上一版直至 CI publish 成功 |
| CI publish 成功后 | `= npm 最新` | 升为 `^` + 新版本 |

核对命令：

```bash
npm view @hkyhy/marsun-components-core version --registry https://registry.npmjs.org
node -p "require('./package.json').version"   # core 仓库
```

## 升版前必核对（禁止跳号）

工作区 version **不得**相对「npm 最新版」一次跳多个 patch（如 0.1.12 → 0.1.21），**不得**落后于 npm（如 npm 0.1.17 而本地仍 0.1.15）。

| 来源 | 命令 | 含义 |
|------|------|------|
| npm **已发布** | `npm view @hkyhy/marsun-components-core version` | **权威实版** |
| 上次 **commit** | `git show HEAD:package.json` → `.version` | Git 台账 |
| 工作区 | `node -p "require('./package.json').version"` | 待提交 version |

在 `repos/marsun_components-core` 根目录：

```bash
node scripts/version-check.mjs                    # 检查；落后 / 跳号 exit 1
npm run version:sync                              # 对齐 npm 最新（--apply-published）
npm run version:check:apply                       # 写回 npm+1，准备 chore(release) commit
```

## 发布顺序（commit/push 触发，禁止本地 npm publish）

1. **功能开发**：只提交 `feat`/`fix`/`docs` 等，**不修改** `package.json` version（保持 = npm 最新）。
2. **准备发版**：
   ```bash
   node scripts/version-check.mjs          # 确认 = npm 最新
   npm run version:check:apply             # 写回 npm+1（仅改文件，不 publish）
   npm run build && npm test
   git add package.json package-lock.json
   git commit -m "chore(release): v0.1.x"
   git push origin main                    # 单独 push，确保为 push 批次最后一条 commit
   ```
3. **CI 自动**（`marsun_components-core` 的 `release.yml`）：校验 → build/test → 打 tag → `npm publish`。
4. **业务项目**：npm 可见新版本后，`package.json` 改为 `^0.1.x`，`npm install`，commit lockfile。

补发失败版本：GitHub Actions → **Publish npm (manual retry)** → 输入已有 tag。

## chore(release) commit

- 仅含 `package.json` / `package-lock.json` version bump（及 `CHANGELOG` 若有）
- 不与功能 commit 混写在同一 push 批次末尾之外
- commit message 首行须为：`chore(release): v0.1.x`（与 package.json version 一致）
- **禁止**本地 `npm publish`
