# frontend-dev-spec 同步到 repos 子仓库

## 权威源

`marsun_arch/.cursor/skills/frontend-dev-spec/` 为**唯一权威源**。  
`repos/*/.cursor/skills/frontend-dev-spec/` 为镜像副本，供在子仓库单独打开 Cursor 时加载同一套规范。

## 同步方式

在 **marsun_arch 根目录**执行：

```bash
node scripts/sync-frontend-dev-spec.mjs          # 一次性同步
node scripts/sync-frontend-dev-spec.mjs --check  # 检查差异
node scripts/sync-frontend-dev-spec.mjs --watch  # 监听源目录并自动同步
```

目标列表见 `plane/skills-sync.json`（默认：`maoyang_data-asset-system`、`maoyang_ai-project-management-dashboard`、`marsun_components-core`）。

## 自动同步

marsun_arch 已配置 Cursor hook（`.cursor/hooks.json` → `afterFileEdit`）：当 Agent 或 Tab 编辑 `.cursor/skills/frontend-dev-spec/**` 后，会自动运行同步脚本。

## 提交约定

1. 在 marsun_arch 修改 SKILL / references / prompts 后，先跑同步脚本（或由 hook 自动完成）。
2. marsun_arch 与子仓库分别提交：meta-repo 提交规范源；各 `repos/*` 提交镜像更新。
3. **禁止**只在子仓库改镜像而不回写 marsun_arch 权威源。
4. **子仓库 commit 前**运行 `node scripts/repo-commit-context.mjs --repo <name>`：已有 Plane 则在子仓库按台账 `Task:` 提交并 `@da pm sync`；无 Plane 则按脚本 `suggest` / `fallbacks` 提示用户选择（详见 `marsun-arch-doc-spec` → `references/repos-commit.md`）。
