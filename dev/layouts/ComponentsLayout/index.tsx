import { VirtualScrollbar } from '@/components/VirtualScrollbar';
import { ChevronLeft, ChevronRight } from '@/components/Icons';
import { Layout, Menu } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MENU_ITEMS } from '../menu-config';
import styles from './style.module.scss';

const { Sider } = Layout;

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 0;

const ComponentsLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const defaultOpenKeys = location.pathname.startsWith('/components/agenthub') ? ['agenthub'] : [];

  return (
    <div className={classNames('components-layout-root', styles['components-layout-root'])}>
      <Sider
        width={SIDEBAR_WIDTH}
        collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
        collapsed={collapsed}
        collapsible
        trigger={null}
        theme="light"
        className={styles['components-layout-container']}
      >
        <VirtualScrollbar wrapperClassName={styles['components-layout-wrapper']}>
          <div className={styles['components-layout-inner']}>
            <div className={styles['components-layout-header']}>@hkyhy/marsun-components-core</div>
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
      <button
        type="button"
        className={classNames(
          styles['components-layout-toggle'],
          collapsed && styles['components-layout-toggle--collapsed'],
        )}
        onClick={() => setCollapsed((prev) => !prev)}
        aria-label={collapsed ? '展开侧边栏' : '折叠侧边栏'}
        aria-expanded={!collapsed}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
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
