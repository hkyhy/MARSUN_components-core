# 无 SSO 仓协作

> 业务系统全量接 SSO 必须改 `repos/marsun_sso`（SystemApp + catalog import + 角色矩阵）。
> 若你没有 SSO 仓 PR 权，本文件说明：能做哪些、哪些卡住须停手、哪些可走 Admin/API 但易漏。

## 三栏：能做 / 卡住 / 易漏

| 仅靠公开契约可做（业务仓内）                              | 卡住须 SSO 仓 PR                                             | Admin/API 可做但易漏                              |
| --------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------- |
| FE EP 拉取 + store + Bridge + 路由门禁                    | 新建 SystemApp（`POST /api/iam/system-apps`）                | 手动建 App（Admin UI）→ 易漏 `sys:<app>` 入口     |
| BE PEP `requirePermission` + dual 观测                    | catalog import 脚本（`npm run db:import-<app>-permissions`） | 手动录权限码 → 易漏与 FE/BE 三方码对齐            |
| BE dataScope 适配 + tenantId 过滤                         | 角色矩阵 sync 脚本（`sync-<app>-role-matrix`）               | 手动绑权 → 易漏 `ensureSystemAppEntryPermissions` |
| 业务仓 .env（JWT_SECRET/SSO_API_BASE_URL/IAM_AUTHZ_MODE） | `ensureSystemAppEntryPermissions`（仓内函数）                | 手动建 `sys:<app>` → 易漏 SYSTEM 层               |
| 文档（码表/接入说明）                                     | `provisionSharedApps`（仓内脚本）                            | —                                                 |

## 协作清单（8 步）

1. 拿 SSO_BASE_URL / JWT_SECRET / 试点租户 code / Admin 账号（向 SSO 维护人）。
2. 读 marsun_sso 仓 `docs/integration-guide.md` 确认公开契约边界。
3. 开 SSO 侧任务（建 SystemApp + catalog import + 角色矩阵 + 试点任命）→ SSO 维护人执行。
4. 业务仓并行：FE 壳 + BE PEP + dataScope + tenantId。
5. 三方码一致验收（SSO catalog ⊇ FE PERMISSIONS ⊇ BE 挂载点）。
6. 无 SSO PR 权：停在「文档齐套 + 业务仓代码就绪」，等 SSO 侧补 catalog。
7. **禁止宣称「已接 SSO / 已 G1」**：catalog 未 import = EP 空 = 等于没接。
8. role-loop §2.5 命中（改权限码/绑权/auth）必跑。

## 必须 SSO 侧执行的动作

| 动作                                        | 类型      | 说明                                          |
| ------------------------------------------- | --------- | --------------------------------------------- |
| `POST /api/iam/system-apps`                 | Admin API | 建 SystemApp（code/name）                     |
| `ensureSystemAppEntryPermissions(tenantId)` | 仓内函数  | 保障 `sys:<app>` SYSTEM 入口权限存在          |
| `npm run db:import-<app>-permissions`       | 仓内脚本  | import catalog（`<app>PermissionCatalog.ts`） |
| `npm run db:sync-<app>-role-matrix`         | 仓内脚本  | 同步角色矩阵 + 灌权                           |
| `PUT /api/iam/users/:id/app-access`         | Admin API | 试点用户 App 访问开关                         |

> `import-<app>-permissions` / `sync-<app>-role-matrix` 是**仓内脚本**（读 `server/src/data/<app>PermissionCatalog.ts`），非通用 API。无 SSO 仓权 → 无法新增 catalog 文件 → 无法 import。

## 停手红线

- 无 SSO PR 权 + Admin 也无权建 SystemApp → 只能写业务仓代码 + 文档，**不得说「已接 SSO / 已 G1」**。
- 详见 marsun_sso 仓 `docs/iam-ops-checklist.md` §0（G0–G4 门禁）。
