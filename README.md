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
  <ChatPanel messages={[]} inputValue="" onInputChange={() => {}} onSend={() => {}} />
</MarsunCoreProvider>;
```

### 主题与 Token

| 导入路径                               | 用途                                                                    |
| -------------------------------------- | ----------------------------------------------------------------------- |
| `@hkyhy/marsun-components-core/tokens` | 静态 CSS 变量默认值（布局、灰阶、标签色等）                             |
| `@hkyhy/marsun-components-core/theme`  | `generateTheme`, `applyThemeToCssVariables`, `PALETTE`, `LAYOUT_TOKENS` |
| `@hkyhy/marsun-components-core/styles` | 组件库打包样式                                                          |

### L2 产品域（v0.1.53+）

AgentHub / File 预览 / Llm 走子路径，避免无相关产品首包拖入重依赖：

| 导入路径                                  | 用途                                      |
| ----------------------------------------- | ----------------------------------------- |
| `@hkyhy/marsun-components-core/agent-hub` | Chat、Knowledge、Citation、AgentHub Guard |
| `@hkyhy/marsun-components-core/file`      | FilePreview、FileItem、FileLink 等        |
| `@hkyhy/marsun-components-core/llm`       | LlmFormattedText                          |

包根仍 re-export L2（迁移期 `@deprecated`）；新代码请用子路径。

### Layout（v0.1.57+）

`AgentAppShell` 侧栏折叠改为边缘竖条 tab（主题色）；`UserProfileCard` / brand 折叠态水平居中。

> 0.1.54/0.1.55 因 typecheck 未发布；0.1.56 修 showcase；**0.1.57** PermissionBindPanel 勾选性能。

### HTTP（v0.1.58+）

`createMarsunRequest`：Marsun 信封 / 扁平 JSON 透传 / blob；`getResponseError`；`passThroughEnvelopeError`。**0.1.60** `isMarsunEnvelope`（拒绝 `{code:200,results}` 误判）+ FormData 不写死 JSON Content-Type。

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
2. **顺号**：日常 `package.json` = npm latest；本地 `npm pack` **不要**每次 bump。发版前 `node scripts/version-check.mjs --apply`（= npm+1；**0.1.98 之后下一版为 0.1.99**）
3. **发版**：再提交并 push 首行形如 `chore(release): vX.Y.Z …` 的 commit；`release.yml` 校验版本 → 打 tag → `npm publish`（仅该消息前缀触发，feat push 不发版）

```bash
# 当前 npm latest=0.1.98 时
node scripts/version-check.mjs --apply   # → 0.1.99
# 再 commit chore(release): v0.1.99 … 并 push main
```

也可在 Actions 中手动运行 **Publish npm**，填写已有 tag 重新发布。

- 2026-10-29：`v0.1.141` — InboxBell 列表卡回退：去左侧色条、标题在类型 Tag 前、未读底 `#f8fbff`（对齐测试环境观感）
- 2026-10-29：`v0.1.140` — Table：列配置重排/增量列后归位 `fixed` 列，避免操作列 sticky 失效

- 2026-10-23：`v0.1.138` — CreateActionForm：`allocatorDisabled` / `defaultAssigneeUserId`（Related S3-1523）
- 2026-10-22：`v0.1.137` — InboxBell：`action_assigned_ack` 恒「查看任务」（禁「去执行」）；Related S3-1721
- 2026-10-21：`v0.1.136` — MessageCenter 推送规则级别改为业务 DI `levelOptions`（禁写死 L1/L2/L3；S3 可注入 L2+）
- 2026-10-16：`v0.1.135` — 新建跟踪任务分配人/执行人必填星与任务类型同为 `is-req`（去掉 `marsun-form-info-is-req`）
- 2026-10-14：`v0.1.134` — InboxBell Drawer「清空未读」可选 `markAllRead`；Demo/vitest
- 2026-10-12：`v0.1.133` — DispositionBar 短徽章；模板来源 Tag；ActionList 去壳/铃铛摘要色；执行门禁 SSOT；vite external 子路径防双 React（feat 分支曾误标 0.1.135 未进 main，顺号回正）
- 2026-10-11：`v0.1.132` — 重试发布消息模板富文本（0.1.131 CI 绿但 npm 未见）
- 2026-10-11：`v0.1.131` — 消息模板富文本色/加粗回显（配置页；seed 另仓）
- 2026-10-11：`v0.1.130` — InboxBell 级别 Tag `selected` 反白（消息类型 Tag 仍默认浅底）
- 2026-10-10：`v0.1.129` — InboxBell toast `createPortal` 自渲染（禁 ant notification 透明残留壳）
- 2026-10-09：`v0.1.124` — CreateAction FormInfo DatePicker 与 scopeMode=none（token 刷新后重发）
- 2026-09-23：`v0.1.122` — ActionListTable 默认 scrollX 对齐长状态列（0.1.121 已发后补发）

## 后续接入 maoyang

发布 npm 后，在 `maoyang_data-asset-system` 批量替换：

```ts
import { SemanticTag, FetchTreeSelect } from '@hkyhy/marsun-components-core';
// 业务 wrapper 留在 maoyang
import { DepartmentSelect } from '@/components/Common/Form/DepartmentSelect';
```
