# 组件示例 Examples

> **文档同步**：每次新增或更改组件时，除维护 `examples/meta.json` 与 Demo 外，须同步更新 `component-mapping-组件映射.md`、`SKILL.md` 及相关 `references/` 提示词（见 SKILL.md 核心原则 #23）。

### 8.1 目录结构

每个子模块目录下的 `examples/` 存放 Demo 文件和 `meta.json` 配置：

**单模块**（顶层 menu）：

```
Dashboard/examples/
├── meta.json
├── AssetBoardDemo/
│   ├── index.tsx
│   └── style.module.scss
└── mock.ts（可选）
```

**多子模块业务域**（域级父 menu + 子 menu，如 Common、AgentHub）：

```
{Domain}/{Module}/examples/
├── meta.json
├── {Module}BasicDemo/
│   ├── index.tsx
│   └── style.module.scss
├── mock.ts（可选）
└── (无 barrel index.ts)

# 示例路径（非 Demo 目录名）
Common/Tag/examples/
AgentHub/Chat/examples/
AgentHub/KnowledgeBase/examples/
```

**重要**：`meta.json` 不包含 `route` 字段，route 由收集脚本根据目录结构自动推导。

### 8.2 Demo 拆分原则

1. **从小到大、从简到繁**：先展示最简单的基础用法，再展示复杂场景
2. **每个 Demo 一个独立目录**：`{DemoName}/index.tsx` + `style.module.scss`；Demo 目录名以 `Demo` 结尾，格式 `{组件/模块名}{场景}Demo`（如 `TagBasicDemo`、`SemanticTagReviewDemo`），**禁止**在通用模板中写死某一子模块的具体 Demo 名
3. **子组件须有独立 Demo**：对外导出的子组件（如 `FilterTrigger`、`MessageActions`）须有独立 Demo，不可仅在父组件 Demo 中间接出现
4. **场景化拆分**：不同使用场景（如基础用法 vs 审核状态场景 vs 多标签组合场景）各自独立 Demo
5. **单组件多 Demo**：如 Tag 组件拆分为 `SemanticTagBasicDemo` + `SemanticTagReviewDemo` + `SemanticTagMultiDemo`
6. **示例中不嵌入代码展示**：源码展示由 `ExamplePage` 统一处理

### 8.3 注册表规范

示例注册表由脚本自动生成，开发者只需维护各组件的 `examples/meta.json`：

**类型定义**（`src/pages/Components/examples.ts`）：

```ts
export interface ComponentExample {
  title: string;
  description: string;
  component: React.LazyExoticComponent<React.FC>;
  sourcePath: () => Promise<{ default: string }>;
  block?: boolean;
}

export interface ExampleGroup {
  title: string;
  description?: string;
  examples: ComponentExample[];
  apiDoc?: { componentName: string; rows: ApiDocRow[] }[];
}
```

**meta.json 格式**（`src/components/**/examples/meta.json`）：

```json
{
  "title": "Tag 语义化标签",
  "description": "统一颜色体系的语义化标签",
  "examples": [
    {
      "title": "基本用法",
      "description": "所有预定义语义颜色的展示",
      "component": "@/components/Common/Tag/examples/SemanticTagBasicDemo",
      "sourcePath": "@/components/Common/Tag/examples/SemanticTagBasicDemo.tsx",
      "block": true
    }
  ],
  "apiDoc": [...]
}
```

**自动收集机制**：

| 工具       | 文件                                        | 说明                                                                                   |
| ---------- | ------------------------------------------- | -------------------------------------------------------------------------------------- |
| 收集脚本   | `scripts/collect-examples.mjs`              | 扫描 `src/components/**/examples/meta.json`，自动推导 route，生成 registry、路由、菜单 |
| Vite 插件  | `scripts/vite-plugin-examples.mjs`          | 监听 `components/` 下 `meta.json` 和 `*Demo.tsx` 变化，自动重新生成                    |
| npm script | `npm run collect-examples`                  | CLI 手动触发收集                                                                       |
| 生成产物   | `src/pages/Components/examples-registry.ts` | 示例注册表，自动生成，禁止手动修改                                                     |
| 生成产物   | `src/components/{Domain}/routes.tsx`        | 多子模块业务域嵌套路由（如 Common、AgentHub），自动生成                                |
| 生成产物   | `src/components/routes.tsx`                 | 组件展示路由汇总，自动生成                                                             |
| 生成产物   | `src/layouts/menu-config.ts`                | 侧边栏菜单，自动生成                                                                   |

**route 自动推导规则**：

```
# 多子模块业务域（路径深度 ≥ 2）→ 域级父 menu + 子 menu
src/components/Common/Auth/examples/meta.json           → /components/common/auth
src/components/AgentHub/Chat/examples/meta.json           → /components/agenthub/chat
src/components/AgentHub/KnowledgeBase/examples/meta.json  → /components/agenthub/knowledgebase

# 单模块（路径深度 = 1）→ 顶层 menu
src/components/Dashboard/examples/meta.json             → /components/dashboard
src/components/Feedback/examples/meta.json              → /components/feedback
```

规则：`src/components/` 到 `examples/` 上层目录的相对路径，每段 lowercase，拼 `/components/` 前缀。路径含 `/`（深度 ≥ 2）时自动归入 `{Domain}/routes.tsx` 并在 menu 中生成域级父项；深度 = 1 时为顶层路由和 menu 项。

**menu 自动生成规则**：

| 目录深度 | 示例路径                  | 路由                        | 菜单结构                   |
| -------- | ------------------------- | --------------------------- | -------------------------- |
| ≥ 2      | `AgentHub/Chat/examples/` | `/components/agenthub/chat` | AgentHub（父）→ Chat（子） |
| ≥ 2      | `Common/Tag/examples/`    | `/components/common/tag`    | Common（父）→ Tag（子）    |
| = 1      | `Dashboard/examples/`     | `/components/dashboard`     | Dashboard（顶层）          |

### 8.4 代码展示规范

- 源码通过 `import('...?raw')` 动态导入，**禁止硬编码 sourceCode**
- 点击「展开代码」时才懒加载源码
- 代码区使用 `prism-react-renderer` 语法高亮（vsDark 主题）+ 行号
- **代码区标题栏（语言标签 + 复制按钮）放在最下方**，不在代码顶部
- 复制按钮使用 `navigator.clipboard.writeText()`

### 8.5 布局规范

`ExamplePage` 负责示例卡片布局（`marsun_components-core` 为 `dev/pages/Components/ExamplePage/`，业务项目为 `src/pages/Components/ExamplePage/`）：

- **多示例（>1）**：使用 antd `Masonry` 瀑布流，`columns={2}`、`gutter={[20, 28]}`（水平 20px、垂直 28px），按卡片实际高度自动排列；设置 `fresh` 以便展开/收起代码后重新计算高度
- **单示例**：独占整行，不使用 Masonry
- **强制独占**：`meta.json` 中 `block: true` 的示例单独成段、全宽纵向排列（适用于完整筛选栏、Table 等宽内容）；其余示例按配置顺序合并为 Masonry 段

### 8.6 API 文档规范

每个 ExampleGroup 必须有 `apiDoc` 字段，在示例最下方用 API Table 展示：

- 每个 Props 接口一个 Table；`componentName` 与导出 Props 类型名一致（如 `ChatPanelProps`）
- 列：属性 | 说明 | 类型 | 默认值
- 必填属性用 `required: true` 标记
- 继承 antd 的 Props 用 `...XxxProps` 行说明
- 常量（如 `SEMANTIC_COLORS`）也作为独立 Table 展示
- **marsun_components-core 新增导出时**：同任务更新 `meta.json` 的 `examples` 与 `apiDoc`

### 8.7 新增多子模块业务域

后续新增类似 Common、AgentHub 的多子模块业务域时，**只需按目录规范放置 `examples/meta.json`**，无需手动注册路由或菜单：

1. 创建 `src/components/{Domain}/{Module}/` 组件目录（含 Action/Detail/Form 等）
2. 在 `{Module}/examples/` 下编写 Demo 和 `meta.json`
3. 运行 `npm run dev` 或 `npm run collect-examples`，脚本自动生成：
   - `src/components/{Domain}/routes.tsx`（嵌套 `<Route path="{domain}">`）
   - `src/components/routes.tsx` 中的 import 引用
   - `src/layouts/menu-config.ts` 中的域级父 menu 与子 menu 项

**禁止**：手动编辑 `{Domain}/routes.tsx`、`components/routes.tsx`、`menu-config.ts`、`examples-registry.ts`。

### 8.8 非 prod 组件展示切换（FloatButton）

所有**业务前端子仓库**（`repos/*`，不含 `marsun_components-core` 的 dev app）须接入开发态组件展示入口，与 `repos/maoyang_data-asset-system` 对齐：

| 项         | 规范                                                                                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 环境 guard | `import.meta.env.DEV`（`npm run dev` 为 true，production build 为 false）；禁止额外 `VITE_*` 开关                                                                     |
| 悬浮按钮   | antd `FloatButton`，`right: 24`、`bottom: 80`；业务页 `LayoutGrid` + tooltip「组件展示」→ `/components`；组件页 `House` + tooltip「返回主页」→ 项目默认业务首页       |
| 图标       | 从 `@hkyhy/marsun-components-core` 导入 `LayoutGrid`、`House`（禁止业务页直接 lucide）                                                                                |
| 路由       | `{import.meta.env.DEV && (<Route path="/components" element={<ComponentsLayout />}>…{componentRoutes}</Route>)}`，不走 MainLayout / AppShell                          |
| 依赖       | `prism-react-renderer`；`scripts/collect-examples.mjs` + `scripts/vite-plugin-examples.mjs`；`vite.config.ts` 注册插件；`package.json` 提供 `collect-examples` script |

**新建/接入 checklist**：

0. `package.json` 声明 `react`/`react-dom` `^19`、`antd` `^6`（与 core peer 一致；见 SKILL.md 技术栈）
1. 从 `maoyang_data-asset-system` 复制 `scripts/collect-examples.mjs`、`scripts/vite-plugin-examples.mjs`、`src/layouts/ComponentsLayout/`、`src/pages/Components/`
2. `vite.config.ts` 注册 `viteExamplesPlugin()`
3. `App.tsx` 增加 FloatButton + DEV `/components` 路由（见 [routing-api-路由与API.md](../business/routing-api-路由与API.md) §13.5）
4. 至少一个 `{Domain}/{Module}/examples/meta.json` + Demo，运行 `npm run collect-examples`
5. `ComponentsLayout` 的 `defaultOpenKeys` 按 pathname 首段域（如 `qualityanalysis`）自动展开

**参考实现**：`repos/maoyang_data-asset-system/src/App.tsx`、`repos/Agent_QualityAnalysis/frontend/src/App.tsx`
