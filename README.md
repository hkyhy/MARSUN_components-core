# @hkyhy/marsun-components-core

Marsun 纯 UI 组件库（React 19 + antd 6）。从 `maoyang_data-asset-system` 的 Common / AgentHub 拆分，**不含业务数据**。

[![CI](https://github.com/hkyhy/MARSUN_components-core/actions/workflows/ci.yml/badge.svg)](https://github.com/hkyhy/MARSUN_components-core/actions/workflows/ci.yml)
[![GitHub Pages](https://img.shields.io/badge/docs-GitHub%20Pages-blue)](https://hkyhy.github.io/MARSUN_components-core/)

**远程仓库**：`git@github.com:hkyhy/MARSUN_components-core.git`

**组件 Showcase**：https://hkyhy.github.io/MARSUN_components-core/

## 安装

```bash
npm install @hkyhy/marsun-components-core antd react react-dom
```

> 发布至 [npm](https://www.npmjs.com/package/@hkyhy/marsun-components-core)（GitHub Secret `HKYHY_PACKAGE_PUBLISH` + tag `v*` 触发，见「发布版本」）。

## 快速开始

```tsx
import '@hkyhy/marsun-components-core/styles';
import '@hkyhy/marsun-components-core/tokens';

import {
  MarsunCoreProvider,
  SemanticTag,
  ChatPanel,
  SessionSidebar,
  applyThemeToCssVariables,
  generateTheme,
} from '@hkyhy/marsun-components-core';

const primaryColor = '#1677ff';
applyThemeToCssVariables(primaryColor);

<MarsunCoreProvider
  auth={{
    isAuthenticated: true,
    hasPermission: (p) => permissions.includes(p),
    hasAnyRole: (roles) => roles.some((r) => userRoles.includes(r)),
  }}
  fetch={{ baseUrl: '/api', headers: { Authorization: `Bearer ${token}` } }}
  primaryColor={primaryColor}
  themeConfig={generateTheme(primaryColor)}
>
  <SemanticTag color="primary">标签</SemanticTag>
  <ChatPanel
    messages={[]}
    inputValue=""
    onInputChange={() => {}}
    onSend={() => {}}
  />
</MarsunCoreProvider>
```

### 主题与 Token

| 导入路径 | 用途 |
| --- | --- |
| `@hkyhy/marsun-components-core/tokens` | 静态 CSS 变量默认值（布局、灰阶、标签色等） |
| `@hkyhy/marsun-components-core/theme` | `generateTheme`, `applyThemeToCssVariables`, `PALETTE`, `LAYOUT_TOKENS` |
| `@hkyhy/marsun-components-core/styles` | 组件库打包样式 |

项目可在 `src/styles/tokens.css` 扩展领域变量，详见 showcase 内 `frontend-dev-spec` → `theme.md`。

## 设计原则

- **零业务依赖**：无 `departmentPath`、`personOption` 等领域工具；`transformData` 由消费方实现
- **双模式数据**：props 传 `data`/`treeData`/`options` 优先；或 `fetchUrl` + `transformData`
- **MaybeFn 参数**：`display` / `hidden` / `disabled` 等支持 `boolean | (ctx) => boolean`
- **Mock 数据**：各组件 `doc/*.mock.json`，仅 dev showcase 使用，不打入 npm 产物

## 目录

```
src/components/
  Auth/ Filter/ Form/ File/ Tag/ Icons/ ...   # Common 拍平
  AgentHub/                                    # Chat + KnowledgeBase
```

## Dev

```bash
npm install
npm run dev              # 本地 showcase :5175
npm run build            # 库产物 dist/
npm run build:showcase   # 静态 showcase → dist-showcase/（GitHub Pages）
npm run preview:showcase # 预览 showcase 构建结果
npm run typecheck
```

### GitHub Pages

**deploy 报 404 时**：说明仓库尚未启用 Pages，按下列步骤操作（仅需一次）：

1. 打开 https://github.com/hkyhy/MARSUN_components-core/settings/pages
2. **Build and deployment → Source** 选择 **GitHub Actions**（不要选 Deploy from a branch）
3. 保存后，到 **Actions → Deploy GitHub Pages → Re-run all jobs**

- 推送 `main` 后由 `.github/workflows/pages.yml` 自动部署
- 项目页 base path：`/MARSUN_components-core/`
- 本地模拟 Pages 构建：`VITE_BASE_PATH=/MARSUN_components-core/ npm run build:showcase && npm run preview:showcase`

### 发布版本（npm）

包名为 **`@hkyhy/marsun-components-core`**（npm scope 与 GitHub 发布账号 `hkyhy` 对齐）。

1. 在 GitHub 仓库 **Settings → Secrets → Actions** 配置 `HKYHY_PACKAGE_PUBLISH`（npm Automation Token，对 `@hkyhy` 有 publish 权限）
2. **推送 `main` 即自动发布**：`.github/workflows/release.yml` 会 patch 版本号、提交 `chore(release): v* `、打 tag 并 `npm publish`（`chore(release)` 提交本身不会再次触发，避免循环）
3. 日常只需正常开发提交并 push：

```bash
git push origin main
```

也可在 Actions 中手动运行 **Publish npm**，填写已有 tag 重新发布。

## 后续接入 maoyang

发布 npm 后，在 `maoyang_data-asset-system` 批量替换：

```ts
import { SemanticTag, FetchTreeSelect } from '@hkyhy/marsun-components-core';
// 业务 wrapper 留在 maoyang
import { DepartmentSelect } from '@/components/Common/Form/DepartmentSelect';
```
