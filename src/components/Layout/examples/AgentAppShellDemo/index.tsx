import { AgentAppShell } from '@/components/Layout';
import { UserProfileCard } from '@/components/Auth';
import { CircleAlert, LayoutGrid } from '@/components/Icons';
import { Button } from 'antd';
import React, { useState } from 'react';
import styles from './style.module.scss';

/** AgentAppShell：侧栏 + 顶栏纯 UI 壳 */
const AgentAppShellDemo: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [log, setLog] = useState('');

  return (
    <div className={styles['agent-app-shell-demo']}>
      <AgentAppShell
        brandTitle="质量管理"
        brandMark="Q"
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((v) => !v)}
        selectedKeys={['/alerts']}
        menuItems={[
          {
            type: 'group',
            label: '质量分析',
            children: [
              { key: '/alerts', icon: <CircleAlert size={18} />, label: '质量预警' },
              { key: '/sandbox', icon: <LayoutGrid size={18} />, label: '质量分析' },
            ],
          },
        ]}
        siderFooter={
          <UserProfileCard
            collapsed={collapsed}
            name="Demo User"
            sub="demo@marsun.local"
            onLogout={() => setLog('logout')}
          />
        }
        headerTitle="质量预警"
        headerDescription="Agent 业务壳示例"
        headerActions={<Button type="primary">刷新</Button>}
      >
        <div className={styles['agent-app-shell-demo-body']}>主内容区{log ? ` · ${log}` : ''}</div>
      </AgentAppShell>
    </div>
  );
};

export default AgentAppShellDemo;
