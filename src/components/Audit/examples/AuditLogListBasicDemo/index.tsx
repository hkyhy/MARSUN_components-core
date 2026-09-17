import { AuditEventDetailView, AuditLogList } from '../../AuditLogList';
import type { AuditEventDetail, AuditEventListItem } from '../../types';
import { Space, Typography } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

const mockRows: AuditEventListItem[] = [
  {
    id: 'demo-1',
    tenantId: 't-demo',
    systemAppId: 'equipment-agent',
    traceId: 'trace-demo-1',
    actorName: '示例管理员',
    action: 'alertClaim',
    actionLabel: '认领告警',
    summary: '认领用能告警（showcase）',
    status: 'success',
    httpMethod: 'POST',
    path: '/api/v1/agents/x/energy-management/alertClaim',
    durationMs: 42,
    hasSteps: true,
    createdAt: dayjs().subtract(1, 'hour').toISOString(),
  },
];

const mockDetail: AuditEventDetail = {
  ...mockRows[0]!,
  requestCurl: "curl -X POST 'http://example' -H 'Authorization: ***REDACTED***'",
  steps: [
    {
      seq: 1,
      stepType: 'REQUEST',
      title: '请求进入',
      status: 'finish',
      input: { alertId: 'a1' },
    },
    {
      seq: 2,
      stepType: 'SQL',
      title: '更新处置表',
      status: 'finish',
      sqlText: 'UPDATE s4_alert SET status=? WHERE id=?',
      tables: ['s4_alert'],
    },
    {
      seq: 3,
      stepType: 'RESPONSE',
      title: '响应完成',
      status: 'finish',
      output: {
        httpStatus: 200,
        body: '{"code":0,"data":{"pageData":[{"factoryCode":"1600","machineNo":"细纱001"}…[truncated]',
      },
    },
  ],
};

/**
 * AuditLogList 列表点行 → DetailView（showcase 假数据；业务页禁止 mock 兜底）
 */
const AuditLogListBasicDemo: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <div>
        <Typography.Title level={5}>App 模式（点击行看详情）</Typography.Title>
        <AuditLogList mode="app" dataSource={mockRows} onRowClick={(r) => setSelected(r.id)} />
        {selected ? (
          <div style={{ marginTop: 16 }}>
            <Typography.Title level={5}>详情</Typography.Title>
            <AuditEventDetailView detail={mockDetail} />
          </div>
        ) : null}
      </div>
      <div>
        <Typography.Title level={5}>平台模式（含系统列）</Typography.Title>
        <AuditLogList mode="platform" dataSource={mockRows} />
      </div>
    </Space>
  );
};

export default AuditLogListBasicDemo;
