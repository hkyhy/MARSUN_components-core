/**
 * FormInfo · SuperSelect 字段（对位 kne-union SuperSelectField 精简版）。
 * 经 `hooks.useDecorator` 接入；多选可开 `allowSelectedAll`（值 sentinel 默认 `'all'`）。
 * 对外 form 值为 Marsun 标量/数组（string | string[]），面板内适配 kne `{ label, value }`。
 */
// @ts-nocheck — @kne/super-select 无完整 TS 类型
import KneSuperSelect from '@kne/super-select';
import '@kne/super-select/dist/index.css';
import * as ReactFormAntd from '@kne/react-form-antd';
import classNames from 'classnames';
import type { ComponentType, FC, ReactNode } from 'react';
import { useMemo, useRef } from 'react';
import { withNormalizedLabelTips } from './normalizeLabelTips';
import {
  kneToMarsun,
  marsunToKne,
  mergeKneLabelMaps,
  type KneSelectItem,
  type MarsunSelectValue,
} from '@/components/Filter/kneValueAdapter';
import styles from './SuperSelect.module.scss';

/** 与 @kne/super-select 默认 `selectedAllValue.value` 对齐 */
export const SUPER_SELECT_ALL_VALUE = 'all';

export type SuperSelectOption = {
  value: string | number;
  label: string;
  disabled?: boolean;
  [key: string]: unknown;
};

export type SuperSelectProps = {
  name: string;
  label?: ReactNode;
  labelTips?: ReactNode | ((props: SuperSelectProps) => ReactNode);
  rule?: string;
  disabled?: boolean;
  placeholder?: string;
  options?: SuperSelectOption[];
  /** true = 单选；默认多选 */
  single?: boolean;
  /** 多选时显示全选（form 值变为 `[selectedAllValue.value]`，默认 `'all'`） */
  allowSelectedAll?: boolean;
  /** 覆盖默认 `{ value: 'all', label: '全选' }` */
  selectedAllValue?: { value: string | number; label: string };
  showSearch?: boolean;
  allowClear?: boolean;
  className?: string;
  /** 透传 kne SuperSelect */
  [key: string]: unknown;
};

type FieldRenderProps = {
  value?: MarsunSelectValue;
  onChange?: (v: MarsunSelectValue) => void;
  disabled?: boolean;
  id?: string;
};

type KneHooks = {
  useDecorator: (
    opts: Record<string, unknown>,
  ) => (Comp: ComponentType<FieldRenderProps>) => ReactNode;
};

function isSelectAllMarsun(
  value: MarsunSelectValue,
  allValue: string | number = SUPER_SELECT_ALL_VALUE,
): boolean {
  if (value == null || value === '') return false;
  if (Array.isArray(value)) {
    return value.length === 1 && String(value[0]) === String(allValue);
  }
  return String(value) === String(allValue);
}

/** 业务写路径：是否为全选 sentinel */
export function isSuperSelectAllValue(
  value: unknown,
  allValue: string | number = SUPER_SELECT_ALL_VALUE,
): boolean {
  if (value == null || value === '') return false;
  if (Array.isArray(value)) {
    return value.length === 1 && String(value[0]) === String(allValue);
  }
  return String(value) === String(allValue);
}

const SuperSelectField: FC<
  FieldRenderProps & {
    options?: SuperSelectOption[];
    single?: boolean;
    allowSelectedAll?: boolean;
    selectedAllValue?: { value: string | number; label: string };
    placeholder?: string;
    showSearch?: boolean;
    allowClear?: boolean;
    className?: string;
    /** 有 api 时走远程/分页加载，不再传 options（否则 kne 会忽略 api） */
    api?: unknown;
    getSearchProps?: (searchProps: { searchText?: string }) => Record<string, unknown>;
    [key: string]: unknown;
  }
> = ({
  value,
  onChange,
  disabled,
  options = [],
  single = false,
  allowSelectedAll = false,
  selectedAllValue = { value: SUPER_SELECT_ALL_VALUE, label: '全选' },
  placeholder,
  showSearch = true,
  allowClear = true,
  className,
  api,
  getSearchProps: getSearchPropsProp,
  ...kneRest
}) => {
  const mapsRef = useRef({
    labelMap: {} as Record<string, string>,
    itemMap: {} as Record<string, KneSelectItem>,
  });
  const useApi = api != null;

  const labelMapFromOptions = useMemo(() => {
    const map: Record<string, string> = {};
    for (const o of options) {
      map[String(o.value)] = o.label;
    }
    map[String(selectedAllValue.value)] = selectedAllValue.label;
    return map;
  }, [options, selectedAllValue]);

  const kneValue = useMemo(() => {
    const maps = {
      labelMap: { ...labelMapFromOptions, ...mapsRef.current.labelMap },
      itemMap: mapsRef.current.itemMap,
    };
    if (isSelectAllMarsun(value, selectedAllValue.value)) {
      return [selectedAllValue as KneSelectItem];
    }
    return marsunToKne(value, { single, ...maps });
  }, [value, single, labelMapFromOptions, selectedAllValue]);

  const handleChange = (next: KneSelectItem | KneSelectItem[] | null) => {
    mapsRef.current = mergeKneLabelMaps(next, mapsRef.current);
    onChange?.(kneToMarsun(next, single));
  };

  const defaultGetSearchProps = ({ searchText }: { searchText?: string }) => ({
    keyword: searchText || '',
    currentPage: 1,
  });

  return (
    <div
      className={classNames(
        'marsun-form-super-select',
        styles['marsun-form-super-select'],
        className,
      )}
    >
      <KneSuperSelect
        {...kneRest}
        value={kneValue}
        onChange={handleChange}
        {...(useApi
          ? {
              api,
              getSearchProps: showSearch
                ? getSearchPropsProp || defaultGetSearchProps
                : getSearchPropsProp,
            }
          : {
              options,
              getSearchCallback: showSearch
                ? ({ searchText }: { searchText?: string }, item: KneSelectItem) => {
                    if (!searchText) return true;
                    const kw = searchText.toLowerCase();
                    const label = String(item.label ?? '').toLowerCase();
                    const val = String(item.value ?? '').toLowerCase();
                    return label.includes(kw) || val.includes(kw);
                  }
                : undefined,
            })}
        single={single}
        allowSelectedAll={!single && allowSelectedAll}
        selectedAllValue={selectedAllValue}
        placeholder={placeholder}
        isPopup
        allowClear={allowClear && !disabled}
        disabled={disabled}
      />
    </div>
  );
};

const SuperSelectInner: FC<SuperSelectProps> = (props) => {
  const { useDecorator } = (ReactFormAntd as unknown as { hooks: KneHooks }).hooks;
  const render = useDecorator({
    fieldName: 'superSelect',
    ...props,
  });
  return render(SuperSelectField);
};

SuperSelectInner.displayName = 'SuperSelect';

export const SuperSelect = withNormalizedLabelTips(
  SuperSelectInner as ComponentType<SuperSelectProps>,
) as ComponentType<SuperSelectProps>;

export default SuperSelect;
