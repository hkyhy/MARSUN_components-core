# 改权限齐套（Assets / SSO 前端）

改业务权限码（增减/重命名/基线）时**同任务**必须齐套，禁止只改菜单或只改绑权 UI。

## 齐套检查表

```
改 Assets/SSO 权限码时同任务必须：
码表(Assets ALL_PERMISSIONS + SSO catalog) → 角色矩阵 → 菜单/路由/API
→ 绑权目录(含 defaultGranted) → FE 常量 PERMISSIONS
→ 功能与权限点清单 → PRD 相关节 → Test 用例+冒烟 → 七问/证据链条数量
全仓搜旧码清零；本地 import；禁止兼容旧码 OR；禁止只改一侧仓。
```

## 绑权 `defaultGranted`（基线）

- 目录叶子可标 `defaultGranted: true`（全员基线）。
- `PermissionBindPanel`：SYSTEM 入口打开时基线**勾选且 disabled**；保存合并锁定 id。
- Assets 基线 SSOT：清单 §1.3.1 / `ASSETS_BASELINE_PERMISSIONS`（含 `review:initiated` 等）。
- 审核侧栏叶子展示名=产品侧栏名；权限最大的「全部审核」置顶，禁止用模糊「审核管理」作唯一解释。

## IAM 薄壳门禁

- `dept:view` / `user:view`：只读拉 SSO 本租户 GET（见 [routing-api](./routing-api-路由与API.md)「IAM 薄壳」）。
- 任命保存须 `system:permission`（或 `system:admin`）；勿对基线用户暴露可写「权限管理」。

## 触发

涉及 `PERMISSIONS`、绑权目录、侧栏 `permission`、审核/文件门禁时读本页 + [permissions-data-权限与常量.md](./permissions-data-权限与常量.md)。
