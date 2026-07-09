# Plane Task ID 与 Commit 命名

> 台账字段见 `platform-doc-plane-sync/SCHEMA.md`；提交规范见 marsun_arch `repos-commit.md`。

## Task ID（`sync_manifest.yaml` → `id`）

Plane Work Item 显示为 **`{id} · {name}`**。`id` 须稳定、全局可检索，对齐团队远程 Plane 命名习惯。

### 推荐格式

```
{模块编码}-{阶段/版本}-{任务序号}[-{子任务序号}]
```

| 示例         | 含义                                                                 |
| ------------ | -------------------------------------------------------------------- |
| `DA-1.10-7e` | DA 模块 · 1.10 阶段 · 任务 7 · 子任务 e                              |
| `DA-1.10-7d` | 同上阶段相邻子任务                                                   |
| `C2U-4`      | C2U 模块 · 任务 4                                                    |
| `P057`       | 平台/里程碑前缀 P · 序号 057                                         |
| `M001-15`    | 里程碑 M001 下第 15 项（简式，适合单项目台账）                       |
| `M002-S3-15` | Agent_QualityAnalysis · 里程碑 M002 · S3 阶段 · 第 15 项（增量任务） |

**模块编码**：2–5 位大写字母/数字（`DA`、`C2U`、`MY`、`P`、`QA`）。  
**阶段/版本**：`1.10`、`2.0`、里程碑号或业务阶段（如 `S3`）。  
**子任务**：末段单字母/数字（`7a`、`7e`）表示同一父任务拆分。

### Agent_QualityAnalysis（`repos/Agent_QualityAnalysis`）

| 时期                           | Task ID 格式                      | 说明                                                           |
| ------------------------------ | --------------------------------- | -------------------------------------------------------------- |
| 历史（M002 首批重构，已 Done） | `QA-S3-1` … `QA-S3-14`、`QA-BE-1` | **勿 rename**，Plane external_id 已固定                        |
| **后续增量（M002 模块内）**    | **`M002-S3-15` 起**               | `milestone: M002`；commit 写 `Task: M002-S3-{N}`、`Refs: M002` |
| 后端增量                       | `M001-BE-2` 起                    | 挂 `milestone: M001`                                           |
| 全新阶段                       | `M003-1` 或 `M003-UAT-1`          | 新开里程碑，不再用 `M002-S3-*`                                 |

**登记顺序**：先在 `repos/Agent_QualityAnalysis/plane/sync_manifest.yaml` 新增条目 → 原子 commit → `@da pm sync`。

**M002 里程碑**：增量 `M002-S3-*` 任务仍写 `milestone: M002`。Plane Module 可保持 **已完成**（`block_regression` 会拦截 YAML 回退 `进行中`）；仅新增 task 条目并 sync 即可。

**Plane orphan 清理（手动）**：Plane 上旧的 `M002-1` … `M002-14`、`M001-1` Issue 与台账重复，在 Plane UI **Cancel/Archive**，勿删 API；勿复用这些序号。

```yaml
# sync_manifest 新任务模板
- id: M002-S3-15
  milestone: M002
  name: 修复主按钮 primary 文字色
  status: 进行中
  priority: P1
  kind: fix
  tags: [frontend]
  note: 简要说明
```

```text
fix(frontend): restore primary button white label text

Task: M002-S3-15
Refs: M002
AI-Assisted: true
```

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
| `Task:`   | **必须**对应该次 diff 完成的台账 `id` | `Task: DA-1.10-7e`                             |
| `[WIP]`   | 未完成时追加                          | `Task: DA-1.10-7e [WIP]`                       |

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

1. 在远程 Plane 或 sibling 项目查同类 id 前缀，保持编码一致。
2. 在 `sync_manifest.yaml` 新增条目：`id` + `milestone` + `name` + `status`。
3. commit 前确认 `Task:` 与本次 diff 对应 id。
4. `@da pm dry-run` → 审 preview → sync。
