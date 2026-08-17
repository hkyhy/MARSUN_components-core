# 新系统 IAM / RBAC 接入齐套（通用）

| 项           | 说明                                                                                                                  |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| 适用         | 任意业务系统首次或补齐 IAM 有效权限（目录 → PEP → FE snapshot）；**不限** Assets / S3                                 |
| 参考实现     | Assets：`repos/maoyang_data-asset-system`（EP / Bridge / PEP）                                                        |
| 改码齐套     | [permissions-catalog-改权限齐套.md](./permissions-catalog-改权限齐套.md)（改已有码时）                                |
| 后端齐套     | [backend-dev-spec permissions-catalog](../../../backend-dev-spec/references/common/permissions-catalog-改权限齐套.md) |
| 产品文档落点 | [marsun-arch-doc-spec](../../../marsun-arch-doc-spec/SKILL.md) §4.6～4.8                                              |
| 禁止话术     | 未完成 Gate 前禁止宣称「已 G1 / 已一键切流」；各系统独立切流单                                                        |

**触发**：用户说「新系统接入 IAM / RBAC / 权限码 / 功能权限点 / 对齐 Assets 权限 / Wave 接线」→ **先读本文并按检查表执行**，禁止只改菜单或只写 `hasPermission: () => true`。

---

## 0. 红线

| 禁止                                                 | 原因                                  |
| ---------------------------------------------------- | ------------------------------------- |
| DEMO localStorage / 恒真 `hasPermission` 当任命 SSOT | 正式任命在 SSO Admin                  |
| 只改 FE 或只改 BE 一侧                               | 码表、清单、PEP、门禁必须同任务齐套   |
| 兼容旧码 OR 拖延迁移                                 | 见 permissions-catalog                |
| 与另一系统共用同一 `IAM_AUTHZ_MODE` 操作单           | 独立 env 名或独立仓配置               |
| 未接线却宣称 G1                                      | G1 叙事仅属已立项并通过证据链条的系统 |

---

## 1. 全套检查表（按序）

```
□ 1 业务真源：岗位/泳道/RACI/权限矩阵（或等价 PRD 职责章）
□ 2 对照表：岗→SSO Role→菜单码/动作码→dataScope
     · 现网已入库码逐格打标（已覆盖/缺码/仅数据范围）
     · 补码 backlog（七问 ③）
     · 职责分离冲突对（提议∩批准∩落地等）
□ 3 PRD：范围/非目标；RBAC 章；角色×码矩阵（现网/目标分列）
□ 4 功能与权限点清单：页面|功能点|现网门禁|建议码|状态[现网|目标]
□ 5 Test/{App}/：README + 测试用例（PERM/ROLE/SOD）+ 冒烟 + 侧栏核对清单
□ 6 证据链条：环境、catalog 三方一致、EP、PEP 日志、试点任命（禁密钥）
□ 7 DataScope Adapter 声明（可后置接线，须先声明词汇）
□ 8 SSO：SystemApp + BUSINESS/SYSTEM catalog + import + 角色矩阵 + 试点账号
□ 9 FE：PERMISSIONS 常量 + bindCatalog（与 catalog 同 diff）+ defaultGranted
□ 10 BE：独立 authz env（默认 dual）+ EP 客户端 + requirePermission
      + dual 观测日志 + 写/读挂码 + 非 DEMO 禁旁路 + OpenAPI/接口 403 信封
□ 11 FE：EP snapshot（userId 分桶）+ Bridge auth.permissions
      + 菜单/动作门禁 + 退 DEMO；null 时 hold 壳 loading
      + 用户「权限管理」壳：EP 用 PermissionBindPanel readOnly（对齐角色绑权布局；禁止手写扁平 checkbox 列表）
      + 预览须随角色/共享组勾选实时草稿合并（非仅打开时拉一次已保存 EP）
      + 多 App Admin（如 SSO）：「业务系统」进 FormInfo Select；`FormDataSync` 驱动按 App reload；回填用 `useFormApi` setField/setFormData；**禁止** open 期间 Modal key+epoch remount
      + 切换业务系统须重载本 App 角色/共享组/任命与预览目录；改角色/组→预览即时变
      + 任命字段用 core FormModal/FormInfo（`column={2}`；禁手写 Typography label）；字段 tip 勿堆产品史/SET-02；角色用 Tags showLength=2 / Select maxTagCount=2
      + 改弹层联动 UX 须同任务回写 Products PRD + Test 用例/清单（SSO：USR-14/15；见 requirement-workflow 检查项 39）
□ 12 全仓搜旧 DEMO key / 恒真门禁 / 废码；清零或隔离
□ 13 回链：七问扫查、Wave 立项、使用指南、Products README、仓库环境登记
□ 14 Plane 台账 + WorkRecord（对接人、试点账号、证据）
□ 15 角色循环验证（须含 [role-loop §2.5 安全](../../../da-workflow/references/role-loop-review-角色循环验证.md)）+ 按 Test 跑通并回写用例状态与证据链条
□ 16（可选）独立环境试 iam 模式；生产保持 dual；独立操作单
```

---

## 2. 产物落点（模板）

| 产物             | 建议路径                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| PRD              | `Modules/<Domain>/Products/<产品>/…PRD-v1.md`                                                     |
| 功能与权限点清单 | 同目录 `功能与权限点清单-v1.md`（表头对标 Assets）                                                |
| Test             | `Modules/<Domain>/Test/<App>/`：`README.md`、`测试用例-v1.md`、`验收冒烟清单-v1.md`、侧栏核对清单 |
| 证据链条         | 同产品目录 `…接线证据链条与记录-v1.md`                                                            |
| DataScope 声明   | 同产品目录 `…-DataScope-Adapter声明-v1.md`                                                        |
| 七问 / Wave 立项 | `Modules/Platform/Products/SSO管理中心/`                                                          |
| SSO catalog      | `repos/marsun_sso/server/src/data/{app}PermissionCatalog.ts`                                      |
| FE bindCatalog   | 业务仓 `src/constants/{app}PermissionBindCatalog.ts`                                              |
| FE 权限常量      | 业务仓 `src/constants/permissions.ts`（或等价）                                                   |
| 环境登记         | `docs/guides-使用指南/仓库环境与部署登记.md`                                                      |

清单表头建议：

`页面/路径 | 功能点 | 门禁（现网） | 建议码 | 状态[现网\|目标]`

---

## 3. 工程接线要点（对标 Assets）

### 3.1 Backend

- **独立** authz 环境变量（勿与他系统混淆）；默认 `dual`（观测）→ 再 `iam`（硬拒绝）。
- EP：`effective-permissions?app=<systemAppKey>`；超时 + 有限缓存。
- `requirePermission(code)` 挂关键写路径；读/菜单按清单挂码。
- `dual` 下结构化观测日志（供证据链条抽样）。
- 非 DEMO 环境禁止跳过 SSO / DEMO 授权旁路。
- 契约：`接口.md` / OpenAPI 补充权限不足 **403** 信封，与 FE 提示对齐。

### 3.2 Frontend

- `fetchMyEffectivePermissions(app)` → `authStore.iamPermissionCodes`（`null`=未加载，`[]`=已加载无码）。
- 持久化按 **userId 分桶**；拒绝裸数组 legacy（防跨用户泄漏）。
- `MarsunCoreProvider` 注入 `auth.permissions` + 真实 `hasPermission`；**禁止** `() => true`。
- 侧栏/路由/按钮：`usePermissions` / `usePermissionsPass` / `hasPermissionKey`；码来自 PERMISSIONS 常量。
- 权限配置页：只读提示或深链 SSO Admin；退业务内 DEMO PermissionManager。
- 登录后 EP 未返回前：**hold 壳 loading**，避免闪拒。

### 3.3 SSO

- SystemApp + `sys:<app>` 入口；BUSINESS 码 import；角色矩阵按对照表灌试点岗。
- 试点账号任命写入 Test README（工号级，**非密钥**）。

---

## 4. 与「仅改码」齐套的关系

| 场景                      | 读                                                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------------- |
| **新系统首次接线 / Wave** | **本文全文**                                                                                       |
| 已有系统增减/重命名权限码 | [permissions-catalog-改权限齐套.md](./permissions-catalog-改权限齐套.md)（仍须清单/PRD/Test/七问） |
| 按钮三态 UI               | [permissions-data-权限与常量.md](./permissions-data-权限与常量.md)                                 |

---

## 5. 验收口径（诚实）

| 状态       | 含义                                                         |
| ---------- | ------------------------------------------------------------ |
| 文档齐套   | PRD + 清单 + Test 骨架存在并回链                             |
| 接线可用   | PEP dual + FE snapshot 读 IAM；试点岗菜单/动作与清单一致     |
| 可观测     | 证据链条有 EP/PEP 抽样记录                                   |
| 禁止提前说 | 「已 G1 / 生产统一 IAM」——除非该系统立项 Gate 与证据链条明示 |

---

## 6. 修订

| 版本 | 日期       | 说明                                                                           |
| ---- | ---------- | ------------------------------------------------------------------------------ |
| v1   | 2026-08-10 | 自 Assets→S3 对比沉淀；通用检查表                                              |
| v1.1 | 2026-08-11 | 用户壳 EP 预览统一 PermissionBindPanel readOnly                                |
| v1.2 | 2026-08-11 | 权限弹层 FormInfo；角色展示优先 name                                           |
| v1.3 | 2026-08-11 | Tags showLength=2 + Form tooltip；禁 Alert 堆字段说明                          |
| v1.4 | 2026-08-11 | FormInfo `column={2}` + kne `labelTips`；Tags 长文案 ellipsis                  |
| v1.5 | 2026-08-11 | 多 App 业务系统切换 + FormDataSync/useFormApi；禁 remount；PRD/Test 同任务回写 |
