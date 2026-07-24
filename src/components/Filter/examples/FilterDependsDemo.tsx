import { CommonFilter, FilterDatePicker, FilterTreeSelect } from '@/components';
import type { TreeFilterNode } from '@/components';
import { Select, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useState } from 'react';

const MONTH_TREES: Record<string, TreeFilterNode[]> = {
  [dayjs().format('YYYY-MM')]: [
    {
      id: 'factory::1001',
      name: '一分厂',
      children: [
        { id: '1001@@JCF14.6KD', name: 'JCF14.6KD' },
        { id: '1001@@JC40S', name: 'JC40S' },
      ],
    },
  ],
  [dayjs().subtract(1, 'month').format('YYYY-MM')]: [
    {
      id: 'factory::1050',
      name: '五分厂',
      children: [{ id: '1050@@JCF14.8KD', name: 'JCF14.8KD' }],
    },
  ],
};

const ATTR_OPTIONS = [
  { value: '环锭纺', label: '环锭纺' },
  { value: '紧密纺', label: '紧密纺' },
];

function delay<T>(data: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

/**
 * dependsOn + loadData + panelExtra：
 * - 月份驱动主对标树；主对标面板内提示参考月
 * - 纺纱方法嵌在对比面板内（antd Select，非 Filter*），驱动对比树
 */
const FilterDependsDemo: React.FC = () => {
  const defaultMonth = dayjs().format('YYYY-MM');
  const [month, setMonth] = useState(defaultMonth);
  const [primary, setPrimary] = useState<string | undefined>();
  const [compare, setCompare] = useState<string[]>([]);
  const [spinningMethod, setSpinningMethod] = useState<string | undefined>();

  const loadPrimary = useCallback(
    async ({ values }: { values: Record<string, unknown> }) => {
      const m = String(values.month ?? defaultMonth);
      return delay(MONTH_TREES[m] ?? MONTH_TREES[defaultMonth] ?? []);
    },
    [defaultMonth],
  );

  const loadCompare = useCallback(async () => {
    const suffix = spinningMethod ? ` · ${spinningMethod}` : '';
    return delay<TreeFilterNode[]>([
      {
        id: 'factory::1080',
        name: '八分厂',
        children: [
          { id: `1080@@JCF14.5KD${suffix}`, name: `JCF14.5KD${suffix}` },
          { id: `1080@@JC32S${suffix}`, name: `JC32S${suffix}` },
        ],
      },
    ]);
  }, [spinningMethod]);

  return (
    <CommonFilter label="筛选">
      <FilterDatePicker
        filterKey="month"
        label="月份"
        picker="month"
        value={month}
        onChange={(v) => setMonth(v ?? defaultMonth)}
        showDefaultAsSelected
      />
      <FilterTreeSelect
        filterKey="primary"
        label={({ values }) =>
          values.month ? `主对标分厂×品种（参考 ${String(values.month)}）` : '主对标分厂×品种'
        }
        dependsOn={['month']}
        loadData={loadPrimary}
        value={primary}
        onChange={(v) => setPrimary(typeof v === 'string' ? v : undefined)}
        leafOnly
        showSearch
        panelExtra={
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            参考月份：{month}（由顶栏「月份」驱动本树选项）
          </Typography.Text>
        }
      />
      <FilterTreeSelect
        filterKey="compare"
        label="对比分厂×品种"
        loadData={loadCompare}
        value={compare}
        onChange={(v) => setCompare(Array.isArray(v) ? v : [])}
        multiple
        leafOnly
        showSearch
        panelExtra={
          <Space wrap size={[8, 8]}>
            <span style={{ fontSize: 12, color: 'var(--font-color-grey-1)' }}>筛选条件</span>
            <Select
              allowClear
              placeholder="纺纱方法"
              style={{ minWidth: 120 }}
              size="small"
              options={ATTR_OPTIONS}
              value={spinningMethod}
              onChange={(v) => {
                setSpinningMethod(v);
                setCompare([]);
              }}
              getPopupContainer={(node) => node.parentElement || document.body}
            />
          </Space>
        }
      />
    </CommonFilter>
  );
};

export default FilterDependsDemo;
