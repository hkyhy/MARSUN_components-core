# 钉钉层级命名与 Plane 双轨 ID

> 与 [task-naming](../../frontend-dev-spec/references/common/task-naming.md)、[task-relationships](task-relationships.md)、[pm-sync](pm-sync.md) 配套。  
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

## 仓库 ↔ 钉钉编码速查

| 短名     | 仓库                              | Project | milestone | 备注                                    |
| -------- | --------------------------------- | ------- | --------- | --------------------------------------- |
| assets   | `repos/maoyang_data-asset-system` | P3      | P3.7      | 企业文件上传客户端与平台开发            |
| S3 / QA  | `repos/Agent_QualityAnalysis`     | S3      | S3.3      | 功能开发（当前阶段）                    |
| arch     | `marsun_arch`                     | P6      | P6.11     | 规范 / 工程化文档                       |
| core     | `repos/marsun_components-core`    | P6      | P6.2      | 组件库 npm                              |
| agent    | assets AgentHub                   | S1      | S1.3      | `plane/projects.json` agent 路由        |
| my-plane | `repos/my-plane`                  | —       | —         | **例外**：维持 `M003-*`，暂不纳入层级表 |

完整 Task ID 规则与 YAML 模板见 [task-naming](../../frontend-dev-spec/references/common/task-naming.md)。

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

## merged 模块写保护（2026-07）

`origin: merged` + `dingtalk.project_record_id` 的 milestone：

- **Module 名称**：钉表 `{id} {name}`（空格），**不是** PM Issue 的 `{id} · {name}`
- **禁止** `da pm sync` CREATE Module 或 PATCH 钉表 Module 的 name / external_id
- dry-run **CREATE module = 0** 为硬门槛

详文：[plane-dingtalk-module-rules](plane-dingtalk-module-rules.md)

## 延伸阅读

- [task-naming](../../frontend-dev-spec/references/common/task-naming.md) — 登记模板与 commit 格式
- [task-relationships](task-relationships.md) — `parent_issue` 与 S3.3 父 Issue 表
- [weekly-report/project-map](../../weekly-report/references/project-map.md) — 周报仓库对照
- `repos/my-plane/apps/api/plane/tos/services/dingtalk_sync/README.md` — poll、mapping、init 脚本
