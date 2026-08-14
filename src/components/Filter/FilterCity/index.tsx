// @ts-nocheck — @kne/super-select-plus 无完整 TS 类型
import { SelectAddress, createAddressApi } from '@kne/super-select-plus';
import '@kne/super-select-plus/dist/index.css';
import { Space, Tag, message } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import FilterPopover from '../FilterPopover';
import {
  kneToMarsun,
  marsunToKne,
  marsunValueLabel,
  mergeKneLabelMaps,
  type KneSelectItem,
  type MarsunSelectValue,
} from '../kneValueAdapter';
import type { BaseFilterProps } from '../types';
import { resolveFilterVisible } from '../types';
import { useFilterFieldBridge, useFilterRegister } from '../useFilterState';
import styles from './style.module.scss';

const { CheckableTag } = Tag;

export type FilterCityProps = BaseFilterProps & {
  value?: MarsunSelectValue;
  onChange?: (value: MarsunSelectValue) => void;
  single?: boolean;
  maxSelection?: number;
};

type HotCity = { code: string; name: string; enName?: string };

const FilterCity: React.FC<FilterCityProps> = ({
  filterKey,
  label,
  value,
  onChange,
  single = false,
  maxSelection = 5,
  active,
  hidden,
  display,
  dependsOn,
  clearOnDepsChange = true,
}) => {
  const mapsRef = useRef({
    labelMap: {} as Record<string, string>,
    itemMap: {} as Record<string, KneSelectItem>,
  });
  const [hotCities, setHotCities] = useState<HotCity[]>([]);
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
    let cancelled = false;
    SelectAddress.defaultData?.().then((data) => {
      if (cancelled || !data) return;
      const api = createAddressApi(data);
      setHotCities(api.getChinaHotCities?.() ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setDraft(marsunToKne(value, { single, ...mapsRef.current }));
  }, [value, single]);

  const valueLabel = useMemo(() => marsunValueLabel(value, mapsRef.current.labelMap), [value]);

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

  const draftArr: KneSelectItem[] = draft == null ? [] : Array.isArray(draft) ? draft : [draft];
  const hasValue = Array.isArray(value) ? value.length > 0 : value != null && value !== '';

  return (
    <FilterPopover
      label={resolvedLabel}
      active={active || hasValue}
      width={420}
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
      <div className={classNames('filter-city-body', styles['filter-city-body'])}>
        <Space size={4} wrap>
          {hotCities.map((city) => {
            const checked = draftArr.some((d) => String(d.value) === String(city.code));
            return (
              <CheckableTag
                key={city.code}
                checked={checked}
                onChange={(nextChecked) => {
                  if (single) {
                    if (!nextChecked) {
                      setDraft(null);
                      return;
                    }
                    const item = { value: city.code, label: city.name };
                    mapsRef.current = mergeKneLabelMaps(item, mapsRef.current);
                    setDraft(item);
                    return;
                  }
                  let next = draftArr.slice();
                  if (nextChecked) {
                    next.push({ value: city.code, label: city.name });
                  } else {
                    next = next.filter((d) => String(d.value) !== String(city.code));
                  }
                  if (next.length > maxSelection) {
                    message.error(`最多选择 ${maxSelection} 项`);
                    return;
                  }
                  mapsRef.current = mergeKneLabelMaps(next, mapsRef.current);
                  setDraft(next);
                }}
              >
                {city.name}
              </CheckableTag>
            );
          })}
        </Space>
        <div className={styles['filter-city-more']}>
          <span className={styles['filter-city-more-label']}>更多城市</span>
          <SelectAddress
            single={single}
            maxLength={maxSelection}
            allowClear={false}
            value={draft ?? (single ? null : [])}
            onChange={(next) => {
              const list = next == null ? [] : Array.isArray(next) ? next : [next];
              if (!single && list.length > maxSelection) {
                message.error(`最多选择 ${maxSelection} 项`);
                return;
              }
              mapsRef.current = mergeKneLabelMaps(next, mapsRef.current);
              setDraft(next);
            }}
          />
        </div>
      </div>
    </FilterPopover>
  );
};

export default FilterCity;
