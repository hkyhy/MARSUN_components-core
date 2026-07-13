# 钉表 Module 写保护契约

> 与 [dingtalk-hierarchy-naming](dingtalk-hierarchy-naming.md)、[pm-sync](pm-sync.md)、[plane-team-assignees](plane-team-assignees.md) 配套。  
> 实现：`~/.cursor/skills/platform-doc-plane-sync/scripts/sync_plane.py`

## SSOT 原则

华茂 AI 多维表格（钉钉 Notable）poll 到 Plane 的 **Module / Issue 行是 SSOT**。

| 对象                      | 钉表 poll 写入                                                                   | `da pm sync` 允许                                                 |
| ------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| depth-1 Module            | 名称 `{id} {name}`（空格）；`external_id` = `dev-aanalysis:module:DT-{recordId}` | **仅** link 子任务；**禁止** CREATE / PATCH 名称 / 改 external_id |
| depth-2+ Issue（PM 台账） | 可选由 poll 创建 `DT-*` 行                                                       | CREATE/PATCH `{prefix}:task:{id}`；须写 owner + 起止日期          |
| PM 里程碑 Work Item       | 钉表 Module 行即模块，**不**另建 `{id} · {name}` 里程碑 WI                       | `origin: merged` 时 **跳过** milestone WI CREATE                  |

## milestones.yaml 登记（merged）

```yaml
- id: P6.1 # 与钉表 depth-1 代号一致
  name: 前端组件库与规范
  origin: merged # 必填 — 触发写保护
  dingtalk:
    project_record_id: eXvjEwTAFZ # 钉表 recordId（无 DT- 前缀）
  status: 已完成
  owner: 黄金芳 # 中文名 → sync 映射 Plane assignee
  plan_date: '2026-06-30' # Module start/target 参考（不覆盖钉表已有日期）
```

**禁止**：

- 登记 `M001` / `M002` 等历史 milestone id（会 CREATE 重复 Module）
- `origin: merged` 但未填 `dingtalk.project_record_id`
- 期望 sync 把 Module 名改成 `{id} · {name}`（PM Issue 格式；Module 行用钉表 `{id} {name}`）

## sync_manifest 登记（任务）

新任务 **必须** 含负责人与计划日期（见 [plane-team-assignees](plane-team-assignees.md)）：

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
  note: 范围说明
```

登记前：`da pm dry-run` 或 `plane-reconcile`，以 Plane 快照为准，**禁止**凭空 CREATE 与钉表同名的 Module。

## dry-run 硬门槛

`plane/sync_preview.md` 中若出现 **CREATE module**，且对应 milestone 为 `origin: merged`：

1. **停止 sync**，不得 `--confirm-token`
2. 检查 `milestones.yaml` 是否误用 `M001`/`M002` 或未绑定 `dingtalk.project_record_id`
3. 检查 Plane 是否已有钉表 Module（`dev-aanalysis:module:DT-*`）
4. 修复 YAML 或清理误建 Module 后再 dry-run

目标：**CREATE module = 0**（merged 仓库）。

## 名称格式区分

| 层级 | 钉表 / Plane Module              | PM 台账 Work Item                          |
| ---- | -------------------------------- | ------------------------------------------ |
| 格式 | `P6.1 前端组件库与规范`          | `P6.1.1 · marsun_components-core 独立仓库` |
| 分隔 | `{id}` 与 `{name}` 之间 **空格** | `{id}` 与 `{name}` 之间 **中点 ·**         |

混淆二者会导致 sync 误判「需 PATCH 模块名」并产生 **重复 P6.1 模块**。

## 误建 Module 清理（保留任务）

1. `plane_pull` 刷新快照
2. 保留钉表 Module（含 `dev-aanalysis:module:DT-*` 或 UI 钉表标记）
3. 误建 Module 下 Work Item：**迁移** link 到钉表 Module UUID，**不删**任务
4. 重复 WI（同名且已有 `marsun-arch:task:*`）：mark `(重复·待删)` → `plane_cleanup --apply`
5. 空 Module rename `(重复·待删) …` 后 Archive / cleanup

## M 系列与 P6.x 双轨（DA dev-aanalysis）

同一 Plane 项目（如 P6 技术基建 `f7ed0394`）可能并存：

| 轨道      | Module 示例            | 任务 ext                                                      |
| --------- | ---------------------- | ------------------------------------------------------------- |
| 钉表 SSOT | `P6.4 v1.4 …` + `DT-*` | 可无 ext 或 `marsun-arch:task:*`                              |
| DA 旧轨   | `M004 · v1.4 …` 无 ext | `dev-aanalysis:milestone:M004`、`dev-aanalysis:task:DA-1.4-*` |

**清理**：`M001→P6.1` … `M010→P6.9`、`M022→P6.10`，任务 link 到钉表 Module 后 unlink M 模块；**禁止** pm sync 再 CREATE `M00x` Module。

## 延伸阅读

- [dingtalk-hierarchy-naming](dingtalk-hierarchy-naming.md) — 层级与双轨 ID
- [plane-team-assignees](plane-team-assignees.md) — 负责人映射
- [pm-sync](pm-sync.md) — dry-run / sync 流程
