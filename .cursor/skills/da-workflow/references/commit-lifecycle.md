# Commit Task Lifecycle（可选）

> 与 [commit-format.md](commit-format.md) 配合：`Task:` / `[WIP]` 规则仍生效。  
> 全局 skill：`~/.cursor/skills/commit-task-lifecycle/SKILL.md`

## 何时使用

- 用户要 **commit 前自动对齐 Plane**，没有 Issue 就建一个
- **单次 commit = 单次 Issue**：commit 完成后自动 `tasks/complete`
- 回放最近几条 commit，补齐 Plane 链路：`da lifecycle replay`

## 启用

```bash
export DA_COMMIT_LIFECYCLE=1
# 或写入 .da/standards.json：
# { "commit": { "lifecycle": true, "require_task": true } }
```

关闭：`DA_COMMIT_LIFECYCLE=0`

## 自动流程（hook）

1. **prepare-commit-msg**：`ensurePlaneTaskForCommit` — 查 Plane live；必要时建 Issue，注入 `Task: <uuid>`
2. **commit-msg**：仍校验 `Task:` / `[WIP]` 格式
3. **post-commit**：`closeEphemeralTaskAfterCommit` — 对本次新建的 Issue 调 `tasks/complete`

**注意**：lifecycle 关单走 TOS，会写交付评论；但若走 **`da pm sync` 标 Done**，仍须 Agent 在 commit 后执行 [plane-timeline.md](plane-timeline.md) 的 **`timeline-sync` + `da task done --confirm`**。

## Agent 手动步骤

```bash
da lifecycle status
da lifecycle ensure .git/COMMIT_EDITMSG   # 编辑 COMMIT_EDITMSG 前（可选）
git commit …
da lifecycle close   # 通常 post-commit 已自动执行
```

## 回放最近 commit（不改 git 历史）

```bash
da lifecycle replay --dry-run --last 5
da lifecycle replay --last 5
```

## 与 [WIP] 的关系

- Lifecycle 新建的 Issue 写入 **`Task: <id>`**（无 `[WIP]`），commit 后关闭
- 用户手写 **`Task: <id> [WIP]`** → 不触发 post-commit 自动 Done

## 禁止

- 勿对长期 focus 任务误开 `DA_COMMIT_LIFECYCLE` 后又指望 Issue 保持 open（仅 ephemeral 新建会 auto-close）
- 勿跳过 `Task:` 行；lifecycle 是补齐 Plane，不替代 standards hook
