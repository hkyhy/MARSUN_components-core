# 模块页全局 Loading（PageSpin）

整页数据加载统一用 `@hkyhy/marsun-components-core` 的 **PageSpin** + **PageShellProvider**，禁止在业务组件内手写「加载中…」叠层。

## 何时使用

| 场景                        | 做法                                                                             |
| --------------------------- | -------------------------------------------------------------------------------- |
| App 级顶栏 + 模块 body 分区 | 根 Layout 包 `PageShellProvider`；页面用 `ModulePageShell` 或 `PageHeaderLayout` |
| 页面 hook 聚合 loading      | `ModulePageShell spinning={pageLoading}`                                         |
| 深层子组件（列表/报表）     | `usePageShellLoading(loading)`，**不传** `spinning`                              |
| Modal / 全屏 overlay        | 放在 `ModulePageShell` **外**（同页 fragment），避免被 Spin 遮罩                 |

## 组件与导出

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

## 接入模式

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

## loading 聚合约定

```ts
// hooks/useXxx.ts
const pageLoading = metaLoading || listLoading || detailLoading;
```

- **page 层**：`spinning={pageLoading}` 传给 Shell
- **子组件层**：仅 `usePageShellLoading`
- **禁止** 同一页面同时传 `spinning` 与 `usePageShellLoading` 表达同一 loading（避免双源）

## 与筛选栏协同

Filter meta 加载 / 失败时（详见 [filter.md](filter.md) §5.9）：

- **推荐**：筛选栏挂 `ModulePageShell` 的 **`toolbar`**，位于 `PageSpin` 外，loading 时仍始终可见占位
- **禁止**：`metaLoading → return null` 整栏隐藏；**`suppressLoadingText` 已废弃**，不得再靠隐藏筛选栏避让 Spin
- **失败**：仅 `message.error` + options 为空（Empty）；内容区可继续空态 / Spin

## flex 高度链

PageSpin wrapper 须参与列 flex：

```scss
.module-page-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
```

PageSpin 自身（core 内置）：`flex: 1; min-height: 200px; min-height: 0` on spin-container。

## 禁止

- 业务项目内复制 `PageSpin` / `PageShellContext`
- body 内 `<p className="loading">加载中…</p>` 与整页 Spin 叠层
- 把 Modal 放在 `ModulePageShell` children 内且不设 `spinning={false}` 时期望可点

## 相关

- [virtual-scrollbar.md](./virtual-scrollbar.md) — 滚动区 flex 链
- [component-mapping.md](./component-mapping.md) — npm 导出对照
