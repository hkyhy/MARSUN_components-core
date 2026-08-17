# 钉钉层级命名与 Plane 双轨 ID

> 与 [task-naming](task-naming.md)、[task-relationships](task-relationships.md)、[pm-sync](pm-sync.md) 配套。  
> **给人听的通俗版 + 取号示意图**：[dingtalk-hierarchy-取号通俗说明.md](dingtalk-hierarchy-取号通俗说明.md)  
> 实现详文：`repos/my-plane/apps/api/plane/tos/services/dingtalk_sync/README.md`

## 层级契约

华茂 AI 表格（Notable）行名须匹配 `^[A-Z]\d+(\.\d+)*`（见 `hierarchy_format.py`）：

```
depth-0  P3 / S3 / P6 / S1           → Plane Project
depth-1  P3.2 / S3.3 / P6.11        → Plane Module（sync_manifest milestone）
depth-2+ P3.2.1 / S3.3.15           → Plane Issue（sync_manifest id）
```

**禁止**将 depth-1 Module 行重复写成 Issue。

New-schema 列（`智能体名称` / `阶段/子项目` / `任务名称` / `子任务名称`）与 legacy `项目名称` + `父记录` 可在同一 sheet 按行混用；分类逻辑见 my-plane `unified.py`。

## 双轨 Task ID

| 来源       | ID 示例                                    | 管理方                             | 说明                                                    |
| ---------- | ------------------------------------------ | ---------------------------------- | ------------------------------------------------------- |
| 钉表 poll  | `DT-{recordId}`、`dev-aanalysis:task:DT-*` | TOS Celery beat / webhook          | 钉表为 SSOT；**不由** `sync_manifest` 登记              |
| DA pm sync | `S3.3.15`、`my-plane:task:M003-27`         | 各 repo `plane/sync_manifest.yaml` | commit `Task:` 行；`external_id` = `{prefix}:task:{id}` |

合并场景（`origin: merged`）：钉行与 PM 台账绑定后，`id` 须与钉表层级代号一致，以便 `backfill_guard` 校验 Plane 名称与钉行前缀匹配。

### 序号号段（每 depth-1 Module · 2026-07 起）

钉表绑定 Module（有 `dingtalk_project_record_id` / `:module:DT-` / `origin` ∈ `{dingtalk,merged}`）下，depth-2 序号分两段：

| 轨                    | 谁用                                           | 序号                 | 取下一号                             |
| --------------------- | ---------------------------------------------- | -------------------- | ------------------------------------ |
| **钉表 / Plane 段内** | 钉 poll 行名；Plane 新建勾选里程碑或关联里程碑 | **1～1000**（10×99） | 见下「Plane 新建双模式」与里程碑段表 |
| **非段内自建**        | Plane 新建未关联里程碑、`da pm` / CLI          | **≥1001**            | `next = max(1000, max_used) + 1`     |

> **best-effort**：取号无预留；创建/更新时同项目同层级码会软拒绝。`da pm` / CLI：`nextChildIssueCode` 默认 `max(1000, max_used)+1`（≥1001）。

#### Plane 新建双模式（创建弹窗）

`GET /api/tos/projects/.../next-hierarchy-id/?kind=&milestone_slot=`（扫号用 `parse_hierarchy_name().code`，`MD2.2.1` 计入 `D2.2`）：

| 模式                    | 标题建议           | 序号                                                                                                          |
| ----------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------- |
| 勾选「里程碑」          | `M{mod}.{slot} · ` | `slot ∈ {1,101,…,901}` 下一空位；已满 10 → `suggested_overflow_module` + 提示新开 Module                      |
| 不勾选 + 已选关联里程碑 | `{mod}.{n} · `     | `n` 在该段 `(slot+1)…(slot+99)` 取 `max+1`；段满则提示（关联=号段父槽，非 Plane parent；下拉仅 M 前缀规范槽） |
| 不勾选 + 未选里程碑     | `{mod}.{n} · `     | 钉表 Module 仍 **≥1001**；纯 Plane Module 为 `max_used+1`                                                     |

`{mod}` = Module **结构码**（`S3.3` / `D2.2`）：Module 名可带 `M`（如 `MD2.2`→`D2.2`），子 Issue 扫号一律用解析后的 `.code`。

纯 Plane Module（无钉锚点）：未选里程碑时不预留 1000，`next = max_used + 1`（可从 1）；勾选里程碑 / 关联里程碑时仍按 10×99 段建议。

存量已占用的 `<1001` 且非段内规划的 PM 任务**不回迁**。`da pm sync` 细粒度新建默认 **≥1001**（`nextChildIssueCode` floor 1000）。

#### 钉表硬上限（须知会表格维护方）

- **每个 depth-1 Module 下，钉表 depth-2 序号不得超过 1000**（即行名 `S3.3.1`～`S3.3.1000`）。
- 超出须**拆 Module / 新建子项目行**，不得继续在同 Module 下写 `S3.3.1001+` 作为钉表行（`≥1001` 专供 Plane / PM 自建）。
- 华茂 AI 表格（Notable）维护时按此号段规划；同步侧以标题层级码为准。

#### 钉表里程碑段（10 × 99 · 须知会表格维护方）

每 Module 的 1～1000 切成 **10 段 × 100**。**每 Module 最多 10 个钉表里程碑**；每里程碑段内最多 **99 个任务**。

| 段 k（1～10） | 里程碑行（名称加 `M` 前缀） | 任务行                    |
| ------------- | --------------------------- | ------------------------- |
| 1             | `{mod}.1` → `MS3.3.1-…`     | `{mod}.2`～`{mod}.100`    |
| 2             | `{mod}.101` → `MS3.3.101-…` | `{mod}.102`～`{mod}.200`  |
| …             | `{mod}.(k-1)*100+1`         | 随后连续 99 号            |
| 10            | `{mod}.901`                 | `{mod}.902`～`{mod}.1000` |

- 里程碑槽：`slot = (k - 1) * 100 + 1`（k∈1..10）
- 任务槽：同段 `slot+1` … `slot+99`
- **第 11 个里程碑**：勿再写入本 Module；**新开 depth-1 Module**，代号取该 Project 下已有 Module 序号的 **max+1**（例：已有 `S3.1`…`S3.9` → `S3.10-功能开发2`）

示例树：

```
S3-质量预警｜智能体子项目
  S3.1-…
  S3.2-…
  S3.3-功能开发
    MS3.3.1-里程碑名称…
    S3.3.2-任务名称…
    …
    S3.3.99-任务名称…
    S3.3.100-任务名称…
    MS3.3.101-里程碑名称…
    …
    MS3.3.901-里程碑名称…
  S3.4-测试及验证/完善
  …
  S3.9-项目及产品管理
  S3.10-功能开发2          ← S3.3 里程碑已满 10 个后新开
```

实现辅助：`my-plane` `plane/tos/services/milestone_slots.py`（`dingtalk_sync/milestone_slots` 为兼容 re-export）。

## 仓库 ↔ 钉钉编码速查

| 短名     | 仓库                              | Project | milestone | 备注                                    |
| -------- | --------------------------------- | ------- | --------- | --------------------------------------- |
| assets   | `repos/maoyang_data-asset-system` | P3      | P3.7      | 企业文件上传客户端与平台开发            |
| S3 / QA  | `repos/Agent_QualityAnalysis`     | S3      | S3.3      | 功能开发（当前阶段）                    |
| arch     | `marsun_arch`                     | P6      | P6.11     | 规范 / 工程化文档                       |
| core     | `repos/marsun_components-core`    | P6      | P6.2      | 组件库 npm                              |
| agent    | assets AgentHub                   | S1      | S1.3      | `plane/projects.json` agent 路由        |
| my-plane | `repos/my-plane`                  | —       | —         | **例外**：维持 `M003-*`，暂不纳入层级表 |

完整 Task ID 规则与 YAML 模板见 [task-naming](task-naming.md)。

## milestone 字段语义（2026-07 起）

| 时期       | `milestone` 含义         | 示例                    |
| ---------- | ------------------------ | ----------------------- |
| 历史       | Plane 里程碑编号         | `M001`、`M002`          |
| **新任务** | 钉表 depth-1 Module 编码 | `S3.3`、`P3.7`、`P6.11` |

`da pm sync` 将任务挂到与 `milestone` 同名的 Plane Module（或按模块名前缀匹配）。

## 与钉表同步的边界

- **钉→Plane poll**：六字段同步（名称、说明、计划日期、状态、负责人）；不写 `sync_manifest`
- **Plane→钉 backfill**：须有钉 binding；Issue 名称须含层级代号（如 `P6.1.1 …`）
- **DA 客户端新建**：`id` 前缀与 `milestone` 一致；禁止无层级旧 id 与新 id 混用（**my-plane 除外**）

## 名称分隔符（Module vs Issue）

| 对象               | 分隔       | 正确                       | 错误（会重复写入）                |
| ------------------ | ---------- | -------------------------- | --------------------------------- |
| depth-1 **Module** | 短横线 `-` | `S3.3-功能开发`            | `S3.3·功能开发`、另造同 id Module |
| depth-2+ **Issue** | 中点 `·`   | `S3.3.15 · 预警页筛选对接` | `S3.3.15-预警页…`（非台账约定）   |

钉表 poll 写入何种分隔即以钉表为准（华茂表 depth-1 统一为 **`-`**）。`da pm sync` **不得**再 CREATE 一套 `·` Module。

## merged 模块写保护（2026-07）

`origin: merged` + `dingtalk.project_record_id` 的 milestone：

- **Module 名称**：钉表 `{id}-{name}`（短横线），**不是** Issue 的 `{id} · {name}`
- **禁止** `da pm sync` CREATE Module 或 PATCH 钉表 Module 的 name / external_id
- dry-run **CREATE module = 0** 为硬门槛

## Agent 自检（硬停止 · 全项目）

适用于 **P / S 各工程线、各仓库**（非仅 P6）。`da pm dry-run` / `sync_preview` / Plane Modules 列表 / **sync 之后**出现以下任一情况 → **立即停止**，不得 `--confirm-token`、不得宣称已同步：

1. 任何 `CREATE module`（`origin: merged` 目标为 **0**）
2. 计划 CREATE 的 Module id 为 `M00x` 等历史轨（`my-plane` 除外）
3. 台账出现 `milestone: M*`（应改为钉表 `P*.*` / `S*.*`）
4. Module 名含 `·`（中点仅为 Issue 分隔符）——会与钉表 `{id}-{name}` **并成重复 Module**
5. 同代号已有两条 Module（一条 `-`、一条 `·`）→ 先清壳再 sync（[plane-dingtalk-module-rules](plane-dingtalk-module-rules.md)）
6. **sync 之后** `module_health_check` 失败，或 Modules 仍同代号双份 → 未完成，禁止收工

PM 顺序铁律：`plane_pull` → dry-run → sync → **post-check**（见 [pm-sync](pm-sync.md)）。

见空 `M*` / middot 壳：**禁止 CREATE**，只做 link→unlink→Archive。

详文：[plane-dingtalk-module-rules](plane-dingtalk-module-rules.md)

## 延伸阅读

- [task-naming](task-naming.md) — 登记模板与 commit 格式
- [task-relationships](task-relationships.md) — `parent_issue` 与 S3.3 父 Issue 表
- [weekly-report/project-map](../../weekly-report/references/project-map.md) — 周报仓库对照
- `repos/my-plane/apps/api/plane/tos/services/dingtalk_sync/README.md` — poll、mapping、init 脚本
