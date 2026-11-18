/**
 * ActionTracking showcase 共享 fixture（内存，形状对齐 List 注入面）。
 * 仅供 demos / 单测；业务 App 禁止当运行时 mock。
 */
import type { ActionListRowBase } from '../List/listTypes';

export const ACTION_DIMENSIONS = [
  { value: 'process', label: '过程' },
  { value: 'result', label: '结果' },
];

export const ACTION_STATUS_OPTIONS = [
  { value: 'approved', label: '待执行' },
  { value: 'in_progress', label: '执行中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
];

export const ACTION_LIST_SEED: ActionListRowBase[] = [
  {
    id: 'act-1',
    title: '五分厂用能缺口排查',
    status: 'approved',
    dimension: 'process',
    assignee: '张三',
    owner: '王五',
    factoryName: '五分厂',
    metricName: 'EI',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'act-2',
    title: '一分厂保养超期跟进',
    status: 'in_progress',
    dimension: 'result',
    assignee: '李四',
    owner: '赵六',
    factoryName: '一分厂',
    metricName: '周期',
    createdAt: new Date().toISOString(),
  },
];

export function dimensionLabel(code: string): string {
  return ACTION_DIMENSIONS.find((d) => d.value === code)?.label || code;
}

export function statusLabel(code: string): string {
  return ACTION_STATUS_OPTIONS.find((d) => d.value === code)?.label || code;
}
