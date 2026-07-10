# 展示/表单内容块布局（InteractiveBlock）

> **文档同步**：新增或变更 `InteractiveBlock` 用法时，须同步本文件与 `component-mapping.md`。

## 适用场景

列表项、表单分组头、卡片摘要等**带操作性**的展示块（非纯静态文本）。业务项目参考：`Agent_QualityAnalysis` → `Shared/Detail/InteractiveBlock`。

## 信息层级（自上而下）

| 层级                | 说明                                                                                                                         | 样式                                                                                                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **title / label**   | 主标题，14px、`font-weight: 500`、`--font-color`                                                                             | 与右侧操作 **两端对齐**（`flex` + `space-between`），**垂直居中**                                                                                                  |
| **info**            | 可选；`title` 右侧 **gap 8px** 的 `Info` icon（16px，**禁止 `CircleHelp`**），`TooltipInfo` + `DescriptionItem[]` hover 展示 | `--font-color-grey-1`，hover `--primary-color`；**cursor: pointer**（禁止 `help`）；`placement="topLeft"`；`overlayStyle` 设 `minWidth: 220`                       |
| **actions**         | `title` 行最右侧；`@kne/button-group` `moreType="link"`                                                                      | **字号 ≤ title**（推荐 12px）；icon **14px**；**icon 颜色与 link 文字一致**（`currentColor`，禁止单独语义色）；导出类操作用 `Download`（禁止 `FileText` 冒充导出） |
| **subtitle + tags** | **meta 行**：subtitle 与 tags **同一行（inline）或 tags 在 subtitle 下方（below）**                                          | subtitle 12px、`--font-color-grey-1`；tags 用 `SemanticTag`                                                                                                        |
| **description**     | 摘要/说明，在 meta **之后**                                                                                                  | 12px、`--font-color-grey`，最多两行截断                                                                                                                            |

**禁止**：将 tags 放在 description **之后**（长摘要会把 tag 推至 listItem 最底部）。

## 布局示意

```
┌─────────────────────────────────────────────────────────┐
│  Title text          [info]              [action links]  │
│  Subtitle · meta              [Tag] [Tag]               │
│  Description preview (optional, 2 lines)                │
└─────────────────────────────────────────────────────────┘
```

`tagsPlacement="below"` 时 meta 行为 subtitle 独占一行、tags 在其下，仍在 description 之前。

## Action 尺寸

| 项           | 规范                                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| title        | 14px / `font-weight: 500`                                                                                                                  |
| actions 文字 | **≤ 14px**，推荐 **12px**                                                                                                                  |
| actions icon | **14px**，不得超过 title 字号；**颜色与 link 文字一致**（inherit / `currentColor`，禁止单独设色）；导出用 `Download`，禁止 `FileText` 冒充 |
| 行高         | header `align-items: center`；link 按钮 `height: auto`、`padding: 0 4px`                                                                   |

## 列表项块区分

列表容器内 **禁止** `border-bottom` 分割线区分条目。推荐：

- 容器 `flex` + `gap: 8px`
- 每项 `--bg-color-grey-1` 背景 + `border-radius: var(--radius-card)`
- hover：`--bg-color-grey-2`
- 选中：`--primary-color-bg` + 可选轻量 `var(--shadow-card)`

见 [styles.md §8.11](styles.md)。

## 代码模板

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

## 交互约定

- 行点击（`onClick`）与右侧 **actions / info 互斥冒泡**：actions、info trigger 均 `stopPropagation`
- 可点击块用 `div[role="button"]` + 键盘 Enter/Space，**禁止** `<button>` 包裹 `TooltipInfo`（避免嵌套交互与 tooltip 宽度塌陷）
- 选中态：title 改 `--primary-color`；列表 `<li>` 可用 `--primary-color-bg` 背景块

## 与 ButtonGroup icon 规则的关系

Table 列内 CRUD 仍遵循 [module-patterns.md](../business/module-patterns.md)「listArray 无 icon」。**InteractiveBlock 行内 link 操作**允许 icon / icon+文字，字号须 ≤ title。

## 后续上收 core

纯 UI 稳定后可迁入 `marsun_components-core`；迁入前业务 wrapper 路径：`Shared/Detail/InteractiveBlock`。
