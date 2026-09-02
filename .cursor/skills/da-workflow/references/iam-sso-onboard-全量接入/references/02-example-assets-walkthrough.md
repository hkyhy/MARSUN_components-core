# 示例：Assets 全量接 SSO walkthrough

> Node/Prisma 后端 + React 前端单仓（`repos/maoyang_data-asset-system`）。
> 照抄改造即可；每个引用含「做什么 / 关键点 / 复制改造提示」三段。
> **code reference 指向 marsun_arch 元仓 `repos/` 下参考实现**：在元仓可直接点开；在 devAanalysis 等非元仓内点不开，需到 marsun_arch 元仓或对应业务仓查看源码。

## BE·EP 客户端

引用 `repos/maoyang_data-asset-system/server/src/services/iamEffectivePermissions.ts`：

```36:81:repos/maoyang_data-asset-system/server/src/services/iamEffectivePermissions.ts
export async function fetchMyEffectivePermissions(
  bearerToken: string,
  app = 'assets',
): Promise<EffectivePermissionsSnapshot | null> {
  const cacheKey = epCacheKey(bearerToken, app);
  const hit = cache.get(cacheKey);
  if (hit && hit.expiresAt > Date.now()) {
    return hit.snapshot;
  }
  // ... fetch EP，8s 超时，sha256(token+app) 作 cache key ...
  cache.set(cacheKey, { expiresAt: Date.now() + epCacheTtlMs(), snapshot });
```

- **做什么**：BE 调 SSO `GET /api/iam/me/effective-permissions?app=assets`，短缓存（秒级）。
- **关键点**：cache key 用 `sha256(token+app)`（禁用 JWT 前缀明文）；8s 超时；`expiresIn` 默认 8s。
- **复制改造**：改 `app` 默认值为你的 SystemApp.code；其余照抄。

## BE·dataScope 适配

引用 `repos/maoyang_data-asset-system/server/src/services/dataScopeAdapter.ts`：

```53:60:repos/maoyang_data-asset-system/server/src/services/dataScopeAdapter.ts
export async function buildFileListScope(
  req: AuthRequest,
  opts?: { departmentId?: string; uploaderId?: string },
): Promise<FileListScopeResult> {
  const role = req.user!.role;
  const { dataScope } = await resolveUserDataScope(req);
  const mode: FileScopeMode = dataScope ?? 'LEGACY_ROLE';
  const effective: DataScopeCode = dataScope ?? legacyModeFromRole(role);
```

- **做什么**：EP.dataScope → Prisma `where`（SELF/ORG_TREE/COMPANY 三分支）。
- **关键点**：EP 有 dataScope 用 EP，无则回落角色推导（`legacyModeFromRole`）；`tenantId` 在其上再叠加（见下）。
- **复制改造**：换业务表与字段（如 `file` → `record`，`uploaderId` → `ownerId`）。

## BE·鉴权中间件

引用 `repos/maoyang_data-asset-system/server/src/middleware/auth.ts`：

```78:106:repos/maoyang_data-asset-system/server/src/middleware/auth.ts
  const tenantId = decoded.tenantId?.trim() || null;
  // ... 验 JWT（HS256，JWT_SECRET 与 SSO 共用），注入 req.user + tenantId ...
```

- **做什么**：验 JWT + 注入 `req.user`（含 `tenantId`）。
- **关键点**：`JWT_SECRET` 与 SSO 一致；HS256；`tenantId` 从 JWT 取，禁客户端覆盖。
- **复制改造**：换 `JWT_SECRET` env 名（若你用独立 env）。

引用 `repos/maoyang_data-asset-system/server/src/middleware/iamSsot.ts`：

```8:8:repos/maoyang_data-asset-system/server/src/middleware/iamSsot.ts
export function blockIamSsotWrites(_req: Request, res: Response, next: NextFunction): void {
```

- **做什么**：SSOT 写回收期间阻断业务写路径（防灰态脏写）。
- **关键点**：G4 前开；G4 后移除。
- **复制改造**：挂到写路由前。

## BE·租户作用域

引用 `repos/maoyang_data-asset-system/server/src/utils/tenantScope.ts`：

```9:30:repos/maoyang_data-asset-system/server/src/utils/tenantScope.ts
export function resolveRequestTenantId(req: AuthRequest): string | null {
  // 仅信 JWT；客户端传 tenantId 与 JWT 不一致 → 403
  // STRICT 且无 JWT tenantId → null（调用方 401）
}
export function tenantWhere(
  // Prisma where 片段：{ tenantId } 或 {}（非 STRICT 兼容）
)
export function rejectIfNoTenant(req: AuthRequest, res: Response): boolean {
  // 缺租户时写 401 并返回 true（调用方应 return）
}
```

- **做什么**：`resolveRequestTenantId` 禁客户端覆盖；`tenantWhere` 出 Prisma where 片段。
- **关键点**：STRICT 401；client 与 JWT 不一致 403；非 STRICT 兼容旧令牌（不推荐生产）。
- **复制改造**：照抄；业务表须带 `tenantId` 列。

## BE·env

引用 `repos/maoyang_data-asset-system/server/.env.example`（IAM 段）。必须配 4 项：

- `JWT_SECRET`（与 SSO 一致）
- `SSO_API_BASE_URL`（如 `http://localhost:8090`）
- `IAM_AUTHZ_MODE`（dual → iam）
- `TENANT_ID_STRICT`（生产 true）

## FE·EP 拉取

引用 `repos/maoyang_data-asset-system/src/api/iamPermissions.ts`：

```30:30:repos/maoyang_data-asset-system/src/api/iamPermissions.ts
export async function fetchMyEffectivePermissions(
```

- **做什么**：FE 调 EP，`credentials: 'include'`。
- **关键点**：401 跳登录；`SYSTEM_APP_CODE` 默认值对齐 SystemApp.code。
- **复制改造**：换 `SYSTEM_APP_CODE`。

## FE·store 分桶

引用 `repos/maoyang_data-asset-system/src/stores/authStore.ts`：

```39:77:repos/maoyang_data-asset-system/src/stores/authStore.ts
type IamPermsSnapshot = { userId: string; codes: string[] };
// ... null = 未加载；[] = 已加载但空 ...
function resolveInitialIamCodes(user: UserInfo | null): string[] | null {
  if (!user?.id) return null;
  // ... 按 userId 分桶，防跨用户串权限 ...
```

- **做什么**：EP 快照存 store；`null`=未加载，`[]`=空。
- **关键点**：按 `userId` 分桶（防跨用户串权限）；localStorage 持久化首屏不闪拒。
- **复制改造**：照抄 store 逻辑。

## FE·Bridge 真实 hasPermission

引用 `repos/maoyang_data-asset-system/src/integrations/MarsunCoreBridge.tsx`：

```28:43:repos/maoyang_data-asset-system/src/integrations/MarsunCoreBridge.tsx
  const permissions = useMemo(() => {
    // ...
    return userRolePermissions?.permissions ?? [];
  }, [...]);
  // ...
  auth={{
    // ...
    permissions,
    hasPermission: (perm: string) => hasPermissionKey(perm) || checkPermission(user, perm),
  }}
```

- **做什么**：注入 `auth.permissions` + 真实 `hasPermission`。
- **关键点**：**禁 `() => true`**（会让所有控件可见，绕过 EP）。
- **复制改造**：照抄；确认 `hasPermission` 走 `iamPermissionCodes`。

## FE·权限常量

引用 `repos/maoyang_data-asset-system/src/constants/permissions.ts`：

```6:6:repos/maoyang_data-asset-system/src/constants/permissions.ts
export const PERMISSIONS = {
```

- **做什么**：FE 权限码常量，须与 SSO catalog 同 diff。
- **关键点**：新增码先在 SSO catalog 加，再在 FE 加；删除反之。
- **复制改造**：照抄结构，换码值。

## FE·路由/侧栏门禁

引用 `repos/maoyang_data-asset-system/src/layouts/MainLayout/index.tsx`：

```241:334:repos/maoyang_data-asset-system/src/layouts/MainLayout/index.tsx
      // EP 未就绪时保持壳层 loading，避免写回收下菜单/路由全拒闪断
      // ...
      // 已有同用户快照：后台刷新 EP，不挡首屏
      // ...
      if (item.permission) return hasPermission(user, item.permission);
```

- **做什么**：EP 未回 → hold loading；侧栏按 `hasPermission` 过滤。
- **关键点**：防闪拒（EP 未回时全拒）；首屏用 localStorage 快照。
- **复制改造**：照抄 `useIamPermissionRefresh` + loading 逻辑。

## SSO 侧配套

- catalog 路径：`repos/marsun_sso/server/src/data/assetsPermissionCatalog.ts`
- import 命令：`npm run db:import-assets-permissions`（SSO 仓 server 目录）
- sync 命令：`npm run db:sync-assets-role-matrix`（同上）
- SystemApp.code = `assets`；SYSTEM 入口 `sys:assets`
- 业务仓不动 SSO 仓，但须知道这些命令由 SSO 维护人执行。
