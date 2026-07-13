# `@da pm` 进度同步

> 用户入口：**`@da pm`**。本文件供 Agent 加载流程；脚本在 `~/.cursor/skills/project-pm-sync/`。  
> 勿对用户宣传 `@project-pm-sync` — 那是内部子 skill。

## 前置

- 已 `da install-config --all --scope global --ide cursor`
- `plane/.env` 或 `~/.cursor/plane.env` 含 `PLANE_API_KEY`
- `plane/project.yaml` 含 `project_id`（缺则 **HITL 停下** 等用户补）

## Agent 按序执行

```bash
REPO=.   # 或用户指定的项目根

bash ~/.cursor/skills/project-pm-sync/scripts/pm_pipeline.sh --repo "$REPO" --step collect
# 阅读 plane/.cache/progress_report.md，更新 plane/milestones.yaml + sync_manifest.yaml（只增/改 id，禁止删除）

bash ~/.cursor/skills/project-pm-sync/scripts/pm_pipeline.sh --repo "$REPO" --step validate

bash ~/.cursor/skills/project-pm-sync/scripts/pm_pipeline.sh --repo "$REPO" --step plane-dry-run
# 审阅 plane/sync_preview.md（仅变动项）

bash ~/.cursor/skills/project-pm-sync/scripts/pm_pipeline.sh --repo "$REPO" --step plane-sync
# 用户明确同意后（非交互）：
bash ~/.cursor/skills/project-pm-sync/scripts/pm_pipeline.sh --repo "$REPO" --step plane-sync --confirm-token <token>
```

## 硬约束

- 不得在用户未确认前带 `--confirm-token` sync
- 不得 Plane DELETE / 删 YAML id
- 有 conflict 须先改 YAML/Plane 或让用户决策
- preflight exit 3 → HITL 停下，用户补 API Key / `project_id`
- **`origin: merged` milestone：dry-run CREATE module 须为 0**（否则停止 sync，见 [plane-dingtalk-module-rules](plane-dingtalk-module-rules.md)）
- **禁止** pm sync 私自 CREATE 与钉表同名的 Module（`M001`/`M002` 等历史 id 已废弃）

## dry-run 门槛（merged 仓库）

| 检查项        | 预期            | 失败处理                                     |
| ------------- | --------------- | -------------------------------------------- |
| CREATE module | **0**           | 改 milestones 绑定 dingtalk；清理误建 Module |
| CREATE 任务   | 仅新登记 id     | 先 reconcile 再登记                          |
| PATCH 模块名  | **0**（merged） | 检查 sync 写保护是否生效                     |

## 负责人与日期

任务 CREATE/PATCH 须写入 Plane assignee 与起止日期。YAML 字段见 [plane-team-assignees](plane-team-assignees.md)：

| 层级      | 字段                                 | sync 行为                                           |
| --------- | ------------------------------------ | --------------------------------------------------- |
| milestone | `owner`、`plan_date`                 | merged 时不 PATCH 钉表 Module；仅 PM 自建模块时生效 |
| task      | `owner`、`start_date`、`target_date` | 写入 Work Item assignee + 日期                      |

```bash
export PLANE_PUSH_ASSIGNEE=1    # YAML 有 owner 时写入 Plane
# 或 PLANE_ASSIGNEE_EMAIL=metacoo@wisilk.com  # 无 owner 兜底
```

## 数据源优先级

| 优先级 | 里程碑                       | 项目/任务                                  |
| ------ | ---------------------------- | ------------------------------------------ |
| 1      | `plane/milestones.yaml`      | `plane/projects.yaml` + `plane/tasks.yaml` |
| 2      | `.agents/**/milestones.yaml` | `.agents/**/projects.yaml` + `tasks.yaml`  |

Plane 同步另需：`plane/project.yaml`、`plane/sync_manifest.yaml`、`plane/taxonomy.yaml`。

## 一键 Pipeline

```bash
# 采集 + 校验 + dry-run（默认，不写 Plane）
bash ~/.cursor/skills/project-pm-sync/scripts/pm_pipeline.sh --repo .

# 含 Excel 导出
bash ~/.cursor/skills/project-pm-sync/scripts/pm_pipeline.sh --repo . --excel

# 全步骤（Plane 一步式 confirm）
bash ~/.cursor/skills/project-pm-sync/scripts/pm_pipeline.sh --repo . --excel --plane
```

## 与六步闭环的关系

- **任务级 sync**（`da pm sync`）：在 commit 闭环内 CREATE/PATCH 台账状态
- **批量进度 sync**（`@da pm` pipeline）：梳理 roadmap → 写 YAML → dry-run → sync

二者不可互相替代。任务完成须先 `timeline-sync` + `task done`，再 PATCH `status: 已完成`。

## 常见问题

| 现象                      | 处理                                                         |
| ------------------------- | ------------------------------------------------------------ |
| preflight exit 3          | 缺 API Key 或 `project_id` → HITL                            |
| 写到错误 Plane 项目       | 更新 `project_id` + `project_url` 后让用户确认               |
| YAML 校验失败含 `@`       | `note` 字段中 `@da` 等须加引号                               |
| dry-run CREATE module > 0 | merged milestone 未绑定钉表 → 见 plane-dingtalk-module-rules |
| Plane 出现重复 P6.1 模块  | pm sync 误 PATCH 钉表 Module 名 → 迁移任务后清理误建 Module  |

完整安全规约：`~/.cursor/skills/platform-doc-plane-sync/PM-SAFETY.md`
