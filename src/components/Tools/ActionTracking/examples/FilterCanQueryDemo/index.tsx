import {
  ActionFilterBar,
  canQueryActionList,
  defaultCreatedRange,
  resetActionFiltersToDefault,
  type ActionListFilters,
} from '@/components/Tools/ActionTracking';
import { InputFilterItem, type FilterValue } from '@/components/ReactFilter';
import { Button, Space, Typography } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';

/** 3. F1 canQuery：清掉创建时间窗 → 禁扫提示 */
const FilterCanQueryDemo: React.FC = () => {
  const [filters, setFilters] = useState<ActionListFilters>(() => resetActionFiltersToDefault());
  const canQuery = canQueryActionList(filters);

  const filterValue = useMemo((): FilterValue => {
    const items: FilterValue = [];
    if (filters.q) {
      items.push({ name: 'q', label: '关键词', value: filters.q });
    }
    if (filters.from && filters.to) {
      items.push({
        name: 'createdAt',
        label: '创建时间',
        value: { value: [filters.from, filters.to], label: `${filters.from} ~ ${filters.to}` },
      });
    }
    return items;
  }, [filters]);

  const onChange = useCallback((next: FilterValue) => {
    const qItem = next.find((i) => i.name === 'q');
    const q = qItem ? String((qItem.value as { value?: unknown })?.value ?? qItem.value ?? '') : '';
    const hasCreated = next.some((i) => i.name === 'createdAt');
    setFilters((prev) => {
      if (!hasCreated) {
        return { q: q || undefined };
      }
      const range = prev.from && prev.to ? { from: prev.from, to: prev.to } : defaultCreatedRange();
      return { ...range, q: q || undefined };
    });
  }, []);

  return (
    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
      <Space wrap>
        <Button size="small" onClick={() => setFilters(resetActionFiltersToDefault())}>
          恢复默认窗（近 30 天）
        </Button>
        <Button size="small" danger onClick={() => setFilters({ q: filters.q })}>
          清空创建时间（触发 !canQuery）
        </Button>
      </Space>
      <Typography.Text type="secondary">
        canQueryActionList = {String(canQuery)}
        {filters.from && filters.to ? ` · ${filters.from} ~ ${filters.to}` : ' · 无 from/to'}
      </Typography.Text>
      <ActionFilterBar
        value={filterValue}
        onChange={onChange}
        canQuery={canQuery}
        list={[
          [
            {
              type: InputFilterItem,
              props: { name: 'q', label: '关键词', placeholder: '仅演示；清窗看 hint' },
            },
          ],
        ]}
      />
    </Space>
  );
};

export default FilterCanQueryDemo;
