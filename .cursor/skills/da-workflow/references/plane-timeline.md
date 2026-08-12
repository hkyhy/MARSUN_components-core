# Plane 交付六步闭环

> 规则：[03-commit-plane-timeline.mdc](../../../rules/03-commit-plane-timeline.mdc)（always-applied）  
> Commit 格式：[commit-format.md](commit-format.md) · WorkRecord：[work-record/SKILL.md](../../work-record/SKILL.md)  
> **红线**：关单必须 `timeline-sync` + `done --confirm`（只改状态不算完成；见 [ai-native-daily](ai-native-daily.md)）

## 触发

用户说 `提交`、`commit`、`push`、`同步 Plane`、`同步至 plane`、`@da pm`、`plane 同步`，或 Agent 执行 `git commit` / `git push` 时。

`da pm sync` **alone** 只 CREATE/PATCH 任务状态，**不会**写 Plane 活动区「📦 任务交付时间线」评论。必须用 `da task timeline-sync` + `da task done --confirm`。

## 六步顺序（plane_ready 仓库）

1. **新任务**：`plane/sync_manifest.yaml` 登记 `status: 进行中`（**与首次业务 diff 同 commit**）→ `da pm sync` **CREATE**（可在 commit 前，只写 Plane；禁止首次就写 `已完成`）
2. **`git commit`**：业务（或文档）diff **与台账 YAML 同包**；`Task: <ID>`；本 commit 完成任务时 YAML 已为 `已完成` 且**不带** `[WIP]`
3. **`da task timeline-sync <ID>`** — 补「关联 commit」到活动区
4. **`da task done <ID> --confirm`** — 写「📦 任务交付时间线」完成块（**必须在最终 pm sync 标 Done 之前**）
5. **WorkRecord**（有对应大事文档时）：追加进展记录
6. **`da pm sync` PATCH** — 将已写入 commit 的 `status: 已完成` 对齐 Plane（**禁止**为此再开仅改台账的 git commit）

```bash
REPO=<git 根目录>
TASK=<Task 行 ID>

# 新任务：YAML 进行中已进工作区后 CREATE（可与业务同批改动；--tasks 避免全量 WI）
PLANE_CI=1 PLANE_CONFIRM_SYNC=1 da pm sync --repo "$REPO" --tasks "$TASK"

# 完成时：先把 sync_manifest 改已完成，再与业务一起 commit
git commit ...   # Task: $TASK（含台账 YAML；完成时不带 [WIP]）

da task timeline-sync "$TASK" --repo "$REPO"
da task done "$TASK" --confirm --repo "$REPO"
# 若 YAML 已是「已完成」但仍缺完成块：da task done "$TASK" --confirm --repost-timeline --repo "$REPO"
# WorkRecord 进展（见 work-record/SKILL.md）

PLANE_CI=1 PLANE_CONFIRM_SYNC=1 da pm sync --repo "$REPO" --tasks "$TASK"   # PATCH only
```

**台账同包**：见 [commit-format · 台账与业务同 commit](commit-format.md#台账与业务同-commit强制)。
**代理**：`da` / Plane sync 会把 Plane 主机写入 `NO_PROXY`（旁路本机 7890 代理）。

## 活动区效果对照

| 操作                     | 活动区效果                    |
| ------------------------ | ----------------------------- |
| `da pm sync`             | 仅 CREATE/PATCH 任务状态      |
| `da task timeline-sync`  | 补「关联 commit」评论         |
| `da task done --confirm` | 写「📦 任务交付时间线」完成块 |

## 禁止

- 仅用 `pm sync` 把 `status: 已完成` 写入 YAML 并 sync，跳过步骤 3–4
- 业务 commit 后再单独 `chore(pm)` / `docs(pm)` 只改 `sync_manifest` status（须在步骤 2 同包）
- `plane/project.yaml` 的 `project_id` 用 YAML 单引号包裹（须裸 UUID）
- **marsun_arch**：`project_id` ≠ `meta.required_plane_project_id`（P6）→ 硬停止；禁止改绑 S1

## 补历史

对已 push 且缺活动区评论的任务：

```bash
da task timeline-sync <ID> --repo <REPO>
```

若 pm sync 已标 Done，用 TOS 补发 `completed` 事件：

```bash
da task done <ID> --confirm --repost-timeline [--force]
```

（`task done` 若发现台账已完成但 TOS 无 `completed` 事件，也会自动进入补发路径。）

## repos 子仓库

子仓库在**该仓库根**执行上述命令，使用**该仓库** `plane/project.yaml` + `plane/sync_manifest.yaml`。  
commit 前运行 `node scripts/repo-commit-context.mjs --repo <name>`（marsun_arch 根目录）。

详见 [marsun-arch-doc-spec/repos-commit](../../marsun-arch-doc-spec/references/repos-commit.md)。
