/** kne SuperSelect / plus 常用项：`{ label, value }`（及扩展字段） */
export type KneSelectItem = {
  label?: string;
  value?: string | number;
  [key: string]: unknown;
};

export type MarsunSelectValue = string | number | (string | number)[] | undefined;

function itemValue(item: KneSelectItem | null | undefined): string | number | undefined {
  if (item == null) return undefined;
  if (item.value !== undefined && item.value !== null && item.value !== '') return item.value;
  return undefined;
}

function itemLabel(item: KneSelectItem | null | undefined): string {
  if (item == null) return '';
  if (typeof item.label === 'string' && item.label) return item.label;
  const v = itemValue(item);
  return v == null ? '' : String(v);
}

/** kne onChange 结果 → Marsun 标量 / 数组 */
export function kneToMarsun(
  kne: KneSelectItem | KneSelectItem[] | null | undefined,
  single?: boolean,
): MarsunSelectValue {
  if (kne == null) return undefined;
  if (single || (!Array.isArray(kne) && typeof kne === 'object')) {
    const one = Array.isArray(kne) ? kne[0] : kne;
    return itemValue(one);
  }
  if (!Array.isArray(kne)) {
    const v = itemValue(kne);
    return v == null ? undefined : [v];
  }
  return kne.map(itemValue).filter((v): v is string | number => v !== undefined);
}

/** Marsun 值 → kne 控件 value（缺 label 时用 String(value)；可用 labelMap 补全） */
export function marsunToKne(
  value: MarsunSelectValue,
  options?: {
    single?: boolean;
    labelMap?: Record<string, string>;
    /** 完整 kne 项缓存（如 city 对象） */
    itemMap?: Record<string, KneSelectItem>;
  },
): KneSelectItem | KneSelectItem[] | null {
  const single = options?.single;
  const labelMap = options?.labelMap ?? {};
  const itemMap = options?.itemMap ?? {};

  const toItem = (v: string | number): KneSelectItem => {
    const key = String(v);
    if (itemMap[key])
      return { ...itemMap[key], value: v, label: itemMap[key].label ?? labelMap[key] ?? key };
    return { value: v, label: labelMap[key] ?? key };
  };

  if (value == null || value === '') return single ? null : [];
  if (Array.isArray(value)) {
    const items = value.map(toItem);
    return single ? (items[0] ?? null) : items;
  }
  return single ? toItem(value) : [toItem(value)];
}

/** 从 kne 草稿生成已选展示文案 */
export function kneValueLabel(
  kne: KneSelectItem | KneSelectItem[] | null | undefined,
  single?: boolean,
): string {
  if (kne == null) return '';
  if (single || (!Array.isArray(kne) && typeof kne === 'object')) {
    const one = Array.isArray(kne) ? kne[0] : kne;
    return itemLabel(one);
  }
  const arr = Array.isArray(kne) ? kne : [kne];
  return arr.map(itemLabel).filter(Boolean).join('、');
}

/** Marsun 值 + labelMap → 已选文案 */
export function marsunValueLabel(
  value: MarsunSelectValue,
  labelMap: Record<string, string> = {},
): string {
  if (value == null || value === '') return '';
  const parts = Array.isArray(value) ? value : [value];
  return parts
    .map((v) => labelMap[String(v)] ?? String(v))
    .filter(Boolean)
    .join('、');
}

/** 合并 kne onChange 项进 labelMap / itemMap */
export function mergeKneLabelMaps(
  kne: KneSelectItem | KneSelectItem[] | null | undefined,
  prev: { labelMap: Record<string, string>; itemMap: Record<string, KneSelectItem> },
): { labelMap: Record<string, string>; itemMap: Record<string, KneSelectItem> } {
  const labelMap = { ...prev.labelMap };
  const itemMap = { ...prev.itemMap };
  const list = kne == null ? [] : Array.isArray(kne) ? kne : [kne];
  for (const item of list) {
    const v = itemValue(item);
    if (v === undefined) continue;
    const key = String(v);
    labelMap[key] = itemLabel(item) || key;
    itemMap[key] = { ...item, value: v, label: labelMap[key] };
  }
  return { labelMap, itemMap };
}
