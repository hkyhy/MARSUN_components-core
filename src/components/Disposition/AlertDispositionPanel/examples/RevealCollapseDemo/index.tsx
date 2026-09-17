import {
  AlertDispositionPanel,
  DispositionAlertLevelLegend,
  DispositionBar,
  buildDispositionAlertContext,
  getDispositionAlertLevel,
} from '@/components';
import type { DispositionAlertContext, DispositionAlertLevelCatalog } from '@/components';
import { Line } from '@ant-design/plots';
import { Button, Radio, Space, Typography } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';

const { Text } = Typography;

/** Demo A：三级制（示意其它项目可注入） */
const CATALOG_L3: DispositionAlertLevelCatalog = [
  { key: 'L1', label: '一级提示', tone: '#1677ff', kind: 'info', pointSize: 6 },
  { key: 'L2', label: '二级预警', tone: '#faad14', kind: 'warn', pointSize: 7 },
  { key: 'L3', label: '三级严重', tone: '#ef4444', kind: 'critical', pointSize: 8 },
];

/** Demo B：预警/报警两级（示意设备用能） */
const CATALOG_WARN_ALARM: DispositionAlertLevelCatalog = [
  { key: 'warn', label: '预警', tone: '#f59e0b', pointSize: 5 },
  { key: 'alarm', label: '报警', tone: '#ef4444', pointSize: 6 },
];

type CatalogId = 'l3' | 'warnAlarm';

const CATALOGS: Record<CatalogId, { name: string; catalog: DispositionAlertLevelCatalog }> = {
  l3: { name: '三级制', catalog: CATALOG_L3 },
  warnAlarm: { name: '预警/报警', catalog: CATALOG_WARN_ALARM },
};

type ChartRow = {
  date: string;
  value: number;
  levelKey: string;
  pointFill: string;
  pointSize: number;
  pointShape: string;
};

function buildSeries(catalog: DispositionAlertLevelCatalog): ChartRow[] {
  const keys = catalog.map((s) => s.key);
  const pick = (i: number) => keys[i % keys.length]!;
  const base = [
    { date: '09-01', value: 1.82, levelKey: '' },
    { date: '09-03', value: 1.91, levelKey: pick(0) },
    { date: '09-05', value: 1.88, levelKey: '' },
    { date: '09-07', value: 2.05, levelKey: pick(1) },
    { date: '09-09', value: 1.95, levelKey: '' },
    { date: '09-11', value: 2.28, levelKey: pick(Math.min(2, keys.length - 1)) },
    { date: '09-13', value: 1.9, levelKey: '' },
    { date: '09-15', value: 2.12, levelKey: pick(1) },
  ];
  return base.map((r) => {
    const spec = r.levelKey ? getDispositionAlertLevel(catalog, r.levelKey) : undefined;
    return {
      date: r.date,
      value: r.value,
      levelKey: r.levelKey,
      pointFill: spec?.tone ?? '#91caff',
      pointSize: spec?.pointSize ?? 3,
      pointShape: spec?.shape ?? 'point',
    };
  });
}

function pickDatum(evt: unknown): ChartRow | null {
  if (!evt || typeof evt !== 'object') return null;
  const e = evt as { data?: { data?: unknown } | ChartRow; datum?: unknown };
  let raw: unknown =
    e.data && typeof e.data === 'object' && 'data' in e.data
      ? (e.data as { data?: unknown }).data
      : (e.data ?? e.datum);
  if (Array.isArray(raw)) raw = raw[0];
  if (!raw || typeof raw !== 'object') return null;
  return raw as ChartRow;
}

/**
 * 等级目录可切换：同一 Panel/折线，换 catalog 即换展示规则。
 * Showcase 用 @ant-design/plots（禁自研 SVG 业务图）。
 */
const RevealCollapseDemo: React.FC = () => {
  const [catalogId, setCatalogId] = useState<CatalogId>('l3');
  const catalog = CATALOGS[catalogId].catalog;
  const [open, setOpen] = useState(false);
  const [ctx, setCtx] = useState<DispositionAlertContext | null>(null);

  const series = useMemo(() => buildSeries(catalog), [catalog]);

  const revealLevel = useCallback(
    (key: string, date: string) => {
      const next = buildDispositionAlertContext(catalog, key, {
        date: `2026-${date}`,
        detail: `等级键 ${key}`,
      });
      if (!next) return;
      setCtx(next);
      setOpen(true);
    },
    [catalog],
  );

  const onReady = useCallback(
    (plot: { chart?: { on?: (ev: string, fn: (e: unknown) => void) => void } }) => {
      plot.chart?.on?.('element:click', (evt: unknown) => {
        const row = pickDatum(evt);
        if (!row?.levelKey) return;
        revealLevel(row.levelKey, row.date);
      });
    },
    [revealLevel],
  );

  const config = useMemo(
    () => ({
      data: series,
      xField: 'date',
      yField: 'value',
      height: 220,
      autoFit: true,
      style: { stroke: '#1677ff', lineWidth: 2 },
      axis: { y: { title: false }, x: { title: false } },
      tooltip: {
        title: 'date',
        items: [
          { field: 'value', name: '指标' },
          {
            field: 'levelKey',
            name: '等级',
            valueFormatter: (v: unknown) => {
              const key = String(v || '');
              if (!key) return '正常';
              return getDispositionAlertLevel(catalog, key)?.label ?? key;
            },
          },
        ],
      },
      point: {
        sizeField: 'pointSize',
        colorField: 'pointFill',
        shapeField: 'pointShape',
        scale: {
          size: { type: 'identity' as const },
          color: { type: 'identity' as const },
          shape: { type: 'identity' as const },
        },
        style: { cursor: 'pointer' },
      },
      legend: false,
      onReady,
    }),
    [series, catalog, onReady],
  );

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space wrap align="center">
        <Text type="secondary" style={{ fontSize: 12 }}>
          等级目录（项目可配）：
        </Text>
        <Radio.Group
          size="small"
          value={catalogId}
          onChange={(e) => {
            setCatalogId(e.target.value as CatalogId);
            setOpen(false);
            setCtx(null);
          }}
          optionType="button"
          options={Object.entries(CATALOGS).map(([id, v]) => ({
            value: id,
            label: v.name,
          }))}
        />
        <DispositionAlertLevelLegend catalog={catalog} title="" />
      </Space>
      <Text type="secondary" style={{ fontSize: 12 }}>
        点击色点展开处置；换目录即换 label/tone，core 不写死产品规则
      </Text>
      <Line {...config} />
      <AlertDispositionPanel
        open={open}
        context={ctx}
        onCollapse={() => {
          setOpen(false);
          setCtx(null);
        }}
      >
        <DispositionBar
          statusBadge="未处置"
          actions={
            <>
              <Button type="primary" size="small">
                认领
              </Button>
              <Button size="small">分配</Button>
              <Button size="small">跟进</Button>
            </>
          }
        />
      </AlertDispositionPanel>
      {!open ? (
        <Text type="secondary" style={{ fontSize: 12 }}>
          （处置区已收起）
        </Text>
      ) : null}
    </Space>
  );
};

export default RevealCollapseDemo;
