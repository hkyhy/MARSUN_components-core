# Plane Task ID 与 Commit 命名

> 台账字段见 `platform-doc-plane-sync/SCHEMA.md`；提交规范见 marsun_arch `repos-commit.md`。

## Task ID（`sync_manifest.yaml` → `id`）

Plane Work Item 显示为 **`{id} · {name}`**。`id` 须稳定、全局可检索，对齐团队远程 Plane 命名习惯。

### 推荐格式

```
{模块编码}-{阶段/版本}-{任务序号}[-{子任务序号}]
```

| 示例 | 含义 |
|------|------|
| `DA-1.10-7e` | DA 模块 · 1.10 阶段 · 任务 7 · 子任务 e |
| `DA-1.10-7d` | 同上阶段相邻子任务 |
| `C2U-4` | C2U 模块 · 任务 4 |
| `P057` | 平台/里程碑前缀 P · 序号 057 |
| `M001-15` | 里程碑 M001 下第 15 项（简式，适合单项目台账） |

**模块编码**：2–5 位大写字母/数字（`DA`、`C2U`、`MY`、`P`）。  
**阶段/版本**：`1.10`、`2.0` 或里程碑号。  
**子任务**：末段单字母/数字（`7a`、`7e`）表示同一父任务拆分。

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

| 部分 | 规则 | 示例 |
|------|------|------|
| `type` | Conventional Commits | `feat` / `fix` / `docs` / `chore` / `refactor` |
| `scope` | 业务模块域，与路径一致 | `files`、`agentHub`、`spec`、`pm` |
| `summary` | 一句话说明「做了什么」 | `consolidate production deploy guide` |
| `Task:` | **必须**对应该次 diff 完成的台账 `id` | `Task: DA-1.10-7e` |
| `[WIP]` | 未完成时追加 | `Task: DA-1.10-7e [WIP]` |

**禁止**：Task id 与 diff 无关；一次 commit 混多个模块；summary 只罗列文件名。

## 新建任务 checklist

1. 在远程 Plane 或 sibling 项目查同类 id 前缀，保持编码一致。
2. 在 `sync_manifest.yaml` 新增条目：`id` + `milestone` + `name` + `status`。
3. commit 前确认 `Task:` 与本次 diff 对应 id。
4. `@da pm dry-run` → 审 preview → sync。
