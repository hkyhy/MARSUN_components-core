# 示例：S3 全量接 SSO walkthrough

> Python/FastAPI 后端（`repos/Agent_QualityAnalysis_backend`）+ React 前端（`repos/Agent_QualityAnalysis`）双仓。
> 与 Assets 差异：Python 后端、独立 `S3_IAM_AUTHZ_MODE`、独立 SystemApp `s3-agent`。
> **code reference 指向 marsun_arch 元仓 `repos/` 下参考实现**：在元仓可直接点开；在 devAanalysis 等非元仓内点不开，需到 marsun_arch 元仓或对应业务仓查看源码。

## BE·PEP

引用 `repos/Agent_QualityAnalysis_backend/src/app/iam_authz.py`：

```40:53:repos/Agent_QualityAnalysis_backend/src/app/iam_authz.py
def effective_s3_iam_authz_mode() -> str:
    """读取并校正 ``S3_IAM_AUTHZ_MODE``：非 DEMO 禁止 off 旁路。"""
    raw = (os.getenv("S3_IAM_AUTHZ_MODE") or "iam").strip().lower() or "iam"
    # ... 非 DEMO 强制回落 dual ...
        return "dual"
# 兼容旧引用；运行时以 effective_s3_iam_authz_mode() 为准
S3_IAM_AUTHZ_MODE = effective_s3_iam_authz_mode()
```

```87:87:repos/Agent_QualityAnalysis_backend/src/app/iam_authz.py
async def fetch_my_effective_permission_snapshot(
```

- **做什么**：BE PEP；`enforce_permission` 挂写路径；`require_permission` 装饰器挂路由。
- **关键点**：独立 `S3_IAM_AUTHZ_MODE`（**非** Assets 的 `IAM_AUTHZ_MODE`）；非 DEMO 禁 off；iam 模式硬拒绝，dual 观测。
- **复制改造**：换 `S3_SYSTEM_APP` 默认值（如 `s4-agent`）。

## BE·鉴权

引用 `repos/Agent_QualityAnalysis_backend/src/app/auth.py`：

```1:55:repos/Agent_QualityAnalysis_backend/src/app/auth.py
"""Marsun SSO JWT 校验（与 marsun_sso 共用 JWT_SECRET）"""
JWT_SECRET = os.getenv("JWT_SECRET", "")
# 未配置 JWT_SECRET 时不强制鉴权（本地演示）；生产必须配置
# ...
def decode_marsun_token(token: str) -> CurrentUser:
    if not JWT_SECRET:
        raise HTTPException(status_code=500, detail="JWT_SECRET 未配置")
```

- **做什么**：验 JWT（HS256，`JWT_SECRET` 与 SSO 共用）。
- **关键点**：未配 secret 时本地演示放行；生产必须配真实 secret。
- **复制改造**：照抄；FastAPI 依赖注入。

## BE·租户作用域

引用 `repos/Agent_QualityAnalysis_backend/src/app/tenant_scope.py`：

```33:48:repos/Agent_QualityAnalysis_backend/src/app/tenant_scope.py
def resolve_request_tenant_id(
    request: Request,
    client_tenant_id: str | None = None,
) -> str:
    """仅信 JWT。client 与 JWT 不一致 → 403；STRICT 且无 JWT → 401。
    非 STRICT 且无 JWT：回落 MESSAGE_DEFAULT_TENANT_ID（仅本地联调）。
    """
    # ... 不一致 raise 403 ...
        raise HTTPException(status_code=403, detail="租户与令牌不一致")
    # ... STRICT 无 JWT raise 401 ...
        raise HTTPException(status_code=401, detail="令牌缺少租户信息，请重新登录")
```

- **做什么**：`resolve_request_tenant_id` 禁客户端覆盖；STRICT 401。
- **关键点**：client 与 JWT 不一致 → 403；非 STRICT 回落默认租户（仅本地）。
- **复制改造**：照抄；SQL/ORM where 须带 `tenant_id`。

## BE·挂载示例

引用 `repos/Agent_QualityAnalysis_backend/src/app/routes/alerts_relative.py`：

```92:492:repos/Agent_QualityAnalysis_backend/src/app/routes/alerts_relative.py
@router.get("/summary", dependencies=[require_permission(PERM_MENU_ALERTS)])
# ... 读 API 挂菜单码 ...
@router.post(
    # ... 写 API 挂动作码 ...
    dependencies=[require_permission(PERM_ALERT_CLAIM)],
)
```

引用 `repos/Agent_QualityAnalysis_backend/src/app/routes/actions.py`：

```401:474:repos/Agent_QualityAnalysis_backend/src/app/routes/actions.py
@router.get(
    # ... 读 API 挂菜单码 ...
    dependencies=[require_permission(PERM_MENU_ACTIONS)],
)
@router.post(
    # ... 写 API 挂动作码 ...
    dependencies=[require_permission(PERM_ACTION_CREATE)],
)
```

- **做什么**：读 API 挂菜单码（`PERM_MENU_*`），写 API 挂动作码（`PERM_*`）。
- **关键点**：菜单码挡路由可见 + 读 API；动作码挡写 API；二者都挂 `require_permission`。
- **复制改造**：换 `PERM_*` 常量名。

## FE·EP 拉取

引用 `repos/Agent_QualityAnalysis/frontend/src/api/iamPermissions.ts`：

```33:39:repos/Agent_QualityAnalysis/frontend/src/api/iamPermissions.ts
export async function fetchMyEffectivePermissions(
  // ... app 默认 s3-agent ...
      `/api/iam/me/effective-permissions?app=${encodeURIComponent(app)}`,
```

- **做什么**：FE 调 EP，`app=s3-agent`。
- **关键点**：`app` 默认值须与 SystemApp.code 完全一致。
- **复制改造**：换 `SYSTEM_APP_CODE`。

## FE·权限常量

引用 `repos/Agent_QualityAnalysis/frontend/src/constants/permissions.ts`：

```2:13:repos/Agent_QualityAnalysis/frontend/src/constants/permissions.ts
export const S3_PERMISSIONS = {
  // ...
  MENU_PERMISSIONS: 's3:menu:permissions',
```

- **做什么**：FE 权限码常量，须与 SSO catalog 同 diff。
- **关键点**：码值前缀 `s3:`；新增先 SSO catalog 再 FE。
- **复制改造**：换前缀（如 `s4:`）。

## FE·bindCatalog

引用 `repos/Agent_QualityAnalysis/frontend/src/constants/s3PermissionBindCatalog.ts`：

```10:35:repos/Agent_QualityAnalysis/frontend/src/constants/s3PermissionBindCatalog.ts
export const S3_SYSTEM_ENTRY_CODES = ['sys:s3-agent'] as const;
export const S3_PERMISSION_BIND_CATALOG: PermissionBindCatalog = {
  // ... 码 → 模块/菜单映射 ...
          key: 'menu',
          leaves: [{ code: 's3:menu:alerts', label: '质量预警' }],
```

- **做什么**：码 → 模块/菜单映射；含 SYSTEM 入口 `sys:s3-agent`。
- **关键点**：`S3_SYSTEM_ENTRY_CODES` 须与 SSO `ensureSystemAppEntryPermissions` 一致。
- **复制改造**：换 `sys:<app>` 与码值。

## FE·路由门禁

引用 `repos/Agent_QualityAnalysis/frontend/src/hooks/useS3MenuRouteGuard.ts`：

```51:70:repos/Agent_QualityAnalysis/frontend/src/hooks/useS3MenuRouteGuard.ts
 * EP 未加载（null）时不跳，交由 AuthGate hold。
export function useS3MenuRouteGuard() {
  // ...
  const { hasPermissionKey, iamPermissionCodes } = useAuthStore();
  // ... 无任何菜单码 → 跳首个允许页 ...
      navigate(firstAllowedPath(hasPermissionKey), { replace: true });
```

引用 `repos/Agent_QualityAnalysis/frontend/src/components/Common/Auth/AuthGate.tsx`：

```13:42:repos/Agent_QualityAnalysis/frontend/src/components/Common/Auth/AuthGate.tsx
 * SSO 启用时：校验会话并拉取 EP；未登录跳转 marsun_sso。
 * EP 未返回前 hold loading，避免菜单闪拒。
        // 页面加载/会话就绪时拉一次 EP（无周期自动刷；本地绑权另调 refreshIamPermissionCodes）
```

- **做什么**：菜单码挡路由；EP 未回 hold loading。
- **关键点**：EP null 时不跳（交 AuthGate hold）；防闪拒。
- **复制改造**：照抄 `useS3MenuRouteGuard` + `AuthGate`。

## SSO 侧 catalog

引用 `repos/marsun_sso/server/src/data/s3PermissionCatalog.ts`：

```1:10:repos/marsun_sso/server/src/data/s3PermissionCatalog.ts
export const S3_PERMISSION_CATALOG: S3PermissionDef[] = [
  // --- menu (侧栏) ------------------------------------------
  {
    key: 's3:menu:alerts',
    name: '质量预警',
    category: 'menu',
    description: '侧栏·质量预警',
  },
```

- import 命令：`npm run db:import-s3-permissions`（SSO 仓 server 目录）
- sync 命令：`npm run db:sync-s3-role-matrix`（同上）
- SystemApp.code = `s3-agent`；SYSTEM 入口 `sys:s3-agent`
- 独立 SystemApp（与 `assets` 分开）。
