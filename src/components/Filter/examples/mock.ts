import type { FilterOption, SelectedItem } from '@/components';

/** 状态选项 */
export const STATUS_OPTIONS: FilterOption[] = [
  { label: '待提交', value: 'pending' },
  { label: '审核中', value: 'reviewing' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' },
];

/** 部门选项 */
export const DEPT_OPTIONS: FilterOption[] = [
  { label: '技术部', value: 'tech' },
  { label: '产品部', value: 'product' },
  { label: '设计部', value: 'design' },
  { label: '运营部', value: 'ops' },
  { label: '市场部', value: 'market' },
  { label: '财务部', value: 'finance' },
];

/** 单选示例选项 */
export const SINGLE_SELECT_OPTIONS: FilterOption[] = [
  { label: '选项一', value: 'a' },
  { label: '选项二', value: 'b' },
  { label: '选项三', value: 'c' },
  { label: '选项四', value: 'd' },
];

/** 可搜索示例选项 */
export const SEARCHABLE_OPTIONS: FilterOption[] = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橙子', value: 'orange' },
  { label: '葡萄', value: 'grape' },
  { label: '西瓜', value: 'watermelon' },
];

/** 构建已选条件列表的工具函数 */
export function buildSelectedItems(
  filters: Record<string, { label: string; valueLabel: string; onRemove: () => void } | null>,
): SelectedItem[] {
  return Object.values(filters).filter(Boolean) as SelectedItem[];
}
