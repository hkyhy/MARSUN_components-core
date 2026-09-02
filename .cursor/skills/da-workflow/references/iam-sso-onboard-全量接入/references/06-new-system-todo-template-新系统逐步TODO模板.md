# 新系统从零接 SSO 逐步 TODO 模板

> 本文件 = 新业务系统从零全量接 marsun_sso 的可勾选 TODO 模板。粒度对齐 Plan P1–P10，照做可满分完成。
> 每步含「做什么 / 关键文件 / 验收点 / 勾选位」。引用对应 reference，不重复正文。

## 阶段 1：产品码表

- [ ] 1.1 列岗位 → SSO Role 映射（岗名 / Role.code / Role.name）
- [ ] 1.2 列菜单码（`<app>:menu:<key>`）→ 侧栏项；每码写 name/category/description
- [ ] 1.3 列动作码（`<app>:action:<key>`）→ 按钮 + 写 API；每码写 name/description
- [ ] 1.4 列 dataScope（SELF / OR_TREE / COMPANY）→ 岗位对应数据范围
- [ ] 1.5 列 SYSTEM 入口码 `sys:<app>`
- [ ] 1.6 产出「功能与权限点清单」表（功能 / 码 / 类型 / dataScope / 负责）
- [ ] 验收：码表经产品 + 后端 + 前端三方确认；无遗漏菜单/动作
- [ ] 关键文件：`docs/<系统>/权限点清单.md`（业务仓）
- [ ] 产物落盘：`docs/<系统>/权限点清单.md`（业务仓）；缺产物禁进阶段 2
- [ ] 闸门：**role-loop §2.1 需求**必跑（码表/清单未三方确认 → 禁进阶段 2）；Agent 须白话复述「本阶段做+风险」再 AskQuestion
- [ ] 参考：[iam-system-onboard §1–4](../../../frontend-dev-spec/references/business/iam-system-onboard-新系统IAM接入齐套.md)

## 阶段 2：SSO 侧（须 SSO 仓 PR 权或 SSO 维护人）

> ⚠️ **本阶段全部动作须改 `repos/marsun_sso` 或调 SSO Admin API**。无 SSO PR 权 + Admin 也无权建 SystemApp → **停在 2.1，禁宣称 G1**（见 [01-without-sso-repo](01-without-sso-repo-无仓协作.md) 停手红线）。业务仓可并行先做阶段 3–6，但 G1 须等 SSO 侧补完 catalog。
>
> ⚠️ **Agent 强提醒（必做）**：仅提交 catalog/矩阵 **代码**不算阶段 2 完成。  
> 合入后须 **AskQuestion**：① 现在本机执行 import+sync？② 用户明确延期灌库？  
> 选①则跑命令并贴 JSON；选②则在 WorkRecord/Plan 写「延期灌库」——**二者缺一 → 禁勾选 2.4/2.5、禁宣称阶段 2 完成**。  
> 「不碰生产」≠「本机不灌库」；本机 SSO DB import **允许且必须提醒**。

- [ ] 2.1 建 SystemApp（`POST /api/iam/system-apps` 或 import 脚本内 create；code/name；显示名按产品，**勿假设叫 Dify**）
- [ ] 2.2 确认 `ensureSystemAppEntryPermissions` **扫 SystemApp 表**动态写 `sys:<code>`（**禁止**再往函数里加手写 `specs[]`）；import 须先落 SystemApp 再 ensure
- [ ] 2.3 新建 `<app>PermissionCatalog.ts`（SSO 仓 `server/src/data/`），含 1.2/1.3/1.5 全部码
- [ ] 2.4 **本机执行** `TENANT_CODE=<租户> npm run db:import-<app>-permissions`（SSO server；建议再跑 `BIND_ADMIN=1`）
- [ ] 2.5 **本机执行** `npm run db:sync-<app>-role-matrix`；验收 JSON 中 `missingPermissionCodes: []`（须含 `sys:<app>`）
- [ ] 2.6 SSO Admin FE：新建 `*PermissionBindCatalog.ts`（中文模块名）并接入 `BindPermissionsModal`；验收绑权左侧**非** `sys`/`myflow` 等英文前缀
- [ ] 2.7 试点用户任命 + `PUT /api/iam/users/:id/app-access` 开 App 访问
- [ ] 验收：Admin「角色管理」出现该 SystemApp；绑权弹窗左侧中文多模块；试点 EP `?app=<code>` 返回菜单/动作码 + dataScope + `sys:<app>`
- [ ] 关键文件：`repos/marsun_sso/server/src/data/<app>PermissionCatalog.ts` + `frontend/.../*PermissionBindCatalog.ts`
- [ ] 产物落盘：catalog + Bind catalog + **import/sync 终端 JSON**（或用户书面「延期灌库」）；缺则禁进阶段 3
- [ ] 闸门：**role-loop §2.5**（catalog/矩阵/绑权命中）；未 import 且未延期 → **必须改/停手**；绑权英文前缀回退 → **必须改**
- [ ] 参考：[01-without-sso-repo](01-without-sso-repo-无仓协作.md)；[07-myflow](07-example-myflow-walkthrough.md)；无 SSO PR 权停在 2.1，禁宣称 G1

## 阶段 3：FE 壳

- [ ] 3.1 EP 拉取客户端 `fetchMyEffectivePermissions(app=<code>)`，`credentials: 'include'`，401 跳登录
- [ ] 3.2 store 分桶：`iamPermissionCodes`，null=未加载 / []=空，按 userId 分桶防跨用户串权限
- [ ] 3.3 Bridge 真实 `hasPermission`（禁 `() => true`），注入 `auth.permissions`
- [ ] 3.4 路由/侧栏门禁：EP 未回 hold loading（防闪拒），首屏用 localStorage 快照
- [ ] 3.5 权限常量 `PERMISSIONS` 与 SSO catalog 同 diff
- [ ] 验收：试点用户登录后侧栏只显示有码项；无码路由直跳 403
- [ ] 关键文件：`src/api/iamPermissions.ts` / `src/stores/authStore.ts` / `src/integrations/MarsunCoreBridge.tsx` / `src/layouts/MainLayout/index.tsx`
- [ ] 产物落盘：`src/api/iamPermissions.ts` + `PERMISSIONS` 常量（与 SSO catalog 同 diff）；缺产物禁进阶段 4
- [ ] 闸门：**role-loop §2.3 前端**（建议跑）；侧栏/门禁有「必须改」未确认 → 不继续
- [ ] 参考：[02-assets](02-example-assets-walkthrough.md) FE 段 / [03-s3](03-example-s3-walkthrough.md) FE 段

## 阶段 4：BE PEP

- [ ] 4.1 EP 客户端 `fetchMyEffectivePermissions`（短缓存 8s，sha256(token+app) key，8s 超时）
- [ ] 4.2 `requirePermission(code)` 装饰器/中间件，挂读 API（菜单码）+ 写 API（动作码）
- [ ] 4.3 `*_IAM_AUTHZ_MODE` env（各 App 独立，默认 dual 观测 → iam 硬拒绝）
- [ ] 4.4 非 DEMO 禁 off（`effective_*_iam_authz_mode` 强制回落 dual）
- [ ] 验收：缺码调写 API → 403；dual 模式不硬拒但记观测；iam 模式硬拒
- [ ] 关键文件：BE `iam_authz.py` / `iamEffectivePermissions.ts`
- [ ] 产物落盘：`requirePermission` 挂载点清单 + dual 观测日志抽样；缺产物禁进阶段 5
- [ ] 闸门：若改 REST，**role-loop §2.2 接口**必跑；有「必须改」未确认 → 不继续
- [ ] 参考：[02-assets](02-example-assets-walkthrough.md) BE·EP / [03-s3](03-example-s3-walkthrough.md) BE·PEP

## 阶段 5：BE dataScope

- [ ] 5.1 `resolveUserDataScope`：EP.dataScope 优先，无则回落角色推导
- [ ] 5.2 `buildXxxListScope`：dataScope → ORM/SQL where（SELF/ORG_TREE/COMPANY 三分支）
- [ ] 5.3 列表/统计/导出/人员选项均过 dataScope 适配
- [ ] 验收：SELF 仅见自己；ORG_TREE 见本部门及下级；COMPANY 见本租户全部
- [ ] 关键文件：BE `dataScopeAdapter.ts` / `dataScopeAdapter.py`
- [ ] 产物落盘：`…-DataScope-Adapter声明-v1.md`（业务仓 docs）；缺产物禁进阶段 6
- [ ] 参考：[04-data-vs-shell](04-data-vs-shell-权限四层.md) dataScope 段

## 阶段 6：BE tenant

- [ ] 6.1 鉴权中间件验 JWT（HS256，`JWT_SECRET` 与 SSO 共用），注入 `req.user.tenantId`
- [ ] 6.2 `resolveRequestTenantId`：仅信 JWT，client 与 JWT 不一致 → 403
- [ ] 6.3 `tenantWhere`：所有业务表 where 强制 `tenantId`
- [ ] 6.4 生产 `TENANT_ID_STRICT=true`（缺 tenantId → 401）
- [ ] 6.5 业务表带 `tenantId` 列
- [ ] 验收：他租户同名数据不可见；缺 tenantId token（STRICT）→ 401
- [ ] 关键文件：BE `auth.ts/py` / `tenant_scope.ts/py`
- [ ] 产物落盘：`tenantWhere` 覆盖清单（业务表逐表勾选）+ STRICT 配置记录；缺产物禁进阶段 7
- [ ] 参考：[04-data-vs-shell](04-data-vs-shell-权限四层.md) tenantId 段 / [05-tenant-isolation](../../../rules/05-tenant-isolation.mdc)

## 阶段 7：验收

- [ ] 7.1 三方码一致：SSO catalog ⊇ FE PERMISSIONS ⊇ BE requirePermission 挂载点
- [ ] 7.2 SystemApp.code 与 `?app=` 字符串完全一致；`sys:<app>` 存在
- [ ] 7.3 租户 Gate T1–T6（[05-checklist](05-checklist-验收勾选.md)）
- [ ] 7.4 检查表 1–16（[05-checklist](05-checklist-验收勾选.md)）
- [ ] 7.5 SSO 配置项核对（JWT_SECRET 一致 / CORS 含本业务源 / Redirect 含回跳源 / STRICT=true）
- [ ] 7.6 role-loop §2.5（命中：改权限码/auth/.env/租户隔离必跑）
- [ ] 7.7 诚实口径：未过 Gate 禁说「已 G1」；dual ≠ G1
- [ ] 验收：全部勾选 + role-loop 通过
- [ ] 产物落盘：证据链条 `…接线证据链条与记录-v1.md` + WorkRecord + Plane 台账；缺产物禁宣称 G1
- [ ] 闸门：**role-loop §2.4 测试 + §2.5 安全**必跑；未确认 → 禁宣称 G1
- [ ] 参考：[05-checklist](05-checklist-验收勾选.md) / [role-loop-review §2.5](../role-loop-review-角色循环验证.md)

## 完成定义

全部 7 阶段勾选完毕 + role-loop §2.5 通过 + 试点用户端到端可用（登录→见正确菜单→调写 API 不 403→只见本租户数据）= 全量接入完成（G1）。
