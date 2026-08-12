---
name: da-workflow
description: |
  DA 总控：提交/commit/push、同步 Plane、@da pm、开工/收工/day start、AI Native、六步交付闭环、Task 与 AI 归因。细则见 references/（plane-timeline、ai-native-daily、cursor-session-prompt）；事项进展用 work-record，周报用 weekly-report。
---

# DA 开发工作流（marsun_arch 权威源）

> 全局安装入口：`da install-config --all --scope global --ide cursor`（脚本仍在 `~/.cursor/skills/`）  
> 速查：[docs/开发规范速查.md](../../../docs/开发规范速查.md) · 培训：[docs/AI_Native_开发培训手册-20260728.md](../../../docs/AI_Native_开发培训手册-20260728.md) · 安全：[references/vibe-guard.md](references/vibe-guard.md)  
> 全局同规：`~/.cursor/skills/da`（`@da`）

与 [work-record](../work-record/SKILL.md)、[weekly-report](../weekly-report/SKILL.md) 关系：

| 技能                                                                                    | 职责                                      |
| --------------------------------------------------------------------------------------- | ----------------------------------------- |
| **本技能**                                                                              | 提交格式、scan、六步 Plane 闭环、`@da pm` |
| [work-record](../work-record/SKILL.md)                                                  | 事项级 WorkRecord 进展（commit 后步骤 5） |
| [weekly-report](../weekly-report/SKILL.md)                                              | 周期周报汇总                              |
| [marsun-arch-doc-spec/repos-commit](../marsun-arch-doc-spec/references/repos-commit.md) | repos 子仓库原子 commit 与检测脚本        |

权威细则：

- AI Native 日常 / 三条红线 / Vibe 四步 / **会话 Focus 绑定**：[references/ai-native-daily.md](references/ai-native-daily.md)
- **Cursor 会话与提示词（控用量）**：[references/cursor-session-prompt-会话与提示词.md](references/cursor-session-prompt-会话与提示词.md)
- **角色大前提（五维 / 开场收尾 / 复检 SSOT）**：[references/mindset-角色大前提.md](references/mindset-角色大前提.md)
- Task 父子与关系：[references/task-relationships.md](references/task-relationships.md)
- Commit 格式：[references/commit-format.md](references/commit-format.md)
- Task ID 与台账登记：[references/task-naming.md](references/task-naming.md)
- 钉钉层级命名：[references/dingtalk-hierarchy-naming.md](references/dingtalk-hierarchy-naming.md)
- 钉表 Module 写保护：[references/plane-dingtalk-module-rules.md](references/plane-dingtalk-module-rules.md)
- Plane 负责人映射：[references/plane-team-assignees.md](references/plane-team-assignees.md)
- Plane 六步闭环：[references/plane-timeline.md](references/plane-timeline.md)
- `@da pm`：[references/pm-sync.md](references/pm-sync.md)
- 可选自动建关 Issue：[references/commit-lifecycle.md](references/commit-lifecycle.md)
- 安全清单：[references/vibe-guard.md](references/vibe-guard.md)
- **写代码自检与自动化测试门禁**：[references/test-and-selfcheck-写代码自检与测试.md](references/test-and-selfcheck-写代码自检与测试.md)
- **角色循环验证**（按触发表命中才跑：需求/接口/前端/测试；安全条件加查）：[references/role-loop-review-角色循环验证.md](references/role-loop-review-角色循环验证.md)
- **会议会前/会中/会后**：[references/meeting-会议会前会中会后.md](references/meeting-会议会前会中会后.md)

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

## 一·附、每日标准动作

三句话：**任务在 Plane，提交走 DA，AI 是生产力不是玩具。** 详文：[ai-native-daily](references/ai-native-daily.md)。

**无 Focus 时**：先做 [会话 Focus 绑定](references/ai-native-daily.md#21-会话-focus-绑定钉表优先--agent-择优-abc)——锚定钉表后，Agent **择优推荐** A 认领 / B 子工作项 / C 添加关系（对齐 Plane「添加子工作项」「添加关系」），用户确认后再编码。禁止静默建单。

```bash
da day start
# 无 Focus → AskQuestion 确认 ABC（推荐项高亮）
da task use <ID>   # 或登记子任务/关系后 use 新 id
# ... 编码 ...
da standards scan
da standards commit --yes --subject "type(scope): 描述" --task <ID>
da task timeline-sync <ID> --repo .
da task done <ID> --confirm --repo .
da day close --confirm
```

**三条红线**：禁裸 `git commit -m`；正文必有 `Task:`；关单必须 `timeline-sync` + `done --confirm`。

**Module 选择（ephemeral / my-plane）**：拿不准 → AskQuestion；按 [task-naming · P6 Module 分工](references/task-naming.md#p6-module-分工防乱挂)（P6.8 产品 UI · P6.9 TOS · P6.11 arch 规范 · P6.12 周报工具）；**禁止**静默采用推荐项或把产品/TOS 卡塞进 P6.12。

## 二、提交前（Agent 必做）

```
Task Progress:
- [ ] git diff --stat — 原子性，无无关文件
- [ ] **按功能/模块切分** — 对照钉表 depth-2 Issue；一事项一台账任务一组 commit（见 references/commit-format.md）
- [ ] **台账同包** — `sync_manifest` 登记/status 与业务 diff 同一 commit；禁止事后单独 chore(pm) 只改台账（见 commit-format「台账与业务同 commit」）
- [ ] **plane_pull 取号** — 扫描 `{module}.(\d+)`；`id = max+1`（空则 `.1`；见 dingtalk-hierarchy-naming）；勿盲信 `meta.next_task_id`；挂 `parent_issue`
- [ ] 钉表已有独立事项 → 业务仓已登记对应 id，note 含 Refs: <钉表代号>
- [ ] **钉表大颗粒下的增量** → 新建细粒度 id + `parent_issue`；**禁止**写进父 note「纳入本任务」后用父 id 作 `Task:`（见 task-relationships 硬规则）
- [ ] dry-run 若 CREATE 已有 `plane_issue_id` 的钉表任务 → **硬停止**，勿改并父 note 规避
- [ ] **测试门禁** — 前端相关 vitest / 后端契约用例本人已跑通（见 [test-and-selfcheck](references/test-and-selfcheck-写代码自检与测试.md)）
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

# 新任务先 CREATE（YAML 进行中已与业务同批改动）
PLANE_CI=1 PLANE_CONFIRM_SYNC=1 da pm sync --repo "$REPO" --tasks "$TASK"

git commit ...   # Task: $TASK（含台账 YAML；完成时不带 [WIP]，且 status 已为已完成）

da task timeline-sync "$TASK" --repo "$REPO"
da task done "$TASK" --confirm --repo "$REPO"
# WorkRecord 进展（见 work-record/SKILL.md）

# PATCH 对齐 Plane（勿再单独 git commit 改台账）
PLANE_CI=1 PLANE_CONFIRM_SYNC=1 da pm sync --repo "$REPO" --tasks "$TASK"
```

| 操作                     | 活动区效果                    |
| ------------------------ | ----------------------------- |
| `da pm sync`             | 仅 CREATE/PATCH 任务状态      |
| `da task timeline-sync`  | 补「关联 commit」             |
| `da task done --confirm` | 补「📦 任务交付时间线」完成块 |

**禁止**：仅用 `pm sync` 标 Done 代替 timeline-sync + task done。`project_id` 须裸 UUID。

**marsun_arch Plane 归属硬规则**：`plane/project.yaml` 的 `project_id` **必须**等于 `meta.required_plane_project_id`（P6 `f7ed0394-…`）。knowledge-qa / 其它仓文档合入 **禁止**改绑到 S1（`934b5818-…`）或其它项目；`da pm` preflight / `da doctor` 会硬拦。

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

- [ ] 当日有 Focus（`da task use`）；习惯上同时只 Focus 一个；开工时若无 Focus 已按钉表 **ABC 择优**绑定（认领/子工作项/添加关系）并经用户确认
- [ ] commit message 含 `Task:`；完成时不带 `[WIP]`
- [ ] 完成任务时 **台账 `status: 已完成` 已与业务同 commit**（禁止事后单独改台账）
- [ ] plane_ready 仓库已执行 timeline-sync + task done（完成任务时；关单两步齐）
- [ ] WorkRecord 进展已按事项类型追加（有对应文档时）
- [ ] sync_manifest status 与 commit 语义一致后再 pm sync PATCH（不再另开 git）
- [ ] 对**当前操作的任意仓库**（非仅 QA/S3）：`da pm dry-run` 对 merged milestone **CREATE module = 0**
- [ ] 该仓 sync **之后** `module_health_check` 通过（无同代号 `-`/`·` 双份）
- [ ] 该仓 Plane Modules **无** 同代号 `-`/`·` 双份；误建壳已 `(重复·待删)` Archive
- [ ] 新任务台账含 `owner`、`start_date`、`target_date`、`milestone`；层级增量另含 `parent_issue` + note `Refs:`/`related_tasks:`（`validate_manifest` 硬拦缺字段；见 task-relationships / plane-team-assignees）
- [ ] Module 名跟钉表 `{id}-{name}`（P3/P6/S1/S3 同规）；Issue 才用 `{id} · {name}`（**禁止**标题塌成父级 `.1`）
- [ ] Plane 详情：非「无模块」；有父项/关系时 UI「父项」「添加关系」可见（对照 task-relationships 核对清单）
- [ ] 无 `.env` / 密钥进暂存区；未向 AI 喂密钥/真实用户/未公开经营数据
- [ ] Agent 编辑含 `AI-Assisted: true`
- [ ] 卡壳 ≥30min 且可复用：已写 `.skills/draft/` 或对应 skill reference（见 ai-native-daily）

---

## 延伸阅读

- [references/ai-native-daily.md](references/ai-native-daily.md) — 每日动作、红线、Vibe 四步
- [references/test-and-selfcheck-写代码自检与测试.md](references/test-and-selfcheck-写代码自检与测试.md) — 前后端测试门禁 + 加强自检
- [references/role-loop-review-角色循环验证.md](references/role-loop-review-角色循环验证.md) — 角色循环验证（§1 触发表 + 安全 §2.5 条件加查）
- [references/meeting-会议会前会中会后.md](references/meeting-会议会前会中会后.md) — 会议三段规范
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
- [docs/AI_Native_开发培训手册-20260728.md](../../../docs/AI_Native_开发培训手册-20260728.md) — 培训全文（含考核，人读）
