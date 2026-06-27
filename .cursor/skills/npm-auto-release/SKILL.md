---
name: npm-auto-release
description: >-
  @hkyhy/marsun-components-core 的 npm 自动发布规约。main 分支任意 push（含 PR 合并）
  触发 release.yml：patch 版本、打 tag、npm publish。改 release 流程、回答发布问题、
  或用户问「如何发布/版本号」时使用。
---

# npm 自动发布（marsun-components-core）

## 触发条件（已确认）

**只要 `main` 收到 push，就会尝试发布**（GitHub Actions `push` 事件）：

| 操作 | 是否触发 release |
|------|------------------|
| 直接 commit 并 `git push origin main` | 是 |
| PR 合并到 main（merge / squash / rebase） | 是 |
| 仅本地 commit、未 push | 否（CI 未运行） |
| `chore(release): v*` 机器人版本提交 | 否（防循环） |

Workflow：`.github/workflows/release.yml`

## 自动步骤

1. `npm version patch`（仅改 `package.json` / `package-lock.json`）
2. 提交 `chore(release): vX.Y.Z` 并打 `vX.Y.Z` tag
3. `git push origin main --tags`
4. `npm run typecheck` → `npm run build` → `npm publish`

## Agent 须知

- **不要**在功能 commit 里手动改 `package.json` 的 `version`（除非用户明确要求固定版本策略）；CI 会在 push 后自动 patch。
- 日常开发：正常 commit → push `main` 即可，无需 `npm version`、无需手打 tag。
- 合并 PR 前无需额外发布步骤；合并即 push `main`，release 自动跑。
- 应急重发：Actions 手动运行 **Publish npm**（`.github/workflows/publish.yml`），填写已有 tag。
- Secret：`HKYHY_PACKAGE_PUBLISH`（npm Automation Token，`@hkyhy` scope）。

## 合并后本地同步

release 机器人会向 `main` 追加 `chore(release): v*` 提交。开发者 push 功能后应：

```bash
git pull origin main   # 拉取 CI 写入的版本号
```

## 相关文件

- `.github/workflows/release.yml` — 主发布流水线
- `.github/workflows/publish.yml` — 仅 workflow_dispatch 手动重发
- `README.md` §发布版本（npm）
