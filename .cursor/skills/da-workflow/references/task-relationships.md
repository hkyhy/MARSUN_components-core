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

| 类型             | YAML 字段                                        | Plane 表现                | 何时使用                        |
| ---------------- | ------------------------------------------------ | ------------------------- | ------------------------------- |
| **模块父项**     | `milestone: S3.3` 等                             | Work Item 挂到 Module     | 必填；所有任务                  |
| **业务父 Issue** | `parent_issue: <uuid>`                           | 子工作项（Sub-work item） | 增量任务属于某条产品/模块父需求 |
| **拆分来源**     | `note` 首行 `split_from: <id>`                   | 描述可追溯                | 大任务完成前拆出后续子任务      |
| **前后序**       | `note` 行 `related_tasks: [id, …]`               | 描述 + 活动区评论         | 依赖已完成项、并行 sibling      |
| **阻塞**         | `note` 行 `blocks: <id>` 或 WorkRecord 标 `阻塞` | 人工判断                  | 后端未交付、等联调环境          |

`parent_issue` 填 **Plane Work Item UUID**（非 external_id）。从 `plane/.cache/plane_snapshot.json` 或 Plane UI Issue URL 获取。

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

# 4. dry-run 审 preview → CREATE
PLANE_CI=1 PLANE_CONFIRM_SYNC=1 da pm sync --repo "$REPO"
```

### 决策树

```
新需求 / 新 commit 需登记 Task？
│
├─ 是某已完成 Task 的「剩余工作」？
│   └─ 是 → 新建 id；note 写 split_from: <原 id>；parent_issue 与原任务相同
│
├─ 是某模块页（预警/沙盘/配置…）的专属改动？
│   └─ 是 → parent_issue 挂该模块 Plane 父 Issue（见项目映射表）
│
├─ 是跨模块布局/工程化/智能体基础设施？
│   └─ 是 → parent_issue 挂「UI 设计 / 工程化」类父 Issue
│
├─ 仅依赖里程碑、无更细父 Issue？
│   └─ 只写 milestone；note 写 related_tasks
│
└─ 与多个已完成项都有关？
    └─ parent_issue 选**最贴近产品域**的一个；note 列全 related_tasks
```

### sync_manifest 新任务模板（含关联）

```yaml
- id: S3.3.50
  milestone: S3.3
  parent_issue: 383c0dfb-b497-463e-8ec9-673b183d4d5b # Plane 父 Issue UUID
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

## CREATE 后核对

当前 `da pm sync` **会将任务挂到 Module（milestone）**，`parent_issue` **须通过 Plane API 或 UI 建立子工作项**：

```bash
# 子工作项：PATCH work-items/{child_id}/  body {"parent": "<parent_issue uuid>"}
# 父 Issue UUID 从 plane/.cache/plane_snapshot.json 或 sync_manifest parent_issue 获取
```

CREATE 后若 `plane_snapshot` 中 `parent` 仍为 `None`，Agent 应执行上述 PATCH（或 Plane UI → Add sub-work-item）。

核对清单：

- [ ] Plane 新 Issue 名称 = `{id} · {name}`
- [ ] Module = `milestone` 对应模块（如 `S3.3`）
- [ ] 若 YAML 有 `parent_issue`：Plane 父 Issue 下可见子项（或活动区备注关联）
- [ ] `note` 中 `split_from` / `related_tasks` 与 WorkRecord 进展一致
- [ ] 无重复登记（同一 diff 不拆两个 id）

## Agent_QualityAnalysis 父 Issue 映射（参考）

项目：`plane/project.yaml` → `module_id: 09a31e8b-…`（S3-质量预警｜智能体子项目）

| milestone | parent_issue UUID                      | Plane 父 Issue 名称         | 适用增量任务                                                             |
| --------- | -------------------------------------- | --------------------------- | ------------------------------------------------------------------------ |
| `S3.3`    | `c4e38085-2588-4515-9513-b433618e3412` | 质量预警智能体产品开发-预警 | 预警页专属：筛选、SegmentTabs、列表、图表（如 S3.3.* 预警域）            |
| `S3.3`    | `383c0dfb-b497-463e-8ec9-673b183d4d5b` | 初步前端功能UI设计          | 跨模块布局、工程化、智能体 SSE/会话、配置页壳（如 S3.3.* 工程化/智能体） |

台账已对齐为 `S3.3.*`；parent_issue UUID 规则不变。历史 commit 可能仍写旧 `Task: S3-37` / `QA-S3-*`。

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
| parent_issue | 二者均挂 `383c0dfb-…`（初步前端功能UI设计）                              |
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
