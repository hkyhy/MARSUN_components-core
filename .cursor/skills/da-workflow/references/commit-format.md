# Commit 格式与 Task 行

> 总控：[../SKILL.md](../SKILL.md) · Task ID 编码：[frontend-dev-spec/task-naming](../../frontend-dev-spec/references/common/task-naming.md) · 钉表层级：[dingtalk-hierarchy-naming](dingtalk-hierarchy-naming.md)

## 格式

```
<type>(<scope>): <summary>

Task: <任务ID>              ← 本 commit **完成**该任务
Task: <任务ID> [WIP]        ← 本 commit **未完成**，仍在进行
AI-Assisted: true           ← Agent 编辑时必填（hook 自动追加）
```

| 部分      | 规则                                                                        |
| --------- | --------------------------------------------------------------------------- |
| `type`    | `feat` / `fix` / `docs` / `chore` / `refactor` / `perf` / `test` / `revert` |
| `scope`   | 业务模块域，与路径一致（`files`、`spec`、`pm`、`arch`）                     |
| `summary` | 一句话说明「为什么」，不罗列文件名                                          |
| `Task:`   | **必须**；对应该次 diff 完成的台账 `id`                                     |
| `[WIP]`   | 未完成时追加；最近 commit 带 `[WIP]` 时不可 `da task done`                  |

## 验收规则

- 仅当该任务**最近一条** commit 为 `Task: <ID>`（无 `[WIP]`）时，才可 `da task done --confirm`
- 交互 `git commit` / `da standards commit` 询问「本次 commit 是否完成该任务」；默认 **N** → 自动写 `[WIP]`

## Agent 步骤（commit 前）

1. `git status` / `git diff --stat` 确认变更范围
2. 拆分无关变更为独立 commit
3. 从分支名、PR、用户消息、`sync_manifest.yaml` 提取 Task ID
4. 编写 summary：说明「为什么」而非罗列文件名
5. `da standards scan` — `.env` 硬拦

## 禁止

- 不提交 `.env`、密钥、临时调试代码
- 不在一条 commit 中混合多个无关模块
- Task id 与 diff 无关
- 多模块改完只打一个 commit

## meta-repo scope 速查

| scope                 | 用途                                          |
| --------------------- | --------------------------------------------- |
| `docs(arch)`          | README、目录规范、本技能                      |
| `docs(work-record)`   | WorkRecord 事项记录                           |
| `docs(weekly-report)` | WeeklyReport 周报                             |
| `docs(spec)`          | frontend-dev-spec / marsun-arch-doc-spec 镜像 |
| `docs(da-workflow)`   | 本技能文档变更                                |
| `chore(repos)`        | README 仓库表更新                             |
