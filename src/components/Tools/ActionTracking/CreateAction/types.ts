import type { ReactNode } from 'react';

/** 新建 / 下发预填（App 注入） */
export type CreateActionPrefill = {
  factory?: string;
  variety?: string;
  metric?: string;
  title?: string;
  dimension?: string;
  bizDate?: string;
  factoryCode?: string;
};

/** 分厂/品种/指标只读锁定 */
export type CreateActionScopeLock = {
  factory?: string;
  variety?: string;
  metric?: string;
};

/** 分域只读上下文（分厂名/机台/指标展示名等）；有则不再出品种/关联指标 */
export type LockedContextField = {
  label: string;
  value: string;
};

/** 角色→用户两级级联节点 */
export type ActionPersonCascadeOption = {
  value: string;
  label: ReactNode;
  children?: ActionPersonCascadeOption[];
};

/** 扁平人员选项（提交时解析展示名） */
export type ActionPersonOption = {
  value: string;
  displayName?: string;
  label?: ReactNode;
};

export type CreateActionPersonCatalog = {
  cascadeOptions: ActionPersonCascadeOption[];
  options: ActionPersonOption[];
};

export type CreateActionSelectOption = {
  value: string;
  label: string;
};

export type CreateActionDimensionOption = {
  value: string;
  label: string;
};

/** 品种等远程分页下拉：对齐 kne SuperSelect.api loader 返回面 */
export type CreateActionSelectPageQuery = {
  keyword?: string;
  currentPage: number;
  pageSize: number;
  /**
   * 当前选中的分厂（code/value）。
   * App 应按分厂筛品种；未选时宜返回空页。
   */
  factory?: string;
};

export type CreateActionSelectPageResult = {
  pageData: CreateActionSelectOption[];
  totalCount: number;
};

/**
 * 建单数据加载器（App 注入；core 禁直连业务 API / DEMO）。
 * loadFactoryOptions / loadVarietyPage 在 lockedContext 模式下可不传。
 */
export type CreateActionLoaders = {
  loadAssigneeCatalog: () => Promise<CreateActionPersonCatalog>;
  loadAllocatorCatalog: () => Promise<CreateActionPersonCatalog>;
  loadFactoryOptions?: () => Promise<CreateActionSelectOption[]>;
  /**
   * 品种（或 App 自定义 label）分页下拉。
   * 有则 FormInfo SuperSelect + api/滚动分页；禁 FE 平行码表。
   */
  loadVarietyPage?: (query: CreateActionSelectPageQuery) => Promise<CreateActionSelectPageResult>;
  /** 分配人默认 userId（如 localStorage 上次） */
  pickDefaultAllocatorUserId?: (options: ActionPersonOption[]) => string;
};

/**
 * Modal 提交契约（对齐 EAM CreateActionModal 字段面；
 * actor / analysisId / eventSource / API 由 App onSubmit 补齐）。
 */
export type CreateActionSubmitPayload = {
  title: string;
  dimension: string;
  status: string;
  assignee: string;
  assigneeUserId: string;
  allocator: string;
  allocatorUserId: string;
  owner: string;
  dueDate?: string;
  factory: string;
  variety: string;
  metric: string;
  factoryCode?: string;
  factoryName?: string;
  verifyMetric?: string;
  eventLabel: string;
};

export type CreateActionPersonValidateError =
  'missing_allocator' | 'invalid_allocator' | 'missing_assignee' | 'invalid_assignee';

export type CreateActionPersonValidateResult =
  | { ok: true; allocator: ActionPersonOption; assignee: ActionPersonOption }
  | { ok: false; code: CreateActionPersonValidateError };
