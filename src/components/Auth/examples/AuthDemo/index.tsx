import { SEMANTIC_COLORS, SemanticTag } from '@/components';
import { Typography } from 'antd';
import React from 'react';
import { PERMISSION_CONFIG } from '../mock';
import styles from './style.module.scss';
import classNames from 'classnames';

const { Paragraph, Text } = Typography;

const HAS_PERMISSION_CODE = `import { hasPermission } from '@/components/Auth/hasPermission';

hasPermission(user, 'user:edit') // → true/false`;

const GUARD_CODE = `import { PermissionGuard } from '@/components/Auth';

<PermissionGuard permission="user:edit">
  <Button>编辑</Button>
</PermissionGuard>`;

const AuthDemo: React.FC = () => (
  <div className={classNames('auth-demo-root', styles['auth-demo-root'])}>
    <div>
      <h4 className={classNames('auth-demo-container', styles['auth-demo-container'])}>hasPermission 权限判断</h4>
      <p className={classNames('auth-demo-wrapper', styles['auth-demo-wrapper'])}>判断当前用户是否拥有指定权限，返回 boolean。</p>
      <Paragraph copyable={{ text: HAS_PERMISSION_CODE, tooltips: ['复制代码', '已复制'] }}>
        <Text
          code
          className={classNames('auth-demo-inner', styles['auth-demo-inner'])}
        >
          {HAS_PERMISSION_CODE}
        </Text>
      </Paragraph>
    </div>
    <div>
      <h4 className={classNames('auth-demo-container', styles['auth-demo-container'])}>PermissionGuard 权限守卫</h4>
      <p className={classNames('auth-demo-wrapper', styles['auth-demo-wrapper'])}>包裹需要权限控制的区域，无权限时隐藏内容。</p>
      <Paragraph copyable={{ text: GUARD_CODE, tooltips: ['复制代码', '已复制'] }}>
        <Text
          code
          className={classNames('auth-demo-inner', styles['auth-demo-inner'])}
        >
          {GUARD_CODE}
        </Text>
      </Paragraph>
    </div>
    <div>
      <h4 className={classNames('auth-demo-container', styles['auth-demo-container'])}>权限配置一览</h4>
      <div className={classNames('auth-demo-header', styles['auth-demo-header'])}>
        {PERMISSION_CONFIG.permissions.map((p) => (
          <div key={p.key} className={classNames('auth-demo-body', styles['auth-demo-body'])}>
            <SemanticTag color={SEMANTIC_COLORS.INFO} className={classNames('auth-demo-footer', styles['auth-demo-footer'])}>
              {p.module}
            </SemanticTag>
            <span>{p.label}</span>
            <Text
              copyable={{ text: p.key, tooltips: ['复制', '已复制'] }}
              className={classNames('auth-demo-row', styles['auth-demo-row'])}
            />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default AuthDemo;
