import { Permissions } from '@/components/Permissions';
import MarsunCoreProvider from '@/provider/MarsunCoreProvider';
import { Button, Radio, Space } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import styles from './style.module.scss';

const BasicDemo: React.FC = () => {
  const [type, setType] = useState<'tooltip' | 'error' | 'hidden'>('tooltip');

  return (
    <MarsunCoreProvider
      auth={{
        isAuthenticated: true,
        permissions: ['permission_1', 'permission_2'],
      }}
    >
      <div
        className={classNames('permissions-basic-demo-root', styles['permissions-basic-demo-root'])}
      >
        <Space direction="vertical">
          <Radio.Group
            value={type}
            options={[
              { label: 'tooltip', value: 'tooltip' },
              { label: 'error', value: 'error' },
              { label: 'hidden', value: 'hidden' },
            ]}
            onChange={(e) => setType(e.target.value)}
            optionType="button"
            buttonStyle="solid"
          />
          <Permissions type={type} request={['permission_2']}>
            <div
              className={classNames(
                'permissions-basic-demo-box',
                styles['permissions-basic-demo-box'],
              )}
            >
              <Button type="primary">有权限操作</Button>
            </div>
          </Permissions>
          <Permissions type={type} request={['permission_3']}>
            <div
              className={classNames(
                'permissions-basic-demo-box',
                styles['permissions-basic-demo-box'],
              )}
            >
              <Button>无权限操作</Button>
            </div>
          </Permissions>
        </Space>
      </div>
    </MarsunCoreProvider>
  );
};

export default BasicDemo;
