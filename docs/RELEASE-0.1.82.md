# 0.1.82

- **fix(Table)**：拖宽后 `fixed` 列失效 / 操作列表头错位
  - `fixed` 列**不注入**拖宽把手（避免 `ResizableHeaderCell` 写 `position:relative` 冲掉 antd sticky）
  - 弹性占位列改为 `insertBeforeFixedRight`（插在首个 `fixed: 'right'` **之前**；原先 append 会打断右侧固定列栈）
  - `ResizableHeaderCell` 仅在无既有 `position` 时补 `relative`
- 单测：`isFixedColumn` / `insertBeforeFixedRight`
