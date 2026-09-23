/**
 * ActionTracking showcase 共享 fixture（内存，形状对齐 Create/List/Follow 注入面）。
 * 仅供 demos / 单测；业务 App 禁止当运行时 mock。
 */
import type {
  ActionPersonCascadeOption,
  ActionPersonOption,
  CreateActionDimensionOption,
  CreateActionPersonCatalog,
  CreateActionSelectOption,
} from '../CreateAction/types';
import type { ActionListRowBase } from '../List/listTypes';
import { defaultCreatedRange } from '../List/filterDefaults';

/** 展示名取自 label；value 为业务码（App 注入，禁 FE 平行中文表） */
export const ACTION_DIMENSIONS: CreateActionDimensionOption[] = [
  { value: 'process', label: '过程' },
  { value: 'result', label: '结果' },
];

export const ACTION_STATUS_OPTIONS: CreateActionSelectOption[] = [
  { value: 'approved', label: '待执行' },
  { value: 'in_progress', label: '执行中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
];

export const ACTION_FACTORIES: CreateActionSelectOption[] = [
  { value: 'F5', label: '五分厂' },
  { value: 'F1', label: '一分厂' },
];

const ROLE_OPS: ActionPersonCascadeOption = {
  value: 'ROLE_OPS',
  label: '设备运营',
  children: [
    { value: 'u-ops-1', label: '张三' },
    { value: 'u-ops-2', label: '李四' },
  ],
};

const ROLE_ADMIN: ActionPersonCascadeOption = {
  value: 'ROLE_ADMIN',
  label: '设备管理',
  children: [
    { value: 'u-adm-1', label: '王五' },
    { value: 'u-adm-2', label: '赵六' },
  ],
};

function flattenCascade(nodes: ActionPersonCascadeOption[]): ActionPersonOption[] {
  const out: ActionPersonOption[] = [];
  for (const n of nodes) {
    if (n.children?.length) {
      for (const c of n.children) {
        out.push({ value: String(c.value), displayName: String(c.label) });
      }
    }
  }
  return out;
}

export function fixtureAssigneeCatalog(): CreateActionPersonCatalog {
  return {
    cascadeOptions: [ROLE_OPS],
    options: flattenCascade([ROLE_OPS]),
  };
}

export function fixtureAllocatorCatalog(): CreateActionPersonCatalog {
  return {
    cascadeOptions: [ROLE_ADMIN],
    options: flattenCascade([ROLE_ADMIN]),
  };
}

export const ACTION_LIST_SEED: ActionListRowBase[] = [
  {
    id: 'act-1',
    title: '五分厂用能缺口排查',
    status: 'approved',
    dimension: 'process',
    assignee: '张三',
    owner: '王五',
    factoryName: '五分厂',
    machineName: 'A01',
    metricName: 'EI',
    createdAt: `${defaultCreatedRange().from}T09:00:00Z`,
  },
  {
    id: 'act-2',
    title: '保养超期跟进',
    status: 'in_progress',
    dimension: 'result',
    assignee: '李四',
    owner: '赵六',
    factoryName: '一分厂',
    machineName: 'B12',
    metricName: 'MTTR',
    createdAt: `${defaultCreatedRange().from}T11:30:00Z`,
    startedAt: `${defaultCreatedRange().from}T12:00:00Z`,
  },
  {
    id: 'act-3',
    title: '已取消示例',
    status: 'cancelled',
    dimension: 'process',
    assignee: '张三',
    owner: '王五',
    factoryName: '五分厂',
    cancelReason: '误建单',
    createdAt: `${defaultCreatedRange().from}T08:00:00Z`,
  },
];

/** 含脚本的可控 HTML：须经 sanitizeActionHtml 再展示 */
export const ACTION_FOLLOW_RAW_HTML =
  '<p>现场已更换滤芯</p><img src=x onerror="alert(1)" /><a href="javascript:alert(1)">坏链</a><a href="https://example.com">安全链</a>';

/** Showcase 品种分页（fixture，≠ 业务 mock） */
export const ACTION_VARIETIES_SEED = [
  { value: 'V-CV30', label: 'CV30 精梳' },
  { value: 'V-JC40', label: 'JC40 普梳' },
  { value: 'V-T65', label: 'T65/35' },
  { value: 'V-C32', label: 'C32' },
  { value: 'V-R40', label: 'R40' },
];

export function createActionLoadersFromFixture() {
  return {
    loadAssigneeCatalog: async () => fixtureAssigneeCatalog(),
    loadAllocatorCatalog: async () => fixtureAllocatorCatalog(),
    loadFactoryOptions: async () => ACTION_FACTORIES,
    loadVarietyPage: async ({
      keyword,
      currentPage,
      pageSize,
    }: {
      keyword?: string;
      currentPage: number;
      pageSize: number;
    }) => {
      const kw = String(keyword || '')
        .trim()
        .toLowerCase();
      const filtered = ACTION_VARIETIES_SEED.filter(
        (o) => !kw || o.label.toLowerCase().includes(kw) || o.value.toLowerCase().includes(kw),
      );
      const start = Math.max(0, (currentPage - 1) * pageSize);
      return {
        pageData: filtered.slice(start, start + pageSize),
        totalCount: filtered.length,
      };
    },
    pickDefaultAllocatorUserId: (options: ActionPersonOption[]) => options[0]?.value || '',
  };
}

export function statusLabel(code?: string): string {
  return ACTION_STATUS_OPTIONS.find((o) => o.value === code)?.label || code || '—';
}

export function dimensionLabel(code?: string): string {
  return ACTION_DIMENSIONS.find((o) => o.value === code)?.label || code || '—';
}
