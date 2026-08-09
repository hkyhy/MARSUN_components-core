# 权限、常量与批量操作 Permissions Data

## 常量集中维护

跨模块共享的枚举标签映射（如 `REVIEW_STATUS_LABEL_MAP`、`FILE_STATUS_TABS`、`INITIATED_STATUS_GROUPS`、`REVIEW_STATUS_GROUPS`）必须统一维护在 `src/constants/index.ts`，禁止在各模块内重复定义。模块级 `constants/status.ts` 仅从 `@/constants` 导入并重新导出，不内联数据。所有状态 key 必须使用 `ReviewStatus` 等枚举值，禁止使用字符串字面量。

## 权限数据单一来源

- 用户角色权限从 `GET /api/auth/my-permissions` 获取（`key`/`name`/`permissions`/`permCount`），写入 `localStorage`（`maoyang_user_role_permissions`），`hasPermission()` 检查 `permissions` 数组
- 全量权限定义从 `GET /api/permissions/permissions` 获取（含 `permissionMap`），写入 `localStorage`（`maoyang_permission_definitions`）
- **禁止**在前端维护 `ROLE_PERMISSIONS` 副本
- 业务根节点须把当前用户权限码注入 `MarsunCoreProvider`：`auth.permissions`（数组）与/或 `auth.hasPermission`；供 core `Permissions` / `usePermissionsPass` 使用（见下「UI 权限控制」）

## 角色标签单一来源

角色显示名从 `GET /api/permissions/role-options` 获取，通过 `roleOptionsStore` / `getRoleLabel()` 使用；禁止 `ROLE_LABEL_MAP` 硬编码。

## 权限定义（管理端）

全量权限定义从 `GET /api/permissions/permissions` 获取，由权限管理页拉取后 props 下发；禁止 `ALL_PERMISSIONS` 前端副本。

## UI 权限控制（core）

对照 kne-union `Permissions`，实现位于 `@hkyhy/marsun-components-core`（`Permissions` / `usePermissions` / `usePermissionsPass` / `computedIsPass`）。**禁止**业务再实现一套平行的 tooltip/error/hidden 权限包裹组件。

### 与 PermissionGuard 分工

| 场景                                               | 使用                                    | 说明                                                         |
| -------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------ |
| 列表项按角色/权限显示隐藏                          | `hidden` 属性                           | ButtonGroup / StatCardList 等单项 `hidden: !hasAnyRole(...)` |
| 整块按**角色**或**单个** permission + fallback     | `PermissionGuard`                       | `roles` / `permission` + `fallback`；无 tooltip/error 三态   |
| 按钮/区域按**权限码**，需 hidden / tooltip / error | `Permissions`                           | `request` + `type`；权限列表来自 `auth.permissions`          |
| 组件外布尔判定                                     | `usePermissionsPass` / `computedIsPass` | 或业务侧基于 `permissions` 数组的 `hasPermission`            |

### 权限源（替代 kne Global）

kne 用 `PureGlobal preset.permissions`；Marsun 用：

```tsx
import { MarsunCoreProvider, Permissions, usePermissionsPass } from '@hkyhy/marsun-components-core';

<MarsunCoreProvider
  auth={{
    isAuthenticated: true,
    permissions: userRolePermissions?.permissions ?? [],
    hasPermission: (key) => (userRolePermissions?.permissions ?? []).includes(key),
    hasAnyRole: (roles) => roles.some((r) => userRoles.includes(r)),
  }}
>
  {children}
</MarsunCoreProvider>;
```

- `usePermissions()` → `auth.permissions`（缺省 `[]`）
- `usePermissionsPass({ request })`：优先用 `permissions` 列表；列表为空时回退 `auth.hasPermission(key)`
- **不**引入 kne `Global` / `permissionsPath` / `lodash.get`

### 判定语义

- `request` 为 `string[]` 且非空：**OR**（任一项命中即通过；对齐 kne 运行时 `some`，非 README 字面「全部」）
- `request` 为空 / 未传：视为通过
- `request` 可为函数：`(permissions: string[]) => boolean` 或 `() => boolean`
- `children` 可为函数：`({ isPass, type, request }) => ReactNode`（此时由调用方自行渲染，组件不再套 tooltip/error 壳）

### `type` 三态

| type             | 无权限时                                        | 典型场景             |
| ---------------- | ----------------------------------------------- | -------------------- |
| `hidden`（默认） | 不渲染（`null`）                                | 用户无需知道无此能力 |
| `tooltip`        | 可见但遮罩不可点 + Tooltip 文案                 | 按钮等交互位         |
| `error`          | antd `Result status="403"` + `subTitle=message` | 整块数据区无权限说明 |

默认 `message`：`您暂无权限，请联系管理员`。`tooltip` 可用 `tagName`（默认 `span`）包裹子节点。

### 示例

```tsx
import { Permissions } from '@hkyhy/marsun-components-core';

<Permissions type="tooltip" request={['user:delete']} message="无删除权限">
  <Button danger>删除</Button>
</Permissions>

<Permissions type="error" request={['order:view']}>
  <OrderPanel />
</Permissions>

<Permissions request={['user:view']}>
  {({ isPass }) => <Button disabled={!isPass}>编辑</Button>}
</Permissions>
```

Showcase：`marsun_components-core` → `/components/permissions`（Basic / Hooks / FunctionChildren）。

## 批量操作按钮布局

批量操作按钮（如批量提交审核、批量删除等）放在表格上方（`<Space className={classNames('manage-batch-actions', styles['manage-batch-actions'])}>` + `<Button>`），不放在页面头部 `actions`；页面头部 `actions` 仅放页面级操作（如上传文件、新建文件夹）。

## 批量操作状态校验

批量操作必须校验文件状态，只有符合对应状态的文件才能被操作：

- 状态校验常量（如 `SUBMIT_REVIEW_STATUSES`、`DELETE_STATUSES`）统一维护在 `Action/handlers.ts` 并 `export`，使用 `ReviewStatus` 枚举值
- 通过 `filterByStatus()` 函数过滤可操作项
- UI 上展示可操作数量并提示不可操作项
- 允许的状态列表（如 `SUBMIT_REVIEW_STATUSES`、`REVOKE_REVIEW_STATUSES`、`DELETE_STATUSES`、`ARCHIVE_STATUSES`）在 `Action/handlers.ts` 中用 `ReviewStatus` 枚举定义并 `export`

## 列表项可见性

`ButtonGroup` listArray、`StatCardList` items 等列表项配置，统一使用 `hidden` 属性控制可见性，禁止使用 `switch(role)` 返回不同数组或 `{condition && <List/>}` 条件渲染不同列表。将整个可能的项目放在一个扁平数组中，通过 `hidden: !hasAnyRole([...])` 控制每项的可见性。整个区块的角色/单权限守卫使用 `PermissionGuard`；需要 tooltip / error 呈现或权限码数组 OR 判定时用 core `Permissions`（权限列表注入 `MarsunCoreProvider auth.permissions`）。
