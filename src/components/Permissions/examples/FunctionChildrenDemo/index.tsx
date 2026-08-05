import { Permissions } from '@/components/Permissions';
import MarsunCoreProvider from '@/provider/MarsunCoreProvider';
import { Alert, Button, Card, Space } from 'antd';
import classNames from 'classnames';
import React from 'react';
import styles from './style.module.scss';

const FunctionChildrenDemo: React.FC = () => (
  <MarsunCoreProvider
    auth={{
      isAuthenticated: true,
      permissions: ['user:view', 'order:view'],
    }}
  >
    <div className={classNames('permissions-fn-demo-root', styles['permissions-fn-demo-root'])}>
      <Card title="函数式子组件" size="small">
        <Space
          direction="vertical"
          className={classNames('permissions-fn-demo-space', styles['permissions-fn-demo-space'])}
        >
          <Alert message="children 可为函数，接收 isPass / type / request 自定义渲染" type="info" />
          <Permissions request={['user:view']} type="hidden">
            {({ isPass, type, request }) => (
              <div
                className={classNames(
                  'permissions-fn-demo-block',
                  styles['permissions-fn-demo-block'],
                )}
              >
                <p>权限状态: {isPass ? '有权限' : '无权限'}</p>
                <p>权限类型: {type}</p>
                <p>所需权限: {Array.isArray(request) ? request.join(', ') : String(request)}</p>
                <Button type={isPass ? 'primary' : 'default'} disabled={!isPass}>
                  {isPass ? '可以访问用户页面' : '无权访问用户页面'}
                </Button>
              </div>
            )}
          </Permissions>
          <Permissions request={['order:delete']} type="tooltip" message="您没有删除订单的权限">
            {({ isPass }) => (
              <Button type={isPass ? 'primary' : 'default'}>
                {isPass ? '删除订单' : '删除订单(无权限)'}
              </Button>
            )}
          </Permissions>
        </Space>
      </Card>
    </div>
  </MarsunCoreProvider>
);

export default FunctionChildrenDemo;
