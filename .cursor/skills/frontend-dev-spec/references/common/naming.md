# 命名速查

## 文件与组件命名

| 类别               | 规则                     | 示例                                |
| ------------------ | ------------------------ | ----------------------------------- |
| 组件目录（模块内） | PascalCase 目录 + `index.tsx` | `EditButton/index.tsx`, `FormModal/index.tsx` |
| 工具函数文件       | camelCase                | `columns.tsx`, `handlers.ts`        |
| Props 接口         | `{Component}Props`       | `FormModalProps`, `EditButtonProps` |
| 工厂函数           | `get{Something}`         | `getColumns`                        |
| 确认函数           | `confirm{Action}`        | `confirmDelete`                     |
| Common 组件        | `Common{AntdComponent}`  | `CommonDescriptions`                |
| 布局组件           | `{Purpose}Layout`        | `PageHeaderLayout`                  |
| Select 封装        | `{Domain}Select`         | `DepartmentSelect`                  |
| 状态 Tag           | `{Domain}StatusTag`      | `MemberStatusTag`                   |
| 样式文件           | 与 `index.tsx` 同目录    | `style.module.scss`（无样式时保留空文件） |

## className / SCSS 命名

| 类别           | 规则                              | 示例                                              |
| -------------- | --------------------------------- | ------------------------------------------------- |
| 预定 className | `{组件名-kebab}-{功能定位-kebab}` | `common-filter-label`, `filter-select-active-tab` |
| SCSS 选择器    | 与预定 className **同名** kebab   | `.filter-select-active-tab`                       |
| TS 引用        | `styles['kebab-name']`            | `styles['filter-select-active-tab']`              |
| 合并方式       | `classNames(...)`                 | 禁止 `sc()`、`styles.camelCase`                   |

**组件名转换**：导出组件 PascalCase → kebab（`CommonFilter` → `common-filter`，`FilterSelect` → `filter-select`）。

**功能定位**：节点在组件内的语义，kebab-case（如 `label`、`active-tab`、`selected-tags`）。避免 `header`、`panel` 等泛化名。

详见 [styles.md](styles.md)。
