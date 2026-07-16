# Plane Task ID 与 Commit 命名

> 总控：[../SKILL.md](../SKILL.md) · 提交规范：[marsun-arch-doc-spec/repos-commit](../../marsun-arch-doc-spec/references/repos-commit.md)  
> 钉钉层级契约与双轨 ID 见 [dingtalk-hierarchy-naming](dingtalk-hierarchy-naming.md)。

## Task ID（`sync_manifest.yaml` → `id`）

Plane **Issue**（任务）显示为 **`{id} · {name}`**（中点 `·`）。`id` 须稳定、全局可检索，**与华茂钉钉多维表格层级代号一致**（`P3.2.8`、`S3.3.15` 等）。

Plane **Module**（depth-1）显示为 **`{id}-{name}`**（短横线 `-`，跟钉表），**禁止**写成 `{id} · {name}`，否则与钉表 Module 并成重复条目（如 `S3.3-功能开发` 与 `S3.3·功能开发`）。

### 推荐格式（新任务）

```
{ProjectCode}.{ModuleSeq}.{TaskSeq}[.{SubTaskSeq}]
```

| 字段        | 规则                  | 示例                                    |
| ----------- | --------------------- | --------------------------------------- |
| `milestone` | 钉表 depth-1 模块编码 | `P3.7`、`S3.3`、`P6.11`、`P6.2`、`S1.3` |
| `id`        | depth-2+ 完整层级     | `S3.3.15`、`P3.2.8`、`P6.11.3`          |
| Module 显示 | `{id}-{name}`         | `S3.3-功能开发`                         |
| Issue 显示  | `{id} · {name}`       | `S3.3.15 · 预警页筛选对接`              |
| commit      | `Task: S3.3.15`       | 可选 `Refs: S3.3`                       |

**层级契约**（与钉表 / huamao Plane 一致）：

```
depth-0  P3 / S3 / P6 / S1     → Plane Project
depth-1  P3.7 / S3.3 / P6.11   → Plane Module（名称用 `-`；sync_manifest milestone）
depth-2+ P3.2.1 / S3.3.15      → Plane Issue（名称用 ` · `；sync_manifest id）
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

登记新任务前：查上表选定 `milestone`；`id` 前缀须与 `milestone` 一致（`S3.3.*` 挂 `milestone: S3.3`）。**先** `da pm dry-run` 拉 Plane 快照：merged 仓库 **CREATE module = 0**；禁止凭空 CREATE 钉表 Module，禁止用 `·` 另建同代号 Module（见 [plane-dingtalk-module-rules](plane-dingtalk-module-rules.md)）。

**Agent 硬停止（全项目）**：dry-run / preview 出现 `CREATE module`，或任何 `M00x` Module / `milestone: M*`（`my-plane` 除外）→ 停止 sync；任务只挂钉表 `P*.*` / `S*.*` keeper，勿再建壳。

### 任务台账字段（负责人与日期）

| 字段          | 必填 | 说明                                                                              |
| ------------- | ---- | --------------------------------------------------------------------------------- |
| `owner`       | 推荐 | 中文姓名；sync 按 [plane-team-assignees](plane-team-assignees.md) 映射 Plane 邮箱 |
| `start_date`  | 推荐 | YYYY-MM-DD，Work Item 开始日                                                      |
| `target_date` | 推荐 | YYYY-MM-DD，Work Item 截止日                                                      |

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

### 与旧格式并存 / 一次性格对齐

| 时期                                                      | 格式                                                  | 处理                                               |
| --------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------- |
| **新任务**                                                | `P3.7.*` / `S3.3.*` / `P6.11.*` / `P6.2.*` / `S1.3.*` | 登记 → commit → pm sync                            |
| 台账仍为旧 id（`QA-*` / `M002-S3-*` / `S3-N` / `M001-*`） | —                                                     | **一次性格对齐**（见下）；日常勿手改 `external_id` |
| my-plane                                                  | `M003-*`                                              | **维持例外，不迁**                                 |

**一次性格对齐（他仓同类同办）**：

1. `plane_pull` 后按 **任务名称** 比对 Plane Issue 显示名（已是 `{层级} …` 的）
2. 台账 `id` := Plane 已有编号；`note` 追加 `原 id: …`；PATCH `external_id`
3. **禁止**机械 `旧后缀 → 新层级.后缀`（hierarchy 可能已按创建序重编号，与旧号不一致）
4. 已完全对齐（YAML id + ext + 显示名一致）→ **skip，不再重迁**
5. Module：钉表 `-` keeper；`·` 误建 → 迁任务后 `(重复·待删)` Archive
6. **共享 Plane 项目**（多仓 `external_id` 前缀，如 `marsun-arch` + `marsun-components-core`）：名称 twin **不得**占用他仓已登记的 `{prefix}:task:{code}`；无可靠本仓 twin 则分配本仓空闲号（例：core `M001-*` → `P6.1.25+`，勿抢 arch 的 `P6.1.1–24`）

**禁止**：同一仓库（my-plane 除外）**新增**无层级旧 id；混用未对齐的旧 id 与新 id。

**marsun_arch 禁止新增 `M001-*`**：元仓库交付一律 `milestone: P6.11` + `id: P6.11.{N}`。

### 各仓库新任务起始

```yaml
# Agent_QualityAnalysis — 读 meta.next_task_id（对齐后为 S3.3.51+）
- id: S3.3.51
  milestone: S3.3
  name: 示例任务
  status: 进行中
  priority: P1
  kind: fix
  tags: [frontend]
  note: 简要说明

# marsun_components-core — 读 meta.next_task_id（对齐后为 P6.3.28+）
- id: P6.3.28
  milestone: P6.3
  name: 示例任务
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

### Agent_QualityAnalysis

台账已按名称对齐 Plane 显示编号为 `S3.1.1` / `S3.3.1`…（脚本 `plane/scripts/s3_ledger_align.py`）。**新增量**一律 `S3.3.*`；commit `Task: S3.3.{N}`、`Refs: S3.3`。

`·` 误建 Module（如 `S3.3 · 功能开发`）已并入钉表 `S3.3-功能开发`；空 Module 于 Plane UI Archive。

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

详见 [commit-format](commit-format.md)。摘要：

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

plane_ready 仓库完成任务时，还须 `da task timeline-sync` + `da task done --confirm`（见 [plane-timeline](plane-timeline.md)）。

例外：仓库尚未 bootstrap Plane（`da pm` exit 3）时先 HITL 补 `project_id`，不得跳过台账编造 Task。

## 新建任务 checklist

1. 查 [仓库映射表](#仓库--钉钉编码映射) 选定 `milestone` 与 `id` 前缀。
2. 梳理 `parent_issue` / `related_tasks`（见 [task-relationships](task-relationships.md)）。
3. 在 `sync_manifest.yaml` 新增条目：`id` + `milestone` + `name` + `status: 进行中`。
4. commit 前确认 `Task:` 与本次 diff 对应 id。
5. `@da pm dry-run` → 审 preview → sync。
