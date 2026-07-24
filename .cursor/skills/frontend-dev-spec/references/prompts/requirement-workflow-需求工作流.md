# 需求工作流 Requirement Workflow

触发本技能后，除 SKILL.md 核心原则外，按本流程执行。

## 一、需求理解

- [ ] 明确用户角色、主路径、边界条件与验收标准
- [ ] 识别涉及模块：`src/components/{Domain}/{Module}/` 或 `src/pages/`
- [ ] 确认是否涉及权限、筛选、部门/人员、批量操作等业务规则
- [ ] 需求歧义时列出假设，标注待确认项
- [ ] **WorkRecord**：先判**事项类型**（接口对接 / 页面改版 / 工程化）再匹配文档；涉及 API → 枚举接口清单；**禁止**把 Husky、布局重构写入「*接口对接」；新建前 AskQuestion
- [ ] **core utils**：新建 `src/utils/` 前先查 component-mapping npm Utils 表；core 已有则包根 import，禁止复制同名文件

## 二、方案论证（四方交叉）

| 维度 | 论证要点                                                                                                                                                                                                                                                                         |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 产品 | 交互路径是否最短？边界是否覆盖？                                                                                                                                                                                                                                                 |
| 架构 | 目录结构、handlers 抽离、单一数据来源是否合规？组件变更是否同步更新规范文档与提示词？                                                                                                                                                                                            |
| 开发 | 纯 UI 优先 `@hkyhy/marsun-components-core`？业务 wrapper 留本地 Common？最小 diff？可测试？                                                                                                                                                                                      |
| UI   | PageHeaderLayout、ButtonGroup、主题色、信息层级是否一致？滚动区是否用 VirtualScrollbar（不占位）？数据加载是否用 PageShellProvider + ModulePageShell/PageHeaderLayout spinning（禁止局部 loading 文案）？主 workarea 是否扁平（无冗余 breadcrumb、无双层 card border/padding）？ |

## 三、开发流程

新建模块时按以下顺序执行（**目录结构是大前提，必须先建好目录再填充内容**）：

1. 创建 `src/components/{Domain}/{Module}/` 目录及子目录（`Action/`、`Detail/`、`Form/`、`Modal/`、`List/` 按需创建）；**每个含 JSX 的子组件目录同步创建 `{Name}/index.tsx` + `style.module.scss`（无样式时保留空文件）**
2. 按需创建 `hooks/`、`utils/` 和 `constants/` 子目录（hooks 放自定义 Hook，utils 放工具函数，constants 放常量；模块内使用时放模块内，跨模块时放 `src/hooks/{Module}/`、`src/utils/{Module}/` 或 `src/constants/{Module}/`）
3. 编写 Form 组件（放 `Form/` 目录，从 `@hkyhy/marsun-components-core` 导入 `FormInfo` + `Input`/`Select` 等，`rule` 校验，纯字段渲染不含提交逻辑；禁止直连 `@kne/form-info`）
4. 编写 Modal 组件（放 `Modal/` 目录，从 core 导入 `FormModal` + `formProps={{ data, onSubmit }}`；多步用 `FormStepsModal`）
5. 编写 Action handlers（放 `Action/handlers.ts`，抽取业务逻辑供 listArray onClick 和独立 Button 共用）
6. 编写 Action 按钮组件（放 `Action/` 目录，一个按钮一个文件，支持受控/非受控模式）
7. 编写 ActionButtons 组合组件（放 `Action/` 目录，使用 `@kne/button-group` 的 `ButtonGroup` + listArray 对象形式）
8. 编写 Detail 组件（放 `Detail/` 目录，使用 CommonDescriptions）
9. 编写 List 组件（放 `List/` 目录，操作列引用 Action 组件，columns 使用 `ButtonGroup moreType="link"` + FilterBar + Link）
10. 编写自定义 Hook（放 `hooks/` 目录，封装页面状态与业务逻辑，供页面组件解构使用）
11. 编写各子目录及模块级 `index.ts` barrel export
12. 为新组件编写测试（见 [../common/testing-测试规范.md](../common/testing-测试规范.md)）
13. **注册组件路由和菜单**：组件展示路由、菜单已由 `scripts/collect-examples.mjs` 自动生成（`{Domain}/routes.tsx`、`components/routes.tsx`、`layouts/menu-config.ts`），开发者只需维护各子模块的 `examples/meta.json`，新建组件时创建 `meta.json` 即可自动注册路由和菜单，**禁止手动修改自动生成的文件**。多子模块业务域须将示例放在 `src/components/{Domain}/{Module}/examples/`，脚本会自动生成域级父菜单与子 menu。其他业务页面路由仍需在 `src/pages/{Module}/routes.tsx` 中手动添加
14. 编写页面组件（Manage + Detail，必须使用 `PageHeaderLayout`，标题放 `title`，操作按钮放 `actions`，页面说明放 `description`（可选），内容放 `children`；列表/详情 loading 用 `spinning={pageLoading}` 或子组件 `usePageShellLoading`；App 根 Layout 须包 `PageShellProvider`，见 [../common/shell-layout-页面壳与布局.md](../common/shell-layout-页面壳与布局.md)；禁止使用 `<div><h2>` 或 `<Card>` 包裹页面，禁止在 `children` 内手写说明提示横幅或「加载中…」）
15. 检查：所有组件是否按目录结构规范拆分（Form/ 不含提交逻辑，Modal/ 不含字段渲染，Action/ 每个按钮一个文件，handlers.ts 抽离业务逻辑）
16. 检查：ButtonGroup listArray 使用对象形式，不使用 `() => <Component />`
17. 检查：antd 重复配置是否已提取为 Common 组件
18. 检查：组件使用优先级 Common > Module > @kne/button-group > antd
19. 检查：表单从 `@hkyhy/marsun-components-core` 导入（`Form`/`FormInfo`/`FormModal` + 字段 `rule`），未直连 `@kne/form-info`；操作按钮统一使用 `@kne/button-group`（包括页面头部和详情页，不使用 `Space` + `Button`）
20. 检查：Modal 使用 core 的 `FormModal` + `formProps.onSubmit`（或 `FormStepsModal`），取消走 `onCancel`
21. 检查：新组件是否已创建 `examples/meta.json`（路由和菜单由脚本自动生成，无需手动注册）
22. 检查：业务子仓库 `App.tsx` 是否在 `import.meta.env.DEV` 下接入 FloatButton + `/components` 路由（见 [../common/examples-组件示例.md](../common/examples-组件示例.md) §8.8）
23. 检查：Tooltip 展示结构化详情时是否使用 `TooltipInfo` + **`Info` trigger**（禁止 `CircleHelp`）；`overlayStyle`/`styles.container` 须 `minWidth: 220`；禁止 `<button>` 嵌套 Tooltip trigger
24. 检查：主滚动区是否使用 `VirtualScrollbar`（禁止 `overflow-auto` / `overflow-y-auto`）；flex 布局中 wrapper 是否含 `min-height: 0` / `flex: 1`（写在 SCSS module 中）；需编程滚动时 `ref` 是否挂在 `VirtualScrollbar` 上；Layout 改动是否与 [../common/shell-layout-页面壳与布局.md](../common/shell-layout-页面壳与布局.md) 三层接入一致
25. 检查：样式是否符合 [../common/styles-样式规范.md](../common/styles-样式规范.md)——每个组件/页面有 `style.module.scss`（`index.tsx` 同目录）；禁止 Tailwind；每个 `className` 含 `{组件}-{功能}` 预定类名 + `styles['...']`，经 `classNames` 合并；禁止 `sc()` / `styles.camelCase`
26. 检查：是否有对应 `.test.tsx` / `.test.ts` 且通过（见 [../common/testing-测试规范.md](../common/testing-测试规范.md)）
27. 检查：模块页 loading 是否通过 `PageShellProvider` + `ModulePageShell`/`PageHeaderLayout` `spinning` 或 `usePageShellLoading` 实现，禁止局部 loading 文案与 Spin 叠层（见 [../common/shell-layout-页面壳与布局.md](../common/shell-layout-页面壳与布局.md)）
28. 检查：**每次新增或更改组件**是否已同步更新规范文档与提示词（`SKILL.md`、`component-mapping-组件映射.md`、专题 reference、`requirement-workflow-需求工作流.md` 检查项、`examples/meta.json` / Demo）；代码与规范须同一任务内完成，禁止只改代码
29. 检查：`@hkyhy/marsun-components-core` 版本——业务项目 `package.json` 依赖 **须与 npm 已发布最新版一致**（`npm view @hkyhy/marsun-components-core version`）；core 仓库 `version` 字段不得落后 npm；禁止 `file:` / lockfile `link: true`（见 [../common/component-mapping-组件映射.md](../common/component-mapping-组件映射.md)「Core 版本管理」）
30. 检查：代码格式化工具链是否已安装（`prettier`、`eslint`、`eslint-config-prettier`、`eslint-plugin-prettier`、`lint-staged`、`husky` 等 devDependencies）；根目录是否有 `.prettierrc`、`eslint.config.js`、`.husky/pre-commit`；`package.json` 是否有 `lint` / `lint:fix` / `format` / `lint-staged` / `prepare` scripts（见 [../common/code-formatting-代码格式化.md](../common/code-formatting-代码格式化.md)）
31. 检查：模块 workarea 扁平布局——`ModulePageShell` 不传冗余 `breadcrumb`；主区 `ContentCard flat` 或无边框容器；`*-workarea-body` 无外层 padding；Tabs content `width:100%`；页脚保存等非 block（Drawer 除外）（见 [../common/styles-样式规范.md](../common/styles-样式规范.md) §8.10）
32. 检查：**禁止重复 core utils**——`src/utils/` 不得复制 `@hkyhy/marsun-components-core` 已导出函数；日期/权限/部门/人员/HTTP 等从包根 import（见 [../common/component-mapping-组件映射.md](../common/component-mapping-组件映射.md) npm Utils 表）

## 四、按需阅读规范

| 场景                      | 先读                                                                                                                                                  | 再读                                                                                   |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 接新需求 / 改交互         | [mindset-角色大前提.md](mindset-角色大前提.md)                                                                                                        | 按任务选 common/business                                                               |
| 新建业务模块              | [../business/module-patterns-模块模式.md](../business/module-patterns-模块模式.md)                                                                    | [../common/directory-structure-目录结构.md](../common/directory-structure-目录结构.md) |
| 筛选项                    | [../common/filter-筛选组件.md](../common/filter-筛选组件.md)                                                                                          | —                                                                                      |
| 列表/表单内容块           | [../common/shell-layout-页面壳与布局.md](../common/shell-layout-页面壳与布局.md)                                                                      | [../common/styles-样式规范.md](../common/styles-样式规范.md) §8.11                     |
| 部门 / 人员               | [../common/filter-筛选组件.md](../common/filter-筛选组件.md) + [../business/department-person-部门人员.md](../business/department-person-部门人员.md) | —                                                                                      |
| 权限 / 批量操作           | [../business/permissions-data-权限与常量.md](../business/permissions-data-权限与常量.md)                                                              | —                                                                                      |
| 路由 / API                | [../business/routing-api-路由与API.md](../business/routing-api-路由与API.md)                                                                          | —                                                                                      |
| 主题 / Tag 颜色           | [../common/theme-主题Token.md](../common/theme-主题Token.md) + [../common/component-mapping-组件映射.md](../common/component-mapping-组件映射.md)     | [../common/styles-样式规范.md](../common/styles-样式规范.md)                           |
| 滚动区 / Loading / 内容块 | [../common/shell-layout-页面壳与布局.md](../common/shell-layout-页面壳与布局.md)                                                                      | [../common/component-mapping-组件映射.md](../common/component-mapping-组件映射.md)     |
| 组件 Demo                 | [../common/examples-组件示例.md](../common/examples-组件示例.md)                                                                                      | SKILL.md #23、component-mapping                                                        |
| 新增/变更组件             | [SKILL.md](../../SKILL.md) 核心原则 #23                                                                                                               | component-mapping + 专题 reference                                                     |
| 样式 / className          | [../common/styles-样式规范.md](../common/styles-样式规范.md)                                                                                          | [../common/directory-structure-目录结构.md](../common/directory-structure-目录结构.md) |
| 写测试                    | [../common/testing-测试规范.md](../common/testing-测试规范.md)                                                                                        | —                                                                                      |
| 新建仓库 / 格式化工具链   | [../common/code-formatting-代码格式化.md](../common/code-formatting-代码格式化.md)                                                                    | 技术栈须 React 19 + antd 6（SKILL.md）                                                 |
| 事项工作记录              | [work-record/SKILL.md](../../../work-record/SKILL.md)                                                                                                 | —                                                                                      |

## 五、完成前检查清单

- [ ] **跨仓库提交顺序**：core 先 commit+发版 → 业务 repo 按模块 commit → marsun_arch **先 WorkRecord 再** docs/spec（见 [repos-commit.md](../../../marsun-arch-doc-spec/references/repos-commit.md)）
- [ ] 技术栈为 **React 19 + antd 6**（`react`/`react-dom` `^19`，`antd` `^6`；与 core peer 一致；禁止 antd 5 / React 18 作为默认路径）
- [ ] 目录结构符合 `common/directory-structure-目录结构.md`
- [ ] Form/Modal/Action 分离，handlers 抽离
- [ ] ButtonGroup listArray 对象形式；CRUD 操作无 icon；Header 刷新用 `refreshAction` + `RefreshCw`
- [ ] 图标均从 `@hkyhy/marsun-components-core` 导入，业务代码无 `lucide-react`
- [ ] 权限/常量/API 符合 `business/permissions-data-权限与常量.md` 与 `business/routing-api-路由与API.md`
- [ ] 筛选 state 接入 API，Filter label 语义化（禁止「关键词」抽象 label）；部门/人员符合 `business/department-person-部门人员.md`
- [ ] 筛选项加载态与失败：`metaLoading` 时筛选栏仍占位（禁 `return null`）；失败仅 `message.error` + 空数据 Empty（禁内联错误区 / HTTP raw）；筛选优先挂 `ModulePageShell` `toolbar`；默认分厂来自 meta 首项，禁止硬编码 `1001`（见 [filter-筛选组件.md](../common/filter-筛选组件.md) §5.9、[shell-layout-页面壳与布局.md](../common/shell-layout-页面壳与布局.md)）
- [ ] 带操作的列表/表单块使用 `InteractiveBlock`：info 用 `Info` + `TooltipInfo`（cursor pointer）；actions icon 与文字同色、导出用 `Download`
- [ ] workarea 少 border：列表项用背景块 + gap，禁止 border-bottom 分割线（§8.11）
- [ ] Tooltip 详情用 TooltipInfo，长 ID 类字段须 `minWidth: 220` 且 content 可换行
- [ ] 主滚动区用 VirtualScrollbar（见 `common/shell-layout-页面壳与布局.md`），Layout 接入与全局样式兜底一致
- [ ] 样式符合 `common/styles-样式规范.md`：`style.module.scss` 与 `index.tsx` 同目录；禁止 Tailwind / `sc()`；每个 className 含 `{组件}-{功能}` 预定类名 + `styles['...']`
- [ ] 模块 workarea 扁平：`breadcrumb` 不重复 title；主区无双层 border/padding；Tabs 内容 100% 宽；页脚主按钮非无谓 block（§8.10）；列表/主从区少 panel border（§8.11）
- [ ] examples/meta.json 已创建（如为新组件）
- [ ] 新增/变更组件已同步更新规范文档与提示词（与代码同一任务）
- [ ] `@hkyhy/marsun-components-core` 版本与 npm 实版一致（`npm view` 核对；无 `file:` lock）
- [ ] Prettier + ESLint + Husky 工具链已安装，`.prettierrc` / `eslint.config.js` / `.husky/pre-commit` / `lint`·`format`·`lint-staged`·`prepare` scripts 齐全（见 `common/code-formatting-代码格式化.md`）
- [ ] 业务项目无重复 core utils（`src/utils/date.ts` 等与 component-mapping 冲突的文件须删除并改 import）
- [ ] 测试通过
- [ ] **新任务台账**：
  1. `plane_pull`（或 `pm_pipeline --step plane-pull`）
  2. 扫描 snapshot 名称 `S3.3.(\d+)`，候选 id = `max+1`（**禁止**盲信 `meta.next_task_id`；大颗粒号段如 73–88 勿占用，见 [task-naming](../../../da-workflow/references/task-naming.md)）
  3. `parent_issue` 挂模块 V0.2 大颗粒父（预警前端 `8ab0a122-…` / 分析前端 `95d788aa-…` 等，见 [task-relationships](../../../da-workflow/references/task-relationships.md)）；`note` 写 `Refs: S3.3.26`（钉表代号，勿当 `Task:`）
  4. 查 [task-naming 仓库映射表](../../../da-workflow/references/task-naming.md#仓库--钉钉编码映射) 选定 `milestone`；**禁止** marsun_arch / core / QA / assets 新增 `M001-*`；`data-dev/` → `milestone: P6.11`
  5. `sync_manifest.yaml` 登记 `status: 进行中`、**`owner` + `start_date` + `target_date`** → `da pm dry-run`（**CREATE module = 0**）→ `da pm sync` CREATE（禁止首次就写 `已完成`）
- [ ] **commit 按功能/模块切分并与钉表对齐**：一钉表 depth-2 Issue → 业务仓一台账任务 → 一组原子 commit；禁止多模块/多钉表事项混一个 commit；**台账登记/status 与业务同包**（见 [da-workflow/commit-format](../../../da-workflow/references/commit-format.md)）
- [ ] **Plane Module 只挂既有 keeper（全项目）**：任务 `milestone` 为钉表 depth-1（`P*.*` / `S*.*` 等，见仓库映射表）；**禁止**新建 Module、**禁止** `milestone: M*`（`my-plane` 除外）；见空 `M*` / middot 壳只 Archive（不 CREATE）。交叉：[da-workflow/plane-dingtalk-module-rules](../../../da-workflow/references/plane-dingtalk-module-rules.md)
- [ ] **Module/Issue 分隔符**：Module（钉表 depth-1）用 **短横线 `-`**（`S3.3-功能开发`）；Issue（任务）用 **中点 `·`**（`S3.3.15 · 预警页筛选对接`）。**禁止** pm sync / 手工再建 `S3.3·功能开发` 等同代号 Module（与钉表并成重复）；见 [plane-dingtalk-module-rules](../../../da-workflow/references/plane-dingtalk-module-rules.md)
- [ ] **commit 闭环**（plane_ready 仓库）：完成任务时 **YAML 已先改 `已完成` 并与业务同 commit** → `da task timeline-sync` → `da task done --confirm` → **WorkRecord 进展追加** → `da pm sync` PATCH（**勿再单独 commit 台账**；见 [da-workflow/plane-timeline](../../../da-workflow/references/plane-timeline.md) · [work-record/SKILL.md](../../../work-record/SKILL.md)）
- [ ] WorkRecord 已写入**正确类型**的大事文档（接口对接 / 页面改版 / 工程化分列）；非 API 进展未混入「*接口对接」
- [ ] 若本任务有对应 WorkRecord 大事文档，已追加「进展记录」；新增 API 须补接口行；Mock 与正式接口区分状态（Mock 勿标已完成）

## 五、回复开头

任务开始时，在回复开头单独补充一句（见 [mindset-角色大前提.md](mindset-角色大前提.md) 执行方式第 0 条）：

> 我是产品经理、架构师、全栈开发者和 UI 工程师的综合体，四类角色在各自领域内均达世界前十水平，具有顶尖审美，接下来，我将根据需求从用户价值、模块边界、可维护实现、界面一致性多轮四维交叉论证，结合对话上下文给出方案后，完全按照 frontend-dev-spec 规范来进行编码。

## 六、回复收尾

任务完成后，在回复末尾单独补充一句（见 [mindset-角色大前提.md](mindset-角色大前提.md) 执行方式第 5 条）：

> 我是产品经理、架构师、全栈开发者和 UI 工程师的综合体，四类角色在各自领域内均达世界前十水平，我完全按照 frontend-dev-spec 规范来进行编码，请审阅。
