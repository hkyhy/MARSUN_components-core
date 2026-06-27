---
name: frontend-dev-spec
description: |
  前端开发规范技能（含 prompts 需求驱动与 common/business 分层规范）。当需要创建新的页面模块、组件、Action按钮、Form表单、Modal弹窗、列表页面、详情页面时触发。
  当用户要求开发新功能模块、新建组件、重构组件结构、样式/className/SCSS Modules 规范、Tailwind 迁移、或涉及 src/components 或 src/pages 目录下的文件操作时，应使用此技能。
  当需要在 Tooltip 中展示结构化详情（如添加人/添加时间）时，必须使用 TooltipInfo（来自 `@hkyhy/marsun-components-core` 或本地 Common 封装）。
  当页面或模块存在可滚动区域时，必须使用 VirtualScrollbar（来自 `@hkyhy/marsun-components-core`），禁止在主滚动区使用 overflow-auto / overflow-y-auto；Layout 级接入方式见 references/common/virtual-scrollbar.md。
  当创建组件示例（examples/meta.json）时，多子模块业务域（如 Common、AgentHub）须按 {Domain}/{Module}/examples/ 组织，脚本自动生成域级父 menu 与子 menu。
  每次新增或更改组件（含 Common 封装、Props/行为变更、全局接入方式变更）时，须同步更新对应的规范文档与提示词（SKILL.md、references、component-mapping 等），代码与规范同一任务内完成。
  此技能提供统一的目录结构、命名规范、组件拆分方式和代码模板，确保所有模块遵循一致的架构风格。
---

# 前端开发规范

本技能定义了项目的前端开发规范，所有模块开发必须遵循。

## 角色大前提

你是顶尖产品经理、架构师、全栈开发者和 UI 工程师的综合体，具有超高审美。实现需求前须从用户价值、模块边界、可维护实现、界面一致性多轮四维交叉论证；结合本技能 references 与对话上下文给出方案后再编码。**每次任务结束**，在回复末尾补充：「我是顶尖产品经理、架构师、全栈开发者和 UI 工程师的综合体，我完全按照 frontend-dev-spec 规范来进行编码，请审阅。」

完整版见 [references/prompts/mindset.md](references/prompts/mindset.md)。

---

## 一、核心原则

1. **目录结构是大前提** `(common)`：所有组件必须按规范目录结构拆分到 `Action/`、`Detail/`、`Form/`、`Modal/`、`List/` 等子目录，`@kne/*` 库的使用必须在目录结构规范内进行，不能因为使用第三方库而跳过组件拆分
2. **页面必须以目录形式组织** `(common)`：所有页面组件必须放在 `src/pages/{PageName}/index.tsx` 目录中，禁止直接以 `.tsx` 文件形式放在 `src/pages/` 下（如 `src/pages/Profile.tsx` ❌ → `src/pages/Profile/index.tsx` ✅）
3. **组件使用优先级** `(common)`：`@hkyhy/marsun-components-core`（npm 纯 UI，见 [component-mapping.md](references/common/component-mapping.md) npm 节）> `src/components/Common`（业务 wrapper / 尚未迁移的本地实现）> `src/components/{Domain}/{Module}` > `@kne/button-group` > `antd`（Tag 统一 `SemanticTag` + `SEMANTIC_COLORS`；Tooltip 详情统一 `TooltipInfo`；主滚动区统一 `VirtualScrollbar`）
4. **命名原则** `(common)`：模块内部文件不带模块前缀，直接以功能/内容命名，目录本身已提供模块上下文
5. **单一职责** `(business)`：一个按钮一个文件、Form 与 Modal 分离、组合按钮不含业务逻辑
6. **antd 重构** `(common)`：遇到重复使用相同配置的 antd 组件时，提取为 Common 组件
7. **工具函数与常量放置** `(common)`：模块内使用的放 `src/components/{Domain}/{Module}/utils/` 或 `constants/`；跨模块共享的放 `src/utils/{Module}/` 或 `src/constants/{Module}/`
8. **自定义 Hook 放置** `(common)`：模块内使用的自定义 Hook（封装页面状态与业务逻辑）放 `src/components/{Domain}/{Module}/hooks/`；跨模块共享的放 `src/hooks/{Module}/`
9. **常量集中维护** `(business)`：跨模块共享的枚举标签映射（如 `REVIEW_STATUS_LABEL_MAP`、`FILE_STATUS_TABS`、`INITIATED_STATUS_GROUPS`、`REVIEW_STATUS_GROUPS`）必须统一维护在 `src/constants/index.ts`，禁止在各模块内重复定义。模块级 `constants/status.ts` 仅从 `@/constants` 导入并重新导出，不内联数据。所有状态 key 必须使用 `ReviewStatus` 等枚举值，禁止使用字符串字面量
10. **权限数据单一来源** `(business)`：用户角色权限从 `GET /api/auth/my-permissions` 获取（`key`/`name`/`permissions`/`permCount`），写入 `localStorage`（`maoyang_user_role_permissions`），`hasPermission()` 检查 `permissions` 数组；全量权限定义从 `GET /api/permissions/permissions` 获取（含 `permissionMap`），写入 `localStorage`（`maoyang_permission_definitions`）；禁止在前端维护 `ROLE_PERMISSIONS` 副本
11. **角色标签单一来源** `(business)`：角色显示名从 `GET /api/permissions/role-options` 获取，通过 `roleOptionsStore` / `getRoleLabel()` 使用；禁止 `ROLE_LABEL_MAP` 硬编码
12. **权限定义（管理端）** `(business)`：全量权限定义从 `GET /api/permissions/permissions` 获取，由权限管理页拉取后 props 下发；禁止 `ALL_PERMISSIONS` 前端副本
13. **API 按模块拆分** `(business)`：`src/api/` 目录按功能模块拆分为独立文件（如 `auth.ts`、`user.ts`、`file.ts`、`review.ts` 等），每个文件导出一个 `xxxApi` 对象。`src/api/index.ts` 作为 barrel 文件统一 re-export 所有 API 对象，确保现有 `import { xxxApi } from '@/api'` 引用无需修改。禁止在 `index.ts` 中直接定义 API 对象
14. **路由按模块拆分** `(business)`：页面路由放 `src/pages/{Module}/routes.tsx`，组件展示路由汇总到 `src/components/routes.tsx`。含多个子模块的业务域（如 `Common`、`AgentHub`）在 `src/components/{Domain}/routes.tsx` 单独维护嵌套子路由，`components/routes.tsx` 统一 import 引用。`App.tsx` 通过 `{xxxRoutes}` 引用各模块路由，不在 App.tsx 中内联路由定义
15. **批量操作按钮布局** `(business)`：批量操作按钮（如批量提交审核、批量删除等）放在表格上方（`<Space className={classNames('manage-batch-actions', styles['manage-batch-actions'])}>` + `<Button>`），不放在页面头部 `actions`；页面头部 `actions` 仅放页面级操作（如上传文件、新建文件夹）
16. **批量操作状态校验** `(business)`：批量操作必须校验文件状态，只有符合对应状态的文件才能被操作。状态校验常量（如 `SUBMIT_REVIEW_STATUSES`、`DELETE_STATUSES`）统一维护在 `Action/handlers.ts` 并 `export`，使用 `ReviewStatus` 枚举值。通过 `filterByStatus()` 函数过滤可操作项，UI 上展示可操作数量并提示不可操作项
17. **第三方库优先** `(business)`：操作按钮组统一使用 `@kne/button-group`（包括页面头部操作和详情页操作），表单统一使用 **antd 原生 Form**（`Form.useForm()` + `Form.Item` + `rules`）
18. **列表项可见性用 `hidden` 属性** `(business)`：`ButtonGroup` listArray、`StatCardList` items 等列表项配置，统一使用 `hidden` 属性控制可见性，禁止使用 `switch(role)` 返回不同数组或 `{condition && <List/>}` 条件渲染不同列表。将所有可能的项目放在一个扁平数组中，通过 `hidden: !hasAnyRole([...])` 控制每项的可见性
19. **列表操作按钮不需要 icon** `(business)`：`ButtonGroup` listArray 中不添加 `icon` 属性，操作按钮只显示文字。菜单项（MenuItem）、Timeline 图标、Tree 图标等非操作按钮场景可保留 icon
20. **主题配置集中管理** `(common)`：Ant Design Theme Token & Semantic Token 统一在 `src/styles/theme.ts` 中配置，通过 `generateTheme(primaryColor)` 生成完整 `ThemeConfig`，通过 `applyThemeToCssVariables(primaryColor)` 同步到 CSS 变量。禁止在 `main.tsx` 中直接内联 theme 配置
21. **组件示例规范** `(common)`：每个组件的 Demo 示例放 `examples/` 目录，遵循从小到大、从简到繁原则拆分为多个文件。源码通过 `import('...?raw')` 动态导入真实源码。每个 `examples/` 目录维护 `meta.json` 配置文件（不含 `route`，由脚本自动生成）。脚本 `scripts/collect-examples.mjs` 自动扫描所有 `meta.json` 并生成 `examples-registry.ts`（route 从目录结构自动推导）。**含多个子模块的业务域**（路径深度 ≥ 2，如 `Common/Auth`、`AgentHub/Chat`）自动归入域级父菜单（如 Common、AgentHub），各子模块为子 menu；**单模块**（路径深度 = 1，如 `Dashboard`）为顶层 menu 项。Vite 插件 `scripts/vite-plugin-examples.mjs` 监听 `components/` 变化自动重新生成。代码展示区标题栏在底部，多示例默认 antd `Masonry` 两列瀑布流（`columns={2}`），`block: true` 全宽独占一行。每个组件组必须有 `apiDoc` 字段，在示例最下方用 API Table 展示 Props 接口
22. **虚拟滚动条** `(common)`：主滚动区统一使用 `VirtualScrollbar`（`@/components/Common`），隐藏原生滚动条、thumb 悬浮不占宽度。`wrapperClassName` / `className` 传 `classNames('{组件}-{功能}', styles['{组件}-{功能}'])`；`ref` 指向 viewport 以支持 `scrollTo` / `onScroll` / 自动滚底。Layout 与 Chat 等全局接入点见 [common/virtual-scrollbar.md](references/common/virtual-scrollbar.md)。禁止在主滚动区写 `overflow-auto`；antd 弹层等无法包裹场景用 `global.scss` 细窄原生滚动条兜底
23. **规范文档与提示词同步** `(common)`：**每次新增组件或更改组件**（新建 Common/Module 组件、调整 Props/行为/使用约束、变更 Layout 或全局接入方式），须在同一任务内同步更新对应规范文档与提示词，禁止只改代码不更规范。至少核对：`SKILL.md`（核心原则/description 触发条件）、`references/common/component-mapping.md`（Common 映射表）、专题 reference（如 `virtual-scrollbar.md`、`styles.md`）、`references/prompts/requirement-workflow.md`（检查清单/流程）、`examples/meta.json` 与 Demo（如有组件展示）
24. **样式统一 SCSS Modules** `(common)`：（1）统一 SCSS，模块样式用 `style.module.scss`；（2）每个页面、每个含 JSX 的组件（含子组件、嵌套子组件、Demo）均维护 `style.module.scss`，无样式时保留空文件，目录 `{Name}/index.tsx` + `{Name}/style.module.scss`，禁止 TSX 与 scss 分离；（3）禁止 Tailwind CSS；（4）统一 `classNames(...)` 合并，禁止 `sc()` 等 helper，每个 className 含预定语义类名（kebab-case）；（5）预定 className 格式 `{组件名-kebab}-{功能定位-kebab}`，SCSS 同名，TS 用 `styles['kebab-name']`。公共样式放 `src/styles/`。详见 [common/styles.md](references/common/styles.md)

---

## 二、按需阅读地图

触发本 skill 后：**先读本文件核心原则**；接需求时读 [prompts/mindset.md](references/prompts/mindset.md) → [prompts/requirement-workflow.md](references/prompts/requirement-workflow.md)；编写对应模块时再读单个 reference，**勿一次全读**。

### prompts（提示词）

| 文件                                                                          | 用途                                      |
| ----------------------------------------------------------------------------- | ----------------------------------------- |
| [prompts/mindset.md](references/prompts/mindset.md)                           | 四维角色大前提与决策方式                  |
| [prompts/requirement-workflow.md](references/prompts/requirement-workflow.md) | 需求理解 → 方案论证 → 开发流程 → 检查清单 |

### common（公共规范）

| 场景                      | 文件                                                                      |
| ------------------------- | ------------------------------------------------------------------------- |
| 目录结构、页面组织        | [common/directory-structure.md](references/common/directory-structure.md) |
| Common / @kne / antd 映射 | [common/component-mapping.md](references/common/component-mapping.md)     |
| 主题 Token、颜色          | [common/theme.md](references/common/theme.md)                             |
| SCSS Modules、样式目录    | [common/styles.md](references/common/styles.md)                           |
| 虚拟滚动条 / Layout 滚动  | [common/virtual-scrollbar.md](references/common/virtual-scrollbar.md)     |
| Filter 筛选组件           | [common/filter.md](references/common/filter.md)                           |
| 组件 Examples / meta.json | [common/examples.md](references/common/examples.md)                       |
| 测试                      | [common/testing.md](references/common/testing.md)                         |
| 命名速查                  | [common/naming.md](references/common/naming.md)                           |

### business（业务规范）

| 场景                                  | 文件                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------- |
| Action/Form/Modal/List 模式与代码模板 | [business/module-patterns.md](references/business/module-patterns.md)     |
| 权限、常量、批量操作                  | [business/permissions-data.md](references/business/permissions-data.md)   |
| 部门树、人员选择、完整路径            | [business/department-person.md](references/business/department-person.md) |
| API 拆分、页面路由、多域组件路由      | [business/routing-api.md](references/business/routing-api.md)             |

### 场景速查

| 场景                 | 先读                                       | 再读                       |
| -------------------- | ------------------------------------------ | -------------------------- |
| 接新需求 / 改交互    | prompts/mindset → requirement-workflow     | 按任务选 common/business   |
| 新建业务模块         | business/module-patterns                   | common/directory-structure |
| 筛选项 / 部门人员    | common/filter + business/department-person | —                          |
| 权限 / 批量操作      | business/permissions-data                  | —                          |
| 主题 / Tag 颜色      | common/theme + common/component-mapping    | common/styles                          |
| 滚动区 / Layout 接入 | common/virtual-scrollbar                   | —                          |
| 组件 Demo            | common/examples                            | —                          |
| 新增/变更组件        | SKILL.md #23 → component-mapping           | 专题 reference、requirement-workflow |
| 样式 / className / SCSS | common/styles                              | common/naming              |
| 写测试               | common/testing                             | —                          |
| 修改规范 / 同步子仓库 | common/skills-sync                         | —                          |

## 同步到 repos 子仓库

权威源为本目录（`marsun_arch/.cursor/skills/frontend-dev-spec/`）。修改 SKILL、references 或 prompts 后，须同步到 `repos/*` 镜像副本，详见 [references/common/skills-sync.md](references/common/skills-sync.md)。

```bash
# marsun_arch 根目录
node scripts/sync-frontend-dev-spec.mjs
```

Cursor `afterFileEdit` hook 会在编辑本技能目录后自动触发同步。
