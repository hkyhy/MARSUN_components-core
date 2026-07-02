# 组件映射与 antd 重构

> **文档同步**：每次新增或更改 Common 组件（含 Props、用法、全局接入），须同步更新本文件、`SKILL.md` 及相关 `references/` 提示词；详见 SKILL.md 核心原则 #23。

## npm 包 `@hkyhy/marsun-components-core`

纯 UI 组件库（源码仓库 `marsun_components-core`），业务项目（如 `maoyang_data-asset-system`）通过 npm 安装：

```bash
npm install @hkyhy/marsun-components-core antd react react-dom
# maoyang 当前 antd 5 / React 18 时须加：npm install ... --legacy-peer-deps
```

**接入要点**：

| 项 | 说明 |
| --- | --- |
| 安装（**提交态**） | `package.json` → `"@hkyhy/marsun-components-core": "^0.1.15"`（**须与 npm 已发布最新版一致**；核对 `npm view @hkyhy/marsun-components-core version`） |
| 本地联调（**勿改 package.json**） | 环境变量 + Vite alias，见下「本地链」；`package.json` / lockfile **保持 semver** |
| 全局 Provider | 根节点包裹 `MarsunCoreProvider`（`auth` / `fetch` 由业务注入） |
| 样式 | `import '@hkyhy/marsun-components-core/styles'` |
| 公共 Token | `import '@hkyhy/marsun-components-core/tokens'`（在 global.scss 或 main 最早加载） |
| 主题 | `generateTheme` / `applyThemeToCssVariables` / `applyCssTokenOverrides` 从 `@hkyhy/marsun-components-core/theme` |
| Showcase | https://hkyhy.github.io/MARSUN_components-core/ |

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

| 仓库 | `package.json` 字段 | 规则 |
| --- | --- | --- |
| `marsun_components-core` | `"version"` | **必须**等于 npm 已发布最新版（发布后）或「npm 最新 +1 patch」（待发布前唯一允许超前） |
| 业务项目 | `"@hkyhy/marsun-components-core"` | **必须**为 `^` + npm 已发布最新版（如 `^0.1.15`），与 lockfile 解析版本一致 |

提交前核对：

```bash
npm view @hkyhy/marsun-components-core version --registry https://registry.npmjs.org
# core 仓库：node scripts/version-check.mjs
# 业务项目：rg '"@hkyhy/marsun-components-core"' package.json
```

**禁止** package.json 版本落后于 npm（如 npm 0.1.15 而文件仍写 0.1.13）、跳号、或 `file:` 链。升版流程见 [marsun-core-version.md](./marsun-core-version.md)。

**导入约定**：npm 包内 Common 已拍平导出，优先从包根 import，业务 wrapper 仍从 `@/components/Common/...`：

```ts
// 纯 UI — 来自 npm
import { SemanticTag, TooltipInfo, CommonFilter, VirtualScrollbar } from '@hkyhy/marsun-components-core';

// 业务域 — 留在 maoyang 本地
import { DepartmentSelect } from '@/components/Common/Form/DepartmentSelect';
import { MemberStatusTag } from '@/components/Common/Tag/MemberStatusTag';
```

**迁移原则**：包内已有的纯 UI（Filter、Tag、File、Auth 守卫、Layout 等）新代码直接从 npm 引用；含 `departmentPath`、权限常量、业务枚举的 wrapper **不得**迁入 npm，保留在 `src/components/Common/` 或 `src/components/{Domain}/`。

**版本对齐**：包 peer 为 antd 6 + React 19；业务项目未升级前可用 `--legacy-peer-deps` 安装，逐步替换 import 后再统一升级 antd/React。

### npm 导出 ↔ 本地 Common 对照

| npm（`@hkyhy/marsun-components-core`） | 原 `src/components/Common/...` |
| --- | --- |
| `CommonDescriptions` | `Descriptions/CommonDescriptions` |
| `TooltipInfo` | `TooltipInfo` |
| `PageHeaderLayout` | `Layout/PageHeaderLayout` |
| `VirtualScrollbar` | `VirtualScrollbar` |
| `Sparkline` | 微型趋势折线（S3 质量分析等） |
| `LlmFormattedText` / `parseLlmText` | LLM 结构化文本展示 |
| `SemanticTag` / `SEMANTIC_COLORS` | `Tag/SemanticTag` |
| `CommonFilter` + `Filter*` | `Filter/*` |
| `FetchSelect` / `FetchTreeSelect` | `Form/FetchSelect` 等 |
| `FileItemView` / `FileLink` / `FilePreview` | `File/*` |
| `MarsunCoreProvider` | 新增，替代分散的 auth/fetch context |
| `DepartmentSelect` 等 | **无**，保留本地业务 wrapper |

### AgentHub 导出（`@hkyhy/marsun-components-core`）

包根 `export *` 自 `AgentHub/Chat` 与 `AgentHub/KnowledgeBase`，优先从包根 import：

```ts
import {
  ChatPanel,
  SessionSidebar,
  CitationPanel,
  MessageActions,
  useChat,
  useSSECompletion,
  DocumentTable,
  KnowledgeCard,
} from '@hkyhy/marsun-components-core';
```

| 子模块 | 主要导出 |
| --- | --- |
| Chat / Detail | `ChatPanel`, `ChatInput`, `MessageItem`, `MessageActions`, `CitationPanel`, `CitationInlineBadge`, `ThinkingSection`, `MermaidBlock`, … |
| Chat / List | `ChatCard`, `ChatFilterBar`, `SessionSidebar` |
| Chat / Action | `ChatCreateButton`, `ChatManageActionButtons`, `SessionActionButtons` |
| Chat / hooks | `useChat`, `useChatSessions`, `useSSECompletion`, `useTypewriter`, `useAutoScrollToBottom` |
| Chat / utils | `prepareCitationContent`, `parseSessionMessages`, `sanitizeMermaidChart`, … |
| KnowledgeBase / Detail | `DocumentTable`, `ParseStatusTag` |
| KnowledgeBase / List | `KnowledgeCard`, `KBFilterBar` |
| KnowledgeBase / Action | `CreateButton`, `ManageActionButtons` |
| 守卫 | `AgentHubAccessGuard`, `AgentHubSessionAccessGuard`, `AgentHubIndexRedirect` |

### Common 组件（本地或 npm）

| antd 组件　　　　　　 | Common 封装　　　　　　　　　　　　　　　　　　　  | 使用方式　　　　　　　　　　　　　　　　　　　　　                    |
| --------------------- | -------------------------------------------------- | --------------------------------------------------------------------- |
| `Descriptions`　　　  | `CommonDescriptions`　　　　　　　　　　　　　　　 | 传入 `DescriptionItem[]` 数组　　　　　　　　　　　                   |
| `Tooltip`（详情）　   | `TooltipInfo`　　　　　　　　　　　　　　　　　　  | 传入 `content: DescriptionItem[]` + `children`；禁止手写 div 拼接详情 |
| 页面头部布局　　　　  | `PageHeaderLayout`　　　　　　　　　　　　　　　　 | `title` + `onBack` + `actions` + `description` + `children`           |
| 可滚动区域　　　　　  | `VirtualScrollbar`　　　　　　　　　　　　　　　　 | `wrapperClassName` / `className` 传 `classNames('{组件}-{功能}', styles['...'])`；`ref` → viewport；见 [virtual-scrollbar.md](virtual-scrollbar.md) |
| 模块/页面样式         | `style.module.scss`                               | 每模块/页面必选（无样式时空文件）；见 [styles.md](styles.md) |
| `Tag`（状态展示）　　 | `MemberStatusTag` / `RoleTag` / `ReviewStatusTag`  | 传入 `status` / `role`　　　　　　　　　　　　　　                    |
| `Tag`（通用）　　　　 | `SemanticTag`　　　　　　　　　　　　　　　　　　  | 统一 Tag 组件，颜色必须使用 `SEMANTIC_COLORS` 常量                    |
| `Select`（部门选择）  | `DepartmentSelect`　　　　　　　　　　　　　　　　 | 自动加载部门列表　　　　　　　　　　　　　　　　　                    |
| 权限判断　　　　　　  | `hasPermission`　　　　　　　　　　　　　　　　　  | `hasPermission(user, 'user:edit')`　　　　　　　　                    |
| 筛选栏　　　　　　　  | `CommonFilter` + Filter 子组件　　　　　　　　　　 | 见 [filter.md](filter.md)　　　　　　　　　　　　　　                    |
| `Input`（筛选）　　　 | `FilterInput`　　　　　　　　　　　　　　　　　　  | `filterKey` + `label` + `value` + `onChange`　　　                    |
| `Select`（筛选）　　  | `FilterSelect`　　　　　　　　　　　　　　　　　　 | `filterKey` + `options` + `value` + `onChange`　　                    |
| `TreeSelect`（筛选）  | `FilterTreeSelect`　　　　　　　　　　　　　　　　 | `filterKey` + `value` + `onChange`，自动加载部门树　                  |
| `RangePicker`（筛选） | `FilterDateRange`　　　　　　　　　　　　　　　　  | `filterKey` + `value` + `onChange`，输出 YYYY-MM-DD                   |
| 数字范围（筛选）　　  | `FilterNumberRange`　　　　　　　　　　　　　　　  | `filterKey` + `value` + `onChange` + `unit`　　　　                   |

### @kne/button-group

| 场景                     | 组件                                     | 替代                               |
| ------------------------ | ---------------------------------------- | ---------------------------------- |
| 操作按钮组（Table）      | `ButtonGroup moreType="link"` + 对象数组 | `Dropdown` + `Button`              |
| 操作按钮组（详情页）     | `ButtonGroup` + 对象数组                 | `Space` + 多个 `Button`            |
| 页面头部操作             | `ButtonGroup` + 对象数组                 | `Space` + `Button`                 |
| 确认操作（listArray 中） | 对象 `message`/`isDelete` 属性           | `ConfirmLink`/`ConfirmButton` 组件 |
| 确认操作（独立按钮）     | `ConfirmButton` / `ConfirmLink`          | `Modal.confirm` / `Popconfirm`     |
| 带加载按钮               | `LoadingButton`                          | `Button` + 手动 `loading`          |
| 请求按钮                 | `FetchButton`                            | `LoadingButton` + 手动请求         |

### antd 原生 Form

| 组件                                       | 说明                                 |
| ------------------------------------------ | ------------------------------------ |
| `Form.useForm()`                           | 创建表单实例，返回 `[form]`          |
| `<Form form={form} layout="vertical">`     | 表单容器                             |
| `<Form.Item name label rules>`             | 表单字段容器，`rules` 为校验规则数组 |
| `<Input>` / `<Select>` / `<TreeSelect>` 等 | antd 原生字段组件，放在 Form.Item 内 |
| `form.validateFields()`                    | 触发校验并返回表单数据               |
| `form.setFieldsValue()`                    | 设置表单值（编辑时初始化）           |
| `form.resetFields()`                       | 重置表单                             |
| `Form.useWatch()`                          | 监听某个字段的值变化                 |

**校验规则**：`rules={[{ required: true, message: '不能为空' }]}`、`[{ type: 'email', message: '格式不正确' }]}`

## 六、antd 重构为 Common 的条件

1. 多处重复使用相同配置
2. 有统一的样式/交互规范
3. 需要封装业务逻辑
4. Tag 展示逻辑一致

重构模板参考 [../business/module-patterns.md](../business/module-patterns.md) 中「antd 组件重构模板」章节。
