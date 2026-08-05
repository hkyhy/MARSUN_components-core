import {
  Permissions,
  computedIsPass,
  usePermissions,
  usePermissionsPass,
} from '@/components/Permissions';
import MarsunCoreProvider from '@/provider/MarsunCoreProvider';
import { Card, Space, Tag, Typography } from 'antd';
import classNames from 'classnames';
import React from 'react';
import styles from './style.module.scss';

const PermissionsInfo: React.FC = () => {
  const { permissions } = usePermissions();
  const hasUserPermission = usePermissionsPass({ request: ['user:view'] });
  const hasOrderPermission = usePermissionsPass({ request: ['order:view'] });
  const manualCheck = computedIsPass({
    permissions,
    request: ['user:edit', 'user:delete'],
  });

  return (
    <Card
      title="权限信息展示"
      className={classNames('permissions-hooks-demo-card', styles['permissions-hooks-demo-card'])}
    >
      <Space
        direction="vertical"
        className={classNames(
          'permissions-hooks-demo-space',
          styles['permissions-hooks-demo-space'],
        )}
      >
        <div>
          <Typography.Text strong>当前用户权限列表: </Typography.Text>
          <Space wrap>
            {permissions.map((perm) => (
              <Tag key={perm} color="blue">
                {perm}
              </Tag>
            ))}
          </Space>
        </div>
        <div>
          <Typography.Text strong>用户查看权限: </Typography.Text>
          <Tag color={hasUserPermission ? 'green' : 'red'}>
            {hasUserPermission ? '有权限' : '无权限'}
          </Tag>
        </div>
        <div>
          <Typography.Text strong>订单查看权限: </Typography.Text>
          <Tag color={hasOrderPermission ? 'green' : 'red'}>
            {hasOrderPermission ? '有权限' : '无权限'}
          </Tag>
        </div>
        <div>
          <Typography.Text strong>手动检查(用户编辑/删除 OR): </Typography.Text>
          <Tag color={manualCheck ? 'green' : 'red'}>{manualCheck ? '有权限' : '无权限'}</Tag>
        </div>
      </Space>
    </Card>
  );
};

const HooksDemo: React.FC = () => (
  <MarsunCoreProvider
    auth={{
      isAuthenticated: true,
      permissions: ['user:view', 'user:edit', 'dashboard:view', 'report:view'],
    }}
  >
    <div
      className={classNames('permissions-hooks-demo-root', styles['permissions-hooks-demo-root'])}
    >
      <Space
        direction="vertical"
        size="large"
        className={classNames(
          'permissions-hooks-demo-space',
          styles['permissions-hooks-demo-space'],
        )}
      >
        <PermissionsInfo />
        <Permissions request={['user:view']} type="tooltip">
          <Card
            title="用户信息"
            className={classNames(
              'permissions-hooks-demo-card',
              styles['permissions-hooks-demo-card'],
            )}
          >
            <div>用户名: 张三</div>
            <div>部门: 技术部</div>
          </Card>
        </Permissions>
        <Permissions
          request={['order:view']}
          type="error"
          message="您没有订单查看权限，请联系部门管理员"
        >
          <Card title="订单信息">订单列表内容...</Card>
        </Permissions>
      </Space>
    </div>
  </MarsunCoreProvider>
);

export default HooksDemo;
