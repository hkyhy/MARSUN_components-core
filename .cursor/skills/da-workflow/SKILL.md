---
name: da-workflow
description: |
  DA 团队开发总控：@da 规范审查提交、@da pm 进度同步 Plane、六步交付闭环、Task 必填与 AI 归因。
  用户说提交/commit/push/同步 Plane/@da pm/完成开发任务时触发。
  plane_ready 仓库 commit 后须 timeline-sync → task done --confirm → WorkRecord → pm sync PATCH（见 references/plane-timeline.md）。
  与 work-record、weekly-report 互补：本技能管提交与 Plane 交付；work-record 管事项进展；weekly-report 管周期汇总。
---

# DA 开发工作流（marsun_arch 权威源）

> 全局安装入口：`da install-config --all --scope global --ide cursor`（脚本仍在 `~/.cursor/skills/`）  
> 速查：[docs/开发规范速查.md](../../../docs/开发规范速查.md) · 架构：[docs/vibe-guard.md](../../../docs/vibe-guard.md)

与 [work-record](../work-record/SKILL.md)、[weekly-report](../weekly-report/SKILL.md) 关系：

| 技能                                                                                    | 职责                                      |
| --------------------------------------------------------------------------------------- | ----------------------------------------- |
| **本技能**                                                                              | 提交格式、scan、六步 Plane 闭环、`@da pm` |
| [work-record](../work-record/SKILL.md)                                                  | 事项级 WorkRecord 进展（commit 后步骤 5） |
| [weekly-report](../weekly-report/SKILL.md)                                              | 周期周报汇总                              |
| [marsun-arch-doc-spec/repos-commit](../marsun-arch-doc-spec/references/repos-commit.md) | repos 子仓库原子 commit 与检测脚本        |

权威细则：

- Commit 格式：[references/commit-format.md](references/commit-format.md)
- Task ID 与台账登记：[references/task-naming.md](references/task-naming.md)
- 钉钉层级命名：[references/dingtalk-hierarchy-naming.md](references/dingtalk-hierarchy-naming.md)
- 钉表 Module 写保护：[references/plane-dingtalk-module-rules.md](references/plane-dingtalk-module-rules.md)
- Plane 负责人映射：[references/plane-team-assignees.md](references/plane-team-assignees.md)
- Plane 六步闭环：[references/plane-timeline.md](references/plane-timeline.md)
- `@da pm`：[references/pm-sync.md](references/pm-sync.md)
- 可选自动建关 Issue：[references/commit-lifecycle.md](references/commit-lifecycle.md)
- 安全清单：[references/vibe-guard.md](references/vibe-guard.md)

---

## 一、新机 / 新项目

```bash
da install-config --all --scope global --ide cursor
da standards install-hooks
da doctor

da project init          # 规范 + plane/ 台账
# 补 plane/project.yaml + PLANE_API_KEY → da project register --plane-project-id <UUID> --confirm
```

`da pm dry-run` / `sync` 在缺少 `plane/` 时会自动 bootstrap。

---

## 二、提交前（Agent 必做）

```
Task Progress:
- [ ] git diff --stat — 原子性，无无关文件
- [ ] **按功能/模块切分** — 对照钉表 depth-2 Issue；一事项一台账任务一组 commit（见 references/commit-format.md）
- [ ] **plane_pull 取号** — 扫描 snapshot 名称 `S3.3.(\d+)`，`id = max+1`；勿盲信 `meta.next_task_id`；挂 `parent_issue` 到钉表大颗粒（见 references/task-relationships.md）
- [ ] 钉表已有独立事项 → 业务仓已登记对应 id，note 含 Refs: <钉表代号>
- [ ] **钉表大颗粒下的增量** → 新建细粒度 id + `parent_issue`；**禁止**写进父 note「纳入本任务」后用父 id 作 `Task:`（见 task-relationships 硬规则）
- [ ] dry-run 若 CREATE 已有 `plane_issue_id` 的钉表任务 → **硬停止**，勿改并父 note 规避
- [ ] da standards scan — .env 硬拦；密钥/反模式
- [ ] 审查 diff：范围、密钥、反模式（见 vibe-guard）
- [ ] 编写 message：含 Task: / [WIP]；Agent 编辑 → AI-Assisted: true
- [ ] da standards commit 或规范手写 message
```

**修 bug**：遵守全局 rule `minimal-fix`（根因层改、禁止为修而修堆状态文件/抽象层）。

---

## 三、提交后（plane_ready 仓库 · 必做）

用户要求 **提交 / push / 同步 Plane** 且 commit 含 `Task: <ID>` 时，**commit 与 push 之间**补交付时间线。规则见 [`.cursor/rules/03-commit-plane-timeline.mdc`](../../rules/03-commit-plane-timeline.mdc)。

```bash
REPO=<git 根>
TASK=<Task 行 ID>

# 新任务先 CREATE（status 进行中）
PLANE_CI=1 PLANE_CONFIRM_SYNC=1 da pm sync --repo "$REPO"

git commit ...   # Task: $TASK（完成时不带 [WIP]）

da task timeline-sync "$TASK" --repo "$REPO"
da task done "$TASK" --confirm --repo "$REPO"
# WorkRecord 进展（见 work-record/SKILL.md）

# 台账改已完成后再 PATCH
PLANE_CI=1 PLANE_CONFIRM_SYNC=1 da pm sync --repo "$REPO"
```

| 操作                     | 活动区效果                    |
| ------------------------ | ----------------------------- |
| `da pm sync`             | 仅 CREATE/PATCH 任务状态      |
| `da task timeline-sync`  | 补「关联 commit」             |
| `da task done --confirm` | 补「📦 任务交付时间线」完成块 |

**禁止**：仅用 `pm sync` 标 Done 代替 timeline-sync + task done。`project_id` 须裸 UUID。

详文：[references/plane-timeline.md](references/plane-timeline.md)

---

## 四、PM 进度同步（`@da pm`）

团队统一入口：**`@da pm`**（勿对用户宣传 `@project-pm-sync`）。

### 钉表 SSOT（开场必检 · 全项目 · 非仅 S3）

华茂钉钉多维表是 Module 真相源。**Module 名必须跟钉表 `{id}-{name}`（短横线）**；Issue 才用 `{id} · {name}`（中点）。适用于 **每个** plane_ready 仓（P3 / P6 / S1 / S3 等；`my-plane` 除外）。

| 正确（钉表 keeper）        | 错误（会制造重复 Module）      |
| -------------------------- | ------------------------------ |
| `P3.7-企业文件上传…`       | `P3.7 · …` / `M*`              |
| `P6.11-开发规范`           | `P6.11 · 开发规范` / `M*`      |
| `S1.3-…` / `S3.3-功能开发` | `S1.3 · …` / `S3.3 · 功能开发` |

**PM Sync 铁律（当前操作的任意仓库 · 每次必做）**：

1. **先拉** — `plane-pull` / pipeline 内 `plane_pull`（禁止凭旧 snapshot 写入）
2. **dry-run** — `CREATE module = 0`；merged 只 **link** DT keeper
3. **确认后 sync** — 用户明确同意后再 `--confirm-token` / `PLANE_CONFIRM_SYNC`
4. **同步后自检** — 对该 **当前 repo** 跑 `module_health_check.py`（同代号不得 `-`/`·` 双份）；失败 → **禁止**宣称「已同步」

**Agent 硬停止**：dry-run 出现 `CREATE module`、台账写 `milestone: M*`（`my-plane` 除外）、或 Plane Modules 同代号已有 `-` 与 `·` 两行 → **禁止 sync**；先清壳（迁任务到 DT keeper → `(重复·待删)` → Archive）。细则：[plane-dingtalk-module-rules](references/plane-dingtalk-module-rules.md)。

```bash
REPO=.
bash ~/.cursor/skills/project-pm-sync/scripts/pm_pipeline.sh --repo "$REPO" --step collect
# 更新 plane/milestones.yaml + sync_manifest.yaml（只增/改 id，禁止删除）
bash ~/.cursor/skills/project-pm-sync/scripts/pm_pipeline.sh --repo "$REPO" --step plane-dry-run
# 审阅 sync_preview.md；CREATE module 必须为 0；末尾自动 module_health_check
bash ~/.cursor/skills/project-pm-sync/scripts/pm_pipeline.sh --repo "$REPO" --step plane-sync
# 非交互：--confirm-token <token>（用户明确同意后）；sync 后二次 pull + health check
```

硬约束：不得在用户未确认前带 `--confirm-token` sync；不得 Plane DELETE / 删 YAML id；**merged milestone dry-run 须 CREATE module = 0**；**各项目**不得登记 `milestone: M*`（`my-plane` 除外），只挂钉表 `P*.*` / `S*.*`；dry-run 出现 CREATE `M*` / middot Module → **硬停止**；sync 后 health check 失败 → **硬停止**（见 [plane-dingtalk-module-rules](references/plane-dingtalk-module-rules.md)）。

详文：[references/pm-sync.md](references/pm-sync.md)

---

## 五、与其他技能联动

| 技能                                                                                                                 | 联动点                                           |
| -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| [work-record](../work-record/SKILL.md)                                                                               | 六步闭环步骤 5：追加事项进展                     |
| [weekly-report](../weekly-report/SKILL.md)                                                                           | 写周报时采集 git log + sync_manifest             |
| [marsun-arch-doc-spec/repos-commit](../marsun-arch-doc-spec/references/repos-commit.md)                              | repos 子仓库 commit 前 `repo-commit-context.mjs` |
| [task-naming](references/task-naming.md)                                                                             | Task ID 编码与 sync_manifest 登记                |
| [dingtalk-hierarchy-naming](references/dingtalk-hierarchy-naming.md)                                                 | 钉表层级契约、双轨 ID、仓库 milestone 速查       |
| [plane-dingtalk-module-rules](references/plane-dingtalk-module-rules.md)                                             | merged 模块写保护、dry-run 0 CREATE module       |
| [plane-team-assignees](references/plane-team-assignees.md)                                                           | owner → Plane assignee 映射                      |
| [frontend-dev-spec/requirement-workflow](../frontend-dev-spec/references/prompts/requirement-workflow-需求工作流.md) | 需求完成前 commit 闭环检查项                     |

---

## 六、Git 提交（本技能文档变更）

- scope：`docs(da-workflow)` 或 `docs(spec)`
- 仅 add `.cursor/skills/da-workflow/` 路径
- Task 行按 [references/commit-format.md](references/commit-format.md)；无 Plane 任务时可用 `Task: P6.11-{N}`

---

## 七、完成前检查

- [ ] commit message 含 `Task:`；完成时不带 `[WIP]`
- [ ] plane_ready 仓库已执行 timeline-sync + task done（完成任务时）
- [ ] WorkRecord 进展已按事项类型追加（有对应文档时）
- [ ] sync_manifest status 与 commit 语义一致后再 pm sync
- [ ] 对**当前操作的任意仓库**（非仅 QA/S3）：`da pm dry-run` 对 merged milestone **CREATE module = 0**
- [ ] 该仓 sync **之后** `module_health_check` 通过（无同代号 `-`/`·` 双份）
- [ ] 该仓 Plane Modules **无** 同代号 `-`/`·` 双份；误建壳已 `(重复·待删)` Archive
- [ ] 新任务台账含 `owner`、`start_date`、`target_date`（见 plane-team-assignees）
- [ ] Module 名跟钉表 `{id}-{name}`（P3/P6/S1/S3 同规）；Issue 才用 `{id} · {name}`
- [ ] 无 `.env` / 密钥进暂存区
- [ ] Agent 编辑含 `AI-Assisted: true`

---

## 延伸阅读

- [references/commit-format.md](references/commit-format.md) — Conventional Commits + Task 行
- [references/task-naming.md](references/task-naming.md) — Task ID、台账字段与登记 checklist
- [references/dingtalk-hierarchy-naming.md](references/dingtalk-hierarchy-naming.md) — 钉表层级与双轨 ID
- [references/plane-dingtalk-module-rules.md](references/plane-dingtalk-module-rules.md) — 钉表 Module SSOT 与写保护
- [references/plane-team-assignees.md](references/plane-team-assignees.md) — 负责人 Plane 邮箱映射
- [references/plane-timeline.md](references/plane-timeline.md) — 六步交付闭环详文
- [references/pm-sync.md](references/pm-sync.md) — `@da pm` Agent 流程
- [references/commit-lifecycle.md](references/commit-lifecycle.md) — `DA_COMMIT_LIFECYCLE=1` 自动建关
- [references/vibe-guard.md](references/vibe-guard.md) — scan 与安全清单
- [references/skills-sync.md](references/skills-sync.md) — 镜像同步到 repos
