# VirtualScrollbar 虚拟滚动条

覆盖式自定义滚动条：**隐藏原生滚动条，thumb 悬浮在内容上方，不占布局宽度**。实现位于 `src/components/Common/VirtualScrollbar/`。

## 何时使用

| 场景 | 做法 |
| ---- | ---- |
| 页面/模块主滚动区 | 必须用 `VirtualScrollbar`，禁止 `overflow-auto` / `overflow-y-auto` |
| 需要 `ref.scrollTo` / `onScroll` / 自动滚底 | 用 `VirtualScrollbar`，`ref` 指向 viewport |
| 横向 + 纵向均可滚动 | `direction="both"` |
| antd Modal / Select / Table / Drawer 内部 | 不包裹组件，依赖 `global.scss` 兜底样式 |

## 组件 API 速查

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
</VirtualScrollbar>
```

**className 分工**：

- `wrapperClassName`：外层容器（flex 填充、高度、外边距、圆角、阴影、背景）
- `className`：viewport 内边距与需随内容滚动的样式
- 均须 `{组件}-{功能}` 预定类名 + 同名 `styles['...']`，经 `classNames` 合并

**禁止**：在已包裹 `VirtualScrollbar` 的容器上再写 `overflow-auto` / `overflow-y-auto`（滚动由 viewport 承担）。

## 布局与 flex 约定

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

## 全局布局接入（已实施，新增滚动区须对齐）

### 层 1：Layout 级

以下 Layout 的主滚动区**已**用 `VirtualScrollbar` 替换 `overflow-auto`：

| 文件 | 接入点 |
| ---- | ------ |
| `src/layouts/MainLayout/index.tsx` | 主内容区（含 Tour `contentRef`）、左侧 Sider 菜单 |
| `src/layouts/AgentHubLayout/index.tsx` | 主内容区 |
| `src/layouts/ComponentsLayout/index.tsx` | 右侧内容区、左侧 Sider 菜单 |

### 层 2：高频业务滚动区

Chat 等已接入模块，改动时保持 `VirtualScrollbar` + `ref`/`onScroll` 不变。

### 层 3：CSS 兜底（antd 弹层）

无法包裹 `VirtualScrollbar` 的 antd 内部滚动容器，在 `src/styles/global.scss` 使用细窄原生滚动条样式：

- `.ant-modal-body`
- `.ant-select-dropdown .rc-virtual-list-holder`
- `.ant-table-body`
- `.ant-drawer-body`

**禁止**在 `.root-container` 上恢复全局 `::-webkit-scrollbar`（会与组件 thumb 重复，且占位）。

## 新增滚动区检查清单

- [ ] 是否用 `VirtualScrollbar` 替代 `overflow-auto`
- [ ] `wrapperClassName` / `className` 是否含预定类名 + `styles['...']`（经 `classNames` 合并）
- [ ] `wrapperClassName` 对应 SCSS 是否含 `min-height: 0` / `flex: 1`（flex 子项时）
- [ ] 需要编程滚动时，`ref` 是否挂在 `VirtualScrollbar` 上
- [ ] 是否误在 viewport 外层再套一层 `overflow-auto`

## 示例与文档

- 组件 Demo：`src/components/Common/VirtualScrollbar/examples/`
- 开发环境路由：`/components/common/virtualscrollbar`
