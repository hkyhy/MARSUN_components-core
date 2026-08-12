---
name: frontend-dev-spec
description: |
  React 19 + antd 6 + marsun-components-core 前端规范。触发：新建/改 src/components|pages、Form/Modal/Action/Filter/列表详情、VirtualScrollbar、PageSpin、TooltipInfo、Permissions/IAM 齐套、core Table、Icons、样式/目录、FOCUS/module-patterns、canQuery/选择性筛选、契约三件套、自检/循环验证。细则只读 references/（common|business|prompts）；禁止把规范全文写进 description。
---

# 前端开发规范 Frontend Development Spec

本技能定义了项目的前端开发规范，所有模块开发必须遵循。

## 技术栈（硬约束）

| 项                | 版本要求                        | 说明                                                                                             |
| ----------------- | ------------------------------- | ------------------------------------------------------------------------------------------------ |
| React / React DOM | `^19.0.0`                       | 新建与存量业务前端子仓库均须 React 19；禁止新建 React 18 项目                                    |
| Ant Design        | `^6.0.0`                        | 与 `@hkyhy/marsun-components-core` peer 对齐；禁止新建 antd 5 项目                               |
| 组件库            | `@hkyhy/marsun-components-core` | peer 为 React 19 + antd 6；业务 `package.json` 须直接声明同主版本 `react` / `react-dom` / `antd` |

安装示例见 [common/component-mapping-组件映射.md](references/common/component-mapping-组件映射.md)。**禁止**再以 antd 5 / React 18 + `--legacy-peer-deps` 作为规范默认路径。

## 角色大前提

你是产品经理、架构师、全栈开发者、UI 工程师和测试工程师的综合体，五类角色在各自领域内均达世界前十水平，并具有顶尖审美。实现需求前须从用户价值、模块边界、可维护实现、界面一致性、可测与验收多轮五维交叉论证；结合本技能 references 与对话上下文给出方案后再编码。

**SSOT（通用）**：[da-workflow/mindset-角色大前提.md](../da-workflow/references/mindset-角色大前提.md)（五维、会话、开场/收尾模板、复检）。  
**前端叠加**：[references/prompts/mindset-角色大前提.md](references/prompts/mindset-角色大前提.md)（组件大前提、React/antd、大表门禁）。  
**复检输出模板**：[requirement-workflow「七」](references/prompts/requirement-workflow-需求工作流.md)。

**每次任务开始** / **结束** 的固定开场句与收尾句见前端叠加 mindset（`{active-skill}` = `frontend-dev-spec`）；结束前须先做任务结束复检，**未获用户明确指示前禁止擅自续修**。

---

## 一、核心原则

1. **目录结构是大前提** `(common)`：所有组件必须按规范目录结构拆分到 `Action/`、`Detail/`、`Form/`、`Modal/`、`List/` 等子目录，`@kne/*` 库的使用必须在目录结构规范内进行，不能因为使用第三方库而跳过组件拆分
2. **页面必须以目录形式组织** `(common)`：所有页面组件必须放在 `src/pages/{PageName}/index.tsx` 目录中，禁止直接以 `.tsx` 文件形式放在 `src/pages/` 下（如 `src/pages/Profile.tsx` ❌ → `src/pages/Profile/index.tsx` ✅）
3. **组件使用优先级** `(common)`：`@hkyhy/marsun-components-core`（npm 纯 UI，见 [component-mapping-组件映射.md](references/common/component-mapping-组件映射.md) npm 节）> `src/components/Common`（业务 wrapper / 尚未迁移的本地实现）> `src/components/{Domain}/{Module}` > `@kne/button-group` > `antd`（Tag 统一 `SemanticTag` + `SEMANTIC_COLORS`；Tooltip 详情统一 `TooltipInfo`；主滚动区统一 `VirtualScrollbar`）。**列表 Table 硬约束**：业务禁止 `import { Table } from 'antd'`；必须用 core `Table`；**必须**传稳定 `tableName`；是否可自定义列用 `columnConfigEnabled`（默认 `!!tableName`）；为 true 时最右独立齿轮列（跨多级表头）+ `fetchColumnConfig`/`saveColumnConfig`（QA 用 `userPrefs`）。豁免：Form `TableList`、纯 HTML `<table>`、showcase ApiDoc 表
4. **命名原则** `(common)`：模块内部文件不带模块前缀，直接以功能/内容命名，目录本身已提供模块上下文
5. **单一职责** `(business)`：一个按钮一个文件、Form 与 Modal 分离、组合按钮不含业务逻辑
6. **antd 重构** `(common)`：遇到重复使用相同配置的 antd 组件时，提取为 Common 组件
7. **工具函数与常量放置** `(common)`：模块内使用的放 `src/components/{Domain}/{Module}/utils/` 或 `constants/`；跨模块共享的放 `src/utils/{Module}/` 或 `src/constants/{Module}/`
8. **自定义 Hook 放置** `(common)`：模块内使用的自定义 Hook（封装页面状态与业务逻辑）放 `src/components/{Domain}/{Module}/hooks/`；跨模块共享的放 `src/hooks/{Module}/`
9. **常量集中维护** `(business)`：跨模块共享的枚举标签映射（如 `REVIEW_STATUS_LABEL_MAP`、`FILE_STATUS_TABS`、`INITIATED_STATUS_GROUPS`、`REVIEW_STATUS_GROUPS`）必须统一维护在 `src/constants/index.ts`，禁止在各模块内重复定义。模块级 `constants/status.ts` 仅从 `@/constants` 导入并重新导出，不内联数据。所有状态 key 必须使用 `ReviewStatus` 等枚举值，禁止使用字符串字面量
10. **权限数据单一来源** `(business)`：用户角色权限从 `GET /api/auth/my-permissions` 获取（`key`/`name`/`permissions`/`permCount`），写入 `localStorage`（`maoyang_user_role_permissions`），`hasPermission()` 检查 `permissions` 数组；全量权限定义从 `GET /api/permissions/permissions` 获取（含 `permissionMap`），写入 `localStorage`（`maoyang_permission_definitions`）；禁止在前端维护 `ROLE_PERMISSIONS` 副本。业务须将权限码注入 `MarsunCoreProvider auth.permissions`（及可选 `hasPermission`），供 core `Permissions` 使用
11. **角色标签单一来源** `(business)`：角色显示名从 `GET /api/permissions/role-options` 获取，通过 `roleOptionsStore` / `getRoleLabel()` 使用；禁止 `ROLE_LABEL_MAP` 硬编码
12. **权限定义（管理端）** `(business)`：全量权限定义从 `GET /api/permissions/permissions` 获取，由权限管理页拉取后 props 下发；禁止 `ALL_PERMISSIONS` 前端副本
13. **UI 权限控制** `(common)`：按钮/区域按权限码且需 `hidden` / `tooltip` / `error` 时，必须用 `@hkyhy/marsun-components-core` 的 `Permissions`（`request` 数组为 **OR**；权限源 `auth.permissions`，列表空时回退 `hasPermission`）；组件外判定用 `usePermissionsPass` / `computedIsPass`。整块按**角色**或**单个** permission + `fallback` 用 `PermissionGuard`。列表项可见性仍用 `hidden`。禁止手写平行权限包裹层、禁止业务再造 kne Global。详见 [business/permissions-data-权限与常量.md](references/business/permissions-data-权限与常量.md)
14. **API 按模块拆分** `(business)`：`src/api/` 目录按功能模块拆分为独立文件（如 `auth.ts`、`user.ts`、`file.ts`、`review.ts` 等），每个文件导出一个 `xxxApi` 对象。`src/api/index.ts` 作为 barrel 文件统一 re-export 所有 API 对象，确保现有 `import { xxxApi } from '@/api'` 引用无需修改。禁止在 `index.ts` 中直接定义 API 对象
15. **路由按模块拆分** `(business)`：页面路由放 `src/pages/{Module}/routes.tsx`，组件展示路由汇总到 `src/components/routes.tsx`。含多个子模块的业务域（如 `Common`、`AgentHub`）在 `src/components/{Domain}/routes.tsx` 单独维护嵌套子路由，`components/routes.tsx` 统一 import 引用。`App.tsx` 通过 `{xxxRoutes}` 引用各模块路由，不在 App.tsx 中内联路由定义
16. **批量操作按钮布局** `(business)`：批量操作按钮（如批量提交审核、批量删除等）放在表格上方（`<Space className={classNames('manage-batch-actions', styles['manage-batch-actions'])}>` + `<Button>`），不放在页面头部 `actions`；页面头部 `actions` 仅放页面级操作（如上传文件、新建文件夹）
17. **批量操作状态校验** `(business)`：批量操作必须校验文件状态，只有符合对应状态的文件才能被操作。状态校验常量（如 `SUBMIT_REVIEW_STATUSES`、`DELETE_STATUSES`）统一维护在 `Action/handlers.ts` 并 `export`，使用 `ReviewStatus` 枚举值。通过 `filterByStatus()` 函数过滤可操作项，UI 上展示可操作数量并提示不可操作项
18. **第三方库优先** `(business)`：操作按钮组统一使用 `@kne/button-group`（包括页面头部操作和详情页操作），表单统一从 **`@hkyhy/marsun-components-core`** 导入——默认 FormInfo 栈（`Form` / `FormInfo` / `FormModal` / `FormSteps` + `rule`）；进阶引擎用 `ReactForm` / `useField` / `useFormApi` / `GroupList` 等。**禁止**业务直连 `@kne/form-info`、`@kne/react-form`。存量未迁移模块可暂留 antd Form；**新模块、新表单必须走 core FormInfo（默认）**
19. **列表项可见性用 `hidden` 属性** `(business)`：`ButtonGroup` listArray、`StatCardList` items 等列表项配置，统一使用 `hidden` 属性控制可见性，禁止使用 `switch(role)` 返回不同数组或 `{condition && <List/>}` 条件渲染不同列表。将所有可能的项目放在一个扁平数组中，通过 `hidden: !hasAnyRole([...])` 控制每项的可见性。整块角色/单权限用 `PermissionGuard`；权限码三态呈现用 `Permissions`（见 #13）
20. **图标统一从 core 导出** `(common)`：业务项目禁止直接 `import from 'lucide-react'` 或 `@ant-design/icons`；统一从 `@hkyhy/marsun-components-core` 导入 Icons（如 `RefreshCw`、`CircleAlert`），加载态用 `spin` prop。缺图标时先在 `marsun_components-core` 的 `Icons` 模块补导出，再业务引用。详见 [component-mapping-组件映射.md](references/common/component-mapping-组件映射.md) Icons 节
21. **ButtonGroup 操作按钮 icon 规则** `(business)`：常规 CRUD（编辑/删除/导出等）listArray **不加 icon**，只显示文字；**刷新**等需语义识别的 Header/工具栏操作使用 `refreshAction`（`Action/refreshAction.tsx`）或 listArray 的 `icon: <RefreshCw spin={loading} />`。菜单项、Timeline、Tree 等非 ButtonGroup 操作场景可保留 icon
22. **主题配置集中管理** `(common)`：Ant Design Theme Token & Semantic Token 统一在 `src/styles/theme.ts` 中配置，通过 `generateTheme(primaryColor)` 生成完整 `ThemeConfig`，通过 `applyThemeToCssVariables(primaryColor)` 同步到 CSS 变量。禁止在 `main.tsx` 中直接内联 theme 配置
23. **组件示例规范** `(common)`：每个组件的 Demo 示例放 `examples/` 目录，遵循从小到大、从简到繁原则拆分为多个文件。源码通过 `import('...?raw')` 动态导入真实源码。每个 `examples/` 目录维护 `meta.json` 配置文件（不含 `route`，由脚本自动生成）。脚本 `scripts/collect-examples.mjs` 自动扫描所有 `meta.json` 并生成 `examples-registry.ts`（route 从目录结构自动推导）。**含多个子模块的业务域**（路径深度 ≥ 2，如 `Common/Auth`、`AgentHub/Chat`）自动归入域级父菜单（如 Common、AgentHub），各子模块为子 menu；**单模块**（路径深度 = 1，如 `Dashboard`）为顶层 menu 项。Vite 插件 `scripts/vite-plugin-examples.mjs` 监听 `components/` 变化自动重新生成。代码展示区标题栏在底部，多示例默认 antd `Masonry` 两列瀑布流（`columns={2}`），`block: true` 全宽独占一行。每个组件组必须有 `apiDoc` 字段，在示例最下方用 API Table 展示 Props 接口。**硬约束（能力点 ↔ Demo）**：`marsun_components-core`（及业务组件展示）每次 Props/行为/新能力变更，必须在该组件 `examples/` **增加或更新对应场景 Demo** 并写入 `meta.json`；能力点与 Demo 一一对应（如 Table：单表头、多表头、列配置），禁止只改实现、禁止用一个 BasicDemo 覆盖全部新能力。详见 [common/examples-组件示例.md](references/common/examples-组件示例.md) §8.2
24. **虚拟滚动条** `(common)`：主滚动区统一使用 `VirtualScrollbar`（`@/components/Common`），隐藏原生滚动条、thumb 悬浮不占宽度。`wrapperClassName` / `className` 传 `classNames('{组件}-{功能}', styles['{组件}-{功能}'])`；`ref` 指向 viewport 以支持 `scrollTo` / `onScroll` / 自动滚底。Layout 与 Chat 等全局接入点见 [common/shell-layout-页面壳与布局.md](references/common/shell-layout-页面壳与布局.md)。禁止在主滚动区写 `overflow-auto`；antd 弹层等无法包裹场景用 `global.scss` 细窄原生滚动条兜底
25. **规范文档与提示词同步** `(common)`：**每次新增组件或更改组件**（新建 Common/Module 组件、调整 Props/行为/使用约束、变更 Layout 或全局接入方式），须在同一任务内同步更新对应规范文档与提示词，禁止只改代码不更规范。至少核对：`SKILL.md`（核心原则/description 触发条件）、`references/common/component-mapping-组件映射.md`（Common 映射表）、专题 reference（如 `shell-layout-页面壳与布局.md`、`styles-样式规范.md`）、`references/prompts/requirement-workflow-需求工作流.md`（检查清单/流程）、`examples/meta.json` 与 Demo——**新能力是否已有独立或已更新的场景 Demo**（如有组件展示）
26. **样式统一 SCSS Modules** `(common)`：（1）统一 SCSS，模块样式用 `style.module.scss`；（2）每个页面、每个含 JSX 的组件（含子组件、嵌套子组件、Demo）均维护 `style.module.scss`，无样式时保留空文件，目录 `{Name}/index.tsx` + `{Name}/style.module.scss`，禁止 TSX 与 scss 分离；（3）禁止 Tailwind CSS；（4）统一 `classNames(...)` 合并，禁止 `sc()` 等 helper，每个 className 含预定语义类名（kebab-case）；（5）预定 className 格式 `{组件名-kebab}-{功能定位-kebab}`，SCSS 同名，TS 用 `styles['kebab-name']`。公共样式放 `src/styles/`。详见 [common/styles-样式规范.md](references/common/styles-样式规范.md)
27. **npm 全量导出** `(common)`：`marsun_components-core` 每个对外组件、子组件、hook、utils、types 须经模块 `index.ts` → 包根 `src/index.ts` 导出；禁止仅 showcase 内 deep import。新增符号时同步更新 `component-mapping-组件映射.md` 与 `examples/meta.json`
28. **公共 Token 三层接入** `(common)`：静态默认值 `import '@hkyhy/marsun-components-core/tokens'` → 运行时 `applyThemeToCssVariables(primaryColor)` → 项目 `tokens.css` 仅扩展领域变量。CSS 变量命名统一 `--primary-color` / `--font-color-grey-*`，禁止项目自建 `--color-primary` 平行体系。详见 [common/theme-主题Token.md](references/common/theme-主题Token.md)
29. **Commit 同步 Plane** `(common)`：子仓库已配置 Plane 时，**每次 git commit 后**须 `@da pm dry-run` → sync，更新 `sync_manifest` 任务 status；新任务 id 须对齐钉钉层级（`S3.3.*` 等，见 [da-workflow/task-naming](../da-workflow/references/task-naming.md)）；**取号前 `plane_pull`，`id = max(名称 S3.3.N)+1`，勿盲信 `next_task_id`**；细粒度挂钉表 V0.2 大颗粒 `parent_issue`（见 [task-relationships](../da-workflow/references/task-relationships.md)）；my-plane 维持 `M003-*` 例外
30. **core 依赖提交态** `(common)`：`package.json` 中 `@hkyhy/marsun-components-core` **提交时必须 semver**，且**版本号与 npm 已发布最新版一致**（如 `^0.1.15`）；禁止 `file:` / lockfile `link: true`；本地联调用 `MARSUN_CORE_LOCAL` + Vite alias。详见 [component-mapping-组件映射.md](references/common/component-mapping-组件映射.md)
31. **core 版本与实版一致；npm 由 `chore(release)` CI 发布** `(common)`：`marsun_components-core` 开发中 version **= npm 已发布最新**；交付时功能 commit 内 `version` bump（`npm run version:check:apply`）；**npm publish 仅** `release.yml` 在 push **首行** `chore(release): v{version}` 时触发（`feat`/`fix` push **不会**发 npm）。推荐：功能+version 同 commit → CI verify 绿 → 再推 `chore(release): vX.Y.Z`；或单提交首行即 `chore(release): vX.Y.Z …`（含功能+version）。业务仓升 `^`/lockfile 与业务 diff **同包**；**禁止本地 npm publish**。**新增源码运行时 `import`**：须同 commit 写入 `package.json`+lock，并加入 `vite.config.lib.ts` `rollupOptions.external`（含 CSS 子路径）；提交前 `npm ci && npm run build && npm run build:showcase`。改 Demo/`meta.json` 须同包 `collect-examples`；`release.yml` typecheck 前须 collect（与 CI 一致）。见 [component-mapping-组件映射.md](references/common/component-mapping-组件映射.md)
32. **模块页全局 Loading** `(common)`：`PageSpin`、`PageShellProvider`、`usePageShellLoading`、`ModulePageShell` 来自 `@hkyhy/marsun-components-core`；App Layout 须包 `PageShellProvider`；页面用 `spinning` 或 `usePageShellLoading`，禁止局部 loading 文案叠层。见 [shell-layout-页面壳与布局.md](references/common/shell-layout-页面壳与布局.md)
33. **代码格式化与 Lint** `(common)`：所有前端子仓库须安装 Prettier + ESLint + Husky 工具链（`prettier`、`eslint`、`eslint-config-prettier`、`eslint-plugin-prettier`、`typescript-eslint`、`lint-staged`、`husky` 等），根目录配置 `.prettierrc` + `eslint.config.js` + `.husky/pre-commit`，`package.json` 提供 `lint` / `lint:fix` / `format` / `lint-staged` / `prepare` scripts；参考 `repos/maoyang_data-asset-system` 与 `repos/marsun_components-core`。详见 [code-formatting-代码格式化.md](references/common/code-formatting-代码格式化.md)
34. **模块主区扁平布局** `(business)`：`ModulePageShell` 已提供 `title`/`description` 时，**禁止**再传与 title 重复的 `breadcrumb`；主内容 workarea **禁止**双层 card（外层 border + 内层 padding）。主区用 `ContentCard flat` 或等价 `flex:1` 容器；Tabs/Table 内容区 `width:100%`；页脚主操作按钮默认 **非 block**（Drawer/窄容器可用 `saveBlock`）。详见 [styles-样式规范.md](references/common/styles-样式规范.md)「模块 workarea 扁平化」
35. **非业务代码进 core** `(common)`：新建或修改 `src/utils/**` 前 **MUST** 查 `@hkyhy/marsun-components-core` 包根导出（见 [component-mapping-组件映射.md](references/common/component-mapping-组件映射.md) npm Utils 表）。**已存在于 core 的函数禁止在业务项目再写同名/同义 `src/utils/*.ts` 文件**；直接从包 import（如 `toDateTimeRange`、`recentDayRangeStrings`）。纯函数、无项目 API/store/业务枚举 → 写 core；含 zustand、业务 API、领域常量 → 留业务项目。仅允许薄配置层（`request.ts`、`Files/download.ts` 注入 token）。core 新增导出须同步 `src/index.ts` + component-mapping + 升版发布
36. **Filter label 语义化** `(common)`：`FilterInput`/`FilterSelect`/`FilterDateRange` 的 `label` 禁止使用「关键词」等抽象词，须用字段业务语义（可与 placeholder 相同）。见 [filter-筛选组件.md](references/common/filter-筛选组件.md) §5.1.1
37. **筛选项加载态与失败** `(common)`：**loading 亦须占位渲染**（禁止 `metaLoading → return null` / 整栏隐藏）；传 `loading` 给 Filter* 时 **Filter Item（Trigger）显示 `Loader2 spin`**，打开面板列表用 **Spin**（禁止 loading 时「暂无数据」）；落定空态用 core **`Empty iconType="simple"`**；失败仅 `message.error`（禁止拼接 HTTP/raw），**禁止**内联错误区；筛选优先挂 `ModulePageShell` `toolbar`（Spin 外）；**选项 loading 禁止并入内容区 `pageLoading`**；**默认选中须来自 meta/options**，**禁止**硬编码工厂 code（如 `1001`）。路径级联（分厂→品种）用 **`FilterCascader`**（`leafOnly` + 可选 `onChangePath`），任意深树勾选仍用 `FilterTreeSelect`。见 [filter-筛选组件.md](references/common/filter-筛选组件.md) §5.9、[shell-layout-页面壳与布局.md](references/common/shell-layout-页面壳与布局.md)
38. **InteractiveBlock 内容块** `(common)`：title → **Info** icon + `TooltipInfo`（禁止 `CircleHelp`）→ actions（字号 ≤ title）；**tags 紧贴 subtitle**（inline/below），**禁止**在 description 之后；可点击块勿用 `<button>` 包裹 Tooltip；见 [shell-layout-页面壳与布局.md](references/common/shell-layout-页面壳与布局.md)
39. **少 border 布局** `(common)`：模块 workarea 少 panel border；**列表项用 theme 背景块 + gap**，禁止 `border-bottom` 线分割。见 [styles-样式规范.md](references/common/styles-样式规范.md) §8.11
40. **InteractiveBlock action 尺寸** `(common)`：link 操作字号不得大于 title（title 14px / actions 12px，icon 14px）；icon 颜色与 link 文字一致；导出用 `Download`；info trigger `cursor: pointer`
41. **非 prod 组件展示切换** `(common)`：所有业务前端子仓库（非 marsun_components-core dev app）须在 `App.tsx` 用 `import.meta.env.DEV` 双 guard 接入：（1）antd `FloatButton` 在业务页与 `/components` 间切换（图标 `LayoutGrid` / `House`，均从 `@hkyhy/marsun-components-core`）；（2）`/components` 路由 + `ComponentsLayout` + `componentRoutes`（collect-examples 自动生成）。生产 build 不包含上述代码。参考 `repos/maoyang_data-asset-system/src/App.tsx`；新建仓库 checklist 见 [examples-组件示例.md](references/common/examples-组件示例.md) §8.8
42. **REST 契约同任务落 backend-dev** `(common)`：新接或改造任一 REST（含「已有平台接口」如 `user_key_get`/`user_key_set`）时，**同任务**更新 marsun_arch `backend-dev/{data-dev|agent-dev|platform-dev|mock}/` 三件套（`接口.md` + OpenAPI + 测试用例）；禁止只写 `src/api/*.ts`。落点见 [backend-dev-spec / openapi-apifox §3.2](../backend-dev-spec/references/common/openapi-apifox-契约标注.md)；用户偏好示例：[platform-dev/用户偏好](../../../backend-dev/platform-dev/用户偏好/接口.md)
43. **可复用问题同任务沉淀** `(common)`：Cursor 联调/开发中若解决了**可复用、非显而易见**的问题（组件用法、布局、环境、信封/分页、落点冲突等），须**同任务**写入对应 skill reference / `component-mapping` / `backend-dev` 契约或 mapping；禁止只留在对话。仅本事项不可复用者写 WorkRecord 进展即可。**禁止**另建「踩坑大全」第二真相源，**禁止**把工程踩坑写入 `TextilePublicKnowledge/`。落点见 [marsun-arch-doc-spec / placement-guide](../marsun-arch-doc-spec/references/placement-guide.md)
44. **写代码门禁（自动化测试 + 自检）** `(common)`：新建组件 / 改纯逻辑须**同任务**补或更新 `__tests__`（见 [testing-测试规范](references/common/testing-测试规范.md)）；提交前**本人**跑通 `npm run test` 或 `npx vitest run <path>`（禁止以 AI「声称测过」代替）；再 `da standards scan` → `da standards commit`。无对应测试不得标任务完成（可 `[WIP]`）。统一流水线与加强自检清单：[da-workflow/test-and-selfcheck](../da-workflow/references/test-and-selfcheck-写代码自检与测试.md)。接 REST 时另须契约用例（#42），不互相替代。
45. **角色循环验证** `(common)`：按 [role-loop-review §1](../da-workflow/references/role-loop-review-角色循环验证.md) 触发表**命中才跑**（需求 §2.1 / 接口 §2.2 / 前端 §2.3 / 测试 §2.4）；未命中须一句话声明跳过。IAM·权限码·密钥·生产等命中时另跑**安全 §2.5**（条件加查，非常驻角色；未命中默认不跑）。输出 **必须改 / 建议改 / 可接受**，**未经用户确认禁止擅自改**。禁止无差别多场景空跑。口令与模板见 role-loop-review。不替代「任务结束复检」（仍必做）与 #44 门禁。
46. **台账/报告模块对齐** `(business)`：Actions / Rca / Effectiveness 等列表+详情模块全量重构时，按 [module-patterns §10](references/business/module-patterns-模块模式.md)——ReactFilter 聚合 `value`/`onChange`（[filter §5.10](references/common/filter-筛选组件.md)）；分页默认 20 + `10/20/30/50/100`；Detail/utils 大块拆子目录且 **utils 删单文件须留 shim**（[directory-structure](references/common/directory-structure-目录结构.md)）；写操作用 `FormModal`+FormInfo；说明用 `Info`+`TooltipInfo`；只读下钻 Drawer + `VirtualScrollbar`；业务 Table 开列配置 + `userPrefs`；模块树内扫除 CommonFilter / overflow:auto / antd Tag / CircleHelp。禁止造台账公共基类。
47. **大表列表选择性筛选** `(common)`：对接万级以上 `queryList`/`search` 时——产品定门禁条件与默认窗；后端无条件 `400`；前端默认窗 + `canQuery`、清空恢复默认、弱条件不可单独成门。见 [filter §5.11](references/common/filter-筛选组件.md)、[list-api 选择性筛选](../backend-dev-spec/references/common/list-api-列表分页.md)。

---

## 二、按需阅读地图

新人 / 总览入口（技术栈图、工具链、Day-0）：[docs/前端工程总览.md](../../../docs/前端工程总览.md)。

触发本 skill 后：**先读本文件核心原则**；接需求时读 [da-workflow/mindset](../da-workflow/references/mindset-角色大前提.md) → [prompts/mindset（FE 叠加）](references/prompts/mindset-角色大前提.md) → [prompts/requirement-workflow](references/prompts/requirement-workflow-需求工作流.md)；编写对应模块时再读单个 reference，**勿一次全读**。

### prompts（提示词）

| 文件                                                                                                 | 用途                                                     |
| ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| [da-workflow/mindset](../da-workflow/references/mindset-角色大前提.md)                               | **SSOT**：五维、会话控用量、开场/收尾模板、任务结束复检  |
| [prompts/mindset-角色大前提.md](references/prompts/mindset-角色大前提.md)                            | **前端叠加**：组件大前提、React/antd、大表门禁           |
| [prompts/requirement-workflow-需求工作流.md](references/prompts/requirement-workflow-需求工作流.md)  | 需求理解 → 方案论证 → 开发流程 → 检查清单 → 任务结束复检 |
| [da-workflow/cursor-session-prompt](../da-workflow/references/cursor-session-prompt-会话与提示词.md) | 人/Agent 提示词模板与高耗反例（控 Cursor 额度）          |

### common（公共规范）

| 场景                                              | 文件                                                                                                                                                                                |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 技术栈 React 19 + antd 6                          | SKILL.md「技术栈」+ [common/component-mapping-组件映射.md](references/common/component-mapping-组件映射.md)                                                                         |
| 目录结构、命名速查                                | [common/directory-structure-目录结构.md](references/common/directory-structure-目录结构.md)                                                                                         |
| Common / @kne / antd 映射                         | [common/component-mapping-组件映射.md](references/common/component-mapping-组件映射.md)（含 Core 版本管理）                                                                         |
| 主题 Token、颜色                                  | [common/theme-主题Token.md](references/common/theme-主题Token.md)                                                                                                                   |
| SCSS Modules、样式目录                            | [common/styles-样式规范.md](references/common/styles-样式规范.md)                                                                                                                   |
| 页面壳与布局（Loading / 滚动 / InteractiveBlock） | [common/shell-layout-页面壳与布局.md](references/common/shell-layout-页面壳与布局.md)                                                                                               |
| Filter 筛选组件                                   | [common/filter-筛选组件.md](references/common/filter-筛选组件.md)（§5.10 聚合 FilterBar；§5.11 大表选择性门禁）                                                                     |
| 台账/报告模块对齐（Rca/Actions/Effectiveness）    | [business/module-patterns-模块模式.md](references/business/module-patterns-模块模式.md) §10 + [directory-structure utils 拆目录](references/common/directory-structure-目录结构.md) |
| 组件 Examples / meta.json                         | [common/examples-组件示例.md](references/common/examples-组件示例.md)                                                                                                               |
| 测试 / 写代码门禁                                 | [common/testing-测试规范.md](references/common/testing-测试规范.md) + [da-workflow/test-and-selfcheck](../da-workflow/references/test-and-selfcheck-写代码自检与测试.md)            |
| 代码格式化 / ESLint                               | [common/code-formatting-代码格式化.md](references/common/code-formatting-代码格式化.md)                                                                                             |

### business（业务规范）

| 场景                                    | 文件                                                                                                            |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Action/Form/Modal/List 模式与代码模板   | [business/module-patterns-模块模式.md](references/business/module-patterns-模块模式.md)                         |
| 权限、常量、批量操作                    | [business/permissions-data-权限与常量.md](references/business/permissions-data-权限与常量.md)                   |
| 改权限齐套（码表/矩阵/绑权/文档）       | [business/permissions-catalog-改权限齐套.md](references/business/permissions-catalog-改权限齐套.md)             |
| 新系统 IAM 接入全套（清单/PRD/Test/EP） | [business/iam-system-onboard-新系统IAM接入齐套.md](references/business/iam-system-onboard-新系统IAM接入齐套.md) |
| 部门树、人员选择、完整路径              | [business/department-person-部门人员.md](references/business/department-person-部门人员.md)                     |
| API 拆分、页面路由、多域组件路由        | [business/routing-api-路由与API.md](references/business/routing-api-路由与API.md)                               |

### 场景速查

| 场景                             | 先读                                                   | 再读                                                                                               |
| -------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| 接新需求 / 改交互                | da mindset → FE prompts/mindset → requirement-workflow | 按任务选 common/business                                                                           |
| 新建业务模块                     | business/module-patterns                               | common/directory-structure                                                                         |
| 筛选项 / 部门人员                | common/filter + business/department-person             | filter §5.9（Item loading + 面板 Spin + Empty；禁 options loading→PageSpin）                       |
| 权限 / 批量操作                  | business/permissions-data                              | SKILL.md #13（Permissions / PermissionGuard）                                                      |
| 主题 / Tag 颜色                  | common/theme + common/component-mapping                | common/styles                                                                                      |
| 页面壳 / 滚动 / Loading / 内容块 | common/shell-layout-页面壳与布局                       | common/component-mapping                                                                           |
| 组件 Demo                        | common/examples                                        | —                                                                                                  |
| 非 prod 组件展示切换             | common/examples §8.8 + routing-api §13.5               | SKILL.md #41                                                                                       |
| 新增/变更组件                    | SKILL.md #23 → component-mapping                       | 专题 reference、requirement-workflow                                                               |
| 可复用踩坑沉淀                   | SKILL.md #43 + requirement-workflow 检查项             | placement-guide（marsun-arch-doc-spec）                                                            |
| 样式 / className / SCSS          | common/styles                                          | common/directory-structure（命名速查）                                                             |
| 模块 workarea 扁平布局           | common/styles §8.10                                    | SKILL.md #34                                                                                       |
| 写测试 / 提交前自检              | common/testing + SKILL.md #44                          | [da-workflow/test-and-selfcheck](../da-workflow/references/test-and-selfcheck-写代码自检与测试.md) |
| 角色循环验证 / 再验证            | SKILL.md #45 + mindset                                 | [da-workflow/role-loop-review](../da-workflow/references/role-loop-review-角色循环验证.md)         |
| 权限码 UI（Permissions）         | business/permissions-data「UI 权限控制」               | SKILL.md #13 · component-mapping                                                                   |
| 新建仓库 / 缺 lint               | common/code-formatting                                 | —                                                                                                  |
| 修改规范 / 同步子仓库            | common/skills-sync-规范同步                            | —                                                                                                  |

**命名约定 Naming**：reference 文件采用 `{英文主题}-{中文简述}.md`（与 [backend-dev-spec](../backend-dev-spec/SKILL.md) 一致），便于检索与跨语言协作；分层目录 `common` / `business` / `prompts` 保留。

## 同步到 repos 子仓库

权威源为本目录（`marsun_arch/.cursor/skills/frontend-dev-spec/`）。修改 SKILL、references 或 prompts 后，须同步到 `repos/*` 镜像副本，详见 [references/common/skills-sync-规范同步.md](references/common/skills-sync-规范同步.md)。

```bash
# marsun_arch 根目录
node scripts/sync-frontend-dev-spec.mjs
```

Cursor `afterFileEdit` hook 会在编辑本技能目录后自动触发同步。
