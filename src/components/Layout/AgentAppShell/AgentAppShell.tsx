import { PanelLeftClose, PanelLeftOpen } from '../../Icons';
import { VirtualScrollbar } from '../../VirtualScrollbar';
import { Button, Layout, Menu } from 'antd';
import classNames from 'classnames';
import React from 'react';
import styles from './style.module.scss';

const { Header, Sider } = Layout;

/** 菜单项：宽松 any，避免业务仓与 core 双份 antd 类型冲突 */
export type AgentAppShellMenuItems = any;

export type AgentAppShellProps = {
  /** 侧栏品牌标题 */
  brandTitle: string;
  /** 侧栏品牌图标（默认字母徽章用 brandMark） */
  brandLogo?: React.ReactNode;
  /** 无 brandLogo 时显示的单字/短文案徽章 */
  brandMark?: string;
  /** 侧栏菜单（antd Menu items） */
  menuItems: AgentAppShellMenuItems;
  selectedKeys?: string[];
  onMenuClick?: (info: { key: string }) => void;
  /** 侧栏是否折叠 */
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  /** 侧栏宽度（展开） */
  siderWidth?: number;
  /** 侧栏底部（如 UserProfileCard） */
  siderFooter?: React.ReactNode;
  /** 顶栏标题 */
  headerTitle?: React.ReactNode;
  /** 顶栏描述 */
  headerDescription?: React.ReactNode;
  /** 顶栏右侧操作 */
  headerActions?: React.ReactNode;
  /** 主内容区滚动后顶栏毛玻璃 */
  headerScrolled?: boolean;
  /** 主内容 */
  children: React.ReactNode;
  className?: string;
  /** 根节点额外 class（兼容业务全局选择器） */
  frameClassName?: string;
  siderClassName?: string;
  mainClassName?: string;
};

/**
 * Agent 业务壳：左 sider（品牌 + 菜单 + 底部槽）+ 右主区（顶栏 + children）。
 * 纯 UI；菜单数据、鉴权、路由由业务注入。
 */
const AgentAppShell: React.FC<AgentAppShellProps> = ({
  brandTitle,
  brandLogo,
  brandMark = 'A',
  menuItems,
  selectedKeys,
  onMenuClick,
  collapsed = false,
  onToggleCollapsed,
  siderWidth = 240,
  siderFooter,
  headerTitle,
  headerDescription,
  headerActions,
  headerScrolled = false,
  children,
  className,
  frameClassName,
  siderClassName,
  mainClassName,
}) => {
  const mark = brandMark.trim().charAt(0).toUpperCase() || 'A';

  return (
    <div className={classNames('agent-app-shell', styles['agent-app-shell'], className)}>
      <div className={classNames('agent-app-frame', styles['agent-app-frame'], frameClassName)}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={siderWidth}
          className={classNames('agent-app-sider', styles['agent-app-sider'], siderClassName)}
        >
          <VirtualScrollbar
            wrapperClassName={classNames('agent-sider-scroll', styles['agent-sider-scroll'])}
          >
            <div className={classNames('agent-sider-brand', styles['agent-sider-brand'])}>
              {brandLogo ?? <span className={styles['agent-sider-logo']}>{mark}</span>}
              {!collapsed ? <h1 className={styles['agent-sider-title']}>{brandTitle}</h1> : null}
            </div>
            <Menu
              mode="inline"
              inlineCollapsed={collapsed}
              selectedKeys={selectedKeys}
              items={menuItems as React.ComponentProps<typeof Menu>['items']}
              onClick={onMenuClick as React.ComponentProps<typeof Menu>['onClick']}
              className={classNames('agent-app-menu', styles['agent-app-menu'])}
            />
          </VirtualScrollbar>
          {siderFooter}
        </Sider>

        <div className={classNames('agent-app-main', styles['agent-app-main'], mainClassName)}>
          <Header
            className={classNames(
              styles['agent-page-topbar'],
              headerScrolled && styles['agent-page-topbar--scrolled'],
              headerDescription ? styles['agent-page-topbar--with-description'] : undefined,
            )}
          >
            <div className={styles['agent-page-topbar-leading']}>
              {onToggleCollapsed ? (
                <Button
                  type="text"
                  className={styles['agent-sider-toggle-btn']}
                  icon={collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                  onClick={onToggleCollapsed}
                  aria-label={collapsed ? '展开侧栏' : '收起侧栏'}
                />
              ) : null}
              {headerTitle ? (
                <div className={styles['agent-page-topbar-meta']}>
                  <h1 className={styles['agent-page-topbar-title']}>{headerTitle}</h1>
                  {headerDescription ? (
                    <p className={styles['agent-page-topbar-description']}>{headerDescription}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
            {headerActions ? (
              <div className={styles['agent-page-topbar-actions']}>{headerActions}</div>
            ) : null}
          </Header>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AgentAppShell;
