import {
  emitFixtureByEventKey,
  listFixtureEvents,
  resetMsgCenterFixture,
} from '@/components/Tools/MessageCenter/doc/msgCenter.fixture';
import { Button, Select, Space, Typography } from 'antd';
import React, { useState } from 'react';

resetMsgCenterFixture();

/** 3. emit / dryRun 预览 */
const EmitDryRunDemo: React.FC = () => {
  const [eventKey, setEventKey] = useState('energy.gap');
  const [preview, setPreview] = useState('');

  const run = (dryRun: boolean) => {
    try {
      const r = emitFixtureByEventKey(
        eventKey,
        { bizDate: '2026-09-16', count: '3', machineId: 'M-01' },
        { dryRun },
      );
      setPreview(
        JSON.stringify(
          {
            dryRun: r.dryRun,
            title: r.title,
            summary: r.summary,
            href: r.href,
            recipientCount: r.recipientCount,
            persisted: !r.dryRun,
          },
          null,
          2,
        ),
      );
    } catch (e) {
      setPreview(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
      <Select
        style={{ width: 280 }}
        value={eventKey}
        options={listFixtureEvents().map((e) => ({
          value: e.eventKey,
          label: e.label,
        }))}
        onChange={setEventKey}
      />
      <Space>
        <Button type="primary" onClick={() => run(true)}>
          dryRun 预览
        </Button>
        <Button
          onClick={() => run(false)}
          disabled={eventKey === 'maintenance.overdue'}
          title={
            eventKey === 'maintenance.overdue'
              ? '该事件种子模板默认停用，请先在「模板 CRUD」启用'
              : undefined
          }
        >
          emit 写入 inbox
        </Button>
      </Space>
      <Typography.Paragraph>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{preview || '点击上方按钮'}</pre>
      </Typography.Paragraph>
    </Space>
  );
};

export default EmitDryRunDemo;
