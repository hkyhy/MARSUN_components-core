import {
  ActionFollowModal,
  CancelExecutionModal,
  sanitizeActionHtml,
} from '@/components/Tools/ActionTracking';
import { TextArea } from '@/components/FormInfo';
import { Button, message, Segmented, Space, Typography } from 'antd';
import React, { useMemo, useState } from 'react';
import { ACTION_FOLLOW_RAW_HTML } from '@/components/Tools/ActionTracking/doc/actionTracking.fixture';

type View = 'follow' | 'review' | 'cancelled';

/** 4. 跟进 / 取消 + F3 HTML 消毒对照 */
const FollowCancelDemo: React.FC = () => {
  const [view, setView] = useState<View>('follow');
  const [followOpen, setFollowOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const safeHtml = useMemo(() => sanitizeActionHtml(ACTION_FOLLOW_RAW_HTML), []);

  const summarySlot = (
    <div>
      <Typography.Text strong>摘要（已消毒）</Typography.Text>
      <div
        style={{
          marginTop: 8,
          padding: 12,
          background: 'var(--ant-color-fill-quaternary, #f5f5f5)',
          borderRadius: 6,
        }}
        // F3：仅消毒后 HTML
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
      <Typography.Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0 }} copyable>
        原始（含危险标签，勿直接渲染）：{ACTION_FOLLOW_RAW_HTML}
      </Typography.Paragraph>
    </div>
  );

  return (
    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
      <Segmented
        value={view}
        options={[
          { label: '跟进', value: 'follow' },
          { label: '复核', value: 'review' },
          { label: '已取消', value: 'cancelled' },
        ]}
        onChange={(v) => setView(v as View)}
      />
      <Space wrap>
        <Button type="primary" onClick={() => setFollowOpen(true)}>
          打开跟进弹层
        </Button>
        <Button danger onClick={() => setCancelOpen(true)}>
          打开取消执行
        </Button>
      </Space>

      <ActionFollowModal
        open={followOpen}
        title="跟进 · 五分厂用能缺口排查"
        onClose={() => setFollowOpen(false)}
        view={view}
        summarySlot={summarySlot}
        formSlot={
          view !== 'cancelled' ? (
            <TextArea
              name="note"
              label="跟进说明"
              rule="REQ"
              rows={3}
              block
              placeholder="填写进展"
            />
          ) : undefined
        }
        onSubmit={async (_values, mode) => {
          message.success(mode === 'complete' ? '已完成（fixture）' : '已跟进（fixture）');
          setFollowOpen(false);
        }}
      />

      <CancelExecutionModal
        open={cancelOpen}
        onCancel={() => setCancelOpen(false)}
        onSubmit={async (reason) => {
          message.success(`已取消：${reason}`);
          setCancelOpen(false);
        }}
      />
    </Space>
  );
};

export default FollowCancelDemo;
