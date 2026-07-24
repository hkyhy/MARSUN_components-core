# 页面壳与布局 Shell Layout

页面壳（Loading / 滚动）与内容块（InteractiveBlock）统一约定。映射表见 [component-mapping-组件映射.md](component-mapping-组件映射.md)。

---

## 一、页面 Loading Page Loading

整页数据加载统一用 `@hkyhy/marsun-components-core` 的 **PageSpin** + **PageShellProvider**，禁止在业务组件内手写「加载中…」叠层。

### 何时使用

| 场景                        | 做法                                                                             |
| --------------------------- | -------------------------------------------------------------------------------- |
| App 级顶栏 + 模块 body 分区 | 根 Layout 包 `PageShellProvider`；页面用 `ModulePageShell` 或 `PageHeaderLayout` |
| 页面 hook 聚合 loading      | `ModulePageShell spinning={pageLoading}`                                         |
| 深层子组件（列表/报表）     | `usePageShellLoading(loading)`，**不传** `spinning`                              |
| Modal / 全屏 overlay        | 放在 `ModulePageShell` **外**（同页 fragment），避免被 Spin 遮罩                 |

### 组件与导出

```ts
import {
  PageSpin,
  PageShellProvider,
  usePageShell,
  usePageShellLoading,
  ModulePageShell,
  PageHeaderLayout,
} from '@hkyhy/marsun-components-core';
```

| 符号                  | 职责                                                                        |
| --------------------- | --------------------------------------------------------------------------- |
| `PageShellProvider`   | App Layout 根节点包裹（与 `MarsunCoreProvider` 同级或在内侧）               |
| `PageSpin`            | antd Spin + flex 高度链；一般 **不** 在页面手写，由 Shell/HeaderLayout 内置 |
| `ModulePageShell`     | toolbar/breadcrumb 在 Spin 外；body 内置 PageSpin                           |
| `PageHeaderLayout`    | 经典页头 + body 内置 PageSpin                                               |
| `usePageShellLoading` | 深层注册 loading，卸载自动清除                                              |

### 接入模式

### A. AppShell + ModulePageShell（质量分析等）

```tsx
// layouts/AppShell/index.tsx
<PageShellProvider>
  <AppPageHeader />  {/* usePageShell().meta */}
  <Outlet />
</PageShellProvider>

// pages/Alerts/index.tsx — 筛选挂 toolbar（Spin 外），始终占位
<ModulePageShell
  spinning={pageLoading}
  toolbar={<GlobalFilterBar meta={meta} metaLoading={metaLoading} ... />}
>
  <WorkArea ... />
</ModulePageShell>
<AnalyzeModal ... />  {/* shell 外 */}
```

### B. PageHeaderLayout（数据资产等）

```tsx
// integrations/MarsunCoreBridge.tsx
<PageShellProvider>{children}</PageShellProvider>

// pages/Files/Manage/index.tsx
<PageHeaderLayout title="文件管理" spinning={listLoading} actions={...}>
  <FileTable ... />
</PageHeaderLayout>
```

### C. 深层 loading

```tsx
const MonthlyReportView = () => {
  const [loading, setLoading] = useState(true);
  usePageShellLoading(loading);
  // 父级 ModulePageShell / PageHeaderLayout 不传 spinning
};
```

### loading 聚合约定

```ts
// hooks/useXxx.ts
const pageLoading = metaLoading || listLoading || detailLoading;
```

- **page 层**：`spinning={pageLoading}` 传给 Shell
- **子组件层**：仅 `usePageShellLoading`
- **禁止** 同一页面同时传 `spinning` 与 `usePageShellLoading` 表达同一 loading（避免双源）

### 与筛选栏协同

Filter meta 加载 / 失败时（详见 [filter-筛选组件.md](filter-筛选组件.md) §5.9）：

- **推荐**：筛选栏挂 `ModulePageShell` 的 **`toolbar`**，位于 `PageSpin` 外，loading 时仍始终可见占位
- **禁止**：`metaLoading → return null` 整栏隐藏；**`suppressLoadingText` 已废弃**，不得再靠隐藏筛选栏避让 Spin
- **失败**：仅 `message.error` + options 为空（Empty）；内容区可继续空态 / Spin

### flex 高度链

PageSpin wrapper 须参与列 flex：

```scss
.module-page-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
```

PageSpin 自身（core 内置）：`flex: 1; min-height: 200px; min-height: 0` on spin-container。

### 禁止

- 业务项目内复制 `PageSpin` / `PageShellContext`
- body 内 `<p className="loading">加载中…</p>` 与整页 Spin 叠层
- 把 Modal 放在 `ModulePageShell` children 内且不设 `spinning={false}` 时期望可点

---

## 二、虚拟滚动条 Virtual Scrollbar

覆盖式自定义滚动条：**隐藏原生滚动条，thumb 悬浮在内容上方，不占布局宽度**。实现位于 `src/components/Common/VirtualScrollbar/`。

### 何时使用

| 场景                                        | 做法                                                                |
| ------------------------------------------- | ------------------------------------------------------------------- |
| 页面/模块主滚动区                           | 必须用 `VirtualScrollbar`，禁止 `overflow-auto` / `overflow-y-auto` |
| 需要 `ref.scrollTo` / `onScroll` / 自动滚底 | 用 `VirtualScrollbar`，`ref` 指向 viewport                          |
| 横向 + 纵向均可滚动                         | `direction="both"`                                                  |
| antd Modal / Select / Table / Drawer 内部   | 不包裹组件，依赖 `global.scss` 兜底样式                             |

### 组件 API 速查

```tsx
import classNames from 'classnames';
import { VirtualScrollbar } from '@/components/Common';
import styles from './style.module.scss';

<VirtualScrollbar
  ref={scrollRef}
  wrapperClassName={classNames('page-scroll-wrapper', styles['page-scroll-wrapper'])}
  className={classNames('page-scroll-viewport', styles['page-scroll-viewport'])}
  direction="vertical"
  autoHide
  onScroll={handleScroll}
>
  {children}
</VirtualScrollbar>;
```

**className 分工**：

- `wrapperClassName`：外层容器（flex 填充、高度、外边距、圆角、阴影、背景）
- `className`：viewport 内边距与需随内容滚动的样式
- 均须 `{组件}-{功能}` 预定类名 + 同名 `styles['...']`，经 `classNames` 合并

**禁止**：在已包裹 `VirtualScrollbar` 的容器上再写 `overflow-auto` / `overflow-y-auto`（滚动由 viewport 承担）。

### 布局与 flex 约定

滚动区在 flex 列布局中须保证高度链不断：

```tsx
<div className={classNames('page-column', styles['page-column'])}>
  <VirtualScrollbar
    wrapperClassName={classNames('page-scroll-wrapper', styles['page-scroll-wrapper'])}
    className={classNames('page-scroll-viewport', styles['page-scroll-viewport'])}
  >
    {/* 长内容 */}
  </VirtualScrollbar>
  <FooterBar />
</div>
```

```scss
.page-column {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.page-scroll-wrapper {
  flex: 1;
  min-height: 0;
}

.page-scroll-viewport {
  padding: 20px 24px;
}
```

- 父级：`min-height: 0` + `overflow: hidden`（或固定高度）
- `VirtualScrollbar` 外层：`flex: 1` + `min-height: 0` 或明确高度
- 内容不足一屏时不显示 thumb

### 全局布局接入（已实施，新增滚动区须对齐）

### 层 1：Layout 级

以下 Layout 的主滚动区**已**用 `VirtualScrollbar` 替换 `overflow-auto`：

| 文件                                     | 接入点                                            |
| ---------------------------------------- | ------------------------------------------------- |
| `src/layouts/MainLayout/index.tsx`       | 主内容区（含 Tour `contentRef`）、左侧 Sider 菜单 |
| `src/layouts/AgentHubLayout/index.tsx`   | 主内容区                                          |
| `src/layouts/ComponentsLayout/index.tsx` | 右侧内容区、左侧 Sider 菜单                       |

### 层 2：高频业务滚动区

Chat 等已接入模块，改动时保持 `VirtualScrollbar` + `ref`/`onScroll` 不变。

### 层 3：CSS 兜底（antd 弹层）

无法包裹 `VirtualScrollbar` 的 antd 内部滚动容器，在 `src/styles/global.scss` 使用细窄原生滚动条样式：

- `.ant-modal-body`
- `.ant-select-dropdown .rc-virtual-list-holder`
- `.ant-table-body`
- `.ant-drawer-body`

**禁止**在 `.root-container` 上恢复全局 `::-webkit-scrollbar`（会与组件 thumb 重复，且占位）。

### 新增滚动区检查清单

- [ ] 是否用 `VirtualScrollbar` 替代 `overflow-auto`
- [ ] `wrapperClassName` / `className` 是否含预定类名 + `styles['...']`（经 `classNames` 合并）
- [ ] `wrapperClassName` 对应 SCSS 是否含 `min-height: 0` / `flex: 1`（flex 子项时）
- [ ] 需要编程滚动时，`ref` 是否挂在 `VirtualScrollbar` 上
- [ ] 是否误在 viewport 外层再套一层 `overflow-auto`

### 示例与文档

- 组件 Demo：`src/components/Common/VirtualScrollbar/examples/`
- 开发环境路由：`/components/common/virtualscrollbar`

---

## 三、内容块布局 Content Layout

> **文档同步**：新增或变更 `InteractiveBlock` 用法时，须同步本文件与 [component-mapping-组件映射.md](component-mapping-组件映射.md)。

### 适用场景

列表项、表单分组头、卡片摘要等**带操作性**的展示块（非纯静态文本）。业务项目参考：`Agent_QualityAnalysis` → `Shared/Detail/InteractiveBlock`。

### 信息层级（自上而下）

| 层级                | 说明                                                                                                                         | 样式                                                                                                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **title / label**   | 主标题，14px、`font-weight: 500`、`--font-color`                                                                             | 与右侧操作 **两端对齐**（`flex` + `space-between`），**垂直居中**                                                                                                  |
| **info**            | 可选；`title` 右侧 **gap 8px** 的 `Info` icon（16px，**禁止 `CircleHelp`**），`TooltipInfo` + `DescriptionItem[]` hover 展示 | `--font-color-grey-1`，hover `--primary-color`；**cursor: pointer**（禁止 `help`）；`placement="topLeft"`；`overlayStyle` 设 `minWidth: 220`                       |
| **actions**         | `title` 行最右侧；`@kne/button-group` `moreType="link"`                                                                      | **字号 ≤ title**（推荐 12px）；icon **14px**；**icon 颜色与 link 文字一致**（`currentColor`，禁止单独语义色）；导出类操作用 `Download`（禁止 `FileText` 冒充导出） |
| **subtitle + tags** | **meta 行**：subtitle 与 tags **同一行（inline）或 tags 在 subtitle 下方（below）**                                          | subtitle 12px、`--font-color-grey-1`；tags 用 `SemanticTag`                                                                                                        |
| **description**     | 摘要/说明，在 meta **之后**                                                                                                  | 12px、`--font-color-grey`，最多两行截断                                                                                                                            |

**禁止**：将 tags 放在 description **之后**（长摘要会把 tag 推至 listItem 最底部）。

### 布局示意

```
┌─────────────────────────────────────────────────────────┐
│  Title text          [info]              [action links]  │
│  Subtitle · meta              [Tag] [Tag]               │
│  Description preview (optional, 2 lines)                │
└─────────────────────────────────────────────────────────┘
```

`tagsPlacement="below"` 时 meta 行为 subtitle 独占一行、tags 在其下，仍在 description 之前。

### Action 尺寸

| 项           | 规范                                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| title        | 14px / `font-weight: 500`                                                                                                                  |
| actions 文字 | **≤ 14px**，推荐 **12px**                                                                                                                  |
| actions icon | **14px**，不得超过 title 字号；**颜色与 link 文字一致**（inherit / `currentColor`，禁止单独设色）；导出用 `Download`，禁止 `FileText` 冒充 |
| 行高         | header `align-items: center`；link 按钮 `height: auto`、`padding: 0 4px`                                                                   |

### 列表项块区分

列表容器内 **禁止** `border-bottom` 分割线区分条目。推荐：

- 容器 `flex` + `gap: 8px`
- 每项 `--bg-color-grey-1` 背景 + `border-radius: var(--radius-card)`
- hover：`--bg-color-grey-2`
- 选中：`--primary-color-bg` + 可选轻量 `var(--shadow-card)`

见 [styles-样式规范.md §8.11](styles-样式规范.md)。

### 代码模板

```tsx
import InteractiveBlock from '@/components/QualityAnalysis/Shared/Detail/InteractiveBlock';
import { Download, SEMANTIC_COLORS } from '@hkyhy/marsun-components-core';

<InteractiveBlock
  title={`${item.metric} · ${item.factory}`}
  info={[
    { label: '报告 ID', value: item.analysisId },
    { label: '生成时间', value: item.createdAt },
  ]}
  subtitle={`${item.variety} · ${item.alertMonth}`}
  tags={[{ label: '预警', color: SEMANTIC_COLORS.WARNING }]}
  tagsPlacement="inline"
  description={item.summaryPreview}
  actions={[
    {
      key: 'export',
      label: '导出 Word',
      icon: <Download size={14} aria-hidden />,
      onClick: () => navigate(`/rca/export?id=${item.analysisId}`),
    },
  ]}
  selected={selectedId === item.analysisId}
  onClick={() => onSelect(item)}
/>;
```

### 交互约定

- 行点击（`onClick`）与右侧 **actions / info 互斥冒泡**：actions、info trigger 均 `stopPropagation`
- 可点击块用 `div[role="button"]` + 键盘 Enter/Space，**禁止** `<button>` 包裹 `TooltipInfo`（避免嵌套交互与 tooltip 宽度塌陷）
- 选中态：title 改 `--primary-color`；列表 `<li>` 可用 `--primary-color-bg` 背景块

### 与 ButtonGroup icon 规则的关系

Table 列内 CRUD 仍遵循 [module-patterns-模块模式.md](../business/module-patterns-模块模式.md)「listArray 无 icon」。**InteractiveBlock 行内 link 操作**允许 icon / icon+文字，字号须 ≤ title。

### 后续上收 core

纯 UI 稳定后可迁入 `marsun_components-core`；迁入前业务 wrapper 路径：`Shared/Detail/InteractiveBlock`。

---

## 相关

- [component-mapping-组件映射.md](component-mapping-组件映射.md) — npm 导出对照
- [filter-筛选组件.md](filter-筛选组件.md) §5.9 — 筛选栏与 PageSpin / toolbar
- [styles-样式规范.md](styles-样式规范.md) §8.10 / §8.11 — workarea 扁平与列表块区分
