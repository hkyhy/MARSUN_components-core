# 钉表 Module 写保护契约

> 与 [dingtalk-hierarchy-naming](dingtalk-hierarchy-naming.md)、[pm-sync](pm-sync.md)、[plane-team-assignees](plane-team-assignees.md) 配套。  
> 实现：`~/.cursor/skills/platform-doc-plane-sync/scripts/sync_plane.py`

## SSOT 原则（Agent 必背）

华茂 AI 多维表格（钉钉 Notable）poll 到 Plane 的 **Module / Issue 行是 SSOT**。

| 对象                      | 钉表 poll 写入                                                                    | `da pm sync` 允许                                                 |
| ------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| depth-1 Module            | 名称 `{id}-{name}`（**短横线 `-`**）；`external_id` = `dev-aanalysis:module:DT-*` | **仅** link 子任务；**禁止** CREATE / PATCH 名称 / 改 external_id |
| depth-2+ Issue（PM 台账） | 可选由 poll 创建 `DT-*` 行                                                        | CREATE/PATCH `{prefix}:task:{id}`；须写 owner + 起止日期          |
| PM 里程碑 Work Item       | 钉表 Module 行即模块，**不**另建 `{id} · {name}` 里程碑 WI                        | `origin: merged` 时 **跳过** milestone WI CREATE                  |

**看见 Plane Modules 出现同代号两行（一条 `-`、一条 `·`）= 违规回潮。** 立刻停 sync，按下方清壳 checklist 合并到钉表 keeper，**禁止**再 CREATE。

## milestones.yaml 登记（merged）

```yaml
- id: S3.3 # 与钉表 depth-1 代号一致
  name: 功能开发
  origin: merged # 必填 — 触发写保护
  dingtalk:
    project_record_id: KGXjeyMTcu # 钉表 recordId（无 DT- 前缀）
  status: 进行中
  owner: 黄金芳
  plan_date: '2026-06-30'
```

**禁止**：

- 登记 `M001` / `M002` 等历史 milestone id（会 CREATE 重复 Module）
- `origin: merged` 但未填 `dingtalk.project_record_id`
- 期望 sync 把 Module 名改成 `{id} · {name}`（那是 **Issue** 格式；Module 须跟钉表 `{id}-{name}`）

## sync_manifest 登记（任务）

新任务 **必须** 含负责人与计划日期（见 [plane-team-assignees](plane-team-assignees.md)）：

```yaml
- id: S3.3.61
  milestone: S3.3 # 必须是钉表 depth-1，禁止 M*
  name: 示例任务
  status: 进行中
  owner: 黄金芳
  start_date: '2026-07-20'
  target_date: '2026-07-31'
  priority: P1
  kind: feature
```

登记前：`da pm dry-run` 或 `plane-reconcile`，以 Plane 快照为准，**禁止**凭空 CREATE 与钉表同名的 Module。

## dry-run 硬门槛

`plane/sync_preview.md` 中若出现 **CREATE module**，且对应 milestone 为 `origin: merged`：

1. **停止 sync**，不得 `--confirm-token`
2. 检查 `milestones.yaml` 是否误用 `M001`/`M002` 或未绑定 `dingtalk.project_record_id`
3. 检查 Plane 是否已有钉表 Module（`dev-aanalysis:module:DT-*`，名称 `{id}-{name}`）
4. 修复 YAML 或清理误建 Module 后再 dry-run

目标：**CREATE module = 0**（merged 仓库）。

## 名称格式区分（硬规则）

| 层级     | Plane 对象              | 格式            | 分隔符                   | 示例                                                 |
| -------- | ----------------------- | --------------- | ------------------------ | ---------------------------------------------------- |
| depth-1  | **Module**（钉表 SSOT） | `{id}-{name}`   | **短横线 `-`**           | `S3.3-功能开发`、`P3.7-企业文件上传客户端与平台开发` |
| depth-2+ | **Issue**（PM 台账）    | `{id} · {name}` | **中点 `·`**（两侧空格） | `S3.3.15 · 预警页筛选对接`                           |

**禁止**：

- 用 `·` 写 Module 名（`S3.3·功能开发` / `S3.3 · 功能开发`）——会与钉表 `S3.3-功能开发` **并成两个 Module**
- 用 `-` 写 Issue 名（`S3.3.15-预警页…`）——与任务台账显示不一致
- `da pm sync` 对 `origin: merged` milestone **CREATE** 或 **PATCH** Module 名称

历史误建（含 `·` 的空 Module）：迁任务到钉表 keeper → rename `(重复·待删) …` → Plane **Archive**（禁止 DELETE API）。

## 误建 Module 清理（保留任务）

1. `plane_pull` 刷新快照
2. 保留钉表 Module（`external_id` 含 `dev-aanalysis:module:DT-*` **且** 名称 `{id}-{name}`）
3. 误建 Module（常见 `{id} · {name}` / `{prefix}:module:{id}`）下 Work Item：**迁移** link 到钉表 Module UUID，**不删**任务
4. 重复 WI（同名且已有层级 `external_id`）：mark `(重复·待删)` → 勿 DELETE API
5. 空 Module rename `(重复·待删) …` 后 `status=completed` → Plane UI / API **Archive**

S3 仓库脚本：`repos/Agent_QualityAnalysis/plane/scripts/s3_ledger_align.py --merge-modules --archive-dup-modules`

## 台账一次性格对齐（名称 SSOT）

他仓发现 `QA-*` / `S3-N` / `M001-*` 与 Plane 显示 `{S3.3.N}` 混用时：

1. 用旧 `external_id` 定位同一 WI → 从 **Plane 显示名**取层级编号
2. **名称归一化比对**通过后：YAML `id` := 该编号；PATCH `external_id`；`note` 写 `原 id`
3. **禁止**机械按旧数字后缀重编；已对齐行 skip
4. **共享项目**勿抢他仓 `{prefix}:task:{code}`；参考 `repos/marsun_components-core/plane/scripts/core_ledger_align.py`（`foreign_codes`）
5. 参考：`repos/Agent_QualityAnalysis/plane/scripts/s3_ledger_align.py`、maoyang `p37_id_migration.py`

## 全项目通用：只挂钉表 keeper（P / S / 各工程线）

适用范围：**所有**已与钉表 merged 的 Plane 项目与 Module（`P*.*`、`S*.*`、以及后续同结构编码），**不仅** P6。仓库映射见 [task-naming](task-naming.md)。

| 规则        | 说明                                                                                    |
| ----------- | --------------------------------------------------------------------------------------- |
| `milestone` | 必须是钉表 depth-1 编码（如 `P3.7`、`S3.3`、`P6.11`、`S1.3`）                           |
| 新任务      | **只 link** 已有 Module UUID；**禁止** `CREATE module`、禁止 `milestone: M*`            |
| Module 名   | 跟钉表 `{id}-{name}`（短横线）；**禁止**用 Issue 的 `·` 再建同代号 Module               |
| 见空壳      | 活跃 `M*` / `(重复·待删) … · …` / `{id} · {name}` → **禁止再 CREATE**，迁任务 + Archive |

### 「今日回潮」禁令（任意项目）

见空的活跃 `M*`、middot `{id} · {name}`、或 `(重复·待删) …` Module 时：

1. **禁止**再 `CREATE module` / 手工新建同名壳
2. 有任务 → link 到对应钉表 keeper → unlink 壳
3. 空壳 → rename `(重复·待删) …`（若尚未）→ `status=completed` → **Archive**（禁止 Plane DELETE WI/API 清库）

### 清壳 checklist（任意项目 · 速查表全仓）

适用于 [dingtalk-hierarchy-naming](dingtalk-hierarchy-naming.md) 仓库速查：**assets / QA / arch / core / agent**（P3 / S3 / P6 / S1）。**`my-plane` 除外**（维持 `M003-*`）。非仅 S3。

1. `plane_pull` 刷新**该仓库** Plane 快照
2. 枚举 shell `module-issues`；已在 keeper → 仅 unlink；否则 link keeper 再 unlink
3. 同名 / 同 `external_id` 重复 WI：标 `(重复·待删)` Done，**不** DELETE
4. issue 数为 0 → Archive（须 Module `status` 为 completed/cancelled）
5. dry-run 验收：`CREATE module = 0`；活跃 Module **仅** 钉表 `{id}-{name}` keeper
6. **每次 sync 后必须跑** `module_health_check.py --repo .`（pipeline 已自动挂）；失败则未完成同步
7. **禁止**只 Archive 壳、不修脚本、不同步后自检（否则下次 sync 又回潮）

### 脚本硬门槛（全仓）

`sync_preview` / `sync_plane` / `module_health_check`：若计划 **CREATE module** 且 id 匹配 `^M\d+`，或 Module 名含 `·`，或同代号 `-`/`·` 双份 → **fail**，阻止 confirm-token sync。唯一例外：`my-plane` 维持 `M003-*`；**其它仓 / 项目一律禁止**。

## 附录：P6 技术基建上的 M→P6 对照（历史双轨）

同一 Plane 项目（P6 `f7ed0394`）曾并存 DA 旧轨壳与钉表 keeper。清壳时按表 link，**新任务勿再写 `M*`**：

| 误建 / 旧轨 Module     | Keeper（钉表） |
| ---------------------- | -------------- |
| M001 … M008            | P6.1 … P6.8    |
| M010                   | P6.9           |
| M022                   | P6.10          |
| `(重复·待删) P6.x · …` | 对应 `P6.x`    |

P3 / S3 等工程线同理：壳迁到该线钉表 Module（如 `P3.7`、`S3.3`），规则同上。

## 延伸阅读

- [dingtalk-hierarchy-naming](dingtalk-hierarchy-naming.md) — 层级与双轨 ID
- [plane-team-assignees](plane-team-assignees.md) — 负责人映射
- [pm-sync](pm-sync.md) — dry-run / sync 流程
