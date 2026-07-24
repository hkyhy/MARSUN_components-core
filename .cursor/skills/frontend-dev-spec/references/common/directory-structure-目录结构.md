# 目录结构 Directory Structure

### 组件目录（`src/components/{Domain}/{Module}/`）

```
├── Action/                     # 操作按钮
│   ├── EditButton/             # 单个操作按钮（一个按钮一个目录）
│   │   ├── index.tsx
│   │   └── style.module.scss   # 无样式时保留空文件
│   ├── handlers.ts             # Action 业务逻辑（纯逻辑，无需 scss）
│   ├── ActionButtons/          # 详情页操作组合
│   │   ├── index.tsx
│   │   └── style.module.scss
│   ├── ManageActionButtons/
│   │   ├── index.tsx
│   │   └── style.module.scss
│   └── index.ts
├── Detail/                     # 详情展示
│   ├── Descriptions/
│   │   ├── index.tsx
│   │   └── style.module.scss
│   └── index.ts
├── Form/                       # 表单字段（纯 UI）
│   ├── Form/
│   │   ├── index.tsx
│   │   └── style.module.scss
│   └── index.ts
├── Modal/                      # 弹窗容器
│   ├── FormModal/
│   │   ├── index.tsx
│   │   └── style.module.scss
│   └── index.ts
├── List/                       # 列表相关
│   ├── columns.tsx             # getColumns 工厂（无 JSX 样式时可无 scss）
│   ├── FilterBar/
│   │   ├── index.tsx
│   │   └── style.module.scss
│   ├── Link/
│   │   ├── index.tsx
│   │   └── style.module.scss
│   └── index.ts
├── Import/                     # 导入（可选）
│   ├── ImportModal/
│   │   ├── index.tsx
│   │   └── style.module.scss
│   └── index.ts
├── hooks/                      # 模块级自定义 Hook（可选，封装页面状态与业务逻辑）
│   ├── use{Feature}.ts         # 如 useFileManager.ts
│   └── index.ts
├── utils/                      # 模块级工具函数（可选，仅模块内使用时放置）
│   ├── {feature}.ts
│   └── index.ts
├── constants/                  # 模块级常量（可选，仅模块内使用时放置）
│   ├── types.ts                # 类型定义
│   ├── {feature}.ts            # 按功能拆分的常量（如 mode.ts、status.ts）
│   └── index.ts
├── style.module.scss           # 模块样式（CSS Modules，无样式时保留空文件）
└── index.ts
```

### 组件展示路由目录（`src/components/`）

组件展示路由分两类：**多子模块业务域**（嵌套路由 + 父 menu）与**单模块**（顶层路由 + 顶层 menu）：

```
src/components/
├── routes.tsx                  # 组件展示路由汇总（开发环境）
├── Common/                     # 多子模块业务域示例
│   ├── routes.tsx              # common/* 嵌套子路由（自动生成）
│   ├── Auth/examples/          # → /components/common/auth
│   ├── Filter/examples/
│   └── ...
├── AgentHub/                   # 多子模块业务域示例
│   ├── routes.tsx              # agenthub/* 嵌套子路由（自动生成）
│   ├── Chat/examples/          # → /components/agenthub/chat
│   ├── KnowledgeBase/examples/ # → /components/agenthub/knowledgebase
│   └── ...
├── Dashboard/examples/         # 单模块 → /components/dashboard（顶层 menu）
├── Feedback/examples/
├── Files/examples/
├── Login/examples/
├── Review/examples/
└── System/examples/
```

**规范**：

- **多子模块业务域**（路径深度 ≥ 2，如 `Common/Auth`、`AgentHub/Chat`）：在 `src/components/{Domain}/routes.tsx` 维护嵌套子路由，侧边栏 menu 自动生成域级父项（如 Common、AgentHub），各子模块为子 menu
- **单模块**（路径深度 = 1，如 `Dashboard`、`Feedback`）：路由直接写在 `src/components/routes.tsx`，侧边栏 menu 为顶层项
- `App.tsx` 只需导入 `componentRoutes`，不需要按模块分别导入
- **组件展示路由和菜单自动生成**：`{Domain}/routes.tsx`、`components/routes.tsx`、`layouts/menu-config.ts` 由 `scripts/collect-examples.mjs` 自动生成，新建组件只需创建 `examples/meta.json`，禁止手动修改自动生成的文件
- **新增类似模块时**：按 `src/components/{Domain}/{Module}/examples/meta.json` 组织即可，脚本自动识别并归入域级父 menu，无需改路由或菜单代码

### 页面目录（`src/pages/`）

**所有页面必须以目录形式组织**，页面组件放在 `index.tsx` 中，禁止直接以 `.tsx` 文件形式放在 `src/pages/` 下。

```
# 带子模块的页面（如系统设置下的用户管理）
src/pages/{Domain}/{Module}/
├── Manage/
│   ├── index.tsx
│   └── style.module.scss
├── Detail/
│   ├── index.tsx
│   └── style.module.scss
└── routes.tsx

# 独立页面（如个人设置、工作台、统计分析）
src/pages/{PageName}/
├── index.tsx                   # 页面组件
└── style.module.scss           # 页面样式（无样式时保留空文件）
```

### Layout 目录（`src/layouts/`）

Layout 以目录形式组织，与页面规范一致：

```
src/layouts/{LayoutName}/
├── index.tsx
└── style.module.scss
```

**示例**：`src/layouts/MainLayout/index.tsx` + `style.module.scss`

**示例**：

- `src/pages/Profile/index.tsx` ✅ （而非 `src/pages/Profile.tsx` ❌）
- `src/pages/Dashboard/index.tsx` ✅
- `src/pages/System/Users/Manage/index.tsx` ✅

### 工具函数与常量目录

**放置原则**：模块内使用的放模块内，跨模块共享的放全局目录；**跨项目纯工具优先进 `@hkyhy/marsun-components-core`**（见核心原则 #34）。

| 归属              | 路径                                                    | 示例                                                               |
| ----------------- | ------------------------------------------------------- | ------------------------------------------------------------------ |
| core 跨域 utils   | `marsun_components-core/src/utils/`                     | `date`、`authRedirect`、`permissionStorage`、`createMarsunRequest` |
| core 组件域 utils | `marsun_components-core/src/components/{Module}/utils/` | `File/utils/download`                                              |
| 业务薄封装        | `src/utils/`（仅注入 store/token/API）                  | `request.ts`、`Files/download.ts`                                  |
| 业务领域 utils    | `src/utils/{Module}/` 或模块内 `utils/`                 | `agentHubAccess`、`points/*`、`fetchAuthPermissions`               |
| 模块内 utils      | `src/components/{Domain}/{Module}/utils/`               | `roleValidation`、`filePreview`                                    |

**决策顺序**：① 查 core 包根导出（component-mapping npm Utils 表）→ ② **有则 import，禁止复制同名 `src/utils/*.ts`** → ③ 能薄封装则不要复制 → ④ 确属单项目业务再写本地 `src/utils/`。

```
# 模块级（仅模块内使用）
src/components/{Domain}/{Module}/
├── hooks/                      # 自定义 Hook（封装页面状态与业务逻辑）
│   ├── use{Feature}.ts         # 如 useFileManager.ts
│   └── index.ts
├── utils/                      # 如 validation.ts、transform.ts
│   └── index.ts
├── constants/                  # 如 types.ts、status.ts、mode.ts
│   └── index.ts

# 项目级（跨模块共享）
src/hooks/{Module}/            # 如 src/hooks/Files/useFileManager.ts
src/utils/{Module}/            # 如 src/utils/Users/format.ts
src/constants/{Module}/        # 如 src/constants/Users/status.ts
```

### API 目录

**`src/api/` 按功能模块拆分**，每个模块一个文件，`index.ts` 作为 barrel 文件统一导出。

```
src/api/
├── index.ts        # barrel 文件，统一 re-export 所有 API 对象
├── auth.ts         # 认证（authApi）
├── user.ts         # 用户（userApi）
├── dept.ts         # 部门（deptApi）
├── file.ts         # 文件（fileApi）
├── review.ts       # 审核（reviewApi）
├── audit.ts        # 审计日志（auditApi）
├── stats.ts        # 统计（statsApi）
├── feedback.ts     # 反馈（feedbackApi）
├── permission.ts   # 权限管理（permissionApi）
└── settings.ts     # 系统设置（settingsApi）
```

**规范**：

- 每个 `xxx.ts` 文件导出一个 `xxxApi` 对象（如 `export const fileApi = { ... }`）
- `index.ts` 只做 `export { xxxApi } from './xxx'`，禁止直接定义 API 对象
- 新增 API 模块时，创建独立文件并在 `index.ts` 中追加导出
- 引用方式统一为 `import { xxxApi } from '@/api'`

## 附录：Components 整体架构

## 〇、Components 目录架构

### 整体结构

Components 采用**两级目录结构**：`{Domain}/{Module}/`，每个 Module 内部按功能拆分子目录。

```
src/components/
├── Common/              # 通用公共组件（无业务逻辑，跨模块复用）
│   ├── Auth/            # 权限相关（PermissionGuard, ProtectedRoute, hasPermission）
│   ├── Descriptions/    # 描述列表（CommonDescriptions）
│   ├── TooltipInfo/     # Tooltip 详情（内部使用 CommonDescriptions）
│   ├── Filter/          # 筛选组件（CommonFilter, FilterSelect, FilterInput, FilterDateRange, FilterNumberRange）
│   ├── Form/            # 表单封装（DepartmentSelect, UploaderSelect, StepForm）
│   ├── Layout/          # 布局组件（PageHeaderLayout）
│   ├── Modal/           # 弹窗组件（StepModal）
│   ├── Stat/            # 统计卡片（StatCard, StatCardList）
│   ├── Tag/             # 标签组件（SemanticTag, StatusTag → MemberStatusTag, ReviewStatusTag, RoleTag）
│   ├── Tour/            # 引导组件（AppTour）
│   ├── Upload/          # 上传组件（CommonUpload）
│   └── index.ts         # 顶层 barrel 文件，统一 re-export 所有 Common 组件
├── AgentHub/            # 智能助手业务域（多子模块，含 routes.tsx + 域级父 menu）
│   ├── routes.tsx       # agenthub/* 嵌套子路由（自动生成）
│   ├── Chat/            # 问答助手子模块
│   └── KnowledgeBase/   # 知识库子模块
├── Dashboard/           # 仪表盘模块（单模块，顶层 menu）
│   └── AssetBoard/      # 资产看板子模块（含 hooks/useAssetBoard.ts）
├── Feedback/            # 反馈模块
├── Files/               # 文件管理模块
├── Review/              # 审核模块
└── System/              # 系统管理模块
    ├── Department/      # 部门管理子模块
    ├── Permission/      # 权限管理子模块
    └── Users/           # 用户管理子模块
```

### 业务域子模块模式（Common、AgentHub 等）

多子模块业务域与单模块的 `examples/` 组织方式不同：

```
# 多子模块业务域 → 域级父 menu + 子 menu
{Domain}/{Module}/examples/
├── meta.json
├── {Module}BasicDemo/
│   ├── index.tsx
│   └── style.module.scss
└── mock.ts（可选）

# 单模块 → 顶层 menu
Dashboard/examples/
├── meta.json
├── AssetBoardDemo/
│   ├── index.tsx
│   └── style.module.scss
```

示例：`AgentHub/Chat/examples/`、`AgentHub/KnowledgeBase/examples/`、`Common/Tag/examples/`。

### Common 子组件模式

每个 Common 子组件（及嵌套子组件）目录遵循统一结构：**`index.tsx` 与 `style.module.scss` 同目录**。

```
Common/Filter/
├── CommonFilter/
│   ├── index.tsx
│   └── style.module.scss
├── FilterSelect/
│   ├── index.tsx
│   └── style.module.scss
├── types.ts                 # 类型定义（可选）
├── examples/
│   ├── meta.json
│   └── FilterSelectDemo/
│       ├── index.tsx
│       └── style.module.scss
├── __tests__/
│   └── CommonFilter.test.tsx
└── index.ts                 # barrel 文件
```

**禁止**：`FilterSelect.tsx` 与 `FilterSelect/style.module.scss` 分离。

**特殊说明**：`Upload/` 组件写在 `Upload/index.tsx` + `style.module.scss`，由 `Common/index.ts` 通过 `export { default as CommonUpload } from './Upload'` 导出。

### 业务模块标准模式

业务模块（Files/Review/Feedback）遵循统一结构：

```
{Domain}/{Module}/
├── Action/
│   ├── EditButton/
│   │   ├── index.tsx
│   │   └── style.module.scss
│   ├── handlers.ts
│   └── index.ts
├── Detail/
│   ├── FileInfo/
│   │   ├── index.tsx
│   │   └── style.module.scss
│   └── index.ts
├── Form/
│   ├── UploadForm/
│   │   ├── index.tsx
│   │   └── style.module.scss
│   └── index.ts
├── List/
│   ├── columns.tsx
│   ├── FilterBar/
│   │   ├── index.tsx
│   │   └── style.module.scss
│   └── index.ts
├── Modal/
│   ├── UploadModal/
│   │   ├── index.tsx
│   │   └── style.module.scss
│   └── index.ts
├── style.module.scss           # 模块级样式（可为空）
├── examples/
│   ├── meta.json
│   └── FilesDemo/
│       ├── index.tsx
│       └── style.module.scss
└── index.ts
```

> **样式规则**：每个含 JSX 的子组件目录均含 `style.module.scss`（可为空）；纯逻辑文件（`handlers.ts`、`columns.tsx` 无自定义样式）可不建 scss。详见 [styles-样式规范.md](styles-样式规范.md)。

> **测试文件**：每个组件/模块的测试文件放在被测组件同级的 `__tests__/` 目录（与 `examples/` 平级），如 `Action/__tests__/handlers.test.ts`、`Form/__tests__/Form.test.tsx`。

### System 子模块嵌套模式

System 模块内部再按功能子模块嵌套一层，每个子模块遵循业务模块标准模式：

```
System/
├── Department/       # 完整的 Action/ + Form/ + List/ + Modal/ + Import/ + utils/ + constants/
├── Permission/       # 完整的 Action/ + Form/ + List/ + Modal/ + constants/
├── Users/            # 完整的 Action/ + Detail/ + Form/ + List/ + Modal/ + Import/
└── examples/         # System 级别 Demo
```

**注意**：System 和 Dashboard 目前缺少顶层 `index.ts` barrel 文件，需直接引用子模块路径（如 `from '@/components/System/Users'`）。

### 子目录适用范围速查

| 子目录                   | 说明                                             | 必选/可选                                                     |
| ------------------------ | ------------------------------------------------ | ------------------------------------------------------------- |
| `Action/`                | 操作按钮 + handlers                              | 必选                                                          |
| `Detail/`                | 详情展示                                         | 按需（有详情页时）                                            |
| `Form/`                  | 表单纯字段组件                                   | 必选（有表单时）                                              |
| `List/`                  | 列表 columns + FilterBar                         | 必选（有列表页时）                                            |
| `Modal/`                 | 弹窗容器                                         | 必选（有弹窗时）                                              |
| `Import/`                | 导入功能                                         | 可选                                                          |
| `hooks/`                 | 自定义 Hook                                      | 可选                                                          |
| `utils/`                 | 工具函数                                         | 可选                                                          |
| `constants/`             | 模块常量                                         | 可选                                                          |
| `routes.tsx`             | 模块路由配置                                     | 可选（仅 Common 需要，其他在 src/components/routes.tsx 汇总） |
| `examples/`              | Demo 示例                                        | 可选                                                          |
| `style.module.scss`      | 模块样式（CSS Modules）                          | 必选（无样式时保留空文件）                                    |
| `.test.tsx` / `.test.ts` | 测试文件（`__tests__/` 目录，与 examples/ 平级） | 必选                                                          |

---

## 命名速查 Naming

### 文件与组件命名

| 类别               | 规则                          | 示例                                          |
| ------------------ | ----------------------------- | --------------------------------------------- |
| 组件目录（模块内） | PascalCase 目录 + `index.tsx` | `EditButton/index.tsx`, `FormModal/index.tsx` |
| 工具函数文件       | camelCase                     | `columns.tsx`, `handlers.ts`                  |
| Props 接口         | `{Component}Props`            | `FormModalProps`, `EditButtonProps`           |
| 工厂函数           | `get{Something}`              | `getColumns`                                  |
| 确认函数           | `confirm{Action}`             | `confirmDelete`                               |
| Common 组件        | `Common{AntdComponent}`       | `CommonDescriptions`                          |
| 布局组件           | `{Purpose}Layout`             | `PageHeaderLayout`                            |
| Select 封装        | `{Domain}Select`              | `DepartmentSelect`                            |
| 状态 Tag           | `{Domain}StatusTag`           | `MemberStatusTag`                             |
| 样式文件           | 与 `index.tsx` 同目录         | `style.module.scss`（无样式时保留空文件）     |

### className / SCSS 命名

| 类别           | 规则                              | 示例                                              |
| -------------- | --------------------------------- | ------------------------------------------------- |
| 预定 className | `{组件名-kebab}-{功能定位-kebab}` | `common-filter-label`, `filter-select-active-tab` |
| SCSS 选择器    | 与预定 className **同名** kebab   | `.filter-select-active-tab`                       |
| TS 引用        | `styles['kebab-name']`            | `styles['filter-select-active-tab']`              |
| 合并方式       | `classNames(...)`                 | 禁止 `sc()`、`styles.camelCase`                   |

**组件名转换**：导出组件 PascalCase → kebab（`CommonFilter` → `common-filter`，`FilterSelect` → `filter-select`）。

**功能定位**：节点在组件内的语义，kebab-case（如 `label`、`active-tab`、`selected-tags`）。避免 `header`、`panel` 等泛化名。

详见 [styles-样式规范.md](styles-样式规范.md)。
