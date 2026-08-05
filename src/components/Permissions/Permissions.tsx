import { useMarsunAuth } from '@/provider';
import { Result, Tooltip } from 'antd';
import classNames from 'classnames';
import { createElement, type FC, type ReactNode } from 'react';
import styles from './style.module.scss';

export type PermissionsType = 'hidden' | 'tooltip' | 'error';

/** 权限请求：字符串数组（OR）、或自定义判定函数 */
export type PermissionRequest = string[] | ((permissions: string[]) => boolean) | (() => boolean);

export type PermissionsRenderProps = {
  isPass: boolean;
  type: PermissionsType;
  request?: PermissionRequest;
};

export type PermissionsProps = {
  /** 无权限呈现：hidden 隐藏 / tooltip 可看见但不可操作 / error 展示 403 */
  type?: PermissionsType;
  /** 包裹标签，同 React.createElement 的 type，默认 span */
  tagName?: keyof HTMLElementTagNameMap | string;
  /** 无权限提示文案 */
  message?: string;
  /** 所需权限；数组为 OR；空/未传视为通过 */
  request?: PermissionRequest;
  className?: string;
  children?: ReactNode | ((props: PermissionsRenderProps) => ReactNode);
} & Record<string, unknown>;

export function computedIsPass({
  permissions,
  request,
}: {
  permissions?: string[];
  request?: PermissionRequest;
}): boolean {
  if (typeof request === 'function') {
    return Boolean((request as (permissions: string[]) => boolean)(permissions || []));
  }
  if (Array.isArray(request) && request.length > 0) {
    const list = permissions || [];
    return request.some((currentKey) => list.indexOf(currentKey) > -1);
  }
  return true;
}

export function usePermissions(): { permissions: string[] } {
  const { permissions } = useMarsunAuth();
  return { permissions: permissions ?? [] };
}

export function usePermissionsPass({ request }: { request?: PermissionRequest }): boolean {
  const { permissions } = usePermissions();
  const { hasPermission } = useMarsunAuth();

  if (typeof request === 'function') {
    return computedIsPass({ permissions, request });
  }

  if (Array.isArray(request) && request.length > 0) {
    if (permissions.length > 0) {
      return computedIsPass({ permissions, request });
    }
    return request.some((key) => !!hasPermission?.(key));
  }

  return true;
}

/**
 * 权限控制：对照 kne-union Permissions，权限源改为 MarsunCoreProvider.auth。
 * 判定语义：request 数组为 OR（与上游运行时一致）。
 */
const Permissions: FC<PermissionsProps> = ({
  type = 'hidden',
  className,
  tagName = 'span',
  message = '您暂无权限，请联系管理员',
  request,
  children,
  ...props
}) => {
  const isPass = usePermissionsPass({ request });

  if (typeof children === 'function') {
    return <>{children({ isPass, type, request })}</>;
  }

  if (isPass) {
    return <>{children}</>;
  }

  if (type === 'error') {
    return <Result status="403" subTitle={message} />;
  }

  if (type === 'tooltip') {
    return (
      <Tooltip title={message}>
        {createElement(
          tagName,
          {
            ...props,
            className: classNames('permissions-outer', styles['permissions-outer'], className),
          },
          children,
        )}
      </Tooltip>
    );
  }

  return null;
};

export default Permissions;
