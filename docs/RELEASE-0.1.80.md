# RELEASE 0.1.80

- **DrillNav**：下钻导航（可选返回 + 步骤胶囊），导出 `DrillNav` / `DrillStep`
- **DispositionBar**：处置条布局壳（label + statusBadge + actions；不绑业务 API）
- **StatCard `tone`**：马卡龙底色 `rose|lilac|mint|blue|peach|butter` + TILE；显式 `style` 优先；导出 `STAT_MACARON`
- **StatCard 字符串 `suffix`**：自动小号单位（12px，如 `%`）；自定义 ReactNode 不改
- **StatCard 布局**：label / value 固定上下（flex column + `space-around`）；`StatCardList` Col 等高撑满，长 title 换行不自流
