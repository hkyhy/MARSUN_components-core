# 主题配置规范

### 7.1 集中管理

Ant Design Theme Token & Semantic Token 统一在 `src/styles/theme.ts` 中配置：

- `generateTheme(primaryColor: string)` — 接收动态主色，生成完整 `ThemeConfig`（含 Design Token + Semantic Token）
- `applyThemeToCssVariables(primaryColor: string)` — 将主题色同步到 CSS 变量（供 SCSS / 非 antd 组件使用）
- `PALETTE` 常量集中管理色板，与 CSS 变量一一对应

**禁止**在 `main.tsx` 中直接内联 theme 配置对象，必须通过 `generateTheme()` 生成。

### 7.2 主题层级

| 层级                  | 内容                                                   | 示例                                                               |
| --------------------- | ------------------------------------------------------ | ------------------------------------------------------------------ |
| Design Token (全局)   | 颜色色板、字号、行高、圆角、间距、阴影、动画、控件高度 | `colorPrimary`、`fontSize`、`borderRadius`、`controlHeight`        |
| Semantic Token (组件) | 按组件定制的 Component Token                           | Table `headerBg`、Button `defaultShadow`、Menu `itemSelectedColor` |

### 7.3 CSS 变量同步

`applyThemeToCssVariables()` 维护 CSS 变量，供 SCSS Modules 和非 antd 组件使用。

每种主题色均维护 5 个透明度层级：

| 后缀         | 透明度 | 用途                     |
| ------------ | ------ | ------------------------ |
| `-bg`        | 0.06   | 浅色背景（选中态、标签） |
| `-bg-hover`  | 0.10   | 悬浮态背景               |
| `-bg-active` | 0.16   | 按下态背景               |
| `-border`    | 0.20   | 边框色                   |
| `-fill`      | 0.10   | 填充色                   |

**各颜色系列**：`--primary-color-*`、`--success-color-*`、`--info-color-*`、`--error-color-*`、`--warning-color-*`

### 7.4 颜色使用规范

#### 7.4.1 使用原则

1. **禁止硬编码颜色值**：使用 CSS 变量，禁止 `#1677ff`、`rgba(22,119,255,0.1)` 等
2. **SCSS Module 中引用变量**：`color: var(--primary-color);`、`background: var(--primary-color-bg);`
3. **选中/hover/active 使用对应变量**：`var(--primary-color-bg)`、`var(--primary-color-bg-hover)`、`var(--primary-color-bg-active)`

#### 7.4.2 SCSS Module 示例

```scss
.stat-card {
  background: var(--primary-color-bg);
  border: 1px solid var(--primary-color-border);

  &:hover {
    background: var(--primary-color-bg-hover);
  }
}

.stat-card-title {
  color: var(--primary-color);
}

.stat-card-muted {
  color: var(--font-color-grey-1);
}

.stat-card-error-text {
  color: var(--error-color);
}
```

```tsx
// 内联样式场景（SCSS 无法覆盖时）
<div style={{ backgroundColor: 'var(--primary-color-bg)' }} />
```

#### 7.4.3 新增颜色变量流程

同步修改两处：

1. `src/styles/global.scss` — 在 `::root` 中添加默认值
2. `src/styles/theme.ts` — 在 `applyThemeToCssVariables()` 中添加动态设置逻辑
