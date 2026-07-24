# 权限、常量与批量操作 Permissions Data

## 常量集中维护

跨模块共享的枚举标签映射（如 `REVIEW_STATUS_LABEL_MAP`、`FILE_STATUS_TABS`、`INITIATED_STATUS_GROUPS`、`REVIEW_STATUS_GROUPS`）必须统一维护在 `src/constants/index.ts`，禁止在各模块内重复定义。模块级 `constants/status.ts` 仅从 `@/constants` 导入并重新导出，不内联数据。所有状态 key 必须使用 `ReviewStatus` 等枚举值，禁止使用字符串字面量。

## 权限数据单一来源

- 用户角色权限从 `GET /api/auth/my-permissions` 获取（`key`/`name`/`permissions`/`permCount`），写入 `localStorage`（`maoyang_user_role_permissions`），`hasPermission()` 检查 `permissions` 数组
- 全量权限定义从 `GET /api/permissions/permissions` 获取（含 `permissionMap`），写入 `localStorage`（`maoyang_permission_definitions`）
- **禁止**在前端维护 `ROLE_PERMISSIONS` 副本

## 角色标签单一来源

角色显示名从 `GET /api/permissions/role-options` 获取，通过 `roleOptionsStore` / `getRoleLabel()` 使用；禁止 `ROLE_LABEL_MAP` 硬编码。

## 权限定义（管理端）

全量权限定义从 `GET /api/permissions/permissions` 获取，由权限管理页拉取后 props 下发；禁止 `ALL_PERMISSIONS` 前端副本。

## 批量操作按钮布局

批量操作按钮（如批量提交审核、批量删除等）放在表格上方（`<Space className={classNames('manage-batch-actions', styles['manage-batch-actions'])}>` + `<Button>`），不放在页面头部 `actions`；页面头部 `actions` 仅放页面级操作（如上传文件、新建文件夹）。

## 批量操作状态校验

批量操作必须校验文件状态，只有符合对应状态的文件才能被操作：

- 状态校验常量（如 `SUBMIT_REVIEW_STATUSES`、`DELETE_STATUSES`）统一维护在 `Action/handlers.ts` 并 `export`，使用 `ReviewStatus` 枚举值
- 通过 `filterByStatus()` 函数过滤可操作项
- UI 上展示可操作数量并提示不可操作项
- 允许的状态列表（如 `SUBMIT_REVIEW_STATUSES`、`REVOKE_REVIEW_STATUSES`、`DELETE_STATUSES`、`ARCHIVE_STATUSES`）在 `Action/handlers.ts` 中用 `ReviewStatus` 枚举定义并 `export`

## 列表项可见性

`ButtonGroup` listArray、`StatCardList` items 等列表项配置，统一使用 `hidden` 属性控制可见性，禁止使用 `switch(role)` 返回不同数组或 `{condition && <List/>}` 条件渲染不同列表。将整个可能的项目放在一个扁平数组中，通过 `hidden: !hasAnyRole([...])` 控制每项的可见性。整个区块的权限控制仍使用 `PermissionGuard`。
