import { LogOut } from '../../Icons';
import { Avatar, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import classNames from 'classnames';
import React, { useMemo } from 'react';
import styles from './style.module.scss';

export type UserProfileCardProps = {
  /** 主文案（姓名 / 展示名） */
  name: string;
  /** 副文案（邮箱 / 工号等） */
  sub?: string;
  /** 头像文字，默认 name 首字 */
  avatarText?: string;
  /** 侧栏折叠时仅显示头像 */
  collapsed?: boolean;
  /** 自定义下拉菜单；不传则在提供 onLogout 时生成「退出登录」 */
  menuItems?: MenuProps['items'];
  /** 点击默认「退出登录」时回调 */
  onLogout?: () => void;
  className?: string;
};

/**
 * 侧栏底部用户卡片：整卡点击向上展开菜单（默认退出登录）。
 * 纯 UI；是否挂载由业务根据登录态决定。
 */
const UserProfileCard: React.FC<UserProfileCardProps> = ({
  name,
  sub,
  avatarText,
  collapsed = false,
  menuItems,
  onLogout,
  className,
}) => {
  const initial = (avatarText || name).trim().charAt(0).toUpperCase() || 'U';

  const items = useMemo<MenuProps['items']>(() => {
    if (menuItems) return menuItems;
    if (!onLogout) return [];
    return [
      {
        key: 'logout',
        danger: true,
        label: '退出登录',
        icon: <LogOut size={14} />,
        onClick: onLogout,
      },
    ];
  }, [menuItems, onLogout]);

  const card = (
    <button
      type="button"
      className={classNames(
        styles['user-profile-card'],
        collapsed && styles['user-profile-card--collapsed'],
        className,
      )}
      aria-label="用户菜单"
    >
      <Avatar className={styles['user-profile-avatar']} size={collapsed ? 32 : 40}>
        {initial}
      </Avatar>
      {!collapsed ? (
        <div className={styles['user-profile-meta']}>
          <div className={styles['user-profile-name']} title={name}>
            {name}
          </div>
          {sub ? (
            <div className={styles['user-profile-sub']} title={sub}>
              {sub}
            </div>
          ) : null}
        </div>
      ) : null}
    </button>
  );

  return (
    <div
      className={classNames(
        styles['user-profile-wrap'],
        collapsed && styles['user-profile-wrap--collapsed'],
      )}
    >
      {items && items.length > 0 ? (
        <Dropdown menu={{ items }} trigger={['click']} placement="topLeft">
          {card}
        </Dropdown>
      ) : (
        card
      )}
    </div>
  );
};

export default UserProfileCard;
