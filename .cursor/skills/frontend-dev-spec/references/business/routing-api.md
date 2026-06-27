# API 与路由规范

## API 按模块拆分

`src/api/` 目录按功能模块拆分为独立文件（如 `auth.ts`、`user.ts`、`file.ts`、`review.ts` 等），每个文件导出一个 `xxxApi` 对象。`src/api/index.ts` 作为 barrel 文件统一 re-export 所有 API 对象，确保现有 `import { xxxApi } from '@/api'` 引用无需修改。禁止在 `index.ts` 中直接定义 API 对象。

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

## 页面路由

- 页面路由放 `src/pages/{Module}/routes.tsx`
- `App.tsx` 通过 `{xxxRoutes}` 引用各模块路由，不在 App.tsx 中内联路由定义

## 组件展示路由

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

## 路由配置模式（参考）

## 十三、路由配置模式

> **核心原则**：路由按模块拆分到 `routes.tsx` 文件中，`App.tsx` 仅负责组合引用，不内联路由定义。

### 13.1 文件放置

- **页面路由**：`src/pages/{Module}/routes.tsx`（定义该模块的页面路由）
- **组件展示路由**：
  - `src/components/routes.tsx`（最外层汇总所有组件展示路由）
  - `src/components/{Domain}/routes.tsx`（多子模块业务域嵌套子路由，如 Common、AgentHub，由脚本自动生成）

### 13.2 导出规范

- 页面路由导出命名为 `{module}Routes`（如 `reviewRoutes`、`filesRoutes`）
- 组件展示路由统一导出为 `componentRoutes`（在 `src/components/routes.tsx` 中汇总）
- 多子模块业务域子路由导出为 `{domain}Routes`（如 `commonRoutes`、`agentHubRoutes`，供 `src/components/routes.tsx` 引用）
- 导出内容为 JSX Route 元素（`<Route>` 或 `<>` 包裹的多个 Route）

### 13.3 页面路由示例

```tsx
// src/pages/Review/routes.tsx
import { Navigate, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/Common/Auth';
import ReviewDetail from './Detail';
import ReviewLayout from './Layout';
import ReviewManage from './Manage';
import { UserRole } from '@/types';

export const reviewRoutes = (
  <Route path="review" element={<ReviewLayout />}>
    <Route index element={<Navigate to="/review/pending" replace />} />
    <Route
      path="all"
      element={
        <ProtectedRoute roles={[UserRole.SYSTEM_ADMIN]}>
          <ReviewManage mode="all" />
        </ProtectedRoute>
      }
    />
    <Route
      path="pending"
      element={
        <ProtectedRoute roles={[UserRole.REVIEWER, UserRole.SYSTEM_ADMIN]}>
          <ReviewManage mode="pending" />
        </ProtectedRoute>
      }
    />
    <Route path=":mode/detail/:fileId" element={<ReviewDetail />} />
  </Route>
);
```

### 13.4 组件展示路由示例

> **重要**：组件展示路由和菜单已由 `scripts/collect-examples.mjs` 自动生成，开发者只需维护各组件的 `examples/meta.json`，无需手动编辑路由或菜单文件。新建组件时创建 `meta.json` 即可自动注册路由和菜单。

**自动生成的文件**（禁止手动修改）：

| 文件                                        | 说明                                            |
| ------------------------------------------- | ----------------------------------------------- |
| `src/components/{Domain}/routes.tsx`        | 多子模块业务域嵌套子路由（Common、AgentHub 等） |
| `src/components/routes.tsx`                 | 组件展示路由汇总（从 meta.json 自动推导）       |
| `src/layouts/menu-config.ts`                | 侧边栏菜单配置（从 meta.json 自动推导）         |
| `src/pages/Components/examples-registry.ts` | 示例注册表                                      |

**最外层汇总**（`src/components/routes.tsx`，自动生成）：

```tsx
// src/components/routes.tsx
import { Route } from 'react-router-dom';
import ExamplePage from '@/pages/Components/ExamplePage';
import { agentHubRoutes } from './AgentHub/routes';
import { commonRoutes } from './Common/routes';

export const componentRoutes = (
  <>
    {agentHubRoutes}
    {commonRoutes}
    <Route path="dashboard" element={<ExamplePage />} />
    <Route path="feedback" element={<ExamplePage />} />
    {/* ... 其他单模块路由 ... */}
  </>
);
```

**多子模块业务域嵌套路由**（`src/components/{Domain}/routes.tsx`，自动生成）：

```tsx
// src/components/AgentHub/routes.tsx
import { Route } from 'react-router-dom';
import ExamplePage from '@/pages/Components/ExamplePage';

export const agentHubRoutes = (
  <Route path="agenthub">
    <Route path="chat" element={<ExamplePage />} />
    <Route path="knowledgebase" element={<ExamplePage />} />
  </Route>
);

// src/components/Common/routes.tsx
export const commonRoutes = (
  <Route path="common">
    <Route path="auth" element={<ExamplePage />} />
    <Route path="filter" element={<ExamplePage />} />
    <Route path="tag" element={<ExamplePage />} />
  </Route>
);
```

**menu 结构**（`src/layouts/menu-config.ts`，自动生成）：

```ts
export const MENU_ITEMS = [
  {
    key: 'agenthub',
    label: 'AgentHub',
    children: [
      { key: '/components/agenthub/chat', label: 'Chat' },
      { key: '/components/agenthub/knowledgebase', label: 'KnowledgeBase' },
    ],
  },
  {
    key: 'common',
    label: 'Common',
    children: [
      { key: '/components/common/auth', label: 'Auth' },
      // ...
    ],
  },
  { key: '/components/dashboard', label: 'Dashboard' },
  // ... 其他单模块顶层项
];
```

> **规范**：路径深度 ≥ 2 的多子模块业务域（如 `Common/Auth`、`AgentHub/Chat`）使用嵌套路由（`<Route path="{domain}">` 包子路由），子路由不需要重复域前缀，侧边栏 menu 自动生成域级父项与各子模块子 menu。路径深度 = 1 的单模块（如 `Dashboard`）路由直接写在 `src/components/routes.tsx`，menu 为顶层项。**路由文件和菜单配置由 `scripts/collect-examples.mjs` 自动生成**，新建组件只需创建 `examples/meta.json`，路由和菜单会自动注册，禁止手动修改自动生成的文件。后续新增类似多子模块业务域时，按 `src/components/{Domain}/{Module}/examples/` 组织即可，无需改路由或菜单代码。

### 13.5 App.tsx 引用方式

```tsx
// App.tsx
import { reviewRoutes } from './pages/Review/routes';
import { filesRoutes } from './pages/Files/routes';
import { componentRoutes } from './components/routes';

const App: React.FC = () => {
  return (
    <Routes>
      {/* 组件展示（开发环境） */}
      {import.meta.env.DEV && (
        <Route path="/components" element={<ComponentsLayout />}>
          <Route index element={<Navigate to="/components/common/auth" replace />} />
          {componentRoutes}
        </Route>
      )}
      {/* 业务页面 */}
      <Route path="/" element={<MainLayout />}>
        {filesRoutes}
        {reviewRoutes}
      </Route>
    </Routes>
  );
};
```

**规范**：

- `App.tsx` 不内联任何 Route 定义（除 index redirect 外），所有路由从模块 `routes.tsx` 导入
- 页面路由从 `src/pages/{Module}/routes.tsx` 导入，组件展示路由从 `src/components/routes.tsx` 导入
- 新增页面路由时，在对应模块的 `routes.tsx` 中添加
- 新增组件展示路由时，在对应子模块的 `examples/meta.json` 中维护示例配置，由 `collect-examples` 脚本自动生成路由和 menu；多子模块业务域无需手动编辑 `{Domain}/routes.tsx`
