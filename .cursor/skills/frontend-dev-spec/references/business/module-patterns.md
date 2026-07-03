# 业务模块模式与代码模板

> **大前提**：目录结构规范是所有模式的基础。无论使用什么第三方库（`@kne/button-group` 等），组件都必须按 `Action/`、`Detail/`、`Form/`、`Modal/`、`List/` 目录拆分。第三方库的使用必须在目录结构规范内进行。

## 关键模式摘要

下文包含完整代码模板与示例，涵盖：

- **目录结构是大前提**：所有组件必须按 `Action/`、`Detail/`、`Form/`、`Modal/`、`List/` 目录拆分，`@kne/*` 库的使用不能绕过目录规范
- **业务逻辑抽离到 handlers.ts**：Table 行操作和页面头部操作共有的业务逻辑必须抽到 `Action/handlers.ts`，供 `ButtonGroup` listArray 的 `onClick` 和独立 Button 组件共用
- **列表项可见性用 `hidden` 属性**：`ButtonGroup` listArray、`StatCardList` items 等列表项配置，统一使用 `hidden` 属性控制可见性，禁止使用 `switch(role)` 返回不同数组或 `{condition && <List/>}` 条件渲染不同列表。将所有可能的项目放在一个扁平数组中，通过 `hidden: !hasAnyRole([...])` 控制每项的可见性（`StatItem` 和 `ButtonGroup` 的 listArray 均支持 `hidden`）。整个区块的权限控制仍使用 `PermissionGuard`
- **批量操作状态校验常量集中管理**：批量操作允许的状态列表（如 `SUBMIT_REVIEW_STATUSES`、`REVOKE_REVIEW_STATUSES`、`DELETE_STATUSES`、`ARCHIVE_STATUSES`）在 `Action/handlers.ts` 中用 `ReviewStatus` 枚举定义并 `export`，配合 `filterByStatus()` 函数过滤可操作项
- **常量集中维护**：跨模块共享的枚举标签映射统一维护在 `src/constants/index.ts`（如 `REVIEW_STATUS_LABEL_MAP`、`FILE_STATUS_TABS`、`INITIATED_STATUS_GROUPS`、`REVIEW_STATUS_GROUPS`），模块级 `constants/status.ts` 仅从 `@/constants` 导入并重新导出，不内联数据。所有状态 key 使用枚举值不用字符串
- **自定义 Hook 封装页面状态**：页面组件中的状态管理和业务逻辑应抽到 `hooks/use{Feature}.ts`，页面仅做 hook 解构 + 渲染
- **ButtonGroup listArray 对象形式（推荐）**：`ButtonGroup` 的 `list` 优先使用**对象数组**（`Record<string, unknown>[]`），不使用函数组件 `() => <Component />`。确认型操作用 `message`/`isDelete` 属性，不用 `ConfirmLink`/`ConfirmButton` 组件
- **函数式调用 + Button 同文件分导出**：当按钮的交互逻辑（如确认弹窗 + API 调用）需被多个场景复用时，将函数式调用和 Button 组件写在同一文件中但分开导出。函数供 listArray onClick 等场景直接调用，Button 供需要渲染按钮的场景使用。参考 `src/components/System/Permission/Action/DeleteButton.tsx`
- **页面头部操作统一使用 ButtonGroup**：无论按钮数量多少，管理页头部的操作按钮统一使用 `ButtonGroup` + listArray，弹窗状态由页面管理，按钮组件只负责触发回调
- **详情页操作统一使用 ButtonGroup**：详情页的操作按钮也使用 `ButtonGroup` + listArray，删除等确认操作用 `message`/`isDelete` 属性
- 操作按钮的受控/非受控模式
- 独立确认型按钮使用 `ConfirmButton`/`ConfirmLink`（供页面头部等非 Table 场景）
- 操作按钮组（使用 `@kne/button-group` 的 `ButtonGroup`，放 `Action/` 目录）
- **Form 与 Modal 分离模式**（使用 antd 原生 Form，Form/ 放纯字段组件+接收 form prop，Modal/ 放 Form.useForm + validateFields + 提交逻辑）
- **校验规则**（`Form.Item` 的 `rules` 属性，如 `[{ required: true, message: '...' }]`）
- 详情页使用 CommonDescriptions
- **Tooltip 详情展示**：hover 展示结构化详情时统一使用 `TooltipInfo`，传入 `DescriptionItem[]`，禁止直接用 antd `Tooltip` + 手写 `div` 拼接字段
- **部门与人员选择全量展示**：部门筛选用 `FilterTreeSelect` 加载完整组织树，禁止按角色裁剪；人员选择器展示全量在职用户（`PersonOptionRow` + `matchPersonOptionSearch`），详见 [department-person.md](department-person.md)
- **部门完整路径展示**：所有部门名称必须显示自上而下完整路径（如 `技术部/信息部`），详见 [department-person.md](department-person.md)
- 列表 columns 工厂函数（放 `List/` 目录，操作列引用 `Action/` 目录的按钮组件）
- Barrel Export 规范
- antd 组件重构为 Common 组件的模板

## 〇点五、列表操作按钮规范

> **核心原则**：
>
> 1. **图标来源**：业务项目统一 `import { RefreshCw, ... } from '@hkyhy/marsun-components-core'`，禁止 `lucide-react` / `@ant-design/icons`。
> 2. **ButtonGroup CRUD 无 icon**：表格/详情页 listArray 中编辑/删除等只显示文字。
> 3. **Header 刷新带 icon**：使用 `Action/refreshAction.tsx`，`icon: <RefreshCw spin={loading} size={16} />`。
> 4. **FilterSelect 单选选中项显示对号**：`FilterSelect` 单选模式下，选中项右侧显示 `CheckOutlined`（对号），而非 `CloseOutlined`（叉号）。取消选中通过"重置"按钮操作，不通过点击对号。


## 〇、列表项可见性：`hidden` 属性模式

> **核心原则**：`ButtonGroup` listArray、`StatCardList` items 等列表项配置，统一使用 `hidden` 属性控制可见性，禁止使用 `switch(role)` 返回不同数组或 `{condition && <List/>}` 条件渲染不同列表。

### ❌ 禁止：switch/case 返回不同数组

```tsx
// ❌ 禁止：switch 按角色返回不同数组
const getItems = () => {
  switch (user?.role) {
    case UserRole.NORMAL_USER:
      return [
        { title: '我的文件', ... },
        { title: '今日上传', ... },
      ];
    case UserRole.DEPT_LEADER:
      return [
        { title: '部门文件', ... },
        { title: '待我审核', ... },
      ];
    default:
      return [];
  }
};
<StatCardList items={getItems()} />
```

### ❌ 禁止：条件渲染不同列表

```tsx
// ❌ 禁止：条件渲染不同列表
{
  isDeptLeader && (
    <>
      <h3>部门数据</h3>
      <StatCardList items={deptItems} />
    </>
  );
}
{
  isReviewer && (
    <>
      <h3>审核数据</h3>
      <StatCardList items={reviewItems} />
    </>
  );
}
```

### ✅ 正确：扁平数组 + hidden 属性

```tsx
// ✅ 正确：扁平数组 + hidden 控制可见性
const statItems: StatItem[] = [
  // 全角色共享
  {
    title: '我的文件',
    value: stats?.myFiles ?? 0,
    prefix: <UserOutlined />,
    color: '#1677ff',
    onClick: () => goFiles(),
  },
  {
    title: '审核通过',
    value: stats?.myApprovedFiles ?? 0,
    prefix: <CheckCircleOutlined />,
    color: '#52c41a',
    onClick: () => goFiles(ReviewStatus.APPROVED),
  },
  // 部门领导
  {
    title: '部门文件',
    value: stats?.deptFiles ?? 0,
    prefix: <FolderOutlined />,
    color: '#13c2c2',
    onClick: () => goFiles(),
    hidden: !isDeptLeader,
  },
  {
    title: '待我审核',
    value: stats?.myPendingReviews ?? 0,
    prefix: <ClockCircleOutlined />,
    color: '#faad14',
    onClick: () => goReview('pending', ReviewStatus.PENDING_DEPT_LEADER),
    hidden: !isDeptLeader,
  },
  // 审核人
  {
    title: '待我审核',
    value: stats?.myPendingReviews ?? 0,
    prefix: <ClockCircleOutlined />,
    color: '#faad14',
    onClick: () => goReview('pending', ReviewStatus.PENDING_REVIEWER),
    hidden: !isReviewer,
  },
  // 系统管理员
  {
    title: '文件总数',
    value: stats?.totalFiles ?? 0,
    prefix: <FileOutlined />,
    color: '#1677ff',
    onClick: () => goFiles(),
    hidden: !isAdmin,
  },
  {
    title: '用户总数',
    value: stats?.totalUsers ?? 0,
    prefix: <TeamOutlined />,
    color: '#722ed1',
    onClick: () => navigate('/system/users'),
    hidden: !isAdmin,
  },
];

<StatCardList items={statItems} />;
```

### ✅ ButtonGroup listArray 同样使用 hidden

```tsx
// ✅ 正确：ButtonGroup listArray 使用 hidden（无 icon，只显示文字）
const quickEntryList: Record<string, unknown>[] = [
  { children: '上传文件', onClick: () => navigate('/files/list') },
  {
    children: '审核中心',
    onClick: () => navigate('/review/pending'),
    hidden: !hasAnyRole([UserRole.DEPT_LEADER, UserRole.REVIEWER, UserRole.SYSTEM_ADMIN]),
  },
  {
    children: '审计日志',
    onClick: () => navigate('/audit'),
    hidden: !hasAnyRole([UserRole.SYSTEM_ADMIN]),
  },
];

<ButtonGroup list={quickEntryList} />;
```

### `hidden` vs `PermissionGuard` 的选择

| 场景                                  | 使用方式          | 说明                                |
| ------------------------------------- | ----------------- | ----------------------------------- |
| 列表项（按钮、卡片等）按角色显示/隐藏 | `hidden` 属性     | 单个项的可见性控制                  |
| 整个区块/组件按角色显示/隐藏          | `PermissionGuard` | 包裹整个区域，如整个 Card、整个表格 |
| 列表项按业务状态显示/隐藏             | `hidden` 属性     | 如 `hidden: record.type !== 'FILE'` |

## 一、操作按钮模式

### 1.0 业务逻辑抽离（handlers.ts）

> **核心原则**：Table 行操作和页面头部操作共有的业务逻辑必须抽到 `Action/handlers.ts`，供 `ButtonGroup` listArray 的 `onClick` 和独立 Button 组件共用。

```ts
// Action/handlers.ts
import { message } from 'antd';
import type { FileItem } from '@/types';
import { fileApi } from '@/api';

/** 删除 */
export async function handleDelete(record: FileItem, onSuccess: () => void) {
  try {
    await fileApi.delete(record.id);
    message.success('删除成功');
    onSuccess();
  } catch {
    /* handled */
  }
}

/** 提交审核 */
export async function handleSubmitReview(record: FileItem, onSuccess: () => void) {
  try {
    await fileApi.submitReview(record.id);
    message.success('提交审核成功');
    onSuccess();
  } catch {
    /* handled */
  }
}

/** 获取删除确认消息 */
export function getDeleteConfirmMessage(record: FileItem) {
  return record.type === 'FOLDER'
    ? `确定要删除文件夹「${record.name}」吗？文件夹内的文件不会被删除，但会移至根目录。`
    : `确定要删除「${record.name}」吗？`;
}
```

### 1.1 ButtonGroup listArray 对象形式（推荐）

> **核心原则**：`ButtonGroup` 的 `list` 优先使用**对象数组**（`Record<string, unknown>[]`），不使用函数组件 `() => <Component />`。确认型操作用 `message`/`isDelete` 属性，不用 `ConfirmLink`/`ConfirmButton` 组件。

```tsx
// Action/FileActionButtons.tsx
import React from 'react';
import ButtonGroup from '@kne/button-group';
import type { FileItem } from '@/types';
import { handleDelete, handleSubmitReview, getDeleteConfirmMessage } from './handlers';

interface FileActionButtonsProps {
  record: FileItem;
  canOperate: boolean;
  onDetail: (record: FileItem) => void;
  onRename: (record: FileItem) => void;
  onMove: (record: FileItem) => void;
  onReupload: (record: FileItem) => void;
  onRefresh: () => void | Promise<void>;
}

const FileActionButtons: React.FC<FileActionButtonsProps> = ({
  record,
  canOperate,
  onDetail,
  onRename,
  onMove,
  onReupload,
  onRefresh,
}) => {
  const isEditable =
    canOperate && ['DRAFT', 'REJECTED', 'RETURNED', 'REVOKED'].includes(record.reviewStatus);
  const isInReview =
    canOperate && ['PENDING_REVIEWER', 'PENDING_LEADER'].includes(record.reviewStatus);

  const listArray: Record<string, unknown>[] = [
    {
      type: 'link',
      children: '查看详情',
      onClick: () => onDetail(record),
    },
    {
      type: 'link',
      children: '下载',
      onClick: () => window.open(`/api/files/${record.id}/download`, '_blank'),
      hidden: record.type !== 'FILE',
    },
    {
      type: 'link',
      children: '重新上传',
      onClick: () => onReupload(record),
      hidden: !isEditable || record.type !== 'FILE',
    },
    {
      type: 'link',
      children: '重命名',
      onClick: () => onRename(record),
      hidden: !isEditable,
    },
    {
      type: 'link',
      children: '移动到',
      onClick: () => onMove(record),
      hidden: !isEditable,
    },
    {
      type: 'link',
      children: '提交审核',
      isDelete: false,
      message: `确定要提交「${record.name}」进行审核吗？`,
      onClick: () => handleSubmitReview(record, onRefresh),
      hidden: !isEditable,
    },
    {
      type: 'link',
      children: '删除',
      isDelete: true,
      message: getDeleteConfirmMessage(record),
      onClick: () => handleDelete(record, onRefresh),
      hidden: !isEditable,
    },
  ];

  return <ButtonGroup moreType="link" list={listArray} />;
};

export default FileActionButtons;
```

**对象属性说明**：

| 属性       | 类型                      | 说明                                      |
| ---------- | ------------------------- | ----------------------------------------- |
| `type`     | `'link'` / `'primary'` 等 | 按钮类型，Table 操作列用 `'link'`         |
| `children` | `string`                  | 按钮文字                                  |
| `onClick`  | `() => void`              | 点击回调，引用 `handlers.ts` 中的函数     |
| `hidden`   | `boolean`                 | 是否隐藏，替代条件 `push`                 |
| `message`  | `string`                  | 确认提示文案，有此属性自动启用 Popconfirm |
| `isDelete` | `boolean`                 | 是否为危险删除操作，红色确认按钮          |
| `confirm`  | `boolean`                 | 显式启用确认弹窗（同 `message`）          |

### 1.2 单个按钮（Button + Modal 组合，支持受控/非受控）

```tsx
// Action/EditButton.tsx
import React, { useState } from 'react';
import { Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import type { UserInfo } from '@/types';
import { FormModal } from '@/components/{Domain}/{Module}';

interface EditButtonProps {
  user: UserInfo;
  onSuccess: () => void;
  /** 受控模式：外部管理 open 状态，不渲染按钮 */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const EditButton: React.FC<EditButtonProps> = ({ user, onSuccess, open, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const modalOpen = isControlled ? open : internalOpen;

  const handleClose = () => {
    isControlled ? onOpenChange?.(false) : setInternalOpen(false);
  };

  return (
    <>
      {!isControlled && (
        <Button onClick={() => setInternalOpen(true)} type="primary" icon={<EditOutlined />}>
          编辑
        </Button>
      )}
      <FormModal
        open={modalOpen}
        editingUser={user}
        onCancel={handleClose}
        onSuccess={() => {
          handleClose();
          onSuccess();
        }}
      />
    </>
  );
};

export default EditButton;
```

**受控/非受控模式说明**：

- **非受控**（默认）：按钮内部管理 open 状态，点击按钮打开弹窗
- **受控**（`open` + `onOpenChange`）：外部管理 open 状态，不渲染按钮，只渲染弹窗（用于表格行操作）

### 1.3 独立确认型按钮（供页面头部等非 Table 场景使用）

```tsx
// Action/DeleteButton.tsx
import React from 'react';
import { ConfirmButton } from '@kne/button-group';
import type { FileItem } from '@/types';
import { handleDelete, getDeleteConfirmMessage } from './handlers';

interface DeleteButtonProps {
  record: FileItem;
  onSuccess: () => void;
}

/** 删除按钮（ConfirmButton 形式，供页面头部等非 Table 场景使用） */
const DeleteButton: React.FC<DeleteButtonProps> = ({ record, onSuccess }) => {
  return (
    <ConfirmButton
      isDelete
      message={getDeleteConfirmMessage(record)}
      onClick={() => handleDelete(record, onSuccess)}
    >
      删除
    </ConfirmButton>
  );
};

export default DeleteButton;
```

> **注意**：独立 Button 组件也调用 `handlers.ts` 中的逻辑，与 listArray 中的 `onClick` 共用同一套 API 调用。

### 1.4 函数式调用 + Button 同文件分导出

> **核心原则**：当按钮的交互逻辑（如确认弹窗 + API 调用）需要被多个场景复用时，将**函数式调用**和 **Button 组件**写在同一个文件中但分开导出。函数供 `ButtonGroup` listArray 的 `onClick` 或其他场景直接调用，Button 组件供需要渲染按钮的场景使用。

```tsx
// Action/DeleteButton.tsx
import React from 'react';
import { Button, Modal, message } from 'antd';
import type { RoleConfig } from '@/types';
import { permissionApi } from '@/api';

interface DeleteButtonProps {
  role: RoleConfig;
  onSuccess: () => void;
}

/** 函数式调用供列表行操作、listArray onClick 等场景使用 */
export function confirmDeleteRole(role: RoleConfig, onSuccess: () => void) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除角色「${role.key}」吗？`,
    okType: 'danger',
    onOk: async () => {
      try {
        await permissionApi.deleteRole(role.key);
        message.success('删除成功');
        onSuccess();
      } catch {
        /* handled */
      }
    },
  });
}

/** Button 组件供需要渲染按钮的场景使用 */
const DeleteButton: React.FC<DeleteButtonProps> = ({ role, onSuccess }) => {
  return (
    <Button type="link" size="small" danger onClick={() => confirmDeleteRole(role, onSuccess)}>
      删除
    </Button>
  );
};

export default DeleteButton;
```

**使用方式**：

```tsx
// 1. 在 ButtonGroup listArray 中直接调用函数
import { confirmDeleteRole } from './DeleteButton';

const listArray: Record<string, unknown>[] = [
  {
    type: 'link',
    children: '删除',
    isDelete: true,
    message: '确定删除吗？',
    onClick: () => confirmDeleteRole(role, onSuccess),
  },
];

// 2. 作为独立 Button 组件使用
import DeleteButton from './DeleteButton';

<DeleteButton role={role} onSuccess={onSuccess} />;
```

**与 handlers.ts 的区别**：

- `handlers.ts`：纯业务逻辑（API 调用 + message 提示），不包含 UI 交互
- `函数式调用 + Button 同文件`：包含 UI 交互（如 `Modal.confirm`），函数和 Button 共享同一交互逻辑
- 当交互仅涉及 API 调用无 UI → 放 `handlers.ts`
- 当交互涉及确认弹窗等 UI 且需多场景复用 → 放同一文件，函数式调用 + Button 分开导出

### 1.5 操作按钮组合（统一使用 ButtonGroup）

> **核心原则**：所有操作按钮组合（包括页面头部和详情页）统一使用 `ButtonGroup` + listArray 对象形式，不使用函数组件 `() => <Component />`，不使用 `Space` + `Button`。

```tsx
// Action/ActionButtons.tsx — 详情页操作
import React from 'react';
import ButtonGroup from '@kne/button-group';
import { confirmDeleteUser } from './DeleteUserButton';

interface ActionButtonsProps {
  user: UserInfo;
  canEdit: boolean;
  canStatus: boolean;
  canDelete?: boolean;
  onEdit: () => void;
  onStatusChange: () => void;
  onActionComplete: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  user,
  canEdit,
  canStatus,
  canDelete,
  onEdit,
  onStatusChange,
  onActionComplete,
}) => {
  if (!canEdit && !canStatus && !canDelete) return null;

  const listArray: Record<string, unknown>[] = [
    { type: 'primary', children: '编辑', onClick: onEdit, hidden: !canEdit },
    { children: '变更状态', onClick: onStatusChange, hidden: !canStatus },
    {
      children: '删除',
      isDelete: true,
      message: `确定删除用户「${user.displayName}」吗？`,
      onClick: () => confirmDeleteUser(user, onActionComplete),
      hidden: !canDelete,
    },
  ];

  return <ButtonGroup list={listArray} />;
};

export default ActionButtons;
```

> **关键变化**：
>
> - 详情页操作也使用 `ButtonGroup` + listArray，不再使用 `Space` + 独立按钮组件
> - 删除操作使用 `message`/`isDelete` 属性，调用 `confirmDelete` 函数
> - 按钮组件只接收回调函数（`onEdit`/`onStatusChange`），不内嵌弹窗，弹窗由页面管理

```tsx
// Action/ManageActionButtons.tsx — 管理页头部操作（统一使用 ButtonGroup）
import React from 'react';
import ButtonGroup from '@kne/button-group';
import { handleBatchDelete } from './handlers';

interface ManageActionButtonsProps {
  hasPermission: boolean;
  selectedRowKeys: React.Key[];
  onAdd: () => void;
  onImport: () => void;
  onBatchDeleteSuccess: () => void;
}

const ManageActionButtons: React.FC<ManageActionButtonsProps> = ({
  hasPermission,
  selectedRowKeys,
  onAdd,
  onImport,
  onBatchDeleteSuccess,
}) => {
  const hasSelected = selectedRowKeys.length > 0;

  const listArray: Record<string, unknown>[] = [
    { type: 'primary', children: '添加', onClick: onAdd, hidden: !hasPermission },
    { children: '导入', onClick: onImport, hidden: !hasPermission },
    {
      children: hasSelected ? `批量删除 (${selectedRowKeys.length})` : '批量删除',
      isDelete: true,
      disabled: !hasSelected,
      message: `确定要删除选中的 ${selectedRowKeys.length} 个项目吗？`,
      onClick: () => handleBatchDelete(selectedRowKeys, onBatchDeleteSuccess),
    },
  ];

  return <ButtonGroup list={listArray} />;
};

export default ManageActionButtons;
```

> **关键变化**：
>
> - 页面头部操作统一使用 `ButtonGroup` + listArray，不再使用 `Space` + `Button`
> - 弹窗状态由页面管理，按钮组件只接收回调函数（如 `onAdd`/`onImport`），不内嵌弹窗
> - 批量删除按钮常显，未选中时 `disabled: true`，选中后显示数量
> - 确认型操作（删除等）在 listArray 中用 `message`/`isDelete` 属性

## 二、表单与弹窗分离（使用 antd 原生 Form）

> **目录结构约束**：表单字段必须放 `Form/` 目录，弹窗容器必须放 `Modal/` 目录。Modal 中不得直接内联字段组件，必须从 `Form/` 目录引用。

### 2.1 Form 组件（放 `Form/` 目录，纯字段渲染，接收 form prop）

```tsx
// Form/Form.tsx
import React from 'react';
import { Form, Input, Select } from 'antd';

interface FormProps {
  form: ReturnType<typeof Form.useForm>[0];
  showAddFields?: boolean;
}

const FormFields: React.FC<FormProps> = ({ form, showAddFields }) => {
  const { options: deptOptions } = useDepartments();

  return (
    <Form form={form} layout="vertical">
      {showAddFields && (
        <Form.Item name="username" label="工号" rules={[{ required: true, message: '请输入工号' }]}>
          <Input placeholder="请输入工号" />
        </Form.Item>
      )}
      <Form.Item
        name="displayName"
        label="姓名"
        rules={[{ required: true, message: '请输入姓名' }]}
      >
        <Input placeholder="请输入姓名" />
      </Form.Item>
      <Form.Item
        name="departmentId"
        label="部门"
        rules={[{ required: true, message: '请选择部门' }]}
      >
        <Select placeholder="请选择部门" options={deptOptions} />
      </Form.Item>
    </Form>
  );
};

export default FormFields;
```

### 2.2 Modal 组件（放 `Modal/` 目录，Form.useForm + validateFields + 提交逻辑）

```tsx
// Modal/FormModal.tsx
import React, { useEffect } from 'react';
import { Modal, Form, message } from 'antd';
import FormFields from '@/components/{Domain}/{Module}/Form/Form';
import type { UserInfo } from '@/types';

interface FormModalProps {
  open: boolean;
  editingUser: UserInfo | null;
  onCancel: () => void;
  onSuccess: () => void;
  defaultDeptId?: string;
  showAddFields?: boolean;
}

const FormModal: React.FC<FormModalProps> = ({
  open,
  editingUser,
  onCancel,
  onSuccess,
  defaultDeptId,
  showAddFields,
}) => {
  const [form] = Form.useForm();
  const isEdit = !!editingUser;

  useEffect(() => {
    if (!open) return;
    if (editingUser) {
      form.setFieldsValue({
        /* 初始化编辑值 */
      });
    } else {
      form.resetFields();
      if (defaultDeptId) form.setFieldsValue({ departmentId: defaultDeptId });
    }
  }, [open, editingUser, defaultDeptId, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (isEdit) {
        await api.update(editingUser!.id, values);
        message.success('更新成功');
      } else {
        await api.create(values);
        message.success('创建成功');
      }
      form.resetFields();
      onSuccess();
    } catch {
      /* 校验失败 */
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={isEdit ? '编辑' : '添加'}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      destroyOnClose
      centered
    >
      <FormFields form={form} showAddFields={showAddFields} />
    </Modal>
  );
};

export default FormModal;
```

> **关键模式**：
>
> - Form 组件接收 `form` prop（`ReturnType<typeof Form.useForm>[0]`），内部渲染 `<Form form={form}>` + `Form.Item` 字段
> - Modal 组件通过 `Form.useForm()` 创建表单实例，传给 Form 组件
> - 校验使用 `form.validateFields()`，提交通过 Modal 的 `onOk` + `confirmLoading`
> - 校验规则通过 `Form.Item` 的 `rules` 属性配置（如 `[{ required: true, message: '...' }]`）
> - 取消按钮使用 `Button onClick={onCancel}` 而非 `ResetButton`

## 三、详情展示

```tsx
// Detail/Descriptions.tsx
import React from 'react';
import { CommonDescriptions, type DescriptionItem } from '@/components/Common/Descriptions';
import type { UserInfo } from '@/types';

interface DescriptionsProps {
  user: UserInfo;
  bordered?: boolean;
  column?: number;
  size?: 'small' | 'default';
}

const Descriptions: React.FC<DescriptionsProps> = ({
  user,
  bordered = true,
  column = 2,
  size = 'default',
}) => {
  const basicItems: DescriptionItem[] = [
    { label: '姓名', value: user.displayName },
    { label: '工号', value: user.username },
    { label: '邮箱', value: user.email || '-' },
    { label: '部门', value: user.departmentName || '-' }, // departmentName 应为完整路径，如 技术部/信息部
  ];

  return (
    <>
      <CommonDescriptions content={basicItems} bordered={bordered} column={column} size={size} />
      {/* 条件渲染其他分组 */}
    </>
  );
};

export default Descriptions;
```

### Tooltip 详情展示

```tsx
import { TooltipInfo, type DescriptionItem } from '@/components/Common';
import dayjs from 'dayjs';

const metaItems: DescriptionItem[] = [
  { label: '添加人', value: record.createdByName || '-' },
  { label: '添加时间', value: dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss') },
];

<TooltipInfo hidden={!record.createdAt} content={metaItems}>
  <span>{record.name}</span>
</TooltipInfo>;
```

> **规范**：
>
> - Tooltip 中展示字段详情（如添加人/添加时间、删除人/删除时间）时，统一使用 `TooltipInfo`
> - `content` 使用 `DescriptionItem[]`，组件内部自动调用 `CommonDescriptions` 渲染
> - 简单单行提示（如「评估中，请稍候」）仍可直接使用 antd `Tooltip`

## 四、列表 columns（放 `List/` 目录，操作列引用 Action 组件）

> **核心原则**：操作列不直接内联 ButtonGroup，而是引用 `Action/` 目录下的操作按钮组件（如 `FileActionButtons`），组件内部使用 listArray 对象形式。

```tsx
// List/columns.tsx
import type { ColumnsType } from 'antd/es/table';
import type { FileItem } from '@/types';
import { FileActionButtons } from '../Action';

interface GetColumnsOptions {
  canOperate: (record: FileItem) => boolean;
  onEnterFolder: (folder: FileItem) => void;
  onDetail: (record: FileItem) => void;
  onRename: (record: FileItem) => void;
  onMove: (record: FileItem) => void;
  onReupload: (record: FileItem) => void;
  onRefresh: () => void | Promise<void>;
}

export function getColumns(options: GetColumnsOptions): ColumnsType<FileItem> {
  const { canOperate, onEnterFolder, onDetail, onRename, onMove, onReupload, onRefresh } = options;

  return [
    // ... 数据列
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_: unknown, record: FileItem) => (
        <FileActionButtons
          record={record}
          canOperate={canOperate(record)}
          onDetail={onDetail}
          onRename={onRename}
          onMove={onMove}
          onReupload={onReupload}
          onRefresh={onRefresh}
        />
      ),
    },
  ];
}
```

## 五、页面结构

### 5.0 PageHeaderLayout

页面统一使用 `PageHeaderLayout` 作为容器，说明性文字通过 `description` 传入，禁止在 `children` 内手写提示横幅。

```tsx
<PageHeaderLayout
  title="任务管理"
  actions={<ManageActionButtons onCreate={...} onRefresh={...} />}
  description={
    <>
      管理 AI 质量评估任务。文件提交审核后将自动创建评估任务。
      {hasActiveTasks && ' 检测到进行中的任务，列表将自动刷新。'}
    </>
  }
>
  <FilterBar ... />
  <Table ... />
</PageHeaderLayout>
```

```tsx
// ❌ 禁止：在 children 内手写说明横幅（含 Tailwind utility 或内联样式 div）
<PageHeaderLayout title="任务管理">
  <div>页面说明</div>
  <Table ... />
</PageHeaderLayout>

// ✅ 正确：使用 description prop
<PageHeaderLayout title="任务管理" description="页面说明">
  <Table ... />
</PageHeaderLayout>
```

> `description` 支持 `React.ReactNode`，样式由 `PageHeaderLayout` 内部 `style.module.scss` 统一（使用 `var(--info-color-bg)` 等 CSS 变量）。

### 5.1 管理页（Manage）

```tsx
// pages/{Domain}/{Module}/Manage/index.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, Table } from 'antd';
import type { FileItem } from '@/types';
import { UserRole } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { fileApi } from '@/api';
import { PageHeaderLayout } from '@/components/Common/Layout';
import {
  getColumns, FileFilterBar, type BreadcrumbItem,
  CreateFolderModal, RenameModal, MoveModal, UploadModal, ReuploadModal,
  FileManagerActions,
} from '@/components/Files';

const Manage: React.FC = () => {
  const { user, hasAnyRole } = useAuthStore();
  const [list, setList] = useState<FileItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 弹窗状态
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<FileItem | null>(null);
  const [moveOpen, setMoveOpen] = useState(false);
  const [moveTarget, setMoveTarget] = useState<FileItem | null>(null);
  const [reuploadTarget, setReuploadTarget] = useState<FileItem | null>(null);

  // 权限
  const canOperate = (record: FileItem) => { /* ... */ };

  // 数据获取
  const fetchData = useCallback(async () => { /* ... */ }, [page]);
  useEffect(() => { fetchData(); }, [fetchData]);

  // columns
  const columns = useMemo(() => getColumns({
    canOperate,
    onEnterFolder: handleEnterFolder,
    onDetail: handleDetail,
    onRename: (record) => { setRenameTarget(record); setRenameOpen(true); },
    onMove: (record) => { setMoveTarget(record); setMoveOpen(true); },
    onReupload: setReuploadTarget,
    onRefresh: fetchData,
  }), [fetchData]);

  return (
    <PageHeaderLayout
      title="XXX管理"
      actions={
        <FileManagerActions
          hasAnyRole={hasAnyRole}
          selectedRowKeys={selectedRowKeys}
          onUpload={() => setUploadModalOpen(true)}
          onCreateFolder={() => setCreateFolderOpen(true)}
          onBatchDeleteSuccess={() => { setSelectedRowKeys([]); fetchData(); }}
        />
      }
    >
      <Card>
        <Table rowKey="id" columns={columns} dataSource={list} loading={loading} ... />
      </Card>

      {/* 弹窗 — 状态由页面管理 */}
      <UploadModal open={uploadModalOpen} onCancel={() => setUploadModalOpen(false)} onSuccess={() => { setUploadModalOpen(false); fetchData(); }} />
      <CreateFolderModal open={createFolderOpen} onOk={handleCreateFolder} onCancel={() => setCreateFolderOpen(false)} />
      <RenameModal open={renameOpen} onOk={handleRenameSubmit} onCancel={() => { setRenameOpen(false); setRenameTarget(null); }} defaultName={renameTarget?.name} />
      <MoveModal open={moveOpen} onOk={handleMoveSubmit} onCancel={() => { setMoveOpen(false); setMoveTarget(null); }} target={moveTarget} />
      <ReuploadModal open={!!reuploadTarget} record={reuploadTarget} onCancel={() => setReuploadTarget(null)} onSuccess={() => { setReuploadTarget(null); fetchData(); }} />
    </PageHeaderLayout>
  );
};

export default Manage;
```

> **关键变化**：
>
> - 页面头部操作统一使用 `ButtonGroup`（通过 `FileManagerActions` 组件），不再使用 `Space` + `Button`
> - 弹窗状态由页面管理，ActionButtons 只接收回调函数，不内嵌弹窗
> - 批量删除常显，未选中时 disabled

### 5.2 详情页（Detail）

```tsx
// pages/{Domain}/{Module}/Detail/index.tsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { UserInfo } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { userApi } from '@/api';
import {
  Descriptions,
  ActionButtons,
  FormModal,
  StatusChangeModal,
} from '@/components/{Domain}/{Module}';
import { hasPermission } from '@/components/Common/Auth';
import { PageHeaderLayout } from '@/components/Common/Layout';

const Detail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuthStore();
  const [data, setData] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const canEdit = hasPermission(currentUser, 'user:edit');
  const canStatus = hasPermission(currentUser, 'user:status');
  const canDelete = hasPermission(currentUser, 'user:delete');

  // 弹窗状态 — 由页面管理
  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const fetchData = useCallback(async () => {
    /* ... */
  }, [id]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className={classNames('file-detail-loading', styles['file-detail-loading'])}>
        加载中...
      </div>
    );
  }
  if (!data) {
    return (
      <div className={classNames('file-detail-empty', styles['file-detail-empty'])}>
        数据不存在
      </div>
    );
  }

  return (
    <PageHeaderLayout
      title="XXX详情"
      onBack={() => navigate(-1)}
      actions={
        <ActionButtons
          user={data}
          canEdit={canEdit}
          canStatus={canStatus}
          canDelete={canDelete}
          onEdit={() => setEditOpen(true)}
          onStatusChange={() => setStatusOpen(true)}
          onActionComplete={fetchData}
        />
      }
    >
      <Descriptions user={data} />

      {/* 弹窗 — 状态由页面管理 */}
      <FormModal
        open={editOpen}
        editingUser={data}
        onCancel={() => setEditOpen(false)}
        onSuccess={() => {
          setEditOpen(false);
          fetchData();
        }}
      />
      <StatusChangeModal
        open={statusOpen}
        user={data}
        onCancel={() => setStatusOpen(false)}
        onSuccess={() => {
          setStatusOpen(false);
          fetchData();
        }}
      />
    </PageHeaderLayout>
  );
};

export default Detail;
```

> **关键变化**：
>
> - 详情页操作统一使用 `ButtonGroup`（通过 `ActionButtons` 组件），不再使用 `Space` + 多个独立按钮
> - `ActionButtons` 接收回调函数（`onEdit`/`onStatusChange`），不内嵌弹窗
> - 弹窗状态由页面管理，页面直接渲染 Modal 组件

## 六、工具函数与常量规范

### 6.0 API 目录规范

> **核心原则**：`src/api/` 按功能模块拆分为独立文件，`index.ts` 仅做 barrel re-export。禁止在 `index.ts` 中直接定义 API 对象。

**目录结构**：

```
src/api/
├── index.ts        # barrel 文件，统一 re-export
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

**模块文件示例**：

```ts
// src/api/file.ts
import request from '@/utils/request';
import type { PaginatedResponse, FileItem } from '@/types';

export const fileApi = {
  list: (params?: Record<string, unknown>) =>
    request.get<{ code: number; data: PaginatedResponse<FileItem> }>('/files', { params }),
  get: (id: string) => request.get<{ code: number; data: FileItem }>(`/files/${id}`),
  delete: (id: string) => request.delete(`/files/${id}`),
  // ...
};
```

**barrel 文件**：

```ts
// src/api/index.ts — 仅 re-export，禁止直接定义
export { authApi } from './auth';
export { userApi } from './user';
export { fileApi } from './file';
// ...
```

**新增 API 模块流程**：

1. 创建 `src/api/{module}.ts`，导出 `{module}Api` 对象
2. 在 `src/api/index.ts` 中追加 `export { xxxApi } from './xxx'`
3. 使用时统一 `import { xxxApi } from '@/api'`

### 6.1 放置规则

- **模块内使用** → 放在 `src/components/{Domain}/{Module}/utils/` 或 `constants/`
- **跨模块共享** → 放在 `src/utils/{Module}/` 或 `src/constants/{Module}/`

### 6.2 模块级 utils/constants 示例

```ts
// src/components/System/Users/utils/validation.ts
export function validateUsername(value: string): boolean {
  return /^[a-zA-Z0-9_]{4,20}$/.test(value);
}

export function formatUserName(name: string): string {
  return name.trim().toLowerCase();
}

// src/components/System/Users/utils/index.ts
export { validateUsername, formatUserName } from './validation';
```

```ts
// src/components/System/Users/constants/types.ts
export type UserStatus = 'active' | 'inactive' | 'locked';

// src/components/System/Users/constants/status.ts
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  LOCKED: 'locked',
} as const;

export const USER_STATUS_LABELS: Record<string, string> = {
  [USER_STATUS.ACTIVE]: '启用',
  [USER_STATUS.INACTIVE]: '停用',
  [USER_STATUS.LOCKED]: '锁定',
};

// src/components/System/Users/constants/index.ts
export type { UserStatus } from './types';
export { USER_STATUS, USER_STATUS_LABELS } from './status';
```

**constants 拆分原则**：

- **types.ts**：集中放置类型定义（如 `type UserStatus`、`type ReviewMode`）
- **{feature}.ts**：按功能类别拆分常量（如 `status.ts`、`mode.ts`、`columns.ts`）
- **index.ts**：barrel export，统一重新导出所有类型和常量
- 外部引用统一通过 `../constants` 或 `./constants` 路径访问，无需关心内部拆分

### 6.3 项目级 utils/constants 示例

```ts
// src/utils/Users/format.ts
export function formatUserDisplayName(user: UserInfo): string {
  return `${user.departmentName} - ${user.displayName}`;
}

// src/utils/Users/index.ts
export { formatUserDisplayName } from './format';
```

```ts
// src/constants/Users/types.ts
export type UserStatus = 'active' | 'inactive' | 'locked';

// src/constants/Users/status.ts
export const USER_STATUS = { ... } as const;

// src/constants/Users/index.ts
export type { UserStatus } from './types';
export { USER_STATUS } from './status';
```

### 6.4 在模块 index.ts 中导出 hooks/utils/constants

```ts
// {Module}/index.ts — 如果模块级 hooks/utils/constants 需要对外暴露
export { useFileManager } from './hooks';
export { validateUsername, formatUserName } from './utils';
export { USER_STATUS, USER_STATUS_LABELS } from './constants';
// ... 其他导出
```

## 六点五、自定义 Hook 模式（放 `hooks/` 目录）

> **核心原则**：页面组件中的状态管理和业务逻辑应抽到 `hooks/use{Feature}.ts`，页面仅做 hook 解构 + 渲染。hooks 与 utils 的区别：hooks 使用 React 状态（useState/useCallback 等），utils 是纯函数。

```ts
// hooks/useFileManager.ts
import { useState, useEffect, useCallback } from 'react';
import type { FileItem } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { fileApi } from '@/api';
import {
  canOperate as checkCanOperate,
  handleCreateFolder,
  handleRenameSubmit,
  handleMoveSubmit,
} from '../Action/handlers';

/** 文件管理页面状态与逻辑 hook */
export function useFileManager() {
  const { user, hasAnyRole } = useAuthStore();

  // ── 状态声明 ──
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FileItem[]>([]);
  const [total, setTotal] = useState(0);
  // ... 其他状态

  // ── 数据获取 ──
  const fetchData = useCallback(
    async () => {
      setLoading(true);
      try {
        const res = await fileApi.list(params);
        setData(res.data.list);
        setTotal(res.data.total);
      } finally {
        setLoading(false);
      }
    },
    [
      /* deps */
    ],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── 业务逻辑 ──
  const onCreateFolder = useCallback(
    async (name: string) => {
      await handleCreateFolder(name, currentParentId, user?.departmentId, () => {
        setCreateFolderOpen(false);
        fetchData();
      });
    },
    [currentParentId, user?.departmentId, fetchData],
  );

  return {
    // 导航
    breadcrumbItems,
    handleEnterFolder,
    handleBreadcrumbClick,
    // 权限
    canOperate,
    hasAnyRole,
    // 表格
    loading,
    data,
    total,
    page,
    pageSize,
    fetchData,
    onPageChange,
    // 弹窗
    createFolderOpen,
    setCreateFolderOpen,
    onCreateFolder,
    renameOpen,
    setRenameOpen,
    renameTarget,
    setRenameTarget,
    onRenameSubmit,
    handleRename,
    moveOpen,
    setMoveOpen,
    moveTarget,
    setMoveTarget,
    onMoveSubmit,
    handleMove,
    // ... 其他
  };
}
```

```ts
// hooks/index.ts
export { useFileManager } from './useFileManager';
```

**使用方式（页面组件）**：

```tsx
// pages/Files/Manage/index.tsx
import { useFileManager } from '@/components/Files';

const FileManager: React.FC = () => {
  const {
    loading, data, total, fetchData,
    renameOpen, setRenameOpen, renameTarget, setRenameTarget,
    // ... 其他
  } = useFileManager();

  return (
    <PageHeaderLayout title="文件管理" actions={<FileManagerActions ... />}>
      <Table loading={loading} dataSource={data} ... />
      <RenameModal open={renameOpen} onCancel={() => { setRenameOpen(false); setRenameTarget(null); }} ... />
    </PageHeaderLayout>
  );
};
```

**hooks 与 utils 的区别**：

- `hooks/`：包含 React 状态（useState/useEffect/useCallback），封装页面逻辑
- `utils/`：纯函数，无 React 依赖（如格式化、验证、转换）

## 七、Barrel Export 规范

### 7.0 导出模式总览

项目中有以下几种 barrel export 模式：

| 模式                       | 适用场景                          | 示例                                                       |
| -------------------------- | --------------------------------- | ---------------------------------------------------------- |
| `export { default as X }`  | 叶子目录 index.ts（最主流）       | `export { default as DeleteButton } from './DeleteButton'` |
| `export * as xxxHandlers`  | handlers 命名空间导出             | `export * as fileHandlers from './handlers'`               |
| `export { getColumns }`    | columns 命名导出                  | `export { getColumns } from './columns'`                   |
| `export type { XxxProps }` | 类型单独导出                      | `export type { DeleteButtonProps } from './DeleteButton'`  |
| 模块顶层 re-export         | 从子目录 barrel 展平导出          | `export { DeleteButton } from './Action'`                  |
| Common 顶层                | 统一 re-export 所有 Common 子组件 | `export { SemanticTag } from './Tag'`                      |

**重要规则**：

- 组件文件内部使用 `export default`
- barrel 文件统一转换为命名导出，消费者按名引用
- `examples/` 目录无 barrel 文件，不被外部引用
- 类型与值分开导出，使用 `export type { ... }` 语法

### 7.1 子目录 index.ts

```ts
// Action/index.ts
export { default as ActionButtons } from './ActionButtons';
export { default as ManageActionButtons } from './ManageActionButtons';
export { default as EditButton } from './EditButton';
export { default as DeleteButton, confirmDeleteRole } from './DeleteButton';
export * as fileHandlers from './handlers';
```

### 7.2 模块级 index.ts

```ts
// {Module}/index.ts
export { FormModal, StatusChangeModal } from './Modal';
export { default as FormFields, StatusChangeForm } from './Form';
export { default as Descriptions } from './Detail';
export { ActionButtons, ManageActionButtons, EditButton, ... } from './Action';
export { ImportModal } from './Import';
export { getColumns, FilterBar, Link } from './List';
```

### 7.3 Common/index.ts

```ts
export { PermissionGuard, ProtectedRoute } from './Auth';
export { MemberStatusTag, RoleTag, ReviewStatusTag } from './Tag';
export { DepartmentSelect } from './Form';
export { CommonDescriptions } from './Descriptions';
export type { DescriptionItem, CommonDescriptionsProps } from './Descriptions';
export { TooltipInfo } from './TooltipInfo';
export type { TooltipInfoProps } from './TooltipInfo';
```

## 八、antd 组件重构模板

当 antd 组件满足重构条件时，按以下模板提取为 Common 组件：

```tsx
// src/components/Common/{Category}/Common{Component}.tsx
import React from 'react';
import { Component } from 'antd';

// 1. 定义精简的 Props 接口（隐藏 antd 内部实现细节）
export interface Common{Component}Props {
  // 业务语义化的 prop，而非直接暴露 antd prop
}

// 2. 组件实现：内部处理 antd 的默认值和统一配置
const Common{Component}: React.FC<Common{Component}Props> = (props) => {
  return <Component {...默认配置} {...props} />;
};

export default Common{Component};
```

```ts
// src/components/Common/{Category}/index.ts
export { default as Common{Component} } from './Common{Component}';
export type { Common{Component}Props } from './Common{Component}';
```

## 九、SemanticTag 与语义化颜色规范

> **核心原则**：所有 Tag 展示统一使用 `SemanticTag` 组件，颜色统一使用 `SEMANTIC_COLORS` 常量，禁止直接使用 antd `Tag` 并硬编码颜色字符串。

### 9.1 SEMANTIC_COLORS 语义化颜色常量

```ts
import { SEMANTIC_COLORS } from '@/components/Common/Tag/SemanticTag';

// 颜色对照表
SEMANTIC_COLORS.DEFAULT; // 'default'  — 默认/中性（已关闭、已撤销、已归档）
SEMANTIC_COLORS.INFO; // 'blue'     — 信息/提示（可计分结案、功能建议）
SEMANTIC_COLORS.PROCESSING; // 'processing' — 进行中/处理中（正在审核、处理中）
SEMANTIC_COLORS.SUCCESS; // 'green'    — 成功/已完成/已通过（审核通过、已处理、在职）
SEMANTIC_COLORS.WARNING; // 'orange'   — 警告/待处理（待主管审核、休假中、待处理）
SEMANTIC_COLORS.DANGER; // 'red'      — 危险/紧急/已驳回（已驳回、高优先级、问题反馈）
SEMANTIC_COLORS.SPECIAL; // 'purple'   — 特殊/待复查（待审核复查、指定负责人）
SEMANTIC_COLORS.VOLCANO; // 'volcano'  — 火山/待领导审批（待分管领导审批）
SEMANTIC_COLORS.CYAN; // 'cyan'     — 青色/辅助（修改优先级）
SEMANTIC_COLORS.GOLD; // 'gold'     — 金色/重要
SEMANTIC_COLORS.LIME; // 'lime'     — 石灰/低优先级
```

### 9.2 SemanticTag 使用方式

```tsx
import { SemanticTag, SEMANTIC_COLORS } from '@/components/Common';

// ✅ 正确：使用 SemanticTag + SEMANTIC_COLORS
<SemanticTag color={SEMANTIC_COLORS.SUCCESS}>已通过</SemanticTag>
<SemanticTag color={SEMANTIC_COLORS.DANGER}>紧急</SemanticTag>
<SemanticTag>默认</SemanticTag>  {/* color 默认为 SEMANTIC_COLORS.DEFAULT */}

// ❌ 禁止：直接使用 antd Tag 硬编码颜色
<Tag color="green">已通过</Tag>
<Tag color="red">紧急</Tag>
```

### 9.3 状态映射常量中使用 SEMANTIC_COLORS

```ts
// ✅ 正确：状态映射中的颜色使用 SEMANTIC_COLORS
import { SEMANTIC_COLORS } from '@/components/Common/Tag/SemanticTag';

export const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待处理', color: SEMANTIC_COLORS.WARNING },
  PROCESSING: { label: '处理中', color: SEMANTIC_COLORS.PROCESSING },
  APPROVED: { label: '已通过', color: SEMANTIC_COLORS.SUCCESS },
  REJECTED: { label: '已驳回', color: SEMANTIC_COLORS.DANGER },
};

// ❌ 禁止：硬编码颜色字符串
export const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待处理', color: 'orange' },
  PROCESSING: { label: '处理中', color: 'blue' },
  APPROVED: { label: '已通过', color: 'green' },
  REJECTED: { label: '已驳回', color: 'red' },
};
```

### 9.4 列表 columns 中使用 SemanticTag

```tsx
// ✅ 正确
import { SemanticTag } from '@/components/Common';
import { STATUS_MAP } from '../constants';

{
  title: '状态',
  dataIndex: 'status',
  render: (v: string) => {
    const map = STATUS_MAP[v];
    return map ? <SemanticTag color={map.color}>{map.label}</SemanticTag> : '-';
  },
}

// ❌ 禁止
import { Tag } from 'antd';
{ title: '状态', render: (v) => <Tag color="green">{v}</Tag> }
```

### 9.5 专用状态 Tag 组件（MemberStatusTag / RoleTag / ReviewStatusTag）

> 对于已有专用状态 Tag 的场景，继续使用专用组件。新建状态 Tag 应基于 `SemanticTag` 封装。

```tsx
// 已有专用 Tag → 继续使用
import { MemberStatusTag, RoleTag, ReviewStatusTag } from '@/components/Common';
<MemberStatusTag status="ACTIVE" />
<RoleTag role="SYSTEM_ADMIN" />
<ReviewStatusTag status="APPROVED" />

// 新建状态 Tag → 基于 SemanticTag 封装
// src/components/Common/Tag/StatusTag.tsx
import SemanticTag from './SemanticTag';
export const FeedbackStatusTag: React.FC<{ status: string }> = ({ status }) => {
  const map = FEEDBACK_STATUS_MAP[status];
  return map ? <SemanticTag color={map.color}>{map.label}</SemanticTag> : <SemanticTag>{status}</SemanticTag>;
};
```

### 9.6 语义化颜色选择指南

| 语义　　　 | 常量　　　　  | antd 值　　　　 | 适用场景　　　　　　　　　　　　　　 |
| ---------- | ------------- | --------------- | ------------------------------------ |
| 中性/默认  | `DEFAULT`　　 | `'default'`　　 | 已关闭、已撤销、已归档、低优先级　　 |
| 信息/提示  | `INFO`　　　  | `'blue'`　　　  | 可计分结案、功能建议、信息展示　　　 |
| 进行中　　 | `PROCESSING`  | `'processing'`  | 正在审核、处理中、流程进行中　　　　 |
| 成功/完成  | `SUCCESS`　　 | `'green'`　　　 | 已通过、已处理、在职、操作成功　　　 |
| 警告/待办  | `WARNING`　　 | `'orange'`　　  | 待主管审核、待处理、休假中、中优先级 |
| 危险/紧急  | `DANGER`　　  | `'red'`　　　　 | 已驳回、高优先级、问题反馈、错误　　 |
| 特殊/复查  | `SPECIAL`　　 | `'purple'`　　  | 待复查、指定负责人、转交　　　　　　 |
| 领导审批　 | `VOLCANO`　　 | `'volcano'`　　 | 待分管领导审批　　　　　　　　　　　 |
| 辅助/变更  | `CYAN`　　　  | `'cyan'`　　　  | 修改优先级、辅助信息　　　　　　　　 |
| 重要/关注  | `GOLD`　　　  | `'gold'`　　　  | 重要标记、关注项　　　　　　　　　　 |

