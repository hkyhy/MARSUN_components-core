# marsun-arch-doc-spec 镜像同步（单向 shared + SKILL 映射）

## 分层

| 路径                         | 同步策略                                                 |
| ---------------------------- | -------------------------------------------------------- |
| `references/repos-commit.md` | **shared** — marsun_arch 权威源 ↔ 各 repo **双向**       |
| `SKILL.repos.md`             | **copyAs → `SKILL.md`** — 仅 push，子仓库勿改 `SKILL.md` |

配置见 `plane/skills-sync.json` 中 `marsun-arch-doc-spec`、`da-workflow` 条目。

## 命令（marsun_arch 根目录）

```bash
# 源 → 所有 repos（默认同步全部 skills，含 frontend-dev-spec）
node scripts/sync-skills.mjs

# 仅同步 marsun-arch-doc-spec
node scripts/sync-skills.mjs --skill marsun-arch-doc-spec

# 子仓库改了 repos-commit.md → 拉回权威源，再推到其他 repos
node scripts/sync-skills.mjs --skill marsun-arch-doc-spec --pull-from repos/marsun_components-core

# 仅检查差异
node scripts/sync-skills.mjs --skill marsun-arch-doc-spec --check
```

## 工作流

### A. 在 marsun_arch 改 repos-commit.md

1. 编辑 `.cursor/skills/marsun-arch-doc-spec/references/repos-commit.md`（或 `SKILL.repos.md`）
2. hook 自动 push 到各 repo（或手动跑 sync）
3. marsun_arch `docs(spec)` commit → 各 repo 镜像 `docs(spec)` commit

### B. 在子仓库改 repos-commit.md（单独打开 Cursor 时）

1. 只改 `.cursor/skills/marsun-arch-doc-spec/references/repos-commit.md`
2. 回到 marsun_arch 执行 `--pull-from repos/<name>`
3. 脚本自动 push 到其他 repos
4. marsun_arch + 各 repo 分别 `docs(spec)` commit

## 提交约定

1. shared 变更：marsun_arch 与子仓库**分别** `docs(spec)` commit，不与业务混 commit。
2. **禁止**只在子仓库改 shared 而不 `--pull-from` 回写权威源。
3. `node scripts/repo-commit-context.mjs` 与 WorkRecord 须在 **marsun_arch 根目录**执行；子仓库内直接用 `da pm sync`。
