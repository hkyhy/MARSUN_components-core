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
  /**
   * 右侧扩展区（如站内信铃铛）；在 Dropdown 触发器之外，
   * 点击不会打开用户菜单。不传则不展示扩展区。
   */
  extra?: React.ReactNode;
  className?: string;
};

/**
 * 侧栏底部用户卡片：主区域点击向上展开菜单（默认退出登录）；
 * 可选 `extra` 槽承载独立操作（如站内信），与主区同处视觉壳内。
 * 纯 UI；是否挂载由业务根据登录态决定。
 */
const UserProfileCard: React.FC<UserProfileCardProps> = ({
  name,
  sub,
  avatarText,
  collapsed = false,
  menuItems,
  onLogout,
  extra,
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

  const trigger = (
    <button
      type="button"
      className={classNames(
        styles['user-profile-card'],
        collapsed && styles['user-profile-card--collapsed'],
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

  const main =
    items && items.length > 0 ? (
      <Dropdown menu={{ items }} trigger={['click']} placement="topLeft">
        {trigger}
      </Dropdown>
    ) : (
      trigger
    );

  return (
    <div
      className={classNames(
        styles['user-profile-wrap'],
        collapsed && styles['user-profile-wrap--collapsed'],
      )}
    >
      <div
        className={classNames(
          styles['user-profile-shell'],
          collapsed && styles['user-profile-shell--collapsed'],
          Boolean(extra) && styles['user-profile-shell--with-extra'],
          className,
        )}
      >
        <div
          className={classNames(
            styles['user-profile-row'],
            collapsed && styles['user-profile-row--collapsed'],
          )}
        >
          <div className={styles['user-profile-main']}>{main}</div>
          {extra ? (
            <div
              className={styles['user-profile-extra']}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              {extra}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;
