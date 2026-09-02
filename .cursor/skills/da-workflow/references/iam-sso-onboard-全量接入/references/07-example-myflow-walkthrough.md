# myFlow / 硅源 wisilk · SSO 全量接入 walkthrough

> 对照：[02-assets](02-example-assets-walkthrough.md) · [03-s3](03-example-s3-walkthrough.md)  
> 业务仓文档：`repos/myFlow/docs/iam/`（权限点清单、Session Bridge 配置清单、全量接入方案）  
> SystemApp.code = **`myflow-agent`** · Admin 显示名 = **硅源 wisilk Agent 平台**（**不是**「Dify」）

## 与 Assets / S3 差异

| 维度      | Assets / S3                            | myFlow                                                  |
| --------- | -------------------------------------- | ------------------------------------------------------- |
| 主 UI     | React SPA                              | Dify CE 白标 + ops-console                              |
| 登录      | SSO Cookie / 业务自建壳                | **Session Bridge**（禁配 Dify `OAUTH_*` 到 marsun_sso） |
| authz env | `IAM_AUTHZ_MODE` / `S3_IAM_AUTHZ_MODE` | **`MYFLOW_IAM_AUTHZ_MODE`**（独立）                     |
| 租户映射  | JWT tenantId ↔ 业务库                  | JWT tenantId ↔ Dify Workspace（旁路表）                 |

## 阶段 2 命令（本机）

```bash
cd repos/marsun_sso/server
# import 内会 create SystemApp myflow-agent，再 ensure 扫表写 sys:myflow-agent
TENANT_CODE=HUAMAO npm run db:import-myflow-permissions
TENANT_CODE=HUAMAO BIND_ADMIN=1 npm run db:import-myflow-permissions
FORCE_IAM_SRC=1 npm run db:sync-myflow-role-matrix   # 刚改 iam.ts 未 rebuild 时加 FORCE_IAM_SRC
```

验收 JSON：`missingPermissionCodes: []`，且存在 `sys:myflow-agent`。

## ensure 动态入口

`ensureSystemAppEntryPermissions(tenantId)` **扫 `SystemApp` 全表**，对每个 app 幂等写 `sys:<code>` / `进入${name}`。  
**禁止**再往函数加手写 `specs[]`。缺入口 → 先查 SystemApp 是否入库，再跑 ensure/import。

## Admin 绑权中文目录

- 文件：`repos/marsun_sso/frontend/src/components/Iam/Roles/utils/myflowPermissionBindCatalog.ts`
- 接入：`BindPermissionsModal`（`appCode === 'myflow-agent'`）
- 模块：进入应用 / 工作室与探索 / 平台运营 / 租户人员
- **禁止**验收时左侧仍是 `sys` / `myflow` 英文前缀（那是 PermissionBindPanel 无 catalog 回退）

## 码表规模（v1）

15 BUSINESS（见 `myflowPermissionCatalog.ts`）+ 1 SYSTEM（`sys:myflow-agent`）。  
与 `repos/myFlow/docs/iam/功能与权限点清单-v1.md` 对齐；Dify 内更细按钮仍由 Dify 角色管，扩码须先改清单再三方同 diff。

## FE / BE 要点

- Bridge：`ops_console/sso/dify_session_bridge.py` + nginx `/sso-bridge/` + `brand.js`
- PEP：`MYFLOW_IAM_AUTHZ_MODE=dual` → `iam`；挂菜单码读 / 动作码写
- 租户：JWT `tenantId` STRICT；映射 Workspace，禁客户端传他租户 id

## 诚实口径

未本机 import + 试点任命 + EP 通 → **禁宣称 G1**。dual 观测 ≠ G1。
