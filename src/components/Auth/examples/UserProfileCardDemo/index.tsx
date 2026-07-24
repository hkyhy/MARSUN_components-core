import { UserProfileCard } from '@/components/Auth';
import { Badge, Button, Space, Switch } from 'antd';
import { Bell } from 'lucide-react';
import React, { useState } from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

/** UserProfileCard 侧栏用户卡片示例（含 extra 站内信占位 + 开关） */
const UserProfileCardDemo: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showInbox, setShowInbox] = useState(true);
  const [log, setLog] = useState('');

  return (
    <div className={classNames('user-profile-card-demo', styles['user-profile-card-demo'])}>
      <Space style={{ marginBottom: 12 }} wrap>
        <Button size="small" onClick={() => setCollapsed((v) => !v)}>
          {collapsed ? '展开侧栏' : '折叠侧栏'}
        </Button>
        <Space size={8}>
          <span className={styles['user-profile-card-demo-log']}>展示站内信</span>
          <Switch size="small" checked={showInbox} onChange={setShowInbox} />
        </Space>
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
          extra={
            showInbox ? (
              <div className={styles['user-profile-card-demo-inbox-wrap']}>
                <Badge count={3} size="small" offset={[-6, 2]}>
                  <Button
                    type="text"
                    className={styles['user-profile-card-demo-inbox-btn']}
                    icon={<Bell size={16} aria-hidden />}
                    aria-label="站内信，3 条未读"
                    onClick={() => setLog('已打开站内信')}
                  />
                </Badge>
              </div>
            ) : undefined
          }
        />
      </div>
    </div>
  );
};

export default UserProfileCardDemo;
