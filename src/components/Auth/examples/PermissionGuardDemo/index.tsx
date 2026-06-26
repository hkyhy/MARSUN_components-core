import { PermissionGuard } from '@/components/Auth';
import { Button } from 'antd';
import React from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

/** PermissionGuard 权限守卫示例（dev showcase 注入 admin 角色） */
const PermissionGuardDemo: React.FC = () => (
  <div className={classNames('permission-guard-demo-root', styles['permission-guard-demo-root'])}>
    <div>
      <h4 className={classNames('permission-guard-demo-col', styles['permission-guard-demo-col'])}>有权限时正常渲染</h4>
      <PermissionGuard
        roles={['admin']}
        fallback={<span className={classNames('permission-guard-demo-wrap', styles['permission-guard-demo-wrap'])}>无权限，不可见</span>}
      >
        <Button type="primary" size="small">
          管理员可见的操作按钮
        </Button>
      </PermissionGuard>
    </div>

    <div>
      <h4 className={classNames('permission-guard-demo-col', styles['permission-guard-demo-col'])}>无权限时显示 Fallback</h4>
      <PermissionGuard
        roles={['dept_leader']}
        fallback={<span className={classNames('permission-guard-demo-panel', styles['permission-guard-demo-panel'])}>当前角色无此权限</span>}
      >
        <Button type="primary" danger size="small">
          部门负责人操作
        </Button>
      </PermissionGuard>
    </div>

    <div>
      <h4 className={classNames('permission-guard-demo-col', styles['permission-guard-demo-col'])}>不传 roles（所有已登录用户可见）</h4>
      <PermissionGuard>
        <Button size="small">公开内容</Button>
      </PermissionGuard>
    </div>
  </div>
);

export default PermissionGuardDemo;
