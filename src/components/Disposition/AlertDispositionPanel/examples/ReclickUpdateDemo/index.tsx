import {
  AlertDispositionPanel,
  DispositionBar,
  SemanticTag,
  buildDispositionAlertContext,
} from '@/components';
import type { DispositionAlertContext, DispositionAlertLevelCatalog } from '@/components';
import { Button, Space } from 'antd';
import React, { useMemo, useState } from 'react';

/** 可替换的项目目录示例 */
const CATALOG: DispositionAlertLevelCatalog = [
  { key: 'L1', label: '一级提示', tone: '#1677ff', kind: 'info' },
  { key: 'L2', label: '二级预警', tone: '#faad14', kind: 'warn' },
  { key: 'L3', label: '三级严重', tone: '#ef4444', kind: 'critical' },
  { key: 'overdue', label: '保养超期', tone: '#f97316' },
];

const ReclickUpdateDemo: React.FC = () => {
  const [open, setOpen] = useState(true);
  const [key, setKey] = useState('L2');
  const ctx: DispositionAlertContext | null = useMemo(
    () =>
      buildDispositionAlertContext(CATALOG, key, {
        date: '2026-09-11',
        detail: `来自目录 ${key}`,
      }),
    [key],
  );

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space wrap>
        {CATALOG.map((lv) => (
          <SemanticTag
            key={lv.key}
            color={lv.tone}
            selected={lv.key === key}
            onClick={() => {
              setKey(lv.key);
              setOpen(true);
            }}
            style={{ cursor: 'pointer' }}
          >
            {lv.label}
          </SemanticTag>
        ))}
      </Space>
      <AlertDispositionPanel open={open} context={ctx} onCollapse={() => setOpen(false)}>
        <DispositionBar
          statusBadge="跟进中"
          actions={
            <>
              <Button size="small">跟进</Button>
              <Button size="small">关闭</Button>
            </>
          }
        />
      </AlertDispositionPanel>
    </Space>
  );
};

export default ReclickUpdateDemo;
