# repos 子仓库 Git 提交与 Plane 同步

> **镜像副本**：本文件由 marsun_arch 同步至各子仓库 `.cursor/skills/marsun-arch-doc-spec/`（见 [skills-sync.md](skills-sync.md)）。单独打开子仓库时，`repos/<name>` 即当前仓库根；`node scripts/repo-commit-context.mjs` 与 WorkRecord 须在 **marsun_arch 根目录**执行。
>
> 机器可读配置：`plane/repos-commit.json`（marsun_arch）  
> 检测脚本：`node scripts/repo-commit-context.mjs`（marsun_arch 根目录）

## 本地产物（勿提交）

以下路径应写入各 repo 的 `.gitignore`（`plane/` 子目录见 `plane/.gitignore`）：

| 路径                       | 说明                                   |
| -------------------------- | -------------------------------------- |
| `.da/`                     | DA 本地状态（brief、standards 缓存等） |
| `plane/.cache/`            | `plane_pull` 远程快照                  |
| `plane/.sync-state.json`   | sync 指纹                              |
| `plane/reconcile_report.*` | reconcile 报告                         |
| `plane/sync_preview.*`     | sync 预览与 token                      |
| `plane/progress_report.*`  | collect 输出                           |
| `*.tsbuildinfo`            | TypeScript 增量构建缓存                |

## 原则

| 场景                                                               | 做法                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 子仓库 **已有 Plane**                                              | 在**该子仓库**内 commit，使用**该仓库** `plane/project.yaml` + `plane/sync_manifest.yaml`；**按功能/模块拆成多个原子 commit**，每个 commit 的 `type(scope)` 与 `Task:` 对应该次 diff；**须与钉表 depth-2 Issue 对齐**（钉表有独立事项 → 业务仓须有对应台账 id，见 [da-workflow/commit-format](../../da-workflow/references/commit-format.md)） |
| 子仓库 **无 Plane**                                                | **停止**，运行检测脚本，将 `suggest` / `fallbacks` **提示给用户**，由用户选择 bootstrap 本仓库或走 marsun_arch                                                                                                                                                                                                                                 |
| 仅 **skills 镜像**（`frontend-dev-spec` / `marsun-arch-doc-spec`） | marsun_arch 改源 → `node scripts/sync-skills.mjs`（hook 自动）→ 子仓库 `docs(spec)` **单独** commit，不与业务混 commit                                                                                                                                                                                                                         |
| **跨仓库同一功能**（含 `@hkyhy/marsun-components-core`）           | **先 core 提交并发布版本** → 业务仓库 `chore(deps)` 对齐 semver → **marsun_arch 先 WorkRecord 再 docs/spec commit**                                                                                                                                                                                                                            |

## 跨仓库提交顺序（必守）

涉及多个 git 根目录时，按依赖与文档源顺序执行，**禁止**业务仓库先 commit 却引用未发布的 core 版本。

```
1. marsun_components-core（若有 src 变更）
   → bump package.json 版本 → commit → 发布 npm → 其他仓库再改 ^x.y.z

2. 业务子仓库（如 Agent_QualityAnalysis）
   → 按 scope 拆分原子 commit（shared / 模块 / deps 分列）
   → 每 commit：timeline-sync → task done → pm sync PATCH

3. marsun_arch（meta-repo）
   → 先追加 WorkRecord「进展记录」（对应子仓库 commit）
   → 再 docs(spec) / docs(work-record) / plane 台账 等原子 commit
   → 最后 node scripts/sync-frontend-dev-spec.mjs（若改了 shared 规范）
```

| 步骤       | 仓库                           | 说明                                                                    |
| ---------- | ------------------------------ | ----------------------------------------------------------------------- |
| core 优先  | `repos/marsun_components-core` | 仅 pick `src/` + 版本号；不与 `.cursor/skills` 镜像混 commit            |
| 业务模块   | `repos/<业务>`                 | `feat(rca)` / `feat(shared)` 等按目录拆分；`chore(deps)` 单独 commit    |
| WorkRecord | `marsun_arch`                  | **先于** meta-repo 的 WorkRecord 路径 commit                            |
| 规范源     | `marsun_arch`                  | `frontend-dev-spec` shared 变更 → sync 脚本 → 各 repo 可选 `docs(spec)` |

**禁止**：ARCH 未写 WorkRecord 就 commit 子仓库进展；core 未发版就让 QA `package.json` 指向不存在版本。

## 原子提交（Plane 已就绪时必守）

**一个 commit = 一个可独立说明的功能点**，对齐具体模块：

```
feat(files): FilterTreeSelect 改用 fetchUrl 加载部门树

Task: P3.2.1
AI-Assisted: true
```

| 变更路径                       | 建议 scope     |
| ------------------------------ | -------------- |
| `src/components/Files/`        | `files`        |
| `src/components/Review/`       | `review`       |
| `src/components/system/users/` | `system/users` |
| `server/src/routes/agentHub/`  | `agentHub`     |
| `plane/`                       | `pm`           |
| `.cursor/skills/`              | `spec`         |

**禁止**：一次 commit 混入 Files + Review；Task 填与 diff 无关的 id；多模块改完只打一个 commit。

**Task 规则**：

- `Task: <id>` — 本 commit **完成**该台账任务
- `Task: <id> [WIP]` — 本 commit **未完成**，仍在进行
- 每个原子 commit 前，在 `plane/sync_manifest.yaml` 确认/新增与**本次功能**对应的 id

**Plane 交付六步闭环（必守）**：`plane/project.yaml` 已配置时，每个任务闭环内按序执行（详见 [03-commit-plane-timeline.mdc](../../../rules/03-commit-plane-timeline.mdc) 与 [da-workflow/plane-timeline](../../da-workflow/references/plane-timeline.md)）：

0. **新任务关联梳理**：`plane_pull` 取号（`max(S3.3.N)+1`，勿盲信 `next_task_id`）→ 对照台账 + 快照 + WorkRecord → 写入 `parent_issue`（优先钉表 V0.2 大颗粒 UUID）与 `note` 中 `Refs:` / `split_from` / `related_tasks`（见 [da-workflow/task-relationships](../../da-workflow/references/task-relationships.md)）
1. 新任务：`sync_manifest` 登记，`status: 进行中` → `da pm sync` **CREATE**
2. `git commit`（`Task: <id>`，完成时不带 `[WIP]`）
3. `da task timeline-sync <id>` — 活动区「关联 commit」
4. `da task done <id> --confirm` — 活动区「📦 任务交付时间线」
5. WorkRecord 进展追加（有对应大事文档时）
6. `sync_manifest` 改 `status: 已完成` → `da pm sync` **PATCH**

**禁止**：仅用 `pm sync` 标 Done 代替步骤 3–4；禁止只 push 不同步 Plane。

**Commit 后 WorkRecord（必守）**：步骤 5 在 `task done` 之后、最终 `pm sync` 之前，按 [work-record/SKILL.md](../../work-record/SKILL.md) 将本次 commit 追加到对应类型的大事文档「进展记录」。**先判事项类型**（接口对接 / 页面改版 / 工程化），**禁止**将 Husky、布局重构等非 API 进展写入「*接口对接」；无 Git hook，Agent 须显式执行。

### Task ID 与 commit 命名

对齐华茂钉钉层级与远程 Plane 习惯，详见 `da-workflow/references/task-naming.md` 与 `da-workflow/references/dingtalk-hierarchy-naming.md`：

| 格式                | 示例                                                                         |
| ------------------- | ---------------------------------------------------------------------------- |
| **新任务（推荐）**  | `S3.3.49`、`P3.7.1`、`P6.11.*`、`P6.2.27`、`S1.3.1`                          |
| 历史（禁止 rename） | `M001-*`（**仅**已 Done / external_id 固定）、`QA-S3-*`、`M002-S3-*`、`S3-*` |
| marsun_arch 禁止    | **新增** `M001-*`；`data-dev/`、规范文档用 `P6.11.*` + `milestone: P6.11`    |
| my-plane 例外       | `M003-*`（暂不纳入层级编码）                                                 |
| 外部项目参考        | `DA-1.10-7e`、`C2U-4`                                                        |

Plane 显示：`{id} · {name}`。commit summary 与台账 `name` 语义一致，例如：

```
feat(agentHub): Mem0 全链路 ingest（baseline/week/kb/edit/propose）

Task: S1.3.1
AI-Assisted: true
```

Agent_QualityAnalysis 新任务示例：

```
fix(frontend): restore primary button white label text

Task: S3.3.49
Refs: S3.3
AI-Assisted: true
```

## Agent / 开发者：提交前必查

```bash
node scripts/repo-commit-context.mjs --repo maoyang_data-asset-system
node scripts/repo-commit-context.mjs --list
```

| 退出码 | 含义                                                                 |
| ------ | -------------------------------------------------------------------- |
| `0`    | Plane 已就绪 → 按模块拆分 commit，再按需 `@da pm sync`               |
| `2`    | Plane 未就绪 → **展示 suggest/fallbacks，等用户选择**，不得猜测 Task |

## maoyang_data-asset-system 双 Plane 项目

单仓库对应两个 Plane 项目（`plane/projects.json`）：

| Key      | 用途             | project_id                             |
| -------- | ---------------- | -------------------------------------- |
| `assets` | 数据资产管理系统 | `072da70e-664a-48ed-985a-fdd9996ca90e` |
| `agent`  | Agent / AgentHub | `56c1a09f-18aa-4bcf-8462-dd6077eabde3` |

- **默认 sync**：`plane/project.yaml` → **assets**（`da pm sync`）
- **路径路由**：`AgentHub/`、`agentHub/` 路由 → **agent**；其余 → **assets**
- **台账**：Agent 任务标 `plane_project: agent`，milestone **S1.3**（功能开发 V1.0）；id 从 `S1.3.*` 起
- **检测**：`node scripts/repo-commit-context.mjs --repo maoyang_data-asset-system --infer-from-git`
- **Agent sync**：`sync_plane.py --repo . --project-id 56c1a09f-18aa-4bcf-8462-dd6077eabde3 --dry-run`

## Plane 同步顺序（先拉后推）

**`da pm dry-run` = preflight → plane_pull（远程→本地快照）→ reconcile → preview**。正式 sync 前必须先 dry-run，审阅 `plane/sync_preview.md` 与 `plane/reconcile_report.md`：

```bash
cd repos/<repo>
# 1. 拉取 Plane 远程到本地快照，与 YAML 对齐
bash ~/.cursor/skills/project-pm-sync/scripts/pm_pipeline.sh --repo . --step plane-dry-run
# 2. 若有 pull_suggest，先按 reconcile 报告回写 milestones.yaml / sync_manifest.yaml
# 3. 用户确认 preview 后再 sync（非交互：PLANE_CONFIRM_SYNC=1 PLANE_CI=1）
PLANE_CONFIRM_SYNC=1 PLANE_CI=1 bash ~/.cursor/skills/project-pm-sync/scripts/pm_pipeline.sh --repo . --step plane-sync
```

**负责人与日期**（写入 Plane Work Item）：

| 层级   | YAML 字段                                | sync 行为                                                                           |
| ------ | ---------------------------------------- | ----------------------------------------------------------------------------------- |
| 里程碑 | `milestones.yaml` → `owner`、`plan_date` | merged 钉表 Module：**不 PATCH** 名称/日期（SSOT 在钉表）；PM 自建模块时写入 Module |
| 任务   | `owner`、`start_date`、`target_date`     | 写入 Work Item assignee + 起止日期                                                  |

团队映射：[da-workflow/plane-team-assignees](../../da-workflow/references/plane-team-assignees.md) · 可选 `plane/team-assignees.yaml`

```bash
export PLANE_PUSH_ASSIGNEE=1                    # YAML 有 owner 时写入 Plane
export PLANE_ASSIGNEE_EMAIL=metacoo@wisilk.com   # 无 owner 兜底
```

**merged 模块**：dry-run **CREATE module = 0**（见 [plane-dingtalk-module-rules](../../da-workflow/references/plane-dingtalk-module-rules.md)）。

双 Plane（maoyang）：assets 与 agent **分别** dry-run + sync（agent 加 `--project-id 56c1a09f…`）。

## frontend-dev-spec 镜像变更（双向）

| 路径                                                    | 策略                             |
| ------------------------------------------------------- | -------------------------------- |
| `SKILL.md`、`references/common/`、`references/prompts/` | **shared** — 权威源 ↔ repos 双向 |
| `references/business/`                                  | **local** — 各项目自维护         |

**在 marsun_arch 改 shared** → `node scripts/sync-skills.mjs --skill frontend-dev-spec`（hook 自动）→ 各 repo `docs(spec)` commit。

**在子仓库改 shared** → marsun_arch 执行：

```bash
node scripts/sync-skills.mjs --skill frontend-dev-spec --pull-from repos/<name>   # 拉回源并推到其他 repos
```

## marsun-arch-doc-spec 镜像变更（repos-commit.md）

| 路径                                                      | 策略                                                     |
| --------------------------------------------------------- | -------------------------------------------------------- |
| `references/repos-commit.md`、`references/skills-sync.md` | **shared** — 权威源 ↔ repos 双向                         |
| `SKILL.repos.md`                                          | **copyAs → `SKILL.md`** — 仅 push；子仓库勿改 `SKILL.md` |

**在 marsun_arch 改 shared** → `node scripts/sync-skills.mjs --skill marsun-arch-doc-spec`（hook 自动）→ 各 repo `docs(spec)` commit。

**在子仓库改 shared** → marsun_arch 执行：

```bash
node scripts/sync-skills.mjs --skill marsun-arch-doc-spec --pull-from repos/<name>
```

**禁止**只在子仓库改 shared 而不 pull 回权威源。业务部分（`references/business/`）可只留在本 repo。

Task / 命名见 `da-workflow/references/task-naming.md`。

## 完整流程（Plane 已就绪，单功能点一轮）

```bash
cd repos/<repo>
git status && git diff --stat          # 只 pick 本功能相关文件
# 确认 scope + Task id（sync_manifest.yaml）
# 若依赖 @hkyhy/marsun-components-core：package.json 须为 npm 已发布 semver；本地联调用 MARSUN_CORE_LOCAL（见 component-mapping-组件映射.md），禁止 file: / lockfile link
da standards scan
git add <paths> && da standards commit
git push

# 每次 commit 后必做（非「攒一批再 sync」）
bash ~/.cursor/skills/project-pm-sync/scripts/pm_pipeline.sh --repo . --step plane-dry-run
# 更新 plane/sync_manifest.yaml / milestones.yaml（status、新任务 id）
bash ~/.cursor/skills/project-pm-sync/scripts/pm_pipeline.sh --repo . --step plane-sync
# 或 Agent：da pm sync --confirm-token <token>

# WorkRecord：在 marsun_arch 根目录追加进展（路径 WorkRecord/{YYYY.M}/{owner}/）
# 见 .cursor/skills/work-record/SKILL.md
```

## 未配置 Plane 的 repos

运行 `node scripts/repo-commit-context.mjs --repo <name>`，将输出中的 **推荐方案** 原样提示用户：

- **bootstrap-local** — 在本仓库 `da pm collect` + 补 `project_id`，再按模块 commit
- **marsun_arch fallback** — 仅 meta-repo 文档/规范变更

## marsun_arch 元仓库

同样在根目录**按域拆分原子 commit**（规范、PM 台账、文档分开），`Task:` 用根目录 `plane/sync_manifest.yaml`。
