# 测试规范 Testing

### 10.1 技术栈

| 工具                        | 用途                                              |
| --------------------------- | ------------------------------------------------- |
| vitest                      | 测试框架（`npm run test` / `npm run test:watch`） |
| @testing-library/react      | React 组件渲染与查询                              |
| @testing-library/user-event | 模拟用户交互                                      |
| @testing-library/jest-dom   | DOM 断言扩展（`toBeInTheDocument()` 等）          |
| happy-dom                   | DOM 环境（jsdom 在 Node <20.19 有兼容问题）       |

### 10.2 测试文件放置

测试文件放在被测组件同级的 `__tests__/` 目录（与 `examples/` 平级），命名为 `{ComponentName}.test.tsx`（组件）或 `{moduleName}.test.ts`（纯逻辑）：

```
src/components/Common/Auth/
├── hasPermission.ts
├── PermissionGuard.tsx
├── ProtectedRoute.tsx
├── examples/                    # Demo 示例
├── __tests__/                   # 测试文件（与 examples/ 平级）
│   ├── hasPermission.test.ts
│   ├── PermissionGuard.test.tsx
│   └── ProtectedRoute.test.tsx
└── index.ts

src/components/Common/Tag/
├── SemanticTag.tsx
├── StatusTag.tsx
├── examples/
├── __tests__/
│   ├── SemanticTag.test.tsx
│   └── StatusTag.test.tsx
└── index.ts
```

### 10.3 测试原则

1. **每个组件必须有测试**：新建组件时同步编写测试文件
2. **纯逻辑优先**：`hasPermission()`、`formatSize()` 等纯函数直接单元测试，不依赖 DOM
3. **组件测试最小化 mock**：只 mock 外部依赖（`useAuthStore`、`useNavigate` 等），不 mock 组件内部逻辑
4. **Form 组件测试**：业务表单以 core 再导出的 FormInfo 为准；若测试存量 antd Form 且需 `Form.useForm()`，通过 Wrapper 组件包裹，禁止在 `it()` 回调中直接调用 Hook
5. **样式断言**：happy-dom 不自动转换 hex → rgb，行内样式颜色比较时用辅助函数统一格式
6. **路由组件测试**：需要 `useNavigate`/`useLocation` 的组件用 `MemoryRouter` 包裹
7. **Store mock**：使用 `vi.mock('@/stores/xxxStore')` + `vi.mocked(useXxxStore).mockReturnValue()`

### 10.4 测试覆盖范围

| 组件类型     | 必测项                 | 示例                                           |
| ------------ | ---------------------- | ---------------------------------------------- |
| 纯逻辑函数   | 全部分支               | `hasPermission(null, ...)` / 各角色 / 未知角色 |
| UI 组件      | 渲染内容 + 交互回调    | 标题/按钮/链接点击 + loading 状态              |
| Form 组件    | 字段渲染 + 提交 + 校验 | 所有 placeholder + onFinish + onBack           |
| 条件渲染组件 | 各分支                 | `roles` 匹配/不匹配 + 未登录                   |
| 列表组件     | 渲染 + hidden 过滤     | 全部可见 + hidden 过滤                         |
| Tag 组件     | 文本 + 颜色 + 尺寸     | 各语义色 + hex 直传 + 默认色                   |

### 10.5 测试模板

**纯逻辑函数**：

```ts
// __tests__/hasPermission.test.ts
import { hasPermission } from '../hasPermission';
describe('hasPermission', () => {
  it('returns false for null user', () => {
    expect(hasPermission(null, 'file:view')).toBe(false);
  });
});
```

**UI 组件**：

```tsx
// __tests__/PageHeaderLayout.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PageHeaderLayout from '../PageHeaderLayout';

describe('PageHeaderLayout', () => {
  it('renders title', () => {
    render(<PageHeaderLayout title="用户管理" />);
    expect(screen.getByText('用户管理')).toBeInTheDocument();
  });
  it('calls onBack', () => {
    const onBack = vi.fn();
    render(<PageHeaderLayout title="详情" onBack={onBack} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onBack).toHaveBeenCalledOnce();
  });
  it('renders description', () => {
    render(<PageHeaderLayout title="任务管理" description="页面说明" />);
    expect(screen.getByText('页面说明')).toBeInTheDocument();
  });
});
```

**带 Form 的组件**：

```tsx
// __tests__/SomeForm.test.tsx
const Wrapper: React.FC<Props> = ({ loading, onFinish, ...rest }) => {
  const [form] = Form.useForm();
  return <SomeForm form={form} loading={loading} onFinish={onFinish} {...rest} />;
};
describe('SomeForm', () => {
  it('renders fields', () => {
    render(<Wrapper />);
    expect(screen.getByPlaceholderText('名称')).toBeInTheDocument();
  });
});
```

**带 Store 的组件**：

```tsx
// __tests__/PermissionGuard.test.tsx
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));
const mockUseAuthStore = vi.mocked(useAuthStore);

describe('PermissionGuard', () => {
  it('renders children when role matches', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      hasAnyRole: vi.fn().mockReturnValue(true),
    } as never);
    render(<PermissionGuard roles={['ADMIN']}>Content</PermissionGuard>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
```

### 10.6 开发流程中的测试

在开发流程（第二节）中增加测试步骤：

- **步骤 11.5**（在 barrel export 之后、页面组件之前）：为新组件编写测试文件
- **步骤 18.5**（检查项）：新增检查 — 是否有对应 `.test.tsx` / `.test.ts` 文件，测试是否通过

### 10.7 运行命令

| 命令                                  | 说明             |
| ------------------------------------- | ---------------- |
| `npm run test`                        | 运行所有测试     |
| `npm run test:watch`                  | 监听模式运行测试 |
| `npm run test:coverage`               | 生成覆盖率报告   |
| `npx vitest run src/path/to/test.tsx` | 运行单个测试文件 |
