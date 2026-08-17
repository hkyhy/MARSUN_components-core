# 拆包与摇树 Bundle / Tree Shaking

> **SSOT**：业务路由拆包、core 包边界、重依赖加载。与 Vite 默认 tree shaking 配合；禁止另造 webpack 时代按需插件（如 `babel-plugin-import`）。

## 1. 目标分层

| 层          | 内容                                                                                               | 加载策略                                                          |
| ----------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| L0 壳       | Provider、theme/tokens、Layout、Table、Form、Filter、Icons（可摇）、VirtualScrollbar、Permissions… | 可进首包；从包根 `@hkyhy/marsun-components-core` import           |
| L1 通用增强 | Tour、OrgTree、Upload（轻）、非预览 File 列表项等                                                  | 用到即摇入；仍可从包根                                            |
| L2 产品域   | AgentHub、File 预览栈、LlmFormattedText                                                            | **子路径** import；禁止默认进无相关产品首包                       |
| L3 业务重库 | plotly、`@ant-design/charts`、xlsx 等                                                              | **禁止**进 App 壳；跟页面/组件，优先路由 lazy + 组件内 `import()` |

| 概念           | 含义                        | 本仓主手段                                                           |
| -------------- | --------------------------- | -------------------------------------------------------------------- |
| Tree shaking   | 构建时剔除未引用 ESM        | Vite 默认 + core `preserveModules` + 收紧 `sideEffects` + Icons 可摇 |
| Code splitting | 运行时按路由/交互再下 chunk | **业务默认 `React.lazy` 路由**；预览/图表/`import()`                 |
| 包边界         | 产品域不进无关 SPA 首包     | core L2 子路径：`/agent-hub` `/file` `/llm`                          |

三者一起做；**禁止**只改 Vite 开关、禁止上 `babel-plugin-import`。

## 2. 业务路由（硬约束）

1. `src/pages/{Module}/routes.tsx` 中**页面组件必须** `React.lazy(() => import(...))`，外包 `Suspense`，fallback 用 core `PageSpin`（或壳已有等价 loading）。
2. **同步允许**：`Navigate`、薄 Guard/`ProtectedRoute` 壳、常量/`PERMISSIONS`、与全站常驻相关的 layout（`AppShell`/`MainLayout`）。**禁止**为图省事同步 import 业务 `pages/*/index`。
3. `App.tsx`：**禁止**顶层静态 import 多个业务页；聚合 `{xxxRoutes}` 即可。Login 可同步；AgentHub 等独立 Layout 须 lazy。
4. `/components` showcase：仅 `import.meta.env.DEV`；examples 已 lazy 则保持；生产 build 不得打进 showcase 注册表（见 [examples-组件示例.md](./examples-组件示例.md) §8.8）。
5. **新建页面**：注册路由时默认 lazy；自检若发现 `routes.tsx` 出现 `import XxxPage from './index'`（非 `import type`）→ 不合格。

### 参考改法

```tsx
import { lazy, Suspense } from 'react';
import { Route } from 'react-router-dom';
import { PageSpin } from '@hkyhy/marsun-components-core';

const AlertsPage = lazy(() => import('./index'));

export const alertsRoutes = (
  <Route
    path="alerts"
    element={
      <Suspense
        fallback={
          <PageSpin spinning>
            <div style={{ minHeight: '40vh' }} aria-hidden />
          </PageSpin>
        }
      >
        <AlertsPage />
      </Suspense>
    }
  />
);
```

> `PageSpin` 须传 `spinning` + `children`。多模块可抽薄封装（如 S3 `pages/routeLazy.tsx` 的 `RouteSuspense`），禁止再造平行 loading 体系。

## 3. core 导入约定

| 能力                   | import                                           |
| ---------------------- | ------------------------------------------------ |
| L0/L1                  | `from '@hkyhy/marsun-components-core'`           |
| AgentHub / Citation 等 | `from '@hkyhy/marsun-components-core/agent-hub'` |
| FilePreview 等预览     | `from '@hkyhy/marsun-components-core/file'`      |
| LlmFormattedText       | `from '@hkyhy/marsun-components-core/llm'`       |
| 样式 / Token / 主题    | 保持 `/styles` `/tokens` `/theme`                |

- **迁移期**：根 barrel 可暂时 re-export L2，但须 JSDoc/`@deprecated`，**新代码禁止**依赖根路径拿 L2。
- **目标态**：根 `src/index.ts` **不再** export AgentHub / File 预览 / Llm。
- Icons：业务仍禁止直连 `lucide-react`（SKILL #20）；core 内 **一图标一模块** + barrel 具名 re-export；`ICON_REGISTRY` 仅 showcase/按名查找（会拉齐全部）。禁止「用一个 icon 拉齐全部已登记 lucide」。
- 类型（如 `Citation`）：优先 `import type`，入口走 `/agent-hub`（目标态），避免类型入口绑回根 barrel。
- **ESLint（业务仓）**：对包根 `@hkyhy/marsun-components-core` 配置 `no-restricted-imports` 的 `importNames`（AgentHub / File 预览 / Llm 具名），message 指向本文件与子路径；子路径 `/agent-hub` `/file` `/llm` 不限制。

细则与映射表见 [component-mapping-组件映射.md](./component-mapping-组件映射.md)。

## 4. 重依赖

1. **库内**：excel/docx/pptx/mermaid 等必须 `import()` / `React.lazy`（FilePreview、MermaidBlock 为范例）。
2. **业务**：`plotly.js` / `react-plotly.js` / `@ant-design/charts` / `xlsx` 禁止在 `App.tsx`、layout、全局 store 静态 import；放在对应页面/图表组件，且该页路由已 lazy。
3. **禁止**为摇树引入 `babel-plugin-import` / antd 老式按需 babel（antd 6 ESM 由 Vite 摇）。

## 5. core 库工程（维护者）

1. `vite.config.lib.ts`：`formats: ['es']` + `preserveModules: true`（保持）。
2. `package.json` `exports`：除 `.` `/theme` `/styles` `/tokens` 外，须有 `./agent-hub` `./file` `./llm`（及可选 `./icons`）。对应 `build.lib.entry`：`src/agent-hub.ts` / `src/file.ts` / `src/llm.ts`（已落地）。
3. `sideEffects`：仅 CSS/SCSS 与明确副作用文件（如 `ensureDayjsZhCn`）；**禁止**把整个 `dist/index.js` 标成 sideEffects（副作用走 `/styles` + Provider）。
4. 新 L2 能力：**默认不进根 export**；先子路径，再评估是否升 L1。根 barrel 对 L2 仅允许迁移期 `@deprecated` re-export。

## 6. 与既有原则关系

- SKILL **#27**：L0/L1 须经模块 index → 包根；**L2 经子路径入口**。
- SKILL **#15** / [routing-api](../business/routing-api-路由与API.md)：模块路由拆分 + **必须 lazy**。
- SKILL **#20** Icons：业务禁直连 lucide；**core 内可摇**。
- SKILL **#41** DEV showcase：与生产拆包一致，生产不含 `/components`。
- SKILL **#49**：本文件总入口。

## 7. 自检（任务结束）

- [ ] 本任务新/改的 `pages/**/routes.tsx` 页组件均为 lazy
- [ ] 未在壳层新增 plotly/charts/xlsx/AgentHub 静态依赖
- [ ] 新 core L2 走子路径；未把重能力塞进根 barrel（除非迁移期 deprecated）
- [ ] （可选）对本产品默认落地路由看一眼 bundle：不应出现无关 L2/重库整包
- [ ] （可选）体积分析：业务仓 `ANALYZE=1 npm run build:analyze` → 打开 `dist/stats.html`（rollup-plugin-visualizer）

## 8. 业务仓体积分析

| 仓             | 命令                    | 产物              |
| -------------- | ----------------------- | ----------------- |
| S3 QA frontend | `npm run build:analyze` | `dist/stats.html` |
| 数据资产       | `npm run build:analyze` | `dist/stats.html` |

S3 图表须经 `QualityAnalysis/Common/LazyPlot`（动态 `react-plotly.js`），禁止业务组件顶层静态 import plotly。  
数据资产 Dashboard 图表须经 `Dashboard/Analytics/Common/LazyPie` / `LazyArea`（动态 `@ant-design/charts`），禁止顶层静态 `import { Pie|Area } from '@ant-design/charts'`。
