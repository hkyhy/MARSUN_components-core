# Plane 任务关联梳理

> 与 [task-naming](task-naming.md)、[dingtalk-hierarchy-naming](dingtalk-hierarchy-naming.md)、[pm-sync](pm-sync.md)、[plane-timeline](plane-timeline.md) 配套。  
> 新任务登记 `sync_manifest.yaml` **之前**执行；`da pm sync` CREATE **之后**核对 Plane 父子关系。

## 为何要做

增量任务很少孤立存在。不梳理关联会导致：

- Plane 上出现与父需求脱节的「孤儿 Issue」
- 同一交付被拆成多个 Task 时，进度与依赖不可追踪
- WorkRecord / 接口文档与台账 Task ID 对不上号

**原则**：YAML 台账除 `milestone`（挂 Module）外，还须标明与**已有 Plane Issue** 的业务父子或前后序关系。

## milestone 字段语义

| 时期       | `milestone` 含义         | 示例                                    |
| ---------- | ------------------------ | --------------------------------------- |
| 历史       | Plane 里程碑编号         | `M001`、`M002`                          |
| **新任务** | 钉表 depth-1 Module 编码 | `S3.3`、`P3.2`、`P6.11`、`P6.2`、`S1.3` |

仓库与 milestone 对照见 [task-naming 映射表](task-naming.md#仓库--钉钉编码映射)。

## 关系类型

| 类型              | YAML 字段                                           | Plane 表现 / UI                           | 何时使用                        |
| ----------------- | --------------------------------------------------- | ----------------------------------------- | ------------------------------- |
| **模块父项**      | `milestone: S3.3` 等                                | Work Item 挂到 Module                     | 必填；所有任务                  |
| **业务父 Issue**  | `parent_issue: <uuid>`                              | **子工作项**（UI：**添加子工作项**）      | 增量任务属于某条产品/模块父需求 |
| **拆分来源**      | `note` 首行 `split_from: <id>`                      | 描述可追溯                                | 大任务完成前拆出后续子任务      |
| **前后序 / 关联** | `note` 行 `related_tasks: [id, …]`（或 `Related:`） | 描述 + Plane **添加关系**（`relates_to`） | 依赖、并行 sibling、非隶属互指  |
| **阻塞**          | `note` 行 `blocks: <id>` 或 WorkRecord 标 `阻塞`    | 人工判断                                  | 后端未交付、等联调环境          |

`parent_issue` 填 **Plane Work Item UUID**（非 external_id）。从 `plane/.cache/plane_snapshot.json` 或 Plane UI Issue URL 获取。

**会话 Focus 绑定**：开工无 Focus 时 Agent 按钉表择优推荐认领 / 子工作项 / 添加关系，见 [ai-native-daily §2.1](ai-native-daily.md#21-会话-focus-绑定钉表优先--agent-择优-abc)。

## 梳理流程（新任务 CREATE 前）

```bash
REPO=<plane_ready 仓库根>
cd "$REPO"

# 1. 拉远程快照
bash ~/.cursor/skills/project-pm-sync/scripts/pm_pipeline.sh --repo . --step plane-dry-run

# 2. 读本地台账 + 快照
#    - plane/sync_manifest.yaml：同 milestone、同 tags、近 30 天 status 变更
#    - plane/.cache/plane_snapshot.json：按 name / external_id 搜父 Issue UUID
#    - WorkRecord（marsun_arch）：同 repo + 模块的大事文档
#    - backend-dev 接口文档：API 序号与页面组件（如有）

# 3. 判定关系（见下方决策树）→ 写入 sync_manifest 新条目

# 4. 仅「整理 Plane / 登记关系」时 dry-run → CREATE；修 bug 关单勿跑
#    CREATE 优先 da standards commit --confirm-plane
# PLANE_CI=1 PLANE_CONFIRM_SYNC=1 da pm sync --repo "$REPO"   # 仅全量/专门整理
```

### 决策树

```
新需求 / 新 commit 需登记 Task？
│
├─ 是某已完成 Task 的「剩余工作」？
│   └─ 是 → 新建 id；note 写 split_from: <原 id>；parent_issue 与原任务相同
│
├─ 是钉表大颗粒（origin:dingtalk / 已有 plane_issue_id）下的增量
│   （部署、seed、联调环境、子功能、修 bug）？
│   └─ 是 → **新建细粒度 id**；parent_issue = 大颗粒 plane_issue_id；
│       note 写 Refs: <大颗粒 id> + related_tasks；
│       父任务 note 仅 related_tasks 互指，**禁止**把增量写进父 note「纳入本任务」
│
├─ 是某模块页（预警/沙盘/配置…）的专属改动？
│   └─ 是 → parent_issue 优先挂 **V0.2 钉表大颗粒**（见下方映射表）；note 写 Refs: S3.3.26 等
│
├─ 是跨模块布局/工程化/智能体基础设施？
│   └─ 是 → parent_issue 挂「UI 设计 / 工程化」类父 Issue（b0a51d21-… / S3-125）
│
├─ 仅依赖里程碑、无更细父 Issue？
│   └─ 只写 milestone；note 写 related_tasks
│
└─ 与多个已完成项都有关？
    └─ parent_issue 选**最贴近产品域**的一个；note 列全 related_tasks
```

### 钉表大颗粒 vs 细粒度（硬规则 · 2026-07-24）

| 角色                                       | 台账表现                                                             | commit `Task:`                |
| ------------------------------------------ | -------------------------------------------------------------------- | ----------------------------- |
| 钉表大颗粒（如 `P3.17.4` UAT）             | `origin: dingtalk` + `plane_issue_id`；**不因一次环境部署改 status** | 仅当整条钉表事项本身收工      |
| 细粒度增量（如 `P3.17.5` 办公室 105 部署） | 新 id；`parent_issue` = 大颗粒 UUID；`Refs:` / `related_tasks`       | **本 commit 必须用细粒度 id** |

**反例（禁止再犯）**：

```yaml
# ✗ 把部署/seed 塞进钉表 UAT 的 note，用父 id 提交
- id: P3.17.4
  note: '…；办公室 105 SSO/seed 部署纳入本任务。'
# commit → Task: P3.17.4

# ✓ 子任务 + 双向关联；commit 用子 id
- id: P3.17.4
  note: |
    …UAT 范围…
    related_tasks: [P3.17.5]
- id: P3.17.5
  parent_issue: <P3.17.4 的 plane_issue_id>
  note: |
    Refs: P3.17.4
    related_tasks: [P3.17.4]
    办公室 Mac(105) SSO 部署与 bootstrap seed

# commit → Task: P3.17.5
```

跨仓同主题（SSO / Assets / QA 各建本仓细粒度）：各仓独立 id，`note` 互指 `Refs: P3.17.4` 与 sibling 任务号；**禁止**三仓都挂同一父 Task 行而不登记本仓 id。

**分配新 id 前**：`plane_pull` → 扫描 snapshot 名称 `{module}.(\d+)` →  
`next = max(1000, max_n) + 1`（**钉表 Module** 预留 1–1000，内含 **10×99 里程碑段**；非钉表自建从 **1001** 起；纯 Plane Module 仍 `max_n+1`）。**勿**盲信 `meta.next_task_id`。号段详文：[dingtalk-hierarchy-naming](dingtalk-hierarchy-naming.md)。

### sync_manifest 新任务模板（含关联）

```yaml
- id: S3.3.50
  milestone: S3.3
  parent_issue: b0a51d21-ae5b-4a73-b3c4-7752ef349cee # Plane 父 Issue UUID（初步前端功能UI设计）
  name: { 动宾短语，与 commit summary 一致 }
  status: 进行中
  priority: P1
  kind: feature
  tags: [frontend, agent]
  note: |
    split_from: S3.3.40
    related_tasks: [S3.3.45, QA-S3-11]
    {根因或范围一句}
```

**note 格式约定**（机器/人可读，同步到 Plane description）：

- 第一行可选 `split_from: <Task id>`
- 第二行可选 `related_tasks: [id1, id2]`（YAML 数组或逗号分隔）
- 第三行起写业务说明（接口序号、文件路径、验收点）

## CREATE 后核对（硬门禁 · 2026-08-08）

`da pm sync`（`sync_plane.py`）在挂 Module 之外会**幂等**写入（`apply_task_relationships` **必须被调用**；仅定义不调用 = 回归缺陷）：

| YAML                                    | Plane API                                | UI                                    |
| --------------------------------------- | ---------------------------------------- | ------------------------------------- |
| `milestone`                             | `link_module_issues`                     | Module（禁止「无模块」）              |
| `parent_issue`                          | `PATCH work-items/{id}/` `{"parent": …}` | **添加子工作项** / 父项               |
| `note` 中 `related_tasks:` / `Related:` | `POST …/relations/` `relates_to`         | **添加关系**                          |
| `owner` + `start_date`/`target_date`    | assignees + dates                        | 负责人 / 起止日期                     |
| 台账 `id`（层级码）                     | Issue.name = `{id} · {name}`             | **禁止**标题塌成 `P6.11.1` / `S3.3.1` |

YAML **未写** `parent_issue` 时不清理 Plane 上已有 parent；`related_tasks` 只**补缺失**关系，不删除多余关系。解析失败打 WARN，不阻断整次 sync。

**`validate_manifest` 硬拦截**（缺则 `da pm sync` 前失败）：

- 非 dingtalk、非已完成任务：必须有 `milestone` / `owner` / `start_date` / `target_date`
- `name` 禁止再带台账 id 前缀（sync 负责拼 `{id} · {name}`）
- 层级 id（`P6.11.99` 等）进行中任务无 `parent_issue` → **WARN**；note 无 `Refs:`/`related_tasks:`/`Related:` → **WARN**

CREATE/UPDATE 后若详情仍为「无模块」、父项空、或「添加关系」下无卡片：先看 sync 日志 WARN → 核对 YAML → **禁止**只改 Done 状态交差。

核对清单：

- [ ] Plane 新 Issue 名称 = `{id} · {name}`（external_id 台账 id 与标题前缀一致）
- [ ] Module = `milestone` 对应模块（如 `S3.3` / `P6.11`），**不是**「无模块」
- [ ] 若 YAML 有 `parent_issue`：父 Issue 下可见子工作项；详情「父项」非空
- [ ] 若 note 有 `related_tasks` / `Related:`：详情「添加关系」可见对应项（对照图：正常卡有「关系 N」）
- [ ] 负责人 / 起止日期非空；完成任务活动区有「📦 任务交付时间线」
- [ ] 无重复壳（同 diff 两个 sequence、无 external_id 的 Done/In Progress）→ 标 `(重复·待删)` 并 Cancel/Archive
- [ ] `note` 中 `split_from` / `related_tasks` 与 WorkRecord 进展一致

## Agent_QualityAnalysis 父 Issue 映射（参考）

项目：`plane/project.yaml` → `module_id: 09a31e8b-…`（S3-质量预警｜智能体子项目）

### V0.2 钉表大颗粒父 Issue（优先挂载）

钉表 depth-2 大颗粒在 Plane 上名称形如 `S3.3.N-质量管理-…V0.2`。**细粒度增量任务**须挂为子工作项（`parent_issue` = 下表 UUID），`note` 写 `Refs: S3.3.N`（钉表代号），**禁止**把大颗粒代号当作细粒度 `Task:` / 台账 `id`。

| 钉表代号（以 Plane 实名为准） | parent_issue UUID                      | Plane 名称（snapshot）                | 适用细粒度增量                 |
| ----------------------------- | -------------------------------------- | ------------------------------------- | ------------------------------ |
| S3.3.26                       | `95d788aa-659e-41bc-a797-b2efe73c7ef6` | S3.3.26-…质量分析模块前端开发V0.2     | 沙盘/FilterTreeSelect/对比筛选 |
| S3.3.27                       | `0bd49306-5b69-4f84-affc-a72005183a63` | S3.3.27-…质量分析模块对比分析开发V0.2 | 对比分析类增量                 |
| S3.3.6                        | `8ab0a122-4bcd-4133-9c14-fe0dbf014aec` | S3.3.6-…质量预警模块前端开发V0.2      | 预警页 API/UI/筛选/矩阵/下钻   |
| S3.3.28                       | `024d2dec-1a56-4ed0-8d7b-a5725304cb5a` | S3.3.28-…质量分析模块联调V0.2         | 沙盘/分析联调类                |

> **注意**：`Refs:` 须与父 Issue **Plane 标题前缀**一致（如挂 `95d788aa-…` 则写 `Refs: S3.3.26`），勿按过时映射表误改成 S3.3.27。取号前再 `plane_pull` 核对实名。

> **取号（2026-07 起）**：钉表 Module 下，未关联里程碑的非段内自建从 **≥1001** 起（`next = max(1000, max(S3.3.N))+1`）；1～1000 供钉表与 Plane「里程碑 / 关联里程碑」段内取号（**≤10 里程碑 × 99 任务**；满则新 Module）。若已有 `S3.3.1005` 等 ≥1001 号，则继续 `max+1`。分配前必须再 `plane_pull`；**禁止**盲信本地 `meta.next_task_id`。详文：[dingtalk-hierarchy-naming](dingtalk-hierarchy-naming.md)。

### 历史产品域父 Issue（仍可用）

| milestone | parent_issue UUID                      | Plane 父 Issue 名称                | 适用增量任务                                  |
| --------- | -------------------------------------- | ---------------------------------- | --------------------------------------------- |
| `S3.3`    | `c4e38085-2588-4515-9513-b433618e3412` | 质量预警智能体产品开发-预警        | 预警页专属（无更贴切的 V0.2 大颗粒时）        |
| `S3.3`    | `b0a51d21-ae5b-4a73-b3c4-7752ef349cee` | 初步前端功能UI设计（Plane S3-125） | 跨模块布局、工程化、智能体 SSE/会话、配置页壳 |

> **失效 UUID**：旧表曾写 `383c0dfb-b497-463e-8ec9-673b183d4d5b`，在 S3 项目内 PATCH parent 会 400；请改挂上表 UI 设计或 V0.2 大颗粒（如 `95d788aa-…` / S3.3.26）。

台账已对齐为 `S3.3.*`；历史 commit 可能仍写旧 `Task: S3-37` / `QA-S3-*`。**同一编号**可能既有历史细粒度又有钉表大颗粒（如本地曾用 `S3.3.73` 做沙盘，Plane 另有 `S3.3.73-…联调V0.2`）——以 Plane UUID + 全名区分，新 id 勿复用 73–88。

| 台账 id（对齐后） | 模块域     | 与增量关系（原 id）                |
| ----------------- | ---------- | ---------------------------------- |
| `S3.3.7`          | 质量预警   | 原 QA-S3-7；S3.3.27/29/34～36 前身 |
| `S3.3.9`          | 根因分析   | 原 QA-S3-9；S3.3.38 Rca 域         |
| `S3.3.10`         | 沙盘       | 原 QA-S3-10                        |
| `S3.3.11`         | 共享 Agent | 原 QA-S3-11；S3.3.37/39/40 浮层    |
| `S3.3.37`         | 智能体 SSE | 原 S3-37；split_from 源            |

## 示例：S3.3.37 拆分为 S3.3.38 / S3.3.39（历史）

| 项           | 说明                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| 背景         | 原 S3-37「智能体 SSE 全量对接」首期完成后拆分                            |
| 动作         | 保留 S3.3.37 `已完成`；增量 S3.3.38（RCA 历史报告）、S3.3.39（会话管理） |
| parent_issue | 二者均挂 `b0a51d21-…`（初步前端功能UI设计 / S3-125）                     |
| note         | `split_from: S3-37`（历史原文可保留）；related 可用对齐后 id             |
| WorkRecord   | 接口进展写入 `S3-质量预警页面接口对接.md`（非改版/工程化文档）           |

**新拆分**应使用 `S3.3.*` id，例如 `S3.3.50` `split_from: S3.3.40`。

## 与六步闭环的衔接

| 步骤         | 关联梳理要求                                     |
| ------------ | ------------------------------------------------ |
| 0（本文件）  | CREATE 前完成 parent_issue / note 关联           |
| 1 CREATE     | `status: 进行中`；禁首次 `已完成`                |
| 2 commit     | `Task:` 与新建 id 一致                           |
| 3–4 timeline | 完成时活动区可提及 `split_from` / 关联父项       |
| 5 WorkRecord | 进展记录写清关联 Task 与接口序号                 |
| 6 PATCH      | 仅改 status，**不删** `parent_issue` / 关联 note |

## 禁止

- 不查台账与快照就 CREATE 孤立 Task
- 为同一交付重复建 id（应 PATCH 原项或写 `split_from`）
- 把 `parent_issue` 写成 milestone id（`S3.3` 不是 UUID）
- 仅 pm sync 标 Done 却未在 Plane 建立与父需求的可见关联（子工作项或描述中的 related_tasks）
- 新任务使用与 `milestone` 不一致的 id 前缀（如 `milestone: S3.3` 却写 `id: S3-50`）
- **把细粒度交付写进钉表大颗粒 `note`（「纳入本任务」）并用父 id 作 `Task:`** — 必须新建子任务 + `parent_issue`
- 因 dry-run 误报「CREATE 已有 `plane_issue_id` 的钉表任务」就改把子工作并进父 note（应硬停止，只 CREATE 无 `plane_issue_id` 的新 id）
- CREATE 后 Plane 显示名若变成 `S3.3.1 …` 而台账 id 是 `S3.3.93`：属历史 ensure 误用 nextChild；须立刻 PATCH 为 `{catalogId} {name}`（`resolveCatalogIssueTitle` 已强制标题头 = catalogId；Agent 仍须核对）
