import type { ColumnsType } from 'antd/es/table';
import { Button, Switch } from 'antd';
import type { MessageTemplateAdminItem } from '../types';

const TYPE_LABELS: Record<string, string> = {
  alert: '预警消息',
  action: '行动跟踪',
  remind: '任务提醒',
};

export function buildTemplateColumns(opts: {
  canWrite: boolean;
  eventLabel: (eventKey?: string) => string;
  onEdit: (row: MessageTemplateAdminItem) => void;
  onToggleEnabled: (row: MessageTemplateAdminItem, enabled: boolean) => void;
}): ColumnsType<MessageTemplateAdminItem> {
  const { canWrite, eventLabel, onEdit, onToggleEnabled } = opts;
  return [
    {
      title: '编号',
      dataIndex: 'code',
      width: 150,
      render: (v: string) => <code>{v || '—'}</code>,
    },
    {
      title: '场景',
      key: 'scenario',
      render: (_, r) => r.scenario || r.label || '—',
    },
    {
      title: '事件',
      key: 'event',
      width: 160,
      render: (_, r) => eventLabel(r.eventKey),
    },
    {
      title: '类型',
      width: 100,
      render: (_, r) => TYPE_LABELS[r.messageType || ''] || r.messageType || '—',
    },
    {
      title: '启用',
      width: 90,
      render: (_, r) => (
        <Switch
          size="small"
          checked={r.enabled !== false}
          disabled={!canWrite}
          onChange={(checked) => onToggleEnabled(r, checked)}
        />
      ),
    },
    {
      title: '操作',
      width: 100,
      render: (_, r) => (
        <Button type="link" size="small" disabled={!canWrite} onClick={() => onEdit(r)}>
          编辑
        </Button>
      ),
    },
  ];
}
