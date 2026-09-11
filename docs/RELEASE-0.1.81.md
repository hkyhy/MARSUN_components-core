# 0.1.81

- `Table` 叶子列拖宽：表头右缘把手；`columnResizeEnabled` 默认 `!!tableName`；`columnResizeMinWidth`/`MaxWidth` 默认 48～480；拖拽与 prefs 读入一律 clamp
- 双击把手清除该列自定义 `width`（回代码默认/弹性列）；mouseup 写入全部已锁叶子 `width`（有 save 时）
- **起拖锁死全部叶子实测宽 + 弹性占位列**，拖 A 时 B/C 视觉宽度不变（避免 `table-layout:fixed` + `width:100%` 摊宽）
- `columns` 叶子结构变时清空会话 `widthOverrides`
- 面板确认列显隐时 `copyColumnWidths` 保留已拖宽度
- Demo `TableBasicDemo`：内存 `saveTablePrefs` +「模拟刷新」+ sorter 列验拖不触发排序；单测含锁兄弟 / signature
