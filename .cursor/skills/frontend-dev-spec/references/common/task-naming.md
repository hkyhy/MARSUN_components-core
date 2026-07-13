# Plane Task ID 与 Commit 命名

> 台账字段见 `platform-doc-plane-sync/SCHEMA.md`；提交规范见 marsun_arch `repos-commit.md`。  
> 钉钉层级契约与双轨 ID 见 [da-workflow/dingtalk-hierarchy-naming](../../../da-workflow/references/dingtalk-hierarchy-naming.md)。

## Task ID（`sync_manifest.yaml` → `id`）

Plane Work Item 显示为 **`{id} · {name}`**。`id` 须稳定、全局可检索，**与华茂钉钉多维表格层级代号一致**（`P3.2.8`、`S3.3.15` 等）。

### 推荐格式（新任务）

```
{ProjectCode}.{ModuleSeq}.{TaskSeq}[.{SubTaskSeq}]
```

| 字段        | 规则                  | 示例                                    |
| ----------- | --------------------- | --------------------------------------- |
| `milestone` | 钉表 depth-1 模块编码 | `P3.7`、`S3.3`、`P6.11`、`P6.2`、`S1.3` |
| `id`        | depth-2+ 完整层级     | `S3.3.15`、`P3.2.8`、`P6.11.3`          |
| Plane 显示  | `{id} · {name}`       | `S3.3.15 · 预警页筛选对接`              |
| commit      | `Task: S3.3.15`       | 可选 `Refs: S3.3`                       |

**层级契约**（与钉表 / huamao Plane 一致）：

```
depth-0  P3 / S3 / P6 / S1     → Plane Project
depth-1  P3.7 / S3.3 / P6.11   → Plane Module（sync_manifest milestone）
depth-2+ P3.2.1 / S3.3.15      → Plane Issue（sync_manifest id）
```

### 仓库 ↔ 钉钉编码映射

| 短名     | 仓库                              | DingTalk Project | milestone（depth-1）                  | 说明                                        |
| -------- | --------------------------------- | ---------------- | ------------------------------------- | ------------------------------------------- |
| assets   | `repos/maoyang_data-asset-system` | **P3**           | **P3.7** 企业文件上传客户端与平台开发 | 数据资产主业务（原 P3.2 资产管理系统归此）  |
| S3 / QA  | `repos/Agent_QualityAnalysis`     | **S3**           | **S3.3** 功能开发                     | 当前开发阶段统一挂此模块                    |
| arch     | `marsun_arch`                     | **P6**           | **P6.11** 规范                        | frontend-dev-spec / da-workflow 等          |
| core     | `repos/marsun_components-core`    | **P6**           | **P6.2** 组件库                       | npm 组件发布                                |
| agent    | assets 内 AgentHub                | **S1**           | **S1.3** 功能开发 V1.0                | `plane/projects.json` agent 路由            |
| my-plane | `repos/my-plane`                  | —                | —                                     | **例外**：维持 `M003-*`，本次不纳入层级编码 |

登记新任务前：查上表选定 `milestone`；`id` 前缀须与 `milestone` 一致（`S3.3.*` 挂 `milestone: S3.3`）。**先** `da pm dry-run` 拉 Plane 快照，禁止凭空 CREATE 钉表 Module（见 [plane-dingtalk-module-rules](../../../da-workflow/references/plane-dingtalk-module-rules.md)）。

### 任务台账字段（负责人与日期）

| 字段          | 必填 | 说明                                                                                                              |
| ------------- | ---- | ----------------------------------------------------------------------------------------------------------------- |
| `owner`       | 推荐 | 中文姓名；sync 按 [plane-team-assignees](../../../da-workflow/references/plane-team-assignees.md) 映射 Plane 邮箱 |
| `start_date`  | 推荐 | YYYY-MM-DD，Work Item 开始日                                                                                      |
| `target_date` | 推荐 | YYYY-MM-DD，Work Item 截止日                                                                                      |

```yaml
- id: P6.11.6
  milestone: P6.11
  name: 示例任务
  status: 进行中
  owner: 黄金芳
  start_date: '2026-07-10'
  target_date: '2026-07-31'
  priority: P1
  kind: docs
  note: 范围
```

### 与旧格式并存

| 时期                               | 格式                                                  | 处理                    |
| ---------------------------------- | ----------------------------------------------------- | ----------------------- |
| 历史（已 Done / external_id 固定） | `M001-*`、`QA-S3-*`、`M002-S3-*`、`S3-*`              | **禁止 rename**         |
| 新增量                             | `P3.7.*` / `S3.3.*` / `P6.11.*` / `P6.2.*` / `S1.3.*` | 登记 → commit → pm sync |
| my-plane                           | `M003-*`                                              | 维持现状，规范例外      |

**禁止**：同一仓库（my-plane 除外）混用无层级旧 id 与新层级 id。

**marsun_arch 禁止新增 `M001-*`**：`milestones.yaml` 已无 `M001`（DA 旧轨 Module 已清理）；`data-dev/`、规范文档、backend-dev-spec 等元仓库交付一律 `milestone: P6.11` + `id: P6.11.{N}`。误登 `M001-*` 须迁为 `P6.11.*` 并将 Plane 旧 Issue 标 `(重复·待删)`。

### 各仓库新任务起始

```yaml
# Agent_QualityAnalysis — 从 S3.3.49 起（对齐 next_task_id: S3-49）
- id: S3.3.49
  milestone: S3.3
  name: 修复主按钮 primary 文字色
  status: 进行中
  priority: P1
  kind: fix
  tags: [frontend]
  note: 简要说明

# marsun_components-core — 从 P6.2.27 起
- id: P6.2.27
  milestone: P6.2
  name: Filter 组件增强
  status: 进行中

# marsun_arch — 从 P6.11.{N} 起（读 meta.next_task_id；**禁止**新增 M001-*）
- id: P6.11.11
  milestone: P6.11
  name: S3 质量预警 data-service 接口文档
  status: 进行中
  tags: [data-dev, docs, S3]
  note: data-dev/S3智能体接口.md 等元仓库接口/规范文档

# maoyang assets — 从 P3.7.{N} 起
- id: P3.7.1
  milestone: P3.7
  name: FilterTreeSelect 改用 fetchUrl
  status: 进行中

# AgentHub（assets agent 项目）— 从 S1.3.{N} 起
- id: S1.3.1
  milestone: S1.3
  name: Agent 列表页对接
  status: 进行中
```

```text
fix(frontend): restore primary button white label text

Task: S3.3.49
Refs: S3.3
AI-Assisted: true
```

### Agent_QualityAnalysis 历史说明

| 时期                           | Task ID 格式                              | 说明                                                     |
| ------------------------------ | ----------------------------------------- | -------------------------------------------------------- |
| 历史（M002 首批重构，已 Done） | `QA-S3-1` … `QA-S3-14`、`QA-BE-1`、`S3-*` | **勿 rename**，Plane external_id 已固定                  |
| M002 中期增量                  | `M002-S3-15` … `M002-S3-*`                | 已登记条目保持不动                                       |
| **新增量**                     | **`S3.3.*` 起**                           | `milestone: S3.3`；commit `Task: S3.3.{N}`、`Refs: S3.3` |

**登记顺序**：先在 `repos/Agent_QualityAnalysis/plane/sync_manifest.yaml` 新增条目 → 原子 commit → `@da pm sync`。

**Plane orphan 清理（手动）**：Plane 上旧的 `M002-1` … `M002-14`、`M001-1` Issue 与台账重复，在 Plane UI **Cancel/Archive**，勿删 API；勿复用这些序号。

### 外部项目编码（参考）

非华茂钉表管辖项目仍可用自有前缀，但须团队约定且不与上表冲突：

| 示例         | 含义                           |
| ------------ | ------------------------------ |
| `DA-1.10-7e` | DA 模块 · 阶段 · 任务 · 子任务 |
| `C2U-4`      | C2U 模块 · 任务 4              |

### `name`（任务名称）

简短动宾或名词短语，与 commit summary 语义一致，例如：

- `Mem0 边界收尾（freshness + 文档）`
- `RAGFlow 租户 KB 参数 API + Panel 配置页`
- `FilterTreeSelect 改用 fetchUrl 加载部门树`

## Commit message

```
type(scope): {与 name 对齐的简短描述}

Task: {sync_manifest id}
AI-Assisted: true
```

| 部分      | 规则                                  | 示例                                           |
| --------- | ------------------------------------- | ---------------------------------------------- |
| `type`    | Conventional Commits                  | `feat` / `fix` / `docs` / `chore` / `refactor` |
| `scope`   | 业务模块域，与路径一致                | `files`、`agentHub`、`spec`、`pm`              |
| `summary` | 一句话说明「做了什么」                | `consolidate production deploy guide`          |
| `Task:`   | **必须**对应该次 diff 完成的台账 `id` | `Task: S3.3.49`                                |
| `[WIP]`   | 未完成时追加                          | `Task: S3.3.49 [WIP]`                          |

**禁止**：Task id 与 diff 无关；一次 commit 混多个模块；summary 只罗列文件名。

## Commit 与 Plane 同步（必守）

**凡产生 git commit（含单文件 chore/docs），同一任务闭环内须同步 Plane**，不得「只 push 不同步」：

1. `sync_manifest.yaml` 已有对应 `Task:` id（无则先登记）。
2. 该 commit **完成**任务 → 台账 `status: 已完成`；**未完成** → `[WIP]` 且 status 保持进行中。
3. **`@da pm dry-run`** 审 preview → **`@da pm sync`**（或 `sync_plane.py --confirm-token`）。
4. 仅改 `plane/` 台账的 commit 也要 sync，以便 Plane 与 YAML 一致。

plane_ready 仓库完成任务时，还须 `da task timeline-sync` + `da task done --confirm`（见 [da-workflow/plane-timeline](../../../da-workflow/references/plane-timeline.md)）。

例外：仓库尚未 bootstrap Plane（`da pm` exit 3）时先 HITL 补 `project_id`，不得跳过台账编造 Task。

## 新建任务 checklist

1. 查 [仓库映射表](#仓库--钉钉编码映射) 选定 `milestone` 与 `id` 前缀。
2. 梳理 `parent_issue` / `related_tasks`（见 [task-relationships](../../../da-workflow/references/task-relationships.md)）。
3. 在 `sync_manifest.yaml` 新增条目：`id` + `milestone` + `name` + `status: 进行中`。
4. commit 前确认 `Task:` 与本次 diff 对应 id。
5. `@da pm dry-run` → 审 preview → sync。
