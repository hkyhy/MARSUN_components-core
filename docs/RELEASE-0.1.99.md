# 0.1.99

- **Disposition 域折叠**（对齐 Tools / AgentHub showcase）
  - `DispositionBar` → `src/components/Disposition/DispositionBar`
  - 新增 **`AlertDispositionPanel`**（触发上下文条 + children；不绑 reveal/EP）
  - Showcase：`Disposition` 下挂 `AlertDispositionPanel` + `DispositionBar` 两菜单
- **DispositionBar examples** 补齐：基础 / 加载藏钮 / 仅状态 / 自定义 label / 自定义徽章 / 多操作钮（去掉挂在 Bar 下的 TriggerRevealDemo）
- **AlertDispositionPanel examples**：展开收起 / 切换触发上下文 / 关闭空态
- **AlertDispositionPanel**：多级色标（`tone` + label）；Showcase 折线色点展开（`@ant-design/plots`）；等级与形状解耦
- **`DispositionAlertLevelCatalog`**：项目注入等级目录（key/label/tone）；`buildDispositionAlertContext` / `DispositionAlertLevelLegend`；Showcase 可切换两套目录
- 设备用能：`ENERGY_TREND_ALERT_LEVEL_CATALOG` 驱动图例/色点/reveal；阈值仍本域 normalize

- CI retry: head was chore(pm); re-push release trigger
