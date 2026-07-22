import { UserProfileCard } from '@/components/Auth';
import { Button, Space } from 'antd';
import React, { useState } from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

/** UserProfileCard 侧栏用户卡片示例 */
const UserProfileCardDemo: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [log, setLog] = useState('');

  return (
    <div className={classNames('user-profile-card-demo', styles['user-profile-card-demo'])}>
      <Space style={{ marginBottom: 12 }}>
        <Button size="small" onClick={() => setCollapsed((v) => !v)}>
          {collapsed ? '展开侧栏' : '折叠侧栏'}
        </Button>
        {log ? <span className={styles['user-profile-card-demo-log']}>{log}</span> : null}
      </Space>
      <div
        className={classNames(
          styles['user-profile-card-demo-sider'],
          collapsed && styles['user-profile-card-demo-sider--collapsed'],
        )}
      >
        <div className={styles['user-profile-card-demo-menu']}>菜单区域</div>
        <UserProfileCard
          collapsed={collapsed}
          name="Jhon Doe"
          sub="hello.jhon@mail.com"
          onLogout={() => setLog('已触发退出登录')}
        />
      </div>
    </div>
  );
};

export default UserProfileCardDemo;
