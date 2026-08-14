/**
 * S3 质量分析筛选高保真 Demo（对齐 Agent_QualityAnalysis VarietyHistorySearchBar）。
 * 业务列表 SSOT 为 CommonFilter + FilterCascader + panelExtra；禁止用 ReactFilter 替代。
 */
import { CommonFilter, FilterCascader, type TreeFilterNode } from '@/components';
import { Button, DatePicker, InputNumber, Segmented, Select, Typography } from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import FilterLayoutPreview from '../FilterLayoutPreview';
import styles from './style.module.scss';

type SearchMode = 'historical' | 'new';

type NewFilters = {
  yarnCountMin?: number | null;
  yarnCountMax?: number | null;
  texMin?: number | null;
  texMax?: number | null;
  plyMin?: number | null;
  plyMax?: number | null;
  spinMethod?: string;
  spinType?: string;
  materialCategory?: string;
};

const EMPTY_FILTERS: NewFilters = {
  yarnCountMin: null,
  yarnCountMax: null,
  texMin: null,
  texMax: null,
  plyMin: null,
  plyMax: null,
  spinMethod: '',
  spinType: '',
  materialCategory: '',
};

const METHOD_OPTS = [
  { value: 'RING_SPINNING', label: '环锭纺' },
  { value: 'COMPACT_SPINNING', label: '紧密纺' },
];
const PROCESS_OPTS = [
  { value: 'COMBED', label: '精梳' },
  { value: 'CARDING', label: '普梳' },
];
const MATERIAL_OPTS = [
  { value: 'PURE_COTTON', label: '纯棉' },
  { value: 'POLYESTER_COTTON', label: '涤棉' },
];

const popupParent = (node: HTMLElement) => node.parentElement || document.body;

function primaryTreeForMonth(month: string): TreeFilterNode[] {
  const tag = month.slice(5) || '08';
  return [
    {
      id: '1001',
      name: '一分厂',
      children: [
        { id: `1001@@JCF14.6KD@@${month}`, name: `JCF14.6KD` },
        { id: `1001@@JC40S@@${month}`, name: `JC40S` },
      ],
    },
    {
      id: '1080',
      name: '八分厂',
      children: [{ id: `1080@@JCF14.5KD@@${month}`, name: `JCF14.5KD · ${tag}` }],
    },
    {
      id: 'xw',
      name: '新维智能工厂',
      children: [{ id: `xw@@JCF7.4KD@@${month}`, name: 'JCF7.4KD' }],
    },
  ];
}

function compareTreeForFilters(filters: NewFilters, primary?: string): TreeFilterNode[] {
  if (!primary) return [];
  const suffix = filters.spinMethod ? ` · ${filters.spinMethod}` : '';
  const range =
    filters.yarnCountMin != null || filters.yarnCountMax != null
      ? ` · 纱支${filters.yarnCountMin ?? '—'}-${filters.yarnCountMax ?? '—'}`
      : '';
  return [
    {
      id: '1070',
      name: '七分厂',
      children: [
        {
          id: `1070@@JCF7.4KD@@cmp${suffix}`,
          name: `JCF7.4KD${suffix}${range}`,
        },
        {
          id: `1070@@JC32S@@cmp${suffix}`,
          name: `JC32S${suffix}${range}`,
        },
      ],
    },
    {
      id: '1080',
      name: '八分厂',
      children: [{ id: `1080@@JCF14.5KD@@cmp${suffix}`, name: `JCF14.5KD${suffix}` }],
    },
    {
      id: 'xw',
      name: '新维智能工厂',
      children: [{ id: `xw@@JCF11.4D@@cmp${suffix}`, name: `JCF11.4D${suffix}` }],
    },
  ];
}

function PrimaryMonthPanel({
  searchMonth,
  onSearchMonthChange,
}: {
  searchMonth: string;
  onSearchMonthChange: (v: string) => void;
}) {
  return (
    <div className={classNames('panel-extra-block', styles['panel-extra-block'])}>
      <div className={styles['panel-extra-header']}>
        <Typography.Text type="secondary" className={styles['panel-extra-hint']}>
          参考月份（变更后刷新下方候选树）
        </Typography.Text>
      </div>
      <DatePicker
        picker="month"
        size="small"
        allowClear={false}
        value={searchMonth ? dayjs(`${searchMonth}-01`) : undefined}
        onChange={(v) => onSearchMonthChange(v ? v.format('YYYY-MM') : '')}
        getPopupContainer={popupParent}
        className={styles['panel-month-picker']}
      />
    </div>
  );
}

function CompareAttrPanel({
  newFilters,
  onApply,
}: {
  newFilters: NewFilters;
  onApply: (filters: NewFilters) => void;
}) {
  const [draft, setDraft] = useState<NewFilters>(() => ({ ...EMPTY_FILTERS, ...newFilters }));

  useEffect(() => {
    setDraft({ ...EMPTY_FILTERS, ...newFilters });
  }, [newFilters]);

  const patchDraft = useCallback((patch: Partial<NewFilters>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  return (
    <div className={classNames('panel-extra-block', styles['panel-extra-block'])}>
      <div className={styles['panel-extra-header']}>
        <Typography.Text type="secondary" className={styles['panel-extra-hint']}>
          填写条件后点击搜索刷新候选树
        </Typography.Text>
        <Button
          type="primary"
          size="small"
          onClick={() => onApply(draft)}
          className={styles['panel-extra-search-btn']}
        >
          搜索
        </Button>
      </div>
      <div className={styles['compare-enum-grid']}>
        <Select
          allowClear
          size="small"
          placeholder="纺纱方法"
          options={METHOD_OPTS}
          value={draft.spinMethod || undefined}
          onChange={(v) => patchDraft({ spinMethod: v ?? '' })}
          getPopupContainer={popupParent}
          className={styles['compare-enum-select']}
        />
        <Select
          allowClear
          size="small"
          placeholder="纺纱工艺"
          options={PROCESS_OPTS}
          value={draft.spinType || undefined}
          onChange={(v) => patchDraft({ spinType: v ?? '' })}
          getPopupContainer={popupParent}
          className={styles['compare-enum-select']}
        />
        <Select
          allowClear
          size="small"
          placeholder="原料类别"
          options={MATERIAL_OPTS}
          value={draft.materialCategory || undefined}
          onChange={(v) => patchDraft({ materialCategory: v ?? '' })}
          getPopupContainer={popupParent}
          className={styles['compare-enum-select']}
        />
      </div>
      <div className={styles['compare-range-list']}>
        {(
          [
            ['纱支', 'yarnCountMin', 'yarnCountMax'],
            ['号数', 'texMin', 'texMax'],
            ['股数', 'plyMin', 'plyMax'],
          ] as const
        ).map(([label, minKey, maxKey]) => (
          <div key={label} className={styles['compare-range-row']}>
            <span className={styles['compare-attr-field-label']}>{label}</span>
            <InputNumber
              size="small"
              placeholder="最小"
              value={draft[minKey] ?? undefined}
              onChange={(v) => patchDraft({ [minKey]: v ?? null })}
              className={styles['compare-range-input']}
            />
            <span className={styles['compare-attr-sep']}>~</span>
            <InputNumber
              size="small"
              placeholder="最大"
              value={draft[maxKey] ?? undefined}
              onChange={(v) => patchDraft({ [maxKey]: v ?? null })}
              className={styles['compare-range-input']}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const QualityAnalysisFilterDemo: React.FC = () => {
  const [searchMode, setSearchMode] = useState<SearchMode>('new');
  const [searchMonth, setSearchMonth] = useState(dayjs().format('YYYY-MM'));
  const [primary, setPrimary] = useState<string | undefined>();
  const [compare, setCompare] = useState<string[]>([]);
  const [newFilters, setNewFilters] = useState<NewFilters>({ ...EMPTY_FILTERS });
  const [appliedFilters, setAppliedFilters] = useState<NewFilters>({ ...EMPTY_FILTERS });
  const [filterKey, setFilterKey] = useState(0);
  const [primaryLoading, setPrimaryLoading] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);

  const primaryTree = useMemo(() => primaryTreeForMonth(searchMonth), [searchMonth]);
  const compareTree = useMemo(
    () => compareTreeForFilters(appliedFilters, primary),
    [appliedFilters, primary],
  );

  useEffect(() => {
    setPrimaryLoading(true);
    const t = window.setTimeout(() => setPrimaryLoading(false), 280);
    setPrimary(undefined);
    setCompare([]);
    return () => window.clearTimeout(t);
  }, [searchMonth]);

  const handleCompareApply = useCallback((filters: NewFilters) => {
    setCompareLoading(true);
    setNewFilters(filters);
    setAppliedFilters(filters);
    setCompare([]);
    window.setTimeout(() => setCompareLoading(false), 320);
  }, []);

  const resetFilters = useCallback(() => {
    setPrimary(undefined);
    setCompare([]);
    setSearchMonth(dayjs().format('YYYY-MM'));
    setNewFilters({ ...EMPTY_FILTERS });
    setAppliedFilters({ ...EMPTY_FILTERS });
    setFilterKey((k) => k + 1);
  }, []);

  const isNewMode = searchMode === 'new';

  return (
    <FilterLayoutPreview provideLayout={false}>
      {(layout) => (
        <div
          className={classNames(
            'quality-analysis-filter-demo',
            styles['quality-analysis-filter-demo'],
          )}
        >
          <p className={styles['quality-analysis-filter-demo-hint']}>
            对齐 S3 质量分析 VarietyHistorySearchBar（CommonFilter 存量写法）。新页请优先看
            ReactFilter 示例「S3 质量分析 · ReactFilter」。
          </p>
          <div
            className={classNames(
              'quality-analysis-filter-demo-mode',
              styles['quality-analysis-filter-demo-mode'],
            )}
          >
            <span className={styles['quality-analysis-filter-demo-mode-label']}>对标模式</span>
            <Segmented<SearchMode>
              value={searchMode}
              onChange={setSearchMode}
              options={[
                { label: '历史品种', value: 'historical' },
                { label: '新品种', value: 'new' },
              ]}
            />
          </div>
          <CommonFilter layoutMode={layout} label="筛选" onClearAll={resetFilters}>
            <FilterCascader
              key={`primaryPlant-${filterKey}`}
              filterKey="primaryPlant"
              label={searchMonth ? `主对标分厂×品种（参考 ${searchMonth}）` : '主对标分厂×品种'}
              showSearch
              leafOnly
              loading={primaryLoading}
              treeData={primaryTree}
              value={primary}
              panelExtra={
                <PrimaryMonthPanel searchMonth={searchMonth} onSearchMonthChange={setSearchMonth} />
              }
              panelWidth={520}
              onChange={(v) => {
                setPrimary(typeof v === 'string' ? v : undefined);
                setCompare([]);
              }}
            />
            <FilterCascader
              key={`comparePlants-${filterKey}`}
              filterKey="comparePlants"
              label="对比分厂×品种"
              dependsOn={['primaryPlant']}
              multiple
              showSearch
              leafOnly
              loading={compareLoading}
              treeData={compareTree}
              value={compare}
              panelExtra={
                isNewMode ? (
                  <CompareAttrPanel newFilters={newFilters} onApply={handleCompareApply} />
                ) : null
              }
              panelWidth={isNewMode ? 520 : undefined}
              onChange={(v) => setCompare(Array.isArray(v) ? v : [])}
            />
          </CommonFilter>
        </div>
      )}
    </FilterLayoutPreview>
  );
};

export default QualityAnalysisFilterDemo;
