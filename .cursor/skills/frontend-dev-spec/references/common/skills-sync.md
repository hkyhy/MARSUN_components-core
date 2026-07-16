# frontend-dev-spec 镜像同步（双向）

## 分层

| 路径                                                    | 同步策略                                                                                                  |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `SKILL.md`、`references/common/`、`references/prompts/` | **shared** — marsun_arch 权威源 ↔ 各 repo **双向**                                                        |
| `references/business/`                                  | **local** — 各项目业务约定，repo 自维护；push 时仅补缺/更新源有而 target 无的文件，**不删** repo 独有文件 |

配置见 `plane/skills-sync.json` 的 `sharedPaths` / `localPaths`。

## 命令（marsun_arch 根目录）

```bash
# 源 → 所有 repos（默认）
node scripts/sync-frontend-dev-spec.mjs

# 子仓库改了公共部分 → 拉回权威源，再推到其他 repos
node scripts/sync-frontend-dev-spec.mjs --pull-from repos/maoyang_data-asset-system

# 仅检查 shared 差异
node scripts/sync-frontend-dev-spec.mjs --check
node scripts/sync-frontend-dev-spec.mjs --pull-from repos/maoyang_data-asset-system --check
```

## 工作流

### A. 在 marsun_arch 改公共规范

1. 编辑 `.cursor/skills/frontend-dev-spec/` 下 shared 路径
2. hook 自动 push 到各 repo（或手动跑 sync）
3. marsun_arch `docs(spec)` commit → 各 repo 镜像 `docs(spec)` commit

### B. 在子仓库改公共规范（单独打开 Cursor 时）

1. 只改 `references/common/`、`references/prompts/`、`SKILL.md`
2. **不要**只留在子仓库 — 回到 marsun_arch 执行 `--pull-from repos/<name>`
3. 脚本自动 push 到其他 repos
4. marsun_arch + 各 repo 分别 `docs(spec)` commit

### C. 改业务规范

仅改本 repo 的 `references/business/`，**不必** pull 到 marsun_arch（除非要沉淀为团队通用模板）。

## 提交约定

1. shared 变更：marsun_arch 与子仓库**分别** `docs(spec)` commit，不与业务混 commit。
2. **禁止**只在子仓库改 shared 而不 `--pull-from` 回写权威源。
3. commit 前：`node scripts/repo-commit-context.mjs --repo <name>`；Task id 见 [da-workflow/task-naming](../../../da-workflow/references/task-naming.md)（新任务用钉钉层级 `S3.3.*`、`P3.2.*`、`P6.11.*` 等；历史 id 勿 rename）。
4. Plane sync：`da pm dry-run` → 审 preview → sync。

## 自动同步

marsun_arch `.cursor/hooks.json`：编辑**权威源** shared 路径后自动 push 到 targets。  
子仓库内编辑需手动 `--pull-from`。
