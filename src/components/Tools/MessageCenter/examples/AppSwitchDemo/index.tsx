import { Space, Typography } from 'antd';
import React, { useCallback, useState } from 'react';
import { MsgCenterAppSwitcher } from '../MsgCenterAppSwitcher';
import { getMsgCenterAppKey } from '../msgCenterAppSwitch';
import { useMsgCenterAppKey } from '../useMsgCenterAppKey';

/**
 * Phase B：双权用户可见切换器；单权返回 null（PB-01）。
 * 展示名取自传入 apps 的 name（模拟 SSO SystemApp.name）。
 */
const AppSwitchDemo: React.FC = () => {
  const fallback = 'equipment-agent';
  const appKey = useMsgCenterAppKey(fallback);
  const [log, setLog] = useState('');

  const listAuthorizedSystemApps = useCallback(async () => {
    // 模拟「仅有权」子集：双 App；非全量 Agent
    return [
      { code: 'equipment-agent', name: '设备管理 Agent' },
      { code: 's3-agent', name: '质量分析 Agent' },
    ];
  }, []);

  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
        Hub 挂载 MsgCenterAppSwitcher；sessionStorage 键 marsun.msgCenter.currentAppKey。当前解析：
        <Typography.Text code>{appKey || getMsgCenterAppKey(fallback)}</Typography.Text>
      </Typography.Paragraph>
      <MsgCenterAppSwitcher
        fallbackAppKey={fallback}
        listAuthorizedSystemApps={listAuthorizedSystemApps}
        onAppKeyChange={(k) => setLog(`switched → ${k}`)}
      />
      {log ? <Typography.Text type="success">{log}</Typography.Text> : null}
    </Space>
  );
};

export default AppSwitchDemo;
