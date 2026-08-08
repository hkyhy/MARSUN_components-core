/**
 * S3 质量分析 · ReactFilter 版 Demo（规范 §5.0：新页默认 ReactFilter）。
 * PopoverItem 壳 + 面板内参考月份 / 新品种属性 + Cascader.Panel（leafOnly，对齐 FilterCascader）。
 */
// @ts-nocheck
import {
  Button,
  Cascader,
  DatePicker,
  Flex,
  Input,
  InputNumber,
  Segmented,
  Select,
  Typography,
} from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PopoverItem } from '../index';
import ReactFilterLayoutPreview from './ReactFilterLayoutPreview';
import styles from './QualityAnalysisReactFilterDemo.module.scss';

type SearchMode = 'historical' | 'new';
type KneVal = { label: string; value: string } | null;
type KneMulti = { label: string; value: string }[] | null;
type CascaderPath = string[];

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

function primaryOptions(month: string) {
  return [
    {
      value: '1001',
      label: '一分厂',
      children: [
        {
          value: `1001@@JCF14.6KD@@${month}`,
          label: `一分厂 · JCF14.6KD · ${month}`,
          isLeaf: true,
        },
        {
          value: `1001@@JC40S@@${month}`,
          label: `一分厂 · JC40S · ${month}`,
          isLeaf: true,
        },
      ],
    },
    {
      value: '1080',
      label: '八分厂',
      children: [
        {
          value: `1080@@JCF14.5KD@@${month}`,
          label: `八分厂 · JCF14.5KD · ${month}`,
          isLeaf: true,
        },
      ],
    },
    {
      value: 'xw',
      label: '新维智能工厂',
      children: [
        {
          value: `xw@@JCF7.4KD@@${month}`,
          label: `新维 · JCF7.4KD · ${month}`,
          isLeaf: true,
        },
      ],
    },
  ];
}

function compareOptions(filters: NewFilters, primary: KneVal) {
  if (!primary?.value) return [];
  const suffix = filters.spinMethod ? ` · ${filters.spinMethod}` : '';
  return [
    {
      value: '1070',
      label: '七分厂',
      children: [
        {
          value: `1070@@JCF7.4KD@@cmp${suffix}`,
          label: `七分厂 · JCF7.4KD${suffix}`,
          isLeaf: true,
        },
        {
          value: `1070@@JC32S@@cmp${suffix}`,
          label: `七分厂 · JC32S${suffix}`,
          isLeaf: true,
        },
      ],
    },
    {
      value: '1080',
      label: '八分厂',
      children: [
        {
          value: `1080@@JCF14.5KD@@cmp${suffix}`,
          label: `八分厂 · JCF14.5KD${suffix}`,
          isLeaf: true,
        },
      ],
    },
  ];
}

function leafPathMap(options: { value: string; children?: { value: string }[] }[]) {
  const map = new Map<string, CascaderPath>();
  for (const factory of options) {
    for (const leaf of factory.children || []) {
      map.set(String(leaf.value), [String(factory.value), String(leaf.value)]);
    }
  }
  return map;
}

function LeafPanel({
  multiple = false,
  options,
  value,
  onChange,
  searchPlaceholder,
}: {
  multiple?: boolean;
  options: ReturnType<typeof primaryOptions>;
  value: KneVal | KneMulti;
  onChange: (next: KneVal | KneMulti) => void;
  searchPlaceholder: string;
}) {
  const [keyword, setKeyword] = useState('');
  const pathMap = useMemo(() => leafPathMap(options), [options]);
  const labelMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of options) {
      for (const leaf of f.children || []) {
        map.set(String(leaf.value), String(leaf.label));
      }
    }
    return map;
  }, [options]);

  const filtered = useMemo(() => {
    if (!keyword.trim()) return options;
    const lower = keyword.toLowerCase();
    return options
      .map((factory) => {
        const children = (factory.children || []).filter((leaf) =>
          String(leaf.label).toLowerCase().includes(lower),
        );
        if (String(factory.label).toLowerCase().includes(lower) || children.length) {
          return {
            ...factory,
            children: String(factory.label).toLowerCase().includes(lower)
              ? factory.children
              : children,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [options, keyword]);

  const cascaderValue = useMemo(() => {
    if (multiple) {
      const items = Array.isArray(value) ? value : [];
      return items
        .map((item) => pathMap.get(String(item.value)))
        .filter((p): p is CascaderPath => Boolean(p && p.length >= 2));
    }
    const key = value && !Array.isArray(value) ? String(value.value || '') : '';
    return key ? pathMap.get(key) : undefined;
  }, [multiple, value, pathMap]);

  return (
    <Flex vertical gap={8} style={{ width: '100%' }}>
      <Input.Search
        allowClear
        size="small"
        placeholder={searchPlaceholder}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <Cascader.Panel
        options={filtered}
        value={cascaderValue as never}
        multiple={multiple}
        changeOnSelect={false}
        {...(multiple ? { showCheckedStrategy: Cascader.SHOW_CHILD } : {})}
        onChange={(next) => {
          if (multiple) {
            const paths = (Array.isArray(next) ? next : []) as CascaderPath[];
            const items = paths
              .filter((p) => p?.length >= 2)
              .map((p) => {
                const leafId = String(p[p.length - 1]);
                return { value: leafId, label: labelMap.get(leafId) || leafId };
              });
            onChange(items.length ? items : null);
            return;
          }
          const path = next as CascaderPath | undefined;
          if (!path || path.length < 2) return;
          const leafId = String(path[path.length - 1]);
          onChange({ value: leafId, label: labelMap.get(leafId) || leafId });
        }}
      />
    </Flex>
  );
}

const QualityAnalysisReactFilterDemo: React.FC = () => {
  const [searchMode, setSearchMode] = useState<SearchMode>('new');
  const [searchMonth, setSearchMonth] = useState(dayjs().format('YYYY-MM'));
  const [primary, setPrimary] = useState<KneVal>(null);
  const [compare, setCompare] = useState<KneMulti>(null);
  const [newFilters, setNewFilters] = useState<NewFilters>({ ...EMPTY_FILTERS });
  const [appliedFilters, setAppliedFilters] = useState<NewFilters>({ ...EMPTY_FILTERS });

  const primaryOpts = useMemo(() => primaryOptions(searchMonth), [searchMonth]);
  const compareOpts = useMemo(
    () => compareOptions(appliedFilters, primary),
    [appliedFilters, primary],
  );

  useEffect(() => {
    setPrimary(null);
    setCompare(null);
  }, [searchMonth]);

  const handleCompareApply = useCallback((filters: NewFilters) => {
    setNewFilters(filters);
    setAppliedFilters(filters);
    setCompare(null);
  }, []);

  const isNewMode = searchMode === 'new';
  const primaryLabel = searchMonth ? `主对标分厂×品种（参考 ${searchMonth}）` : '主对标分厂×品种';

  return (
    <ReactFilterLayoutPreview>
      <div
        className={classNames(
          'quality-analysis-filter-demo',
          styles['quality-analysis-filter-demo'],
        )}
      >
        <p className={styles['quality-analysis-filter-demo-hint']}>
          ReactFilter 版（新页 SSOT）：PopoverItem 壳 + Cascader.Panel（changeOnSelect=false /
          leafOnly）。主对标单选叶子，对比多选叶子；不可只选分厂。
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

        <Flex wrap gap={12} align="flex-start">
          <PopoverItem
            label={primaryLabel}
            value={primary}
            onChange={setPrimary}
            onValidate={(v: KneVal) => Boolean(v?.value)}
          >
            {({ value, onChange }) => (
              <Flex vertical gap={12} style={{ width: 480, maxWidth: '100%' }}>
                <div className={classNames('panel-extra-block', styles['panel-extra-block'])}>
                  <Typography.Text type="secondary" className={styles['panel-extra-hint']}>
                    参考月份（变更后刷新下方候选树）
                  </Typography.Text>
                  <DatePicker
                    picker="month"
                    size="small"
                    allowClear={false}
                    value={searchMonth ? dayjs(`${searchMonth}-01`) : undefined}
                    onChange={(v) => setSearchMonth(v ? v.format('YYYY-MM') : '')}
                    getPopupContainer={popupParent}
                    className={styles['panel-month-picker']}
                  />
                </div>
                <LeafPanel
                  options={primaryOpts}
                  value={value}
                  onChange={onChange}
                  searchPlaceholder="搜索主对标分厂×品种..."
                />
              </Flex>
            )}
          </PopoverItem>

          <PopoverItem
            label="对比分厂×品种"
            value={compare}
            onChange={setCompare}
            onValidate={(v: KneMulti) => Array.isArray(v) && v.length > 0}
          >
            {({ value, onChange }) => (
              <Flex vertical gap={12} style={{ width: 520, maxWidth: '100%' }}>
                {isNewMode ? (
                  <CompareAttrPanel newFilters={newFilters} onApply={handleCompareApply} />
                ) : null}
                {!primary?.value ? (
                  <Typography.Text type="secondary">请先选择主对标</Typography.Text>
                ) : (
                  <LeafPanel
                    multiple
                    options={compareOpts}
                    value={value || []}
                    onChange={onChange}
                    searchPlaceholder="搜索对比分厂×品种"
                  />
                )}
              </Flex>
            )}
          </PopoverItem>
        </Flex>

        <pre
          style={{ margin: 0, background: '#f5f5f5', padding: 8, borderRadius: 4, fontSize: 12 }}
        >
          {JSON.stringify(
            {
              searchMode,
              searchMonth,
              primary,
              compare,
              appliedFilters: isNewMode ? appliedFilters : undefined,
            },
            null,
            2,
          )}
        </pre>
      </div>
    </ReactFilterLayoutPreview>
  );
};

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

export default QualityAnalysisReactFilterDemo;
