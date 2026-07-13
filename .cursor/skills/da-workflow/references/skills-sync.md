# da-workflow 镜像同步（单向 shared）

## 分层

| 路径                      | 同步策略                                                |
| ------------------------- | ------------------------------------------------------- |
| `SKILL.md`、`references/` | **shared** — marsun_arch 权威源 → 各 repo **单向 push** |

配置见 `plane/skills-sync.json` 中 `da-workflow` 条目。

## 命令（marsun_arch 根目录）

```bash
# 源 → 所有 repos（默认同步全部 skills）
node scripts/sync-skills.mjs

# 仅同步 da-workflow
node scripts/sync-skills.mjs --skill da-workflow

# 仅检查差异
node scripts/sync-skills.mjs --skill da-workflow --check
```

## 工作流

### A. 在 marsun_arch 改 da-workflow

1. 编辑 `.cursor/skills/da-workflow/` 下文件
2. hook 自动 push 到各 repo（或手动跑 sync）
3. marsun_arch `docs(da-workflow)` commit → 各 repo 镜像 `docs(spec)` commit

### B. 与全局 `~/.cursor/skills/da` 的关系

- **marsun_arch 权威源**：本目录（Agent 提示词、六步闭环、commit 格式）
- **全局安装**：`da install-config` 安装的 CLI、hooks、`project-pm-sync` 脚本仍在 `~/.cursor/skills/`
- 改提交/Plane 流程时**优先改本目录**，再 `sync-skills.mjs` 推到 repos

## 提交约定

1. shared 变更：marsun_arch 与子仓库**分别** `docs(spec)` commit，不与业务混 commit。
2. **禁止**只在子仓库改 shared 而不 `--pull-from` 回写权威源（本 skill 默认单向 push，子仓库勿改）。
