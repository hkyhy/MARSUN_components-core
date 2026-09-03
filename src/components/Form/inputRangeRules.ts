import type { InputRangeValue } from './InputRange';

export type KneRuleResult = { result: boolean; errMsg: string };

/**
 * Form `rules` 注册名：两端均有值时要求右端 ≥ 左端。
 * 用法：`formProps.rules={{ ...inputRangeRules }}` + 字段 `rule="RANGE_ASC"`（可与 REQ 组合）。
 */
export const RANGE_ASC_RULE_NAME = 'RANGE_ASC';

/** 校验 InputRange 值：空 / 单侧可过；双侧时 max >= min */
export function validateRangeAsc(value: unknown): KneRuleResult {
  if (value == null || value === '') {
    return { result: true, errMsg: '' };
  }
  if (!Array.isArray(value) || value.length < 2) {
    return { result: false, errMsg: '%s须为区间 [下限, 上限]' };
  }
  const pair = value as NonNullable<InputRangeValue>;
  const rawMin = pair[0];
  const rawMax = pair[1];
  if (rawMin == null && rawMax == null) {
    return { result: true, errMsg: '' };
  }
  if (rawMin == null || rawMax == null) {
    return { result: true, errMsg: '' };
  }
  const min = typeof rawMin === 'number' ? rawMin : Number(rawMin);
  const max = typeof rawMax === 'number' ? rawMax : Number(rawMax);
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { result: false, errMsg: '%s须为数字' };
  }
  if (max < min) {
    return { result: false, errMsg: '%s上限不可小于下限' };
  }
  return { result: true, errMsg: '' };
}

/** 供 Form / FormModal `rules` 直接展开 */
export const inputRangeRules = {
  [RANGE_ASC_RULE_NAME]: validateRangeAsc,
} as const;
