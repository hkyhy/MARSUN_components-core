import {
  CreateActionModal,
  type CreateActionSubmitPayload,
} from '@/components/Tools/ActionTracking';
import { Button, message, Segmented, Space, Typography } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ACTION_DIMENSIONS,
  createActionLoadersFromFixture,
} from '@/components/Tools/ActionTracking/doc/actionTracking.fixture';

type Mode = 'create' | 'createNone' | 'dispatch';

/** 2. 建单 / 下发（lockedContext + scopeMode=none + F4 placeholder） */
const CreateActionDemo: React.FC = () => {
  const [mode, setMode] = useState<Mode>('create');
  const [open, setOpen] = useState(false);
  const [lastPayload, setLastPayload] = useState<string>('');
  const loaders = useMemo(() => createActionLoadersFromFixture(), []);

  const onSubmit = useCallback(
    async (payload: CreateActionSubmitPayload) => {
      setLastPayload(JSON.stringify(payload, null, 2));
      message.success(`${mode === 'dispatch' ? '下发' : '创建'}成功（fixture）`);
      return `demo-${Date.now()}`;
    },
    [mode],
  );

  const openLabel = mode === 'dispatch' ? '下发' : mode === 'createNone' ? '新建(none)' : '新建';

  return (
    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
      <Segmented
        value={mode}
        options={[
          { label: '主动新建(form)', value: 'create' },
          { label: '主动新建(none)', value: 'createNone' },
          { label: '预警下发', value: 'dispatch' },
        ]}
        onChange={(v) => setMode(v as Mode)}
      />
      <Button type="primary" onClick={() => setOpen(true)}>
        打开 {openLabel} 弹窗
      </Button>
      <CreateActionModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={() => setOpen(false)}
        variant={mode === 'dispatch' ? 'dispatch' : 'create'}
        scopeMode={mode === 'createNone' ? 'none' : undefined}
        noneScopeHint={mode === 'createNone' ? '业务上下文请从用能/保养/专件下发' : undefined}
        dimensionOptions={ACTION_DIMENSIONS}
        loaders={loaders}
        titlePlaceholder="排查用能 EI 偏高"
        metricPlaceholder="例如：EI"
        lockedContext={
          mode === 'dispatch'
            ? [
                { label: '分厂', value: '五分厂' },
                { label: '机台', value: 'A01' },
                { label: '指标', value: 'EI' },
              ]
            : undefined
        }
        prefill={
          mode === 'dispatch' ? { title: '用能缺口巡检 · A01', dimension: 'process' } : undefined
        }
        onSubmit={onSubmit}
      />
      {lastPayload ? (
        <div>
          <Typography.Text type="secondary">最近提交 payload</Typography.Text>
          <pre style={{ marginTop: 8, fontSize: 12, maxHeight: 240, overflow: 'auto' }}>
            {lastPayload}
          </pre>
        </div>
      ) : null}
    </Space>
  );
};

export default CreateActionDemo;
