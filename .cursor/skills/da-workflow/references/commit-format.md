# Commit 格式与 Task 行

> 总控：[../SKILL.md](../SKILL.md) · Task ID 编码：[task-naming](task-naming.md) · 钉表层级：[dingtalk-hierarchy-naming](dingtalk-hierarchy-naming.md)

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
2. **按功能 / 模块切分**（与钉表 Issue 对齐，见下节）— 禁止一把梭
3. 从钉表 / `sync_manifest.yaml` / `da task` 取 **本功能对应** Task ID（禁止用旁路任务吞并钉表独立事项）
4. 编写 summary：说明「为什么」而非罗列文件名
5. `da standards scan` — `.env` 硬拦

## 功能 / 模块切分（与钉表对齐 · 强制）

**一个钉表 depth-2+ Issue ≈ 一条 `sync_manifest` 任务 ≈ 一组原子 commit（可多笔，同一 `Task:`）。**

| 要求                   | 说明                                                                                                                                                                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **先对钉表**           | 开干前查钉表 / Plane：是否已有独立事项（如「为S3接入单点登录」P3.17.3）。有则业务仓须有对应台账 id（如 `S3.3.71`），`note` 写 `Refs: P3.17.3`                                                                                                          |
| **一功能一任务**       | 前端 SSO、后端 JWT、升 core、UserProfileCard、预警字段兼容等 **分列登记**；禁止只挂在「升依赖」或「UI 小改」上                                                                                                                                         |
| **一 commit 一 scope** | `type(scope)` 对应该次 diff 的模块（`auth` / `alerts` / `shell` / `deps`）；无关模块拆开                                                                                                                                                               |
| **跨仓同功能**         | 钉表一项若跨 core + 业务仓：core **功能 + version 同 commit** → CI publish → 业务仓 **功能 + 升 `^` 同 commit**，**各用本仓 Task id**，note 互指钉表代号；禁止独立 `chore(release)` / 为本功能拆 `chore(deps)`（纯跟版除外）                           |
| **禁止**               | 钉表有独立 Issue 却不登记业务仓任务；多模块混一个 commit；用 WIP 旁路任务长期吞并钉表事项；**把细粒度部署/seed 并进钉表大颗粒 note 后用父 id 提交**；**为台账 status/登记单独开 chore(pm)/docs(pm) commit**（须随业务同包，见「台账与业务同 commit」） |
| **大颗粒下增量**       | 新建子任务 + `parent_issue`；`Task:` = 子 id（如 `P3.17.5`），父（`P3.17.4`）仅 `related_tasks` 互指                                                                                                                                                   |

示例（错误 → 正确）：

```
✗ 一条 feat(shell): 升 core + SSO + UserProfileCard + 部署  Task: S3.3.69
✗ core: feat(table): … 后再单独 chore(release): v0.1.37
✗ 业务: chore(deps): 升 core ^0.1.37 后再单独 feat(auth): …

✓ core: feat(table): …（含 version bump；正文 Release: v0.1.37）  Task: P6.3.xx
✓ 业务: feat(auth): 接入 marsun_sso（含 ^core 升版 + lockfile）    Task: S3.3.71  # Refs: P3.17.3
✓ 业务: feat(auth): 侧栏 UserProfileCard                           Task: S3.3.69 或独立任务
✓ 仅跟版、无本仓功能：chore(deps): 升 core ^0.1.x                  Task: …

✗ note 写「105 部署纳入 P3.17.4」后 Task: P3.17.4
✓ 台账 P3.17.5 parent_issue→P3.17.4；Task: P3.17.5
```

### 台账与业务同 commit（强制）

`sync_manifest.yaml` / `milestones.yaml` 的**任务登记、status、note、parent_issue** 等变更，**须与对应业务（或文档）diff 同一 commit**，禁止拆成「先业务 commit、再单独台账 commit」。

| 场景               | 做法                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| 新任务首次落地     | YAML `status: 进行中` + 业务改动 **同包**；CREATE 用 `da standards commit --confirm-plane`（勿无范围 `da pm sync`）                  |
| 本 commit 完成任务 | YAML 先改 `status: 已完成`，**再** `git commit`（与业务同包）；commit 后 `timeline-sync` → `task done`（**勿**再跑无范围 `pm sync`） |
| 未完成             | YAML 保持 `进行中`；`Task: <ID> [WIP]`；勿为「标一下台账」单独提交                                                                   |
| 例外               | **无业务 diff** 的纯台账治理（批量对齐、Archive 壳清理、一次性格对齐）允许独立 `chore(pm)` / `docs(pm)`                              |

```
✗ feat(alerts): … Task: P6.11.35
  再单独 chore(pm): sync_manifest 标已完成

✓ feat(alerts): …（含 sync_manifest status: 已完成）  Task: P6.11.35
  → timeline-sync → task done
```

## 禁止

**三条红线**（见 [ai-native-daily](ai-native-daily.md)）：禁裸 `git commit -m`；正文必有 `Task:`；关单须 `timeline-sync` + `done --confirm`。

- 不提交 `.env`、密钥、临时调试代码
- 不在一条 commit 中混合多个无关模块 / 多个钉表事项
- Task id 与 diff 无关
- 多模块改完只打一个 commit
- 钉表已有 depth-2 Issue，业务仓却无对应 `sync_manifest` 任务
- **日常任务的台账 status/登记单独 commit**（须随业务同包；例外见上表）
- **功能驱动的 core 发版 / 升依赖单独 commit**（须与功能同包；仅跟版的 `chore(deps)` 除外，见「跨仓同功能」）

## meta-repo scope 速查

| scope                 | 用途                                          |
| --------------------- | --------------------------------------------- |
| `docs(arch)`          | README、目录规范、本技能                      |
| `docs(work-record)`   | WorkRecord 事项记录                           |
| `docs(weekly-report)` | WeeklyReport 周报                             |
| `docs(spec)`          | frontend-dev-spec / marsun-arch-doc-spec 镜像 |
| `docs(da-workflow)`   | 本技能文档变更                                |
| `chore(repos)`        | README 仓库表更新                             |
