# da-workflow 镜像同步（单向 shared）

## 规范类 skill 总览

| Skill                    | 类型      | shared                                            | 不同步                              | target 原则              |
| ------------------------ | --------- | ------------------------------------------------- | ----------------------------------- | ------------------------ |
| `frontend-dev-spec`      | 规范类    | `SKILL.md` + `references/common` + `prompts`      | `references/business`（local）      | React/antd 业务仓        |
| `backend-dev-spec`       | 规范类    | `SKILL.md` + `references/common` + skills-sync 文 | `references/meta`（仅 marsun_arch） | 写 REST/BFF/OpenAPI 的仓 |
| `da-workflow`            | 工作流    | 整树                                              | —                                   | 多数 plane_ready 仓      |
| meta 报表/PPT/WorkRecord | meta 交付 | —                                                 | 整树不 sync                         | 仅 marsun_arch           |

**禁止**把 frontend/backend 规范默认装进 CLI 仓（如 `devAanalysis`）。细则见各 skill 的 skills-sync 文。

## 分层（da-workflow）

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

- **marsun_arch 权威源**：本目录（Agent 提示词、六步闭环、commit 格式、`ai-native-daily`）
- **全局安装**：`da install-config` 安装的 CLI、hooks、`project-pm-sync` 脚本仍在 `~/.cursor/skills/`；全局 `@da` 与本目录 **同构维护** `references/ai-native-daily.md`
- 改提交/Plane/AI Native 日常流程时**两边都改**（本目录 + `~/.cursor/skills/da`），再 `sync-skills.mjs` 推 da-workflow 到 repos；team-sync 回灌全局 skill 另开任务

### C. 全局 vs 项目 skill 该留什么（防双份常驻）

| 位置                                         | 该留                                                                                                                                                                                                        | 禁止                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `~/.cursor/skills/`                          | `da`、standards/vibe-guard、commit-task-lifecycle、team-week-audit*、华茂/平台导出等 **install 入口**；与项目同名的 frontend/weekly-report/work-record 仅允许 **stub**（短 description + 指向 marsun_arch） | 在全局维护与项目同名的 **长 SKILL + references 整树**；两边各写一份长 `description` |
| marsun_arch / 已 sync 子仓 `.cursor/skills/` | 开发规范、da-workflow、文档/周报/WorkRecord 等 **完整 SSOT**                                                                                                                                                | 把齐套全文、组件细则塞进 YAML `description`（须 ≤400 字短触发，细则放 references）  |
| `~/.cursor/rules/`                           | thin always（安全、CLI、prod-safety 等）；timeline 用 **短指针**，正文以工作区 `.cursor/rules/03-…` 为准                                                                                                    | 与项目 `03-commit-plane-timeline` 各贴一份长六步/五步正文                           |

常驻面预算详见 [cursor-session-prompt-会话与提示词.md](cursor-session-prompt-会话与提示词.md) §6。

## 提交约定

1. shared 变更：marsun_arch 与子仓库**分别** `docs(spec)` commit，不与业务混 commit。
2. **禁止**只在子仓库改 shared 而不 `--pull-from` 回写权威源（本 skill 默认单向 push，子仓库勿改）。
