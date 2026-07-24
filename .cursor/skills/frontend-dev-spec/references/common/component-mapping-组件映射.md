# 组件映射 Component Mapping

> **文档同步**：每次新增或更改 Common 组件（含 Props、用法、全局接入），须同步更新本文件、`SKILL.md` 及相关 `references/` 提示词；详见 SKILL.md 核心原则 #23。

## npm 包 `@hkyhy/marsun-components-core`

纯 UI 组件库（源码仓库 `marsun_components-core`），业务项目（如 `maoyang_data-asset-system`）通过 npm 安装：

```bash
# 技术栈硬约束：React 19 + antd 6（与 core peer 一致）
npm install @hkyhy/marsun-components-core antd@^6 react@^19 react-dom@^19
```

**接入要点**：

| 项                                | 说明                                                                                                                                                  |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 安装（**提交态**）                | `package.json` → `"@hkyhy/marsun-components-core": "^0.1.17"`（**须与 npm 已发布最新版一致**；核对 `npm view @hkyhy/marsun-components-core version`） |
| 本地联调（**勿改 package.json**） | 环境变量 + Vite alias，见下「本地链」；`package.json` / lockfile **保持 semver**                                                                      |
| 全局 Provider                     | 根节点包裹 `MarsunCoreProvider`（`auth` / `fetch` 由业务注入）                                                                                        |
| 样式                              | `import '@hkyhy/marsun-components-core/styles'`                                                                                                       |
| 公共 Token                        | `import '@hkyhy/marsun-components-core/tokens'`（在 global.scss 或 main 最早加载）                                                                    |
| 主题                              | `generateTheme` / `applyThemeToCssVariables` / `applyCssTokenOverrides` 从 `@hkyhy/marsun-components-core/theme`                                      |
| Showcase                          | https://hkyhy.github.io/MARSUN_components-core/                                                                                                       |

### 本地链：环境变量（不写 `file:`）

在业务项目 **`.env.local`**（gitignore，勿提交）：

```bash
# 启用本地 core（相对 vite.config.ts 所在目录的默认路径 ../../marsun_components-core）
MARSUN_CORE_LOCAL=1

# 或显式指定相对/绝对路径（优先于 MARSUN_CORE_LOCAL 默认）
# MARSUN_CORE_LOCAL_PATH=../../marsun_components-core
```

`vite.config.ts` 接入（共享 helper 见 [marsun-core-vite-alias.mjs](./marsun-core-vite-alias.mjs)）：

```ts
import { marsunCoreViteAlias } from './scripts/marsun-core-vite-alias.mjs';
// 或从 .cursor/skills/frontend-dev-spec/references/common/marsun-core-vite-alias.mjs 引用

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      ...marsunCoreViteAlias(__dirname, { defaultRelativePath: '../../marsun_components-core' }),
    },
  },
});
```

联调前在 `marsun_components-core` 执行 `npm run build`（或 watch）。**禁止**为本地链改 `package.json` 为 `file:`；也**禁止** `npm link` 后 commit 带 `link: true` 的 lockfile。

**禁止提交 `file:` 依赖**：Git 中的 `package.json` / `package-lock.json` 不得出现 `"@hkyhy/marsun-components-core": "file:..."`、指向 monorepo 兄弟目录的 `resolved`，或 `"link": true` 的本地链。Agent/commit 前检查：

```bash
rg '"@hkyhy/marsun-components-core".*file:' package.json   # 须为空
rg 'marsun_components-core|"link": true' package-lock.json  # 须为空（相对路径链）
```

**semver 须已发布且与实版一致**：

| 仓库                     | `package.json` 字段               | 规则                                                                                |
| ------------------------ | --------------------------------- | ----------------------------------------------------------------------------------- |
| `marsun_components-core` | `"version"`                       | feat 开发时 **= npm 已发布最新**；仅 `chore(release)` commit 内允许 **npm+1 patch** |
| 业务项目                 | `"@hkyhy/marsun-components-core"` | **必须**为 `^` + npm 已发布最新版，与 lockfile 解析版本一致                         |

**core 发版**：`chore(release): vX.Y.Z` push main → CI publish；**禁止**本地 `npm publish`。细则见下文「Core 版本管理」。

提交前核对：

```bash
npm view @hkyhy/marsun-components-core version --registry https://registry.npmjs.org
# core 仓库：node scripts/version-check.mjs
# 业务项目：rg '"@hkyhy/marsun-components-core"' package.json
```

**禁止** package.json 版本落后于 npm（如 npm 0.1.15 而文件仍写 0.1.13）、跳号、或 `file:` 链。升版流程见下文「Core 版本管理」。

**导入约定**：npm 包内 Common 已拍平导出，优先从包根 import，业务 wrapper 仍从 `@/components/Common/...`：

```ts
// 纯 UI — 来自 npm
import {
  SemanticTag,
  TooltipInfo,
  CommonFilter,
  VirtualScrollbar,
  Table,
  RefreshCw,
  CircleAlert,
  PageShellProvider,
  ModulePageShell,
  usePageShellLoading,
  FormInfo,
  FormModal,
  Input,
  ReactForm,
  useField,
} from '@hkyhy/marsun-components-core';
// 业务域 — 留在 maoyang 本地
import { DepartmentSelect } from '@/components/Common/Form/DepartmentSelect';
import { MemberStatusTag } from '@/components/Common/Tag/MemberStatusTag';
```

**迁移原则**：包内已有的纯 UI（Filter、Tag、File、Auth 守卫、Layout 等）新代码直接从 npm 引用；含 `departmentPath`、权限常量、业务枚举的 wrapper **不得**迁入 npm，保留在 `src/components/Common/` 或 `src/components/{Domain}/`。

### npm Utils 导出（`@hkyhy/marsun-components-core`）

跨项目纯工具从包根 import，业务项目 **禁止** 复制实现：

| 分类       | 主要导出                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| 日期       | `toDateRange`, `toDateTimeRange`, `toApiStartEnd`, `recentDayRange`, `recentYearRange`, `recentDayRangeStrings` |
| 登录重定向 | `buildLoginPath`, `readRedirectUrlFromSearch`, `REDIRECT_URL_PARAM`                                             |
| 会话空闲   | `getLastActivityTime`, `touchLastActivity`, `DEFAULT_LAST_ACTIVITY_STORAGE_KEY`                                 |
| 权限存储   | `loadUserRolePermissions`, `getStoredUserPermissions`, `USER_ROLE_PERMISSIONS_KEY`                              |
| HTTP       | `createMarsunRequest`（业务项目薄封装注入 token/logout）                                                        |
| 部门树     | `buildDepartmentPathMapFromTree`, `flattenDepartments`, `getNormalUserDepartmentTree`                           |
| 人员选项   | `normalizePersonDtos`, `toPersonOptions`, `createPersonSelectFilter`                                            |
| 工号校验   | `isValidEmployeeIdFormat`, `employeeIdFormatRule`                                                               |
| 文件下载   | `getFileDownloadUrl`, `downloadFileItem`（注入 `getToken`）                                                     |
| 通用       | `formatFileSize`, `resolveMaybeFn`, `resolveVisible`                                                            |

**保留在业务项目**：`fetchAuthPermissions`（绑定 API）、`agentHubAccess`（路由/常量）、`points/*`（领域逻辑）、`request.ts` 薄封装实例。

**版本对齐（硬约束）**：业务前端子仓库与 `@hkyhy/marsun-components-core` 统一 **React 19 + antd 6**（`react`/`react-dom` `^19`，`antd` `^6`）。`package.json` 须直接声明上述依赖并与 lockfile 一致；**禁止**以 antd 5 / React 18 + `--legacy-peer-deps` 作为默认安装路径。遗留仓升级时一次对齐主版本，再接入/升版 core。

## Core 版本管理 Marsun Core Version

### 核心原则：package.json 与实版一致

**`package.json` 中的版本号必须反映真实可解析版本**，不得滞后、跳号或与 npm 脱节。

| 场景                        | `marsun_components-core` 的 `version` | 业务项目的依赖                   |
| --------------------------- | ------------------------------------- | -------------------------------- |
| feat/fix 开发中             | `= npm 最新`（如 `0.1.17`）           | `^` + npm 最新                   |
| 准备发版（chore commit 内） | `= npm 最新 + 1 patch`                | 仍保持上一版直至 CI publish 成功 |
| CI publish 成功后           | `= npm 最新`                          | 升为 `^` + 新版本                |

核对命令：

```bash
npm view @hkyhy/marsun-components-core version --registry https://registry.npmjs.org
node -p "require('./package.json').version"   # core 仓库
```

### 升版前必核对（禁止跳号）

工作区 version **不得**相对「npm 最新版」一次跳多个 patch（如 0.1.12 → 0.1.21），**不得**落后于 npm（如 npm 0.1.17 而本地仍 0.1.15）。

| 来源            | 命令                                             | 含义           |
| --------------- | ------------------------------------------------ | -------------- |
| npm **已发布**  | `npm view @hkyhy/marsun-components-core version` | **权威实版**   |
| 上次 **commit** | `git show HEAD:package.json` → `.version`        | Git 台账       |
| 工作区          | `node -p "require('./package.json').version"`    | 待提交 version |

在 `repos/marsun_components-core` 根目录：

```bash
node scripts/version-check.mjs                    # 检查；落后 / 跳号 exit 1
npm run version:sync                              # 对齐 npm 最新（--apply-published）
npm run version:check:apply                       # 写回 npm+1，准备 chore(release) commit
```

### 发布顺序（commit/push 触发，禁止本地 npm publish）

1. **功能开发**：只提交 `feat`/`fix`/`docs` 等，**不修改** `package.json` version（保持 = npm 最新）。
2. **准备发版**：
   ```bash
   node scripts/version-check.mjs          # 确认 = npm 最新
   npm run version:check:apply             # 写回 npm+1（仅改文件，不 publish）
   npm run build && npm test
   git add package.json package-lock.json
   git commit -m "chore(release): v0.1.x"
   git push origin main                    # 单独 push，确保为 push 批次最后一条 commit
   ```
3. **CI 自动**（`marsun_components-core` 的 `release.yml`）：校验 → build/test → 打 tag → `npm publish`。
4. **业务项目**：npm 可见新版本后，`package.json` 改为 `^0.1.x`，`npm install`，commit lockfile。

补发失败版本：GitHub Actions → **Publish npm (manual retry)** → 输入已有 tag。

### chore(release) commit

- 仅含 `package.json` / `package-lock.json` version bump（及 `CHANGELOG` 若有）
- 不与功能 commit 混写在同一 push 批次末尾之外
- commit message 首行须为：`chore(release): v0.1.x`（与 package.json version 一致）
- **禁止**本地 `npm publish`

### npm 导出 ↔ 本地 Common 对照

| npm（`@hkyhy/marsun-components-core`）                       | 原 `src/components/Common/...`                                          |
| ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `CommonDescriptions`                                         | `Descriptions/CommonDescriptions`                                       |
| `TooltipInfo`                                                | `TooltipInfo`                                                           |
| `PageHeaderLayout`                                           | `Layout/PageHeaderLayout`                                               |
| `PageSpin`                                                   | 模块 body 整页 Spin（flex 高度链）                                      |
| `PageShellProvider` / `usePageShell` / `usePageShellLoading` | App Layout 全局 loading 注册                                            |
| `ModulePageShell`                                            | toolbar 外 + body 内置 PageSpin；`spinning` / meta 同步                 |
| `VirtualScrollbar`                                           | `VirtualScrollbar`                                                      |
| `Table`                                                      | 列表 Table 包装（antd；默认分页/滚动/Empty）；业务优先用此而非直连 antd |
| `Icons`（`RefreshCw`、`CircleAlert` 等）                     | 统一图标库；业务禁止 `lucide-react`                                     |
| `Sparkline`                                                  | 微型趋势折线（S3 质量分析等）                                           |
| `LlmFormattedText` / `parseLlmText`                          | LLM 结构化文本展示                                                      |
| `SemanticTag` / `SEMANTIC_COLORS`                            | `Tag/SemanticTag`                                                       |
| `CommonFilter` + `Filter*`                                   | `Filter/*`                                                              |
| `FetchSelect` / `FetchTreeSelect`                            | `Form/FetchSelect` 等                                                   |
| `FileItemView` / `FileLink` / `FilePreview`                  | `File/*`                                                                |
| `MarsunCoreProvider`                                         | 新增，替代分散的 auth/fetch context                                     |
| `DepartmentSelect` 等                                        | **无**，保留本地业务 wrapper                                            |

### AgentHub 导出（`@hkyhy/marsun-components-core`）

包根 `export *` 自 `AgentHub/Chat` 与 `AgentHub/KnowledgeBase`，优先从包根 import：

```ts
import {
  ChatPanel,
  ChatAgentFab,
  ChatAgentFabLayout,
  SessionSidebar,
  CitationPanel,
  MessageActions,
  useCitationPanel,
  DocumentTable,
  KnowledgeCard,
  AgentHubAccessGuard,
} from '@hkyhy/marsun-components-core';
```

| 子模块                           | 主要导出                                                                                                                                                                                                                    |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chat / Detail                    | `ChatPanel`, `ChatAgentFab`, `ChatAgentFabLayout`, `ChatInput`, `ChatFollowUpSuggestions`, `MessageItem`, `MessageActions`, `CitationPanel`, `CitationInlineBadge`, `ThinkingSection`, `MermaidBlock`, …                    |
| Chat / List                      | `ChatCard`, `ChatFilterBar`, `SessionSidebar`                                                                                                                                                                               |
| Chat / Action                    | `ChatCreateButton`, `ChatManageActionButtons`, `SessionActionButtons`                                                                                                                                                       |
| Chat / hooks（纯 UI / URL 注入） | `useTypewriter`, `useAutoScrollToBottom`, `useCitationPanel`；另有可选 URL 注入版 `useChat` / `useChatSessions` / `useSSECompletion`（无 BFF 业务语义）                                                                     |
| Chat / utils                     | `prepareCitationContent`, `parseSessionMessages`, `extractCitations`, `sanitizeMermaidChart`, `animateScrollFromTopToBottom` / `getScrollBottom`（core 源码已导出；npm 未含时业务仓可用 `src/utils/agentHub/smoothScroll`） |
| KnowledgeBase / Detail           | `DocumentTable`, `ParseStatusTag`                                                                                                                                                                                           |
| KnowledgeBase / List             | `KnowledgeCard`, `KBFilterBar`                                                                                                                                                                                              |
| KnowledgeBase / Action           | `CreateButton`, `ManageActionButtons`                                                                                                                                                                                       |
| 守卫                             | `AgentHubAccessGuard`, `AgentHubSessionAccessGuard`, `AgentHubIndexRedirect`（受控 props：`isAdmin` / `hasAccess` / `redirectTo`）                                                                                          |

**业务仓分层（maoyang 等）**：禁止再维护 `src/components/AgentHub` fork。

- **UI / FormModal / Guard 壳**：从包根 import；`ChatFormModal` / `KBFormModal` 须注入 `onSubmit`（调业务 `agentHubApi`）；路由层用 `authStore` + `agentHubAccess` 计算后传入 Guard props（见 `pages/AgentHub/guards.tsx`）。
- **业务 hooks**：放 `src/hooks/AgentHub/`（`useChatSessions` 含 RAGFlow 回退 / create·delete·initialize / 竞态；`useSSECompletion` 若对核心信封格式与 core 不一致则必须留业务仓）。
- **鉴权路径**：`utils/agentHubAccess`、`constants/agentHub` 留业务仓。

**`ChatPanel` 推荐问接入（业务层只传数据，编排由 core 负责）**

| Prop                             | 说明                                                      |
| -------------------------------- | --------------------------------------------------------- |
| `followUpItems`                  | API 返回的推荐问/追问（如 `sessionQuestions`）            |
| `starterItems`                   | 无用户消息且无 `followUpItems` 时的领域兜底               |
| `onFollowUpSelect`               | 完全自定义点击行为（优先于 `onSendMessage`）              |
| `onSendMessage`                  | 点击推荐项**直接发送**（业务标准接入，映射 `send(text)`） |
| `followUpLoading`                | 会话加载/发送中时传 `true`，隐藏推荐区                    |
| `starterTitle` / `followUpTitle` | 默认 `推荐问` / `推荐追问`                                |

合并规则：`followUpItems` 优先；否则无用户消息时用 `starterItems`；否则不展示。`showEmptyHint` 未传时，有推荐区或 `followUpLoading` 则自动隐藏空态。

**`ChatAgentFab` + reference 引用侧栏（标准接入）**

| 层                   | 用法                                                                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `ChatAgentFab`       | 受控 `open` / `onOpenChange`；`panelExpanded={citationOpen}` 侧栏加宽；`panelFullscreen` 拉高至 `calc(100vh - 88px)`                    |
| `ChatAgentFabLayout` | `main` 放 `ChatPanel`；`citationAside` 放 `CitationPanel`                                                                               |
| `useCitationPanel`   | 管理 `citationOpen` / `panelCitations` / `handleCitationClick` / `resetCitationState`                                                   |
| `ChatPanel`          | `onCitationClick`；`headerActions` 内「新建会话」+「全屏/退出全屏」（`Maximize2`/`Minimize2`），容器类 `chat-panel-header-icon-actions` |
| 业务                 | API/SSE、`extractCitations(reference)` → `ChatMessage.citations`                                                                        |

```tsx
const {
  citationOpen,
  panelCitations,
  highlightedCitationIndex,
  handleCitationClick,
  closeCitationPanel,
  resetCitationState,
} = useCitationPanel();
const [panelFullscreen, setPanelFullscreen] = useState(false);

<ChatAgentFab
  open={open}
  onOpenChange={setOpen}
  panelExpanded={citationOpen}
  panelFullscreen={panelFullscreen}
  closeOnClickOutside={!panelFullscreen}
  panelAriaLabel="质量 Agent"
>
  <ChatAgentFabLayout
    main={
      <ChatPanel
        headerActions={(
          <div className="chat-panel-header-icon-actions">
            <Button icon={<Plus />} aria-label="新建会话" onClick={handleNewSession} />
            <Button
              icon={panelFullscreen ? <Minimize2 /> : <Maximize2 />}
              aria-label={panelFullscreen ? '退出全屏' : '全屏'}
              onClick={() => setPanelFullscreen((v) => !v)}
            />
          </div>
        )}
        messages={messages}
        onCitationClick={handleCitationClick}
        onSendMessage={(text) => { resetCitationState(); send(text); }}
        ...
      />
    }
    citationAside={
      citationOpen ? (
        <CitationPanel
          citations={panelCitations}
          highlightedIndex={highlightedCitationIndex}
          onClose={closeCitationPanel}
        />
      ) : null
    }
  />
</ChatAgentFab>
```

**引用（`reference` → `citations`）**

| 步骤 | 说明                                                                                                   |
| ---- | ------------------------------------------------------------------------------------------------------ |
| API  | 助手消息 / SSE `done` 含 `reference.chunks[]`；正文含 `[ID:n]`（0-based）                              |
| 映射 | `extractCitations(reference)`（`@hkyhy/marsun-components-core`）→ `ChatMessage.citations`              |
| 展示 | `MessageItem` 渲染角标与来源摘要；`onCitationClick` → `CitationPanel` 侧栏（FAB `panelExpanded` 加宽） |

### Common 组件（本地或 npm）

| antd 组件　　　　　　 | Common 封装　　　　　　　　　　　　　　　　　　　  | 使用方式　　　　　　　　　　　　　　　　　　　　　                                                                                                                  |
| --------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Descriptions`　　　  | `CommonDescriptions`　　　　　　　　　　　　　　　 | 传入 `DescriptionItem[]` 数组　　　　　　　　　　　                                                                                                                 |
| `Tooltip`（详情）　   | `TooltipInfo`　　　　　　　　　　　　　　　　　　  | 传入 `content: DescriptionItem[]` + `children`；禁止手写 div 拼接详情                                                                                               |
| 页面头部布局　　　　  | `PageHeaderLayout`　　　　　　　　　　　　　　　　 | `title` + `onBack` + `actions` + `description` + `spinning` + `children`                                                                                            |
| 模块页壳（AppShell）  | `ModulePageShell` + `PageShellProvider`　　　　　  | App 根包 Provider；`spinning` 或 `usePageShellLoading`；见 [shell-layout-页面壳与布局.md](shell-layout-页面壳与布局.md)                                             |
| Agent 业务壳　　　　  | `AgentAppShell`　　　　　　　　　　　　　　　　　  | 左 sider（品牌/菜单/footer 槽）+ 右顶栏；`menuItems` + `siderFooter`（如 `UserProfileCard`）+ `children`；纯 UI                                                     |
| 主内容卡片　　　　　  | `ContentCard`（Shared/Layout）　　　　　　　　　   | 默认带 border/shadow；模块主区用 `flat` + `noPadding`；见 [styles-样式规范.md](styles-样式规范.md) §8.10                                                            |
| 可滚动区域　　　　　  | `VirtualScrollbar`　　　　　　　　　　　　　　　　 | `wrapperClassName` / `className` 传 `classNames('{组件}-{功能}', styles['...'])`；`ref` → viewport；见 [shell-layout-页面壳与布局.md](shell-layout-页面壳与布局.md) |
| 模块/页面样式         | `style.module.scss`                                | 每模块/页面必选（无样式时空文件）；见 [styles-样式规范.md](styles-样式规范.md)                                                                                      |
| `Tag`（状态展示）　　 | `MemberStatusTag` / `RoleTag` / `ReviewStatusTag`  | 传入 `status` / `role`　　　　　　　　　　　　　　                                                                                                                  |
| `Tag`（通用）　　　　 | `SemanticTag`　　　　　　　　　　　　　　　　　　  | 统一 Tag 组件，颜色必须使用 `SEMANTIC_COLORS` 常量                                                                                                                  |
| `Select`（部门选择）  | `DepartmentSelect`　　　　　　　　　　　　　　　　 | 自动加载部门列表　　　　　　　　　　　　　　　　　                                                                                                                  |
| 权限判断　　　　　　  | `hasPermission`　　　　　　　　　　　　　　　　　  | `hasPermission(user, 'user:edit')`　　　　　　　　                                                                                                                  |
| 侧栏用户卡片　　　　  | `UserProfileCard`　　　　　　　　　　　　　　　　  | `name` + `sub?` + `collapsed?` + `onLogout?` / `menuItems?` + `extra?`（右侧独立操作如站内信，与主区同卡内、Dropdown 外；**不传则无扩展区**）；主区点击展开退出     |
| 筛选栏　　　　　　　  | `CommonFilter` + Filter 子组件　　　　　　　　　　 | 见 [filter-筛选组件.md](filter-筛选组件.md)　　　　　　　　　　　　　　                                                                                             |
| `Input`（筛选）　　　 | `FilterInput`　　　　　　　　　　　　　　　　　　  | `filterKey` + **语义化** `label` + `value` + `onChange`（禁止 label「关键词」，见 [filter-筛选组件.md](filter-筛选组件.md) §5.1.1）                                 |
| 展示/表单内容块       | `InteractiveBlock`（业务 Shared/Detail）           | title/info/actions/subtitle/tags 层级；见 [shell-layout-页面壳与布局.md](shell-layout-页面壳与布局.md)                                                              |
| `Select`（筛选）　　  | `FilterSelect`　　　　　　　　　　　　　　　　　　 | `filterKey` + `options` + `value` + `onChange`　　                                                                                                                  |
| `TreeSelect`（筛选）  | `FilterTreeSelect`　　　　　　　　　　　　　　　　 | `filterKey` + `value` + `onChange`，自动加载部门树　                                                                                                                |
| `RangePicker`（筛选） | `FilterDateRange`　　　　　　　　　　　　　　　　  | `filterKey` + `value` + `onChange`，输出 YYYY-MM-DD                                                                                                                 |
| 数字范围（筛选）　　  | `FilterNumberRange`　　　　　　　　　　　　　　　  | `filterKey` + `value` + `onChange` + `unit` + 可选 `min`/`max`/`precision`/`step`；确定时左≤右                                                                      |

### Icons（`@hkyhy/marsun-components-core`）

| 场景                                    | 用法                                                                                 | 禁止                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| 页面/侧栏/列表装饰 icon                 | `import { RefreshCw, CircleAlert, LayoutGrid } from '@hkyhy/marsun-components-core'` | 业务项目 `import from 'lucide-react'`                                |
| 加载中刷新                              | `<RefreshCw spin={loading} size={16} />`                                             | 手写 CSS 旋转或 lucide 直引                                          |
| Header 刷新 ButtonGroup 项              | `refreshAction({ onClick, loading })` → `{ icon: <RefreshCw spin={loading} /> }`     | 无 icon 的纯文字刷新（Header 须带 icon）                             |
| 结构化详情 hover（TooltipInfo trigger） | `Info`（16px）+ `TooltipInfo`；**cursor: pointer**                                   | `CircleHelp` 作详情 trigger；`cursor: help`；`<button>` 包裹 Tooltip |
| InteractiveBlock 导出操作               | `Download`（14px），icon 与 link 文字同色                                            | `FileText` 冒充导出；icon 单独语义色                                 |
| 路由/面包屑 icon 类型                   | `FC<IconProps>` from core                                                            | `LucideIcon` from lucide-react                                       |

完整列表见 core `ICON_NAMES` / `ICON_REGISTRY`；缺图标时在 `marsun_components-core/src/components/Icons` 补导出后再业务引用。

### @kne/button-group

| 场景                     | 组件                                                                | 替代                               |
| ------------------------ | ------------------------------------------------------------------- | ---------------------------------- |
| 操作按钮组（Table）      | `ButtonGroup moreType="link"` + 对象数组                            | `Dropdown` + `Button`              |
| 列表表格                 | `Table`（core；默认分页/滚动/Empty）                                | 直连 antd `Table`（逐步替换）      |
| 操作按钮组（详情页）     | `ButtonGroup` + 对象数组                                            | `Space` + 多个 `Button`            |
| 页面头部操作             | `ButtonGroup` + 对象数组；刷新用 `refreshAction` + `RefreshCw` icon | `Space` + `Button` + lucide-react  |
| 确认操作（listArray 中） | 对象 `message`/`isDelete` 属性                                      | `ConfirmLink`/`ConfirmButton` 组件 |
| 确认操作（独立按钮）     | `ConfirmButton` / `ConfirmLink`                                     | `Modal.confirm` / `Popconfirm`     |
| 带加载按钮               | `LoadingButton`                                                     | `Button` + 手动 `loading`          |
| 请求按钮                 | `FetchButton`                                                       | `LoadingButton` + 手动请求         |

### Form 表单（`@kne/form-info`，经 core 再导出）

业务**只**从 `@hkyhy/marsun-components-core` 导入；core 内部依赖并再导出 `@kne/form-info`（含样式侧载）。**禁止**业务直连 `@kne/form-info` / 手写 `import '@kne/form-info/dist/index.css'`。

```ts
// 日常业务（默认）
import {
  FormInfo,
  Form,
  FormModal,
  Input,
  TextArea,
  SubmitButton,
} from '@hkyhy/marsun-components-core';

// 引擎进阶（深度自定义字段 / 联动）
import { ReactForm, useField, useFormApi, GroupList } from '@hkyhy/marsun-components-core';
```

必填星号等依赖主题别名 `--color-warning`（映射 `--error-color`，见 [theme-主题Token.md](theme-主题Token.md)）。

| 组件                                                          | 说明                                                    |
| ------------------------------------------------------------- | ------------------------------------------------------- |
| `Form`                                                        | 页内表单容器（form-info）；`data` 初值、`onSubmit` 提交 |
| `FormInfo`                                                    | 分组布局；`column` / `list` 放置字段                    |
| `FormModal`                                                   | 弹窗表单；`formProps={{ data, onSubmit }}`              |
| `FormSteps` / `FormStepsModal`                                | 多步向导（新业务替代 antd `StepForm`）                  |
| `List` / `TableList` / `MultiField`                           | 动态列表 / 表格行 / 多值字段                            |
| `Input` / `TextArea` / `Select` / `InputNumber` / `Switch` 等 | 字段组件                                                |
| `SubmitButton` / `ResetButton` / `CancelButton`               | 表单操作按钮                                            |
| 字段 `rule`                                                   | 校验字符串，如 `REQ`、`REQ TEL`、`EMAIL`、`ID_CARD`     |

**存量**：未迁移模块可暂留 antd `Form.useForm` + `Form.Item`；**新模块、新表单必须走 core 再导出的 FormInfo 栈**。`FetchSelect` / `FetchTreeSelect` / `PersonOptionRow` 仍为 core 字段辅助。

**引擎层（进阶，经 core 再导出 `@kne/react-form`）**：日常优先 FormInfo；深度自定义时从 core 导入下表 API，**禁止**业务直连 `@kne/react-form`。引擎默认组件名为 **`ReactForm`**（勿与 form-info 的 `Form` 混淆）。

| API                                          | 说明                                      |
| -------------------------------------------- | ----------------------------------------- |
| `ReactForm`                                  | 引擎根容器；`data` / `onSubmit` / `rules` |
| `useField`                                   | 字段绑定（自绘 UI 时用）                  |
| `useFormApi` / `useFormContext`              | 读写表单、`validateAll` 等                |
| `useSubmit` / `useReset` / `useGroup`        | 提交、重置、分组上下文                    |
| `GroupList`                                  | 动态分组增删                              |
| `RULES` / `preset` / `interceptors`          | 内置规则、预置、拦截器                    |
| `findField` / `matchFields` / `formUtils` 等 | 工具方法                                  |

## 六、antd 重构为 Common 的条件

1. 多处重复使用相同配置
2. 有统一的样式/交互规范
3. 需要封装业务逻辑
4. Tag 展示逻辑一致

重构模板参考 [../business/module-patterns-模块模式.md](../business/module-patterns-模块模式.md) 中「antd 组件重构模板」章节。
