import { describe, expect, it } from 'vitest';
import type { ColumnsType } from 'antd/es/table';
import {
  applyColumnConfig,
  applyLeafWidthOverrides,
  clearColumnWidthAtPath,
  clampColumnWidth,
  columnsLeafPathSignature,
  COLUMN_RESIZE_MAX_WIDTH,
  COLUMN_RESIZE_MIN_WIDTH,
  configHasLeafWidths,
  copyColumnWidths,
  setColumnWidthAtPath,
} from '../columnConfigUtils';
import type { TableColumnConfigItem } from '../columnConfigTypes';

describe('clampColumnWidth', () => {
  it('clamps below min and above max', () => {
    expect(clampColumnWidth(10)).toBe(COLUMN_RESIZE_MIN_WIDTH);
    expect(clampColumnWidth(999)).toBe(COLUMN_RESIZE_MAX_WIDTH);
    expect(clampColumnWidth(120)).toBe(120);
  });

  it('respects custom min/max', () => {
    expect(clampColumnWidth(10, 80, 200)).toBe(80);
    expect(clampColumnWidth(300, 80, 200)).toBe(200);
  });
});

describe('setColumnWidthAtPath / clearColumnWidthAtPath', () => {
  const tree: TableColumnConfigItem[] = [
    { id: 'factory' },
    {
      id: 'TGCV',
      children: [{ id: 'finished' }, { id: 'semi' }],
    },
  ];

  it('sets leaf width and clamps', () => {
    const next = setColumnWidthAtPath(tree, ['TGCV', 'finished'], 999);
    expect(next[1]?.children?.[0]).toEqual({ id: 'finished', width: COLUMN_RESIZE_MAX_WIDTH });
    expect(next[1]?.children?.[1]).toEqual({ id: 'semi' });
  });

  it('clears leaf width', () => {
    const withW = setColumnWidthAtPath(tree, ['factory'], 160);
    const cleared = clearColumnWidthAtPath(withW, ['factory']);
    expect(cleared[0]).toEqual({ id: 'factory' });
    expect('width' in (cleared[0] || {})).toBe(false);
  });
});

describe('applyColumnConfig width', () => {
  const columns: ColumnsType<Record<string, unknown>> = [
    { title: '分厂', key: 'factory', dataIndex: 'factory', width: 100 },
    { title: '品种', key: 'name', dataIndex: 'name' },
  ];

  it('applies prefs width with clamp on read', () => {
    const config: TableColumnConfigItem[] = [
      { id: 'factory', width: 999 },
      { id: 'name', width: 10 },
    ];
    const next = applyColumnConfig(columns, config);
    expect(next[0]?.width).toBe(COLUMN_RESIZE_MAX_WIDTH);
    expect(next[1]?.width).toBe(COLUMN_RESIZE_MIN_WIDTH);
  });
});

describe('applyLeafWidthOverrides / copyColumnWidths', () => {
  it('overrides leaf by path', () => {
    const columns: ColumnsType<Record<string, unknown>> = [
      {
        title: '组',
        key: 'TGCV',
        children: [
          { title: '成品', key: 'TGCV_finished', dataIndex: 'finished', width: 72 },
          { title: '半制品', key: 'TGCV_semi', dataIndex: 'semi', width: 72 },
        ],
      },
    ];
    const next = applyLeafWidthOverrides(columns, { 'TGCV/finished': 200 });
    const kids = next[0]?.children as ColumnsType<Record<string, unknown>>;
    expect(kids[0]?.width).toBe(200);
    expect(kids[1]?.width).toBe(72);
  });

  it('copyColumnWidths preserves widths across panel confirm shape', () => {
    const prev: TableColumnConfigItem[] = [
      { id: 'factory', width: 140 },
      { id: 'name', hidden: true },
    ];
    const fromPanel: TableColumnConfigItem[] = [{ id: 'name' }, { id: 'factory' }];
    const merged = copyColumnWidths(fromPanel, prev);
    expect(merged.find((c) => c.id === 'factory')?.width).toBe(140);
    expect(merged.find((c) => c.id === 'name')?.width).toBeUndefined();
  });
});

describe('lock siblings / spacer gate', () => {
  it('configHasLeafWidths detects any leaf width', () => {
    expect(configHasLeafWidths([{ id: 'a' }])).toBe(false);
    expect(configHasLeafWidths([{ id: 'a', width: 120 }])).toBe(true);
    expect(configHasLeafWidths([{ id: 'g', children: [{ id: 'leaf', width: 80 }] }])).toBe(true);
  });

  it('mouseup batch set keeps sibling widths independent', () => {
    let cols: TableColumnConfigItem[] = [{ id: 'factory' }, { id: 'name' }, { id: 'status' }];
    const snapshot = { factory: 120, name: 200, status: 80 };
    for (const [id, w] of Object.entries(snapshot)) {
      cols = setColumnWidthAtPath(cols, [id], w);
    }
    expect(cols).toEqual([
      { id: 'factory', width: 120 },
      { id: 'name', width: 200 },
      { id: 'status', width: 80 },
    ]);
    expect(configHasLeafWidths(cols)).toBe(true);
  });

  it('applyLeafWidthOverrides locks multiple paths without clobber', () => {
    const columns: ColumnsType<Record<string, unknown>> = [
      { title: '分厂', key: 'factory', dataIndex: 'factory', width: 100 },
      { title: '品种', key: 'name', dataIndex: 'name' },
      { title: '状态', key: 'status', dataIndex: 'status', width: 80 },
    ];
    const next = applyLeafWidthOverrides(columns, {
      factory: 140,
      name: 220,
      status: 80,
    });
    expect(next[0]?.width).toBe(140);
    expect(next[1]?.width).toBe(220);
    expect(next[2]?.width).toBe(80);
  });

  it('columnsLeafPathSignature changes with leaf structure', () => {
    const a: ColumnsType<Record<string, unknown>> = [
      { key: 'factory', dataIndex: 'factory' },
      { key: 'name', dataIndex: 'name' },
    ];
    const b: ColumnsType<Record<string, unknown>> = [
      { key: 'factory', dataIndex: 'factory' },
      { key: 'status', dataIndex: 'status' },
    ];
    expect(columnsLeafPathSignature(a)).toBe('factory\0name');
    expect(columnsLeafPathSignature(b)).toBe('factory\0status');
    expect(columnsLeafPathSignature(a)).not.toBe(columnsLeafPathSignature(b));
  });
});
