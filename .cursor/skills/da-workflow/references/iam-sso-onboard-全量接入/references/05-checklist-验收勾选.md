# 全量接入验收勾选

> 本文件 = 全量接入交付前勾选。合并租户 Gate + 检查表 + 配置 + 三方码 + role-loop。
> 检查表 1–16 与租户 Gate 详见 [iam-system-onboard](../../../frontend-dev-spec/references/business/iam-system-onboard-新系统IAM接入齐套.md)，本文件不复制全文，仅列标题 + 链接 + 勾选位。

## 租户隔离 Gate（T1–T6）

引用 [iam-system-onboard §0.1](../../../frontend-dev-spec/references/business/iam-system-onboard-新系统IAM接入齐套.md)：

- [ ] T1 业务表带 `tenantId`
- [ ] T2 列表/详情/统计/导出/人员选项服务端 `where tenantId`
- [ ] T3 `stats:global` = 租户内全局，非跨租户
- [ ] T4 生产 `TENANT_ID_STRICT=true`（平台配置页热改）
- [ ] T5 新系统 IAM 接入含「租户隔离」Gate
- [ ] T6 他租户同名数据不可见（验收必跑）

## 检查表（1–16）

引用 [iam-system-onboard §1](../../../frontend-dev-spec/references/business/iam-system-onboard-新系统IAM接入齐套.md)：

- [ ] 1. SystemApp 注册（code/name；Admin 可见，显示名按产品）
- [ ] 2. SYSTEM 入口 `sys:<app>`（ensure **扫 SystemApp 表**动态保障；先有 App 行再 ensure；禁手写 specs）
- [ ] 3. 权限目录 catalog **本机已执行** import（有 JSON 记录；非仅代码合入）
- [ ] 4. 角色矩阵 **本机已执行** sync（`missingPermissionCodes: []`）
- [ ] 4b. SSO Admin 绑权中文 `*PermissionBindCatalog`（左侧非英文前缀回退）
- [ ] 5. 试点用户任命 + App 访问开关
- [ ] 6. FE EP 拉取 + store 分桶
- [ ] 7. FE Bridge 真实 hasPermission（禁 `() => true`）
- [ ] 8. FE 路由/侧栏门禁（EP 未回 hold）
- [ ] 9. BE PEP `requirePermission` 挂读/写 API
- [ ] 10. BE dataScope 适配
- [ ] 11. BE tenantId 强制过滤
- [ ] 12. dual 观测 → iam 硬拒绝切流
- [ ] 13. 错误信封统一
- [ ] 14. 审计日志
- [ ] 15. 文档同步
- [ ] 16. role-loop §2.5

## SSO 配置项核对

- [ ] `JWT_SECRET` 与 SSO 一致（.env，本页不可改）
- [ ] 平台配置页 `CORS_ORIGINS` 含本业务所有前端源
- [ ] 平台配置页 `ALLOWED_REDIRECT_ORIGINS` 含本业务回跳源
- [ ] `SESSION_COOKIE_NAME` 与 SSO 一致（.env 或平台配置页）
- [ ] 生产 `TENANT_ID_STRICT=true`（平台配置页）
- [ ] 独立 `*_IAM_AUTHZ_MODE` env（各 App 独立）

## 三方码一致

- [ ] SSO catalog（`<app>PermissionCatalog.ts`）⊇ FE `PERMISSIONS` 常量
- [ ] FE `PERMISSIONS` 常量 ⊇ BE `requirePermission` 挂载点
- [ ] SystemApp.code 与 `?app=` 字符串完全一致
- [ ] 每条 SYSTEM 入口 `sys:<app>` 存在

## role-loop §2.5 强制

命中任一即跑（见 [role-loop-review §2.5](../role-loop-review-角色循环验证.md)）：

- 改权限码 / 矩阵 / 绑权 / 侧栏门禁
- auth / 密钥 / .env
- 生产 SSH / DB
- 租户隔离

## role-loop 全场景闸门（阶段闸门）

接入全程不是只跑 §2.5，而是**每阶段一道闸门**（见 [SKILL.md「阶段闸门与 role-loop 绑定」](../SKILL.md)）：

- [ ] §2.1 需求：阶段 1 码表定稿**必跑**（码表/权限点清单未三方确认 → 禁进阶段 2）
- [ ] §2.3 前端：阶段 3 FE 壳**建议跑**（侧栏/门禁有「必须改」未确认 → 不继续）
- [ ] §2.2 接口：阶段 4–5 若改 REST **必跑**（有「必须改」未确认 → 不继续）
- [ ] §2.4 测试：阶段 7 验收**必跑**（验收标准不可当场检验 / 缺用例 → 必须改）
- [ ] §2.5 安全：阶段 7 验收**必跑**（见上节）

各场景命中判断见 [role-loop-review §1](../role-loop-review-角色循环验证.md)；未命中须一句话声明跳过（§2.5 未命中默认不跑、不必声明）。
**role-loop §4 硬规则**：有「必须改」默认停手等用户；禁擅自续修；不替代 vitest / 契约用例 / `da standards scan`。

## 诚实口径

- 未过 Gate **禁说**「已 G1 / 生产统一 IAM」。
- dual 接线 ≠ G1 完成（dual 是观测，iam 硬拒绝才是 G1）。
- 引用 marsun_sso 仓 `docs/iam-ops-checklist.md` §0（G0–G4 门禁）。
