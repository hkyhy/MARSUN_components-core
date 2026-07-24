---
name: frontend-dev-spec
description: |
  前端开发规范技能（技术栈 React 19 + antd 6；含 prompts 需求驱动与 common/business 分层规范）。当需要创建新的页面模块、组件、Action按钮、Form表单、Modal弹窗、列表页面、详情页面时触发。
  当用户要求开发新功能模块、新建组件、重构组件结构、样式/className/SCSS Modules 规范、Tailwind 迁移、或涉及 src/components 或 src/pages 目录下的文件操作时，应使用此技能。
  当需要在 Tooltip 中展示结构化详情（如添加人/添加时间）时，必须使用 TooltipInfo（来自 `@hkyhy/marsun-components-core` 或本地 Common 封装）。
  当页面或模块存在可滚动区域时，必须使用 VirtualScrollbar（来自 `@hkyhy/marsun-components-core`），禁止在主滚动区使用 overflow-auto / overflow-y-auto；Layout 级接入方式见 references/common/shell-layout-页面壳与布局.md。
  当模块页或列表页存在数据加载态时，必须使用 core 的 PageSpin + PageShellProvider（App Layout 包裹 Provider；页面用 ModulePageShell / PageHeaderLayout 的 spinning 或 usePageShellLoading）；禁止业务内手写「加载中…」叠层。见 references/common/shell-layout-页面壳与布局.md。
  当新建或初始化前端子仓库、或 package.json 缺少格式化工具链时，须按 references/common/code-formatting-代码格式化.md 安装 Prettier + ESLint + Husky（含 `prepare`、`lint-staged` script、`.husky/pre-commit`），配置对齐 `repos/maoyang_data-asset-system` 与 `repos/marsun_components-core`。
  当使用图标时，必须从 `@hkyhy/marsun-components-core` 导入 Icons（禁止业务项目直接 import lucide-react）；Header 刷新操作使用 `refreshAction` + `RefreshCw` spin。
  当创建组件示例（examples/meta.json）时，多子模块业务域（如 Common、AgentHub）须按 {Domain}/{Module}/examples/ 组织，脚本自动生成域级父 menu 与子 menu。
  业务前端子仓库初始化或接入组件展示时，须在 App.tsx 用 import.meta.env.DEV 挂载 antd FloatButton（业务页 ↔ /components）及 ComponentsLayout 路由；参考 repos/maoyang_data-asset-system。
  每次新增或更改组件（含 Common 封装、Props/行为变更、全局接入方式变更）时，须同步更新对应的规范文档与提示词（SKILL.md、references、component-mapping 等），代码与规范同一任务内完成。
  marsun_components-core 新增或变更导出时，须同步包根 index.ts、examples/meta.json（含子组件 Demo 与 apiDoc）及 component-mapping-组件映射.md。
  此技能提供统一的目录结构、命名规范、组件拆分方式和代码模板，确保所有模块遵循一致的架构风格。
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

你是产品经理、架构师、全栈开发者和 UI 工程师的综合体，四类角色在各自领域内均达世界前十水平，并具有顶尖审美。实现需求前须从用户价值、模块边界、可维护实现、界面一致性多轮四维交叉论证；结合本技能 references 与对话上下文给出方案后再编码。

**每次任务开始**，在回复开头单独补充一句：「我是产品经理、架构师、全栈开发者和 UI 工程师的综合体，四类角色在各自领域内均达世界前十水平，具有顶尖审美，接下来，我将根据需求从用户价值、模块边界、可维护实现、界面一致性多轮四维交叉论证，结合对话上下文给出方案后，完全按照 frontend-dev-spec 规范来进行编码。」

**每次任务结束**，在回复末尾单独补充一句：「我是产品经理、架构师、全栈开发者和 UI 工程师的综合体，四类角色在各自领域内均达世界前十水平，我完全按照 frontend-dev-spec 规范来进行编码，请审阅。」

完整版见 [references/prompts/mindset-角色大前提.md](references/prompts/mindset-角色大前提.md)。

---

## 一、核心原则

1. **目录结构是大前提** `(common)`：所有组件必须按规范目录结构拆分到 `Action/`、`Detail/`、`Form/`、`Modal/`、`List/` 等子目录，`@kne/*` 库的使用必须在目录结构规范内进行，不能因为使用第三方库而跳过组件拆分
2. **页面必须以目录形式组织** `(common)`：所有页面组件必须放在 `src/pages/{PageName}/index.tsx` 目录中，禁止直接以 `.tsx` 文件形式放在 `src/pages/` 下（如 `src/pages/Profile.tsx` ❌ → `src/pages/Profile/index.tsx` ✅）
3. **组件使用优先级** `(common)`：`@hkyhy/marsun-components-core`（npm 纯 UI，见 [component-mapping-组件映射.md](references/common/component-mapping-组件映射.md) npm 节）> `src/components/Common`（业务 wrapper / 尚未迁移的本地实现）> `src/components/{Domain}/{Module}` > `@kne/button-group` > `antd`（Tag 统一 `SemanticTag` + `SEMANTIC_COLORS`；Tooltip 详情统一 `TooltipInfo`；主滚动区统一 `VirtualScrollbar`）
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
17. **第三方库优先** `(business)`：操作按钮组统一使用 `@kne/button-group`（包括页面头部操作和详情页操作），表单统一从 **`@hkyhy/marsun-components-core`** 导入——默认 FormInfo 栈（`Form` / `FormInfo` / `FormModal` / `FormSteps` + `rule`）；进阶引擎用 `ReactForm` / `useField` / `useFormApi` / `GroupList` 等。**禁止**业务直连 `@kne/form-info`、`@kne/react-form`。存量未迁移模块可暂留 antd Form；**新模块、新表单必须走 core FormInfo（默认）**
18. **列表项可见性用 `hidden` 属性** `(business)`：`ButtonGroup` listArray、`StatCardList` items 等列表项配置，统一使用 `hidden` 属性控制可见性，禁止使用 `switch(role)` 返回不同数组或 `{condition && <List/>}` 条件渲染不同列表。将所有可能的项目放在一个扁平数组中，通过 `hidden: !hasAnyRole([...])` 控制每项的可见性
19. **图标统一从 core 导出** `(common)`：业务项目禁止直接 `import from 'lucide-react'` 或 `@ant-design/icons`；统一从 `@hkyhy/marsun-components-core` 导入 Icons（如 `RefreshCw`、`CircleAlert`），加载态用 `spin` prop。缺图标时先在 `marsun_components-core` 的 `Icons` 模块补导出，再业务引用。详见 [component-mapping-组件映射.md](references/common/component-mapping-组件映射.md) Icons 节
20. **ButtonGroup 操作按钮 icon 规则** `(business)`：常规 CRUD（编辑/删除/导出等）listArray **不加 icon**，只显示文字；**刷新**等需语义识别的 Header/工具栏操作使用 `refreshAction`（`Action/refreshAction.tsx`）或 listArray 的 `icon: <RefreshCw spin={loading} />`。菜单项、Timeline、Tree 等非 ButtonGroup 操作场景可保留 icon
21. **主题配置集中管理** `(common)`：Ant Design Theme Token & Semantic Token 统一在 `src/styles/theme.ts` 中配置，通过 `generateTheme(primaryColor)` 生成完整 `ThemeConfig`，通过 `applyThemeToCssVariables(primaryColor)` 同步到 CSS 变量。禁止在 `main.tsx` 中直接内联 theme 配置
22. **组件示例规范** `(common)`：每个组件的 Demo 示例放 `examples/` 目录，遵循从小到大、从简到繁原则拆分为多个文件。源码通过 `import('...?raw')` 动态导入真实源码。每个 `examples/` 目录维护 `meta.json` 配置文件（不含 `route`，由脚本自动生成）。脚本 `scripts/collect-examples.mjs` 自动扫描所有 `meta.json` 并生成 `examples-registry.ts`（route 从目录结构自动推导）。**含多个子模块的业务域**（路径深度 ≥ 2，如 `Common/Auth`、`AgentHub/Chat`）自动归入域级父菜单（如 Common、AgentHub），各子模块为子 menu；**单模块**（路径深度 = 1，如 `Dashboard`）为顶层 menu 项。Vite 插件 `scripts/vite-plugin-examples.mjs` 监听 `components/` 变化自动重新生成。代码展示区标题栏在底部，多示例默认 antd `Masonry` 两列瀑布流（`columns={2}`），`block: true` 全宽独占一行。每个组件组必须有 `apiDoc` 字段，在示例最下方用 API Table 展示 Props 接口
23. **虚拟滚动条** `(common)`：主滚动区统一使用 `VirtualScrollbar`（`@/components/Common`），隐藏原生滚动条、thumb 悬浮不占宽度。`wrapperClassName` / `className` 传 `classNames('{组件}-{功能}', styles['{组件}-{功能}'])`；`ref` 指向 viewport 以支持 `scrollTo` / `onScroll` / 自动滚底。Layout 与 Chat 等全局接入点见 [common/shell-layout-页面壳与布局.md](references/common/shell-layout-页面壳与布局.md)。禁止在主滚动区写 `overflow-auto`；antd 弹层等无法包裹场景用 `global.scss` 细窄原生滚动条兜底
24. **规范文档与提示词同步** `(common)`：**每次新增组件或更改组件**（新建 Common/Module 组件、调整 Props/行为/使用约束、变更 Layout 或全局接入方式），须在同一任务内同步更新对应规范文档与提示词，禁止只改代码不更规范。至少核对：`SKILL.md`（核心原则/description 触发条件）、`references/common/component-mapping-组件映射.md`（Common 映射表）、专题 reference（如 `shell-layout-页面壳与布局.md`、`styles-样式规范.md`）、`references/prompts/requirement-workflow-需求工作流.md`（检查清单/流程）、`examples/meta.json` 与 Demo（如有组件展示）
25. **样式统一 SCSS Modules** `(common)`：（1）统一 SCSS，模块样式用 `style.module.scss`；（2）每个页面、每个含 JSX 的组件（含子组件、嵌套子组件、Demo）均维护 `style.module.scss`，无样式时保留空文件，目录 `{Name}/index.tsx` + `{Name}/style.module.scss`，禁止 TSX 与 scss 分离；（3）禁止 Tailwind CSS；（4）统一 `classNames(...)` 合并，禁止 `sc()` 等 helper，每个 className 含预定语义类名（kebab-case）；（5）预定 className 格式 `{组件名-kebab}-{功能定位-kebab}`，SCSS 同名，TS 用 `styles['kebab-name']`。公共样式放 `src/styles/`。详见 [common/styles-样式规范.md](references/common/styles-样式规范.md)
26. **npm 全量导出** `(common)`：`marsun_components-core` 每个对外组件、子组件、hook、utils、types 须经模块 `index.ts` → 包根 `src/index.ts` 导出；禁止仅 showcase 内 deep import。新增符号时同步更新 `component-mapping-组件映射.md` 与 `examples/meta.json`
27. **公共 Token 三层接入** `(common)`：静态默认值 `import '@hkyhy/marsun-components-core/tokens'` → 运行时 `applyThemeToCssVariables(primaryColor)` → 项目 `tokens.css` 仅扩展领域变量。CSS 变量命名统一 `--primary-color` / `--font-color-grey-*`，禁止项目自建 `--color-primary` 平行体系。详见 [common/theme-主题Token.md](references/common/theme-主题Token.md)
28. **Commit 同步 Plane** `(common)`：子仓库已配置 Plane 时，**每次 git commit 后**须 `@da pm dry-run` → sync，更新 `sync_manifest` 任务 status；新任务 id 须对齐钉钉层级（`S3.3.*` 等，见 [da-workflow/task-naming](../da-workflow/references/task-naming.md)）；**取号前 `plane_pull`，`id = max(名称 S3.3.N)+1`，勿盲信 `next_task_id`**；细粒度挂钉表 V0.2 大颗粒 `parent_issue`（见 [task-relationships](../da-workflow/references/task-relationships.md)）；my-plane 维持 `M003-*` 例外
29. **core 依赖提交态** `(common)`：`package.json` 中 `@hkyhy/marsun-components-core` **提交时必须 semver**，且**版本号与 npm 已发布最新版一致**（如 `^0.1.15`）；禁止 `file:` / lockfile `link: true`；本地联调用 `MARSUN_CORE_LOCAL` + Vite alias。详见 [component-mapping-组件映射.md](references/common/component-mapping-组件映射.md)
30. **core 版本与实版一致** `(common)`：`marsun_components-core` feat 开发时 `package.json` version **= npm 已发布最新**；发版仅通过 `chore(release): vX.Y.Z` commit + push 触发 CI publish，**禁止本地 npm publish**；`npm run version:check:apply` 仅写回 npm+1 准备 chore commit。见 [component-mapping-组件映射.md](references/common/component-mapping-组件映射.md)
31. **模块页全局 Loading** `(common)`：`PageSpin`、`PageShellProvider`、`usePageShellLoading`、`ModulePageShell` 来自 `@hkyhy/marsun-components-core`；App Layout 须包 `PageShellProvider`；页面用 `spinning` 或 `usePageShellLoading`，禁止局部 loading 文案叠层。见 [shell-layout-页面壳与布局.md](references/common/shell-layout-页面壳与布局.md)
32. **代码格式化与 Lint** `(common)`：所有前端子仓库须安装 Prettier + ESLint + Husky 工具链（`prettier`、`eslint`、`eslint-config-prettier`、`eslint-plugin-prettier`、`typescript-eslint`、`lint-staged`、`husky` 等），根目录配置 `.prettierrc` + `eslint.config.js` + `.husky/pre-commit`，`package.json` 提供 `lint` / `lint:fix` / `format` / `lint-staged` / `prepare` scripts；参考 `repos/maoyang_data-asset-system` 与 `repos/marsun_components-core`。详见 [code-formatting-代码格式化.md](references/common/code-formatting-代码格式化.md)
33. **模块主区扁平布局** `(business)`：`ModulePageShell` 已提供 `title`/`description` 时，**禁止**再传与 title 重复的 `breadcrumb`；主内容 workarea **禁止**双层 card（外层 border + 内层 padding）。主区用 `ContentCard flat` 或等价 `flex:1` 容器；Tabs/Table 内容区 `width:100%`；页脚主操作按钮默认 **非 block**（Drawer/窄容器可用 `saveBlock`）。详见 [styles-样式规范.md](references/common/styles-样式规范.md)「模块 workarea 扁平化」
34. **非业务代码进 core** `(common)`：新建或修改 `src/utils/**` 前 **MUST** 查 `@hkyhy/marsun-components-core` 包根导出（见 [component-mapping-组件映射.md](references/common/component-mapping-组件映射.md) npm Utils 表）。**已存在于 core 的函数禁止在业务项目再写同名/同义 `src/utils/*.ts` 文件**；直接从包 import（如 `toDateTimeRange`、`recentDayRangeStrings`）。纯函数、无项目 API/store/业务枚举 → 写 core；含 zustand、业务 API、领域常量 → 留业务项目。仅允许薄配置层（`request.ts`、`Files/download.ts` 注入 token）。core 新增导出须同步 `src/index.ts` + component-mapping + 升版发布
35. **Filter label 语义化** `(common)`：`FilterInput`/`FilterSelect`/`FilterDateRange` 的 `label` 禁止使用「关键词」等抽象词，须用字段业务语义（可与 placeholder 相同）。见 [filter-筛选组件.md](references/common/filter-筛选组件.md) §5.1.1
36. **筛选项加载态与失败** `(common)`：**loading 亦须占位渲染**（禁止 `metaLoading → return null` / 整栏隐藏）；失败仅 `message.error` 友好文案（禁止拼接 HTTP/raw），**禁止**内联错误区；失败后仍渲染、options 为空走 Empty；筛选优先挂 `ModulePageShell` `toolbar`（Spin 外）；**默认选中须来自 meta/options**，**禁止**硬编码工厂 code（如 `1001`）。见 [filter-筛选组件.md](references/common/filter-筛选组件.md) §5.9、[shell-layout-页面壳与布局.md](references/common/shell-layout-页面壳与布局.md)
37. **InteractiveBlock 内容块** `(common)`：title → **Info** icon + `TooltipInfo`（禁止 `CircleHelp`）→ actions（字号 ≤ title）；**tags 紧贴 subtitle**（inline/below），**禁止**在 description 之后；可点击块勿用 `<button>` 包裹 Tooltip；见 [shell-layout-页面壳与布局.md](references/common/shell-layout-页面壳与布局.md)
38. **少 border 布局** `(common)`：模块 workarea 少 panel border；**列表项用 theme 背景块 + gap**，禁止 `border-bottom` 线分割。见 [styles-样式规范.md](references/common/styles-样式规范.md) §8.11
39. **InteractiveBlock action 尺寸** `(common)`：link 操作字号不得大于 title（title 14px / actions 12px，icon 14px）；icon 颜色与 link 文字一致；导出用 `Download`；info trigger `cursor: pointer`
40. **非 prod 组件展示切换** `(common)`：所有业务前端子仓库（非 marsun_components-core dev app）须在 `App.tsx` 用 `import.meta.env.DEV` 双 guard 接入：（1）antd `FloatButton` 在业务页与 `/components` 间切换（图标 `LayoutGrid` / `House`，均从 `@hkyhy/marsun-components-core`）；（2）`/components` 路由 + `ComponentsLayout` + `componentRoutes`（collect-examples 自动生成）。生产 build 不包含上述代码。参考 `repos/maoyang_data-asset-system/src/App.tsx`；新建仓库 checklist 见 [examples-组件示例.md](references/common/examples-组件示例.md) §8.8

---

## 二、按需阅读地图

触发本 skill 后：**先读本文件核心原则**；接需求时读 [prompts/mindset-角色大前提.md](references/prompts/mindset-角色大前提.md) → [prompts/requirement-workflow-需求工作流.md](references/prompts/requirement-workflow-需求工作流.md)；编写对应模块时再读单个 reference，**勿一次全读**。

### prompts（提示词）

| 文件                                                                                                | 用途                                      |
| --------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| [prompts/mindset-角色大前提.md](references/prompts/mindset-角色大前提.md)                           | 四维角色大前提与决策方式                  |
| [prompts/requirement-workflow-需求工作流.md](references/prompts/requirement-workflow-需求工作流.md) | 需求理解 → 方案论证 → 开发流程 → 检查清单 |

### common（公共规范）

| 场景                                              | 文件                                                                                                        |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 技术栈 React 19 + antd 6                          | SKILL.md「技术栈」+ [common/component-mapping-组件映射.md](references/common/component-mapping-组件映射.md) |
| 目录结构、命名速查                                | [common/directory-structure-目录结构.md](references/common/directory-structure-目录结构.md)                 |
| Common / @kne / antd 映射                         | [common/component-mapping-组件映射.md](references/common/component-mapping-组件映射.md)（含 Core 版本管理） |
| 主题 Token、颜色                                  | [common/theme-主题Token.md](references/common/theme-主题Token.md)                                           |
| SCSS Modules、样式目录                            | [common/styles-样式规范.md](references/common/styles-样式规范.md)                                           |
| 页面壳与布局（Loading / 滚动 / InteractiveBlock） | [common/shell-layout-页面壳与布局.md](references/common/shell-layout-页面壳与布局.md)                       |
| Filter 筛选组件                                   | [common/filter-筛选组件.md](references/common/filter-筛选组件.md)                                           |
| 组件 Examples / meta.json                         | [common/examples-组件示例.md](references/common/examples-组件示例.md)                                       |
| 测试                                              | [common/testing-测试规范.md](references/common/testing-测试规范.md)                                         |
| 代码格式化 / ESLint                               | [common/code-formatting-代码格式化.md](references/common/code-formatting-代码格式化.md)                     |

### business（业务规范）

| 场景                                  | 文件                                                                                          |
| ------------------------------------- | --------------------------------------------------------------------------------------------- |
| Action/Form/Modal/List 模式与代码模板 | [business/module-patterns-模块模式.md](references/business/module-patterns-模块模式.md)       |
| 权限、常量、批量操作                  | [business/permissions-data-权限与常量.md](references/business/permissions-data-权限与常量.md) |
| 部门树、人员选择、完整路径            | [business/department-person-部门人员.md](references/business/department-person-部门人员.md)   |
| API 拆分、页面路由、多域组件路由      | [business/routing-api-路由与API.md](references/business/routing-api-路由与API.md)             |

### 场景速查

| 场景                             | 先读                                       | 再读                                                    |
| -------------------------------- | ------------------------------------------ | ------------------------------------------------------- |
| 接新需求 / 改交互                | prompts/mindset → requirement-workflow     | 按任务选 common/business                                |
| 新建业务模块                     | business/module-patterns                   | common/directory-structure                              |
| 筛选项 / 部门人员                | common/filter + business/department-person | filter §5.9（loading 占位 + 失败 message + 空 options） |
| 权限 / 批量操作                  | business/permissions-data                  | —                                                       |
| 主题 / Tag 颜色                  | common/theme + common/component-mapping    | common/styles                                           |
| 页面壳 / 滚动 / Loading / 内容块 | common/shell-layout-页面壳与布局           | common/component-mapping                                |
| 组件 Demo                        | common/examples                            | —                                                       |
| 非 prod 组件展示切换             | common/examples §8.8 + routing-api §13.5   | SKILL.md #40                                            |
| 新增/变更组件                    | SKILL.md #23 → component-mapping           | 专题 reference、requirement-workflow                    |
| 样式 / className / SCSS          | common/styles                              | common/directory-structure（命名速查）                  |
| 模块 workarea 扁平布局           | common/styles §8.10                        | SKILL.md #33                                            |
| 写测试                           | common/testing                             | —                                                       |
| 新建仓库 / 缺 lint               | common/code-formatting                     | —                                                       |
| 修改规范 / 同步子仓库            | common/skills-sync-规范同步                | —                                                       |

**命名约定 Naming**：reference 文件采用 `{英文主题}-{中文简述}.md`（与 [backend-dev-spec](../backend-dev-spec/SKILL.md) 一致），便于检索与跨语言协作；分层目录 `common` / `business` / `prompts` 保留。

## 同步到 repos 子仓库

权威源为本目录（`marsun_arch/.cursor/skills/frontend-dev-spec/`）。修改 SKILL、references 或 prompts 后，须同步到 `repos/*` 镜像副本，详见 [references/common/skills-sync-规范同步.md](references/common/skills-sync-规范同步.md)。

```bash
# marsun_arch 根目录
node scripts/sync-frontend-dev-spec.mjs
```

Cursor `afterFileEdit` hook 会在编辑本技能目录后自动触发同步。
