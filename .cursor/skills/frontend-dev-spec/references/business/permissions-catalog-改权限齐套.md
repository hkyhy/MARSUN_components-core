# 改权限齐套（Assets / SSO / 任意业务 App · 前端）

改业务权限码（增减/重命名/基线）或**新系统接入 IAM**时，须同任务齐套；禁止只改菜单或只改绑权 UI。

**新系统 / Wave 接线**：先读 [iam-system-onboard-新系统IAM接入齐套.md](./iam-system-onboard-新系统IAM接入齐套.md) 全套检查表，再执行下表。

## 齐套检查表

```
【改已有 App 权限码】同任务必须：
码表(业务 ALL_PERMISSIONS/常量 + SSO {app}PermissionCatalog)
→ 角色矩阵 → 菜单/路由/API 门禁
→ 绑权目录 bindCatalog（含 defaultGranted）→ FE PERMISSIONS 常量
→ 功能与权限点清单 → PRD 相关节 → Test 用例+冒烟+侧栏核对
→ 七问扫查 / 证据链条数量回写
全仓搜旧码清零；本地 import；禁止兼容旧码 OR；禁止只改一侧仓。

【新系统 IAM 接入】另须（详见 onboard 文）：
业务真源对照表 → EP snapshot（userId 分桶）→ Bridge auth.permissions
→ 退 DEMO/恒真门禁 → 独立 authz env 登记 → Plane/WorkRecord → 角色循环验证（含 [§2.5 安全](../../../da-workflow/references/role-loop-review-角色循环验证.md)）
```

## 绑权 `defaultGranted`（基线）

- 目录叶子可标 `defaultGranted: true`（全员基线）。
- `PermissionBindPanel`：SYSTEM 入口打开时基线**勾选且 disabled**；保存合并锁定 id。
- Assets 基线 SSOT：清单 §1.3.1 / `ASSETS_BASELINE_PERMISSIONS`（含 `review:initiated` 等）。
- 审核侧栏叶子展示名=产品侧栏名；权限最大的「全部审核」置顶，禁止用模糊「审核管理」作唯一解释。
- **S3 / 其他 App**：基线写在本 App 清单 + `{app}PermissionBindCatalog`；与 SSO catalog **同 diff**。

## FE 常量与搜旧

- 菜单 `permission`、按钮门禁码须来自 `PERMISSIONS`（或等价常量），禁止魔法字符串散落。
- 改码/接线后：全仓搜旧码、DEMO key、`hasPermission: () => true`、废码；清零或隔离。

## IAM 薄壳门禁

- `dept:view` / `user:view`：只读拉 SSO 本租户 GET（见 [routing-api](./routing-api-路由与API.md)「IAM 薄壳」）。
- 任命保存须 `system:permission`（或 `system:admin`）；勿对基线用户暴露可写「权限管理」。
- 业务内「权限配置」页：只读提示或深链 SSO Admin。

## EP / Bridge（接线后）

- `iamPermissionCodes === null` 时 hold 壳 loading；按 userId 分桶持久化；拒绝裸数组 legacy。
- `MarsunCoreProvider` 注入 `auth.permissions` + 真实 `hasPermission`。

## 触发

涉及 `PERMISSIONS`、绑权目录、侧栏 `permission`、审核/文件门禁、**新系统 IAM**、功能权限点清单时：读本文 + [iam-system-onboard](./iam-system-onboard-新系统IAM接入齐套.md) + [permissions-data-权限与常量.md](./permissions-data-权限与常量.md)。
