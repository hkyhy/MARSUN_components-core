import { ActionTrackingShell } from '@/components/Tools/ActionTracking';
import { PageShellProvider } from '@/components/Layout/PageShell';
import { Segmented, Space, Typography } from 'antd';
import React, { useState } from 'react';

/** 5. EP 注入：canCreate 控制是否传入新建 actions（core 不硬编码权限码） */
const PermissionsDemo: React.FC = () => {
  const [canCreate, setCanCreate] = useState(true);

  return (
    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
      <Segmented
        value={canCreate ? 'write' : 'readonly'}
        options={[
          { label: '可写（注入新建）', value: 'write' },
          { label: '只读（不传 actions）', value: 'readonly' },
        ]}
        onChange={(v) => setCanCreate(v === 'write')}
      />
      <Typography.Text type="secondary">
        业务页：`can(PERMISSIONS.xxx) ? actions : undefined`；Showcase 用开关模拟。
      </Typography.Text>
      <PageShellProvider>
        <ActionTrackingShell
          title="行动跟踪"
          description={canCreate ? '当前可新建' : '当前只读'}
          syncPageMeta={false}
          fillHeight={false}
          actions={
            canCreate
              ? [
                  {
                    key: 'create',
                    children: '新建任务',
                    type: 'primary',
                    onClick: () => undefined,
                  },
                ]
              : undefined
          }
          listSlot={
            <div style={{ padding: 16, color: 'var(--ant-color-text-secondary)' }}>
              listSlot 占位（权限只影响顶栏 actions）
            </div>
          }
        />
      </PageShellProvider>
    </Space>
  );
};

export default PermissionsDemo;
