import { Space, Tag, message } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import FilterPopover from '../FilterPopover';
import type { BaseFilterProps, FilterOption } from '../types';
import { resolveFilterVisible } from '../types';
import { useFilterFieldBridge, useFilterRegister } from '../useFilterState';
import styles from './style.module.scss';

const { CheckableTag } = Tag;

export type FilterListValue = string | number | (string | number)[] | undefined;

export type FilterListProps = BaseFilterProps & {
  options: FilterOption[];
  value?: FilterListValue;
  onChange?: (value: FilterListValue) => void;
  /** true：单选；默认多选 */
  single?: boolean;
  /** 多选上限；默认 5 */
  maxSelection?: number;
  /** popover：筛选项弹层；inline：直接展示 Tag（仍 register） */
  mode?: 'popover' | 'inline';
};

function toArray(value: FilterListValue): (string | number)[] {
  if (value == null || value === '') return [];
  return Array.isArray(value) ? value : [value];
}

function formatListLabel(value: FilterListValue, options: FilterOption[]): string {
  const arr = toArray(value);
  if (!arr.length) return '';
  const map = new Map(options.map((o) => [String(o.value), o.label]));
  return arr.map((v) => map.get(String(v)) ?? String(v)).join('、');
}

const FilterListTags: React.FC<{
  options: FilterOption[];
  draft: (string | number)[];
  single: boolean;
  maxSelection: number;
  onDraftChange: (next: (string | number)[]) => void;
}> = ({ options, draft, single, maxSelection, onDraftChange }) => {
  return (
    <Space size={4} wrap className={styles['filter-list-tags']}>
      {options.map((opt) => {
        const checked = draft.some((v) => String(v) === String(opt.value));
        return (
          <CheckableTag
            key={String(opt.value)}
            checked={checked}
            onChange={(nextChecked) => {
              if (single) {
                onDraftChange(nextChecked ? [opt.value] : []);
                return;
              }
              let next = draft.slice();
              if (nextChecked) {
                next.push(opt.value);
              } else {
                next = next.filter((v) => String(v) !== String(opt.value));
              }
              if (next.length > maxSelection) {
                message.error(`最多选择 ${maxSelection} 项`);
                return;
              }
              onDraftChange(next);
            }}
          >
            {opt.label}
          </CheckableTag>
        );
      })}
    </Space>
  );
};

const FilterList: React.FC<FilterListProps> = ({
  filterKey,
  label,
  options,
  value,
  onChange,
  single = false,
  maxSelection = 5,
  mode = 'popover',
  active,
  hidden,
  display,
  dependsOn,
  clearOnDepsChange = true,
}) => {
  const [draft, setDraft] = useState<(string | number)[]>(() => toArray(value));

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const { resolvedLabel } = useFilterFieldBridge({
    filterKey,
    value,
    label,
    dependsOn,
    clearOnDepsChange,
    onDepsClear: () => onChangeRef.current?.(undefined),
  });

  const registerFn = useFilterRegister();
  const visible = resolveFilterVisible({ display, hidden });

  useEffect(() => {
    setDraft(toArray(value));
  }, [value]);

  const valueLabel = useMemo(() => formatListLabel(value, options), [value, options]);

  useEffect(() => {
    if (!registerFn) return;
    if (!visible) {
      registerFn.unregister(filterKey);
      return;
    }
    if (valueLabel) {
      registerFn.register(filterKey, {
        label: resolvedLabel,
        valueLabel,
        onRemove: () => onChange?.(undefined),
      });
    } else {
      registerFn.unregister(filterKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueLabel, filterKey, resolvedLabel, visible]);

  if (!visible) return null;

  const commit = (next: (string | number)[]) => {
    if (single) {
      onChange?.(next[0]);
    } else {
      onChange?.(next.length ? next : undefined);
    }
  };

  const tags = (
    <FilterListTags
      options={options}
      draft={draft}
      single={single}
      maxSelection={maxSelection}
      onDraftChange={(next) => {
        setDraft(next);
        if (mode === 'inline') commit(next);
      }}
    />
  );

  if (mode === 'inline') {
    return (
      <div
        className={classNames('filter-list-inline', styles['filter-list-inline'])}
        data-filter-key={filterKey}
      >
        <span className={styles['filter-list-inline-label']}>{resolvedLabel}</span>
        {tags}
      </div>
    );
  }

  const hasValue = toArray(value).length > 0;

  return (
    <FilterPopover
      label={resolvedLabel}
      active={active || hasValue}
      width={360}
      onOpenChange={(open) => {
        if (open) setDraft(toArray(value));
      }}
      onConfirm={() => commit(draft)}
      onReset={() => {
        setDraft([]);
        onChange?.(undefined);
      }}
    >
      {tags}
    </FilterPopover>
  );
};

export default FilterList;
