# 0.1.100

- **MessageCenter**：`PushRulesPanel` / `VariablesPanel`；Admin 三 Tab（模板 / 推送 / 变量）
- 推送规则真 CRUD：`eventKey` + `templateCode`；切换事件过滤模板并清脏关联
- 「插入变量」+ `{{key}}` 原子色块；空 catalog 按钮禁用
- InteractiveBlock 仅「未接线」降级提示（非冻结文案）

- **Build**：CKEditor / `@ckeditor/*` 标为 vite lib external，避免消费方二次变换丢 named export

- **Fix**：fixture catalog variables 允许 `tenant` source（typecheck）

- **Fix**：PushRulesPanel 事件选择改 antd Select，避开 CI FormInfo Select+onChange 重载错误
