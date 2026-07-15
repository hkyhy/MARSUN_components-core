# 主题配置规范

### 7.1 集中管理

Ant Design Theme Token & Semantic Token 统一在 `src/styles/theme.ts` 中配置：

- `generateTheme(primaryColor: string)` — 接收动态主色，生成完整 `ThemeConfig`（含 Design Token + Semantic Token）
- `applyThemeToCssVariables(primaryColor: string)` — 将主题色同步到 CSS 变量（供 SCSS / 非 antd 组件使用）
- `applyCssTokenOverrides(overrides)` — 项目级 CSS 变量覆盖（在 `applyThemeToCssVariables` 之后调用）
- `PALETTE` / `LAYOUT_TOKENS` 常量集中管理色板，与 CSS 变量一一对应

**禁止**在 `main.tsx` 中直接内联 theme 配置对象，必须通过 `generateTheme()` 生成。

### 7.2 三层 Token 接入（推荐）

| 层级     | 来源                                     | 职责                                                  |
| -------- | ---------------------------------------- | ----------------------------------------------------- |
| 静态默认 | `@hkyhy/marsun-components-core/tokens`   | 布局、灰阶、标签色、文件图标色等公共默认值            |
| 运行时   | `applyThemeToCssVariables(primaryColor)` | 主色及透明度系列、与 PALETTE 同步                     |
| 项目扩展 | `src/styles/tokens.css` 或 `global.scss` | **仅**领域专属变量（如 `--quality-panel-max-height`） |

**业务项目 `main/index.tsx` 典型顺序**：

```tsx
import '@hkyhy/marsun-components-core/styles';
import '@hkyhy/marsun-components-core/tokens';
import '../styles/global.scss';

useEffect(() => {
  applyThemeToCssVariables(settings.themeColor);
}, [settings.themeColor]);
```

**项目 `global.scss`**：

```scss
@import '@hkyhy/marsun-components-core/tokens';
@import './tokens.css'; /* 项目领域扩展 */
```

### 7.3 变量命名

统一使用 core 命名，**禁止**自建平行体系：

| 用途    | 变量                                                                                                 |
| ------- | ---------------------------------------------------------------------------------------------------- |
| 主色    | `--primary-color`, `--primary-color-bg`, …                                                           |
| 文字    | `--font-color`, `--font-color-grey`, `--font-color-grey-1` … `4`                                     |
| 背景    | `--bg-color-white`, `--bg-color-grey` … `4`                                                          |
| 语义色  | `--success-color`, `--error-color`, …                                                                |
| Tooltip | `--tooltip-bg` / `--tooltip-color`（简单提示，白底深字）；`--tooltip-info-*`（TooltipInfo 详情卡片） |

legacy / 第三方（如 `@kne/form-info`）兼容别名由 **core `tokens.css`** 提供，**禁止**业务项目再自建平行色板：

| 别名                                                                     | 映射                     | 说明                                   |
| ------------------------------------------------------------------------ | ------------------------ | -------------------------------------- |
| `--color-warning`                                                        | `--error-color`          | kne 必填星号等；语义为红，非橙 warning |
| `--color-error` / `--color-success` / `--color-info` / `--color-primary` | 对应 `--*-color`         | kne 语义色别名                         |
| `--primary-color-06` / `--primary-color-5`                               | `0.06` / `0.20` 主色透明 | kne form-info 背景/边框                |

业务侧仍应写 `--error-color` / `--primary-color-bg` 等 core 主名；过渡期可在项目 `tokens.css` 映射领域别名，例如 `--color-canvas: var(--bg-color-grey)`。

### 7.4 主题层级

| 层级                  | 内容                                                   | 示例                                                               |
| --------------------- | ------------------------------------------------------ | ------------------------------------------------------------------ |
| Design Token (全局)   | 颜色色板、字号、行高、圆角、间距、阴影、动画、控件高度 | `colorPrimary`、`fontSize`、`borderRadius`、`controlHeight`        |
| Semantic Token (组件) | 按组件定制的 Component Token                           | Table `headerBg`、Button `defaultShadow`、Menu `itemSelectedColor` |

### 7.5 CSS 变量同步

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

### 7.6 颜色使用规范

#### 7.6.1 使用原则

1. **禁止硬编码颜色值**：使用 CSS 变量，禁止 `#1677ff`、`rgba(22,119,255,0.1)` 等
2. **SCSS Module 中引用变量**：`color: var(--primary-color);`、`background: var(--primary-color-bg);`
3. **选中/hover/active 使用对应变量**：`var(--primary-color-bg)`、`var(--primary-color-bg-hover)`、`var(--primary-color-bg-active)`

#### 7.6.2 SCSS Module 示例

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

#### 7.6.3 新增颜色变量流程

| 范围          | 修改位置                                                                                |
| ------------- | --------------------------------------------------------------------------------------- |
| **core 通用** | `marsun_components-core` → `constants.ts` + `tokens.css` + `applyThemeToCssVariables()` |
| **项目专属**  | 项目 `src/styles/tokens.css` 的 `:root` 扩展，**不** fork `generateTheme`               |
