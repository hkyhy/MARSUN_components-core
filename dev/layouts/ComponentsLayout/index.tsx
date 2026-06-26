import { VirtualScrollbar } from '@/components/VirtualScrollbar';
import { Layout, Menu } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MENU_ITEMS } from '../menu-config';
import styles from './style.module.scss';

const { Sider } = Layout;

const ComponentsLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const defaultOpenKeys = location.pathname.startsWith('/components/agenthub')
    ? ['agenthub']
    : [];

  return (
    <div className={classNames('components-layout-root', styles['components-layout-root'])}>
      <Sider width={240} theme="light" className={styles['components-layout-container']}>
        <VirtualScrollbar wrapperClassName={styles['components-layout-wrapper']}>
          <div className={styles['components-layout-inner']}>
            <div className={styles['components-layout-header']}>@marsun/components-core</div>
            <div className={styles['components-layout-body']}>src/components/</div>
          </div>
          <div className={styles['components-layout-footer']} />
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultOpenKeys={defaultOpenKeys}
            items={MENU_ITEMS}
            onClick={({ key }) => navigate(String(key))}
            className={styles['components-layout-row']}
          />
        </VirtualScrollbar>
      </Sider>
      <VirtualScrollbar wrapperClassName={styles['components-layout-col']}>
        <div className={styles['components-layout-wrap']}>
          <div className={styles['components-layout-panel']}>
            <Outlet />
          </div>
        </div>
      </VirtualScrollbar>
    </div>
  );
};

export default ComponentsLayout;
