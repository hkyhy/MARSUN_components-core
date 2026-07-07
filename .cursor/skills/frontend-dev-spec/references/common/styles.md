# 样式规范（SCSS Modules）

### 8.1 核心原则

1. **统一使用 SCSS**：所有样式文件使用 `.scss` 扩展名；组件/页面局部样式使用 CSS Modules（`style.module.scss`），通过 `import styles from './style.module.scss'` 引用
2. **每模块必有 `style.module.scss`**：每个页面、每个含 JSX 的组件（含子组件、嵌套子组件、Demo 示例）均维护 `style.module.scss`；无样式时**保留空文件**。目录结构统一为 `{Name}/index.tsx` + `{Name}/style.module.scss`；**禁止**「TSX 在外、scss 在子文件夹」的分离写法
3. **禁止 Tailwind CSS**：禁止在 JSX 中写 utility 类名（`flex`、`px-4`、`text-gray-400` 等），禁止 `@tailwind` 指令，禁止维护 `tailwind.config.js`
4. **classNames 合并**：统一用 [`classnames`](https://github.com/JedWatson/classnames) 的 `classNames(...)` 合并类名；**禁止**封装 `sc()` 等二次 helper。每个 `className` 必须含预定语义类名（kebab-case，如 `active-tab`）
5. **组件名前缀命名**：预定 className 格式为 `{组件名-kebab}-{功能定位-kebab}`（如 `common-filter-label`、`filter-select-active-tab`）；SCSS 选择器与预定 className **同名**；TS 侧用 `styles['common-filter-label']` 引用，**禁止** `styles.camelCase`

**补充约束**：

- **颜色使用 CSS 变量**：禁止硬编码颜色值，统一 `var(--primary-color*)` / `var(--font-color-grey*)`（见 [theme.md](theme.md)）
- **样式内容不可擅自改动**：存量 `style.module.scss` 迁移时仅做 Tailwind → SCSS 等价替换，禁止私自增减属性

### 8.2 文件归属与目录结构

#### 8.2.1 路径对照表

| 位置          | 目录结构                                                                             |
| ------------- | ------------------------------------------------------------------------------------ |
| 页面          | `src/pages/{PageName}/index.tsx` + `style.module.scss`                               |
| 页面子模块    | `src/pages/{Domain}/{Module}/Manage/index.tsx` + `style.module.scss`                 |
| Layout        | `src/layouts/{LayoutName}/index.tsx` + `style.module.scss`                           |
| 业务模块根    | `src/components/{Domain}/{Module}/style.module.scss`（模块级公共样式，可为空）       |
| 业务子组件    | `Action/EditButton/index.tsx` + `style.module.scss`（Form/Modal/Detail/List 等同理） |
| Common 子组件 | `src/components/Common/{Module}/{SubComponent}/index.tsx` + `style.module.scss`      |
| 嵌套子组件    | 子组件的子组件同样 `{Name}/index.tsx` + `style.module.scss`，逐层细化                |
| Demo 示例     | `examples/{DemoName}/index.tsx` + `style.module.scss`                                |
| App 入口      | `src/main/index.tsx` + `style.module.scss`（`index.html` 指向该路径）                |

#### 8.2.2 路径示例（Filter 模块）

```
Filter/
  CommonFilter/index.tsx + style.module.scss
  FilterTrigger/index.tsx + style.module.scss
  FilterSelect/index.tsx + style.module.scss
  FilterPanel/index.tsx + style.module.scss
  examples/
    FilterSelectDemo/index.tsx + style.module.scss
    ...
```

**禁止**：

```
Filter/
  FilterSelect.tsx                    ❌ TSX 与 scss 分离
  FilterSelect/style.module.scss      ❌
```

#### 8.2.3 何时需要 `style.module.scss`

| 需要                            | 不需要                                         |
| ------------------------------- | ---------------------------------------------- |
| 含 JSX 且需样式化的 `.tsx` 组件 | 纯逻辑 `handlers.ts`、`.ts` Hook               |
| 页面 `index.tsx`                | barrel `index.ts` 仅 re-export                 |
| Demo 示例组件                   | 无 JSX 的 `columns.tsx` 工厂（无自定义样式时） |
| Layout 组件                     | 类型定义 `types.ts`                            |

> 规则：**一旦文件内有需样式化的 JSX，必须在与 `index.tsx` 同目录创建 `style.module.scss`（可为空）**。

#### 8.2.4 公共样式（非 CSS Modules）

跨模块、语义化的全局样式放 `src/styles/`，具体架构按场景选型：

| 文件                                | 用途                               | 何时使用                       |
| ----------------------------------- | ---------------------------------- | ------------------------------ |
| `src/styles/global.scss`            | 入口：`:root` 变量、body、`#root`  | CSS 变量、全局 reset           |
| `src/styles/_antd-overrides.scss`   | `.root-container` 内 antd 全局微调 | antd 组件无法通过 props 覆盖时 |
| `src/styles/_markdown-preview.scss` | `.markdown-preview` 全局样式       | Markdown 渲染区域              |
| `src/styles/_mixins.scss`           | 布局 mixin，供 module `@use` 引用  | 多 module 复用布局模式         |

**决策原则**：组件/页面私有样式 → `style.module.scss`；跨页面语义化全局类 → `src/styles/` partial；module 内 `@use '@/styles/mixins'` 复用布局。

### 8.3 className 与 classNames 编码约定

```tsx
import classNames from 'classnames';
import styles from './style.module.scss';

// 基本：预定语义类名 + 同名 module 类
<div className={classNames('common-filter-label', styles['common-filter-label'])} />

// 条件类
<div
  className={classNames(
    'filter-select-active-tab',
    styles['filter-select-active-tab'],
    isActive && 'filter-select-active-tab-active',
    isActive && styles['filter-select-active-tab-active'],
  )}
/>

// 全局语义类 + module 类（global 中定义的语义类可叠加）
<div className={classNames('file-card', styles['file-card'])} />

// VirtualScrollbar
<VirtualScrollbar
  wrapperClassName={classNames('agent-hub-scroll-wrapper', styles['agent-hub-scroll-wrapper'])}
  className={classNames('agent-hub-scroll-viewport', styles['agent-hub-scroll-viewport'])}
/>
```

**命名规则**：

| 部分         | 规则                           | 示例                                                               |
| ------------ | ------------------------------ | ------------------------------------------------------------------ |
| 组件名       | 导出组件 PascalCase → kebab    | `CommonFilter` → `common-filter`，`FilterSelect` → `filter-select` |
| 功能定位     | 节点在组件内的语义，kebab-case | `label`、`active-tab`、`selected-tags`                             |
| 完整预定类名 | `{组件名}-{功能定位}`          | `common-filter-label`、`filter-select-active-tab`                  |
| SCSS 选择器  | 与预定 className 同名          | `.filter-select-active-tab`                                        |
| TS 引用      | 方括号 kebab                   | `styles['filter-select-active-tab']`                               |

- 避免 `header`、`panel` 等泛化名；必须带组件名前缀
- antd 组件 `className` / `rootClassName` 同样遵循上述规则
- 子组件样式写在对应子组件目录的 `style.module.scss`；跨模块复用提取 mixin 或 Common 组件
- 全局语义类（`.root-container`、`.markdown-preview`）仅在 `src/styles/` partial 维护

### 8.4 SCSS Module 示例

```scss
@use '@/styles/mixins' as *;

.common-filter-root {
  @include flex-column;
  flex: 1;
  min-height: 0;
}

.common-filter-items {
  @include flex-between;
  margin-bottom: 12px;
}

.common-filter-label {
  color: var(--font-color);
  font-size: var(--font-size-large);
}

.filter-select-active-tab {
  padding: 4px 12px;
  cursor: pointer;

  &-active {
    color: var(--primary-color);
    background: var(--primary-color-bg);
  }
}
```

### 8.5 布局 Mixin 速查

`src/styles/_mixins.scss` 提供高频布局 mixin，module 内 `@use '@/styles/mixins' as *;`：

| Mixin               | 用途                           |
| ------------------- | ------------------------------ |
| `flex-row($gap)`    | 水平 flex + align-items:center |
| `flex-column($gap)` | 垂直 flex                      |
| `flex-center`       | 水平垂直居中                   |
| `flex-between`      | 两端对齐                       |
| `flex-fill`         | flex:1 + min-height:0          |

### 8.6 global vs module 边界

| 放 global（`src/styles/`） | 放 module（`style.module.scss`）       |
| -------------------------- | -------------------------------------- |
| `:root` CSS 变量           | 页面/组件布局                          |
| antd 组件全局微调          | 模块内间距、颜色状态                   |
| markdown 预览              | 列表/卡片/表单局部样式                 |
| antd 弹层滚动条兜底        | VirtualScrollbar wrapper/viewport 尺寸 |

### 8.7 新增颜色变量流程

同步修改两处：

1. `src/styles/global.scss` — `::root` 默认值
2. `src/styles/theme.ts` — `applyThemeToCssVariables()` 动态设置

### 8.8 完成前检查

- [ ] 模块/页面/子组件目录存在 `style.module.scss`（可为空）
- [ ] JSX 无 Tailwind utility 类名
- [ ] 每个 `className` 含 `{组件名}-{功能}` 预定类名 + 同名 `styles['...']`，经 `classNames` 合并
- [ ] 子组件 TSX 与 `style.module.scss` 同目录（`index.tsx` + `style.module.scss`），禁止分离写法
- [ ] 未使用 `sc()` 或 `styles.camelCase`
- [ ] 颜色使用 CSS 变量，无硬编码 hex/rgba
- [ ] 主滚动区仍用 VirtualScrollbar
- [ ] 模块 workarea 扁平化：无冗余 breadcrumb、无双层 card border/padding、Tabs content 100% 宽、页脚主按钮非无谓 block（见 §8.10）
- [ ] 新增/变更样式规范已同步本文件与 SKILL.md

### 8.9 附录：批量归位脚本

存量代码若存在 TSX 与 scss 分离，可运行：

```bash
node scripts/colocate-component-files.mjs src/components/Common
node scripts/colocate-component-files.mjs src
```

脚本将 `Component.tsx` 移入 `Component/index.tsx`，并修正相对 import 与 `import()` 动态路径。App 入口 `src/main/` 需单独处理（`index.html` 指向 `/src/main/index.tsx`）。

### 8.10 模块 workarea 扁平化

`ModulePageShell` 已承担页面标题与说明时，主内容区采用**扁平 workarea**，避免与壳层重复叠层。

| 项         | 规范                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 命名       | `*-workarea`、`*-workarea-body`（如 `quality-config-workarea`）                                                                 |
| 外层       | **无** `border`、**无**外层 `padding`；可用 `ContentCard flat`（`border:none; box-shadow:none; border-radius:0`）               |
| breadcrumb | 仅在与 `title` 不同且提供导航价值时传 `breadcrumb`；禁止重复「系统配置」类文案                                                  |
| Tabs/Table | `:global(.ant-tabs-content)`、`.ant-tabs-tabpane` 设 `width: 100%`                                                              |
| 页脚主按钮 | 默认 `Button type="primary"` **非 block**；hint 用 `Typography.Text type="secondary"` 同行/换行；Drawer/Legacy 可用 `saveBlock` |
| 内部间距   | 由子 panel（列表区、工具栏）自带 padding，**不**靠外层 workarea padding 撑开                                                    |

**参考实现（S3 质量分析）**：

- 配置页：`repos/Agent_QualityAnalysis/frontend/src/pages/Config` + `components/QualityAnalysis/Config/Detail/Workarea`
- 预警页：`pages/Alerts/style.module.scss` `.quality-alerts-workarea`

**反例**：`breadcrumb` 与 title 并存；`ContentCard` 默认 border 套 Tabs 外；workarea-body `padding:16px`；页脚保存按钮无谓 `block` 全宽。
