import React, { useEffect, useMemo, useRef, useState } from 'react';
import FilterPopover from './FilterPopover';
import type { BaseFilterProps } from './types';
import { resolveFilterVisible } from './types';
import { useFilterFieldBridge, useFilterRegister } from './useFilterState';
import {
  kneToMarsun,
  kneValueLabel,
  marsunToKne,
  marsunValueLabel,
  mergeKneLabelMaps,
  type KneSelectItem,
  type MarsunSelectValue,
} from './kneValueAdapter';
import styles from './createKneFilterField.module.scss';
import classNames from 'classnames';

export type KneFilterFieldProps = BaseFilterProps & {
  value?: MarsunSelectValue;
  onChange?: (value: MarsunSelectValue) => void;
  /** 对齐 kne：true 单选 */
  single?: boolean;
  /** 面板宽度 */
  panelWidth?: number;
  /** 透传给 kne 组件的其余 props */
  [key: string]: unknown;
};

type KneComponentProps = Record<string, unknown> & {
  value?: KneSelectItem | KneSelectItem[] | null;
  onChange?: (v: KneSelectItem | KneSelectItem[] | null) => void;
  single?: boolean;
  valueType?: string;
  allowClear?: boolean;
  className?: string;
};

/**
 * 将 kne SuperSelect / plus 选择器包进 CommonFilter：FilterPopover 壳 + Marsun 值适配。
 */
export function createKneFilterField(
  KneComponent: React.ComponentType<KneComponentProps>,
  defaults?: { panelWidth?: number },
) {
  const KneFilterField: React.FC<KneFilterFieldProps> = ({
    filterKey,
    label,
    value,
    onChange,
    single = false,
    panelWidth = defaults?.panelWidth ?? 420,
    active,
    hidden,
    display,
    dependsOn,
    clearOnDepsChange = true,
    ...kneRest
  }) => {
    const mapsRef = useRef({
      labelMap: {} as Record<string, string>,
      itemMap: {} as Record<string, KneSelectItem>,
    });
    const [draft, setDraft] = useState<KneSelectItem | KneSelectItem[] | null>(() =>
      marsunToKne(value, { single, ...mapsRef.current }),
    );

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
      setDraft(marsunToKne(value, { single, ...mapsRef.current }));
    }, [value, single]);

    const valueLabel = useMemo(() => {
      const fromMaps = marsunValueLabel(value, mapsRef.current.labelMap);
      if (fromMaps) return fromMaps;
      return kneValueLabel(marsunToKne(value, { single, ...mapsRef.current }), single);
    }, [value, single]);

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

    const hasValue = Array.isArray(value) ? value.length > 0 : value != null && value !== '';

    const handleDraftChange = (next: KneSelectItem | KneSelectItem[] | null) => {
      mapsRef.current = mergeKneLabelMaps(next, mapsRef.current);
      setDraft(next);
    };

    return (
      <FilterPopover
        label={resolvedLabel}
        active={active || hasValue}
        width={panelWidth}
        onOpenChange={(open) => {
          if (open) setDraft(marsunToKne(value, { single, ...mapsRef.current }));
        }}
        onConfirm={() => {
          mapsRef.current = mergeKneLabelMaps(draft, mapsRef.current);
          onChange?.(kneToMarsun(draft, single));
        }}
        onReset={() => {
          setDraft(single ? null : []);
          onChange?.(undefined);
        }}
      >
        <div className={classNames('kne-filter-field-panel', styles['kne-filter-field-panel'])}>
          <KneComponent
            {...(kneRest as KneComponentProps)}
            className={classNames(
              'kne-filter-field-inner',
              styles['kne-filter-field-inner'],
              kneRest.className as string | undefined,
            )}
            single={single}
            allowClear={false}
            valueType="all"
            value={draft ?? (single ? null : [])}
            onChange={handleDraftChange}
          />
        </div>
      </FilterPopover>
    );
  };

  KneFilterField.displayName = `KneFilterField(${KneComponent.displayName || KneComponent.name || 'Component'})`;
  return KneFilterField;
}
