# marsun_components-core 版本号规范

> 维护 `@hkyhy/marsun-components-core` 的 `package.json` version 时必读。业务项目 semver 依赖须与**已发布**版本对齐，见 [component-mapping.md](./component-mapping.md)。

## 升版前必核对（禁止跳号）

工作区 version **不得**相对「上次 Git 提交的 version」或「npm 最新版」一次跳多个 patch（如 0.1.12 → 0.1.21）。

| 来源 | 命令 | 含义 |
|------|------|------|
| 上次 **commit** | `git show HEAD:package.json \| node -e "console.log(JSON.parse(require('fs').readFileSync(0)).version)"` | 台账基准，未 commit 的改动不算 |
| npm **已发布** | `npm view @hkyhy/marsun-components-core version` | 消费者能装到的最新版 |
| 工作区 | `node -p "require('./package.json').version"` | 当前待提交 version |

**下一版建议** = `max(上次 commit 版, npm 最新版)` 的 **patch + 1**（仅发 patch；minor/major 须单独决策并写 release note）。

在 `repos/marsun_components-core` 根目录：

```bash
node scripts/version-check.mjs          # 打印三者 + 建议下一版；异常跳号 exit 1
node scripts/version-check.mjs --apply  # 将工作区 version 设为建议 patch（仍须人工审 diff 后 commit）
```

## 发布顺序

1. `node scripts/version-check.mjs` — 确认 version 合理  
2. `npm run build && npm test`  
3. `git add … && git commit` — `chore(release): v0.1.x`  
4. `npm publish`  
5. 业务项目 `package.json` 改为 `^0.1.x`，`npm install`，commit lockfile（无 `file:` / `link: true`）

## chore(release) commit

- 仅含 version bump、`CHANGELOG`（若有）、与发布相关的 dist 说明  
- 不与功能 commit 混写  
- commit message：`chore(release): v0.1.x`
