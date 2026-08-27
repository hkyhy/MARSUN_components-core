import { Alert } from '@/components';
import { Button } from 'antd';
import classNames from 'classnames';
import React from 'react';
import styles from './style.module.scss';

const AlertDemo: React.FC = () => (
  <div className={classNames('alert-demo-root', styles['alert-demo-root'])}>
    <Alert
      type="info"
      message="按当前筛选租户导入"
      description="所属部门须与组织树名称完全一致；角色编码留空默认 NORMAL_USER。"
    />
    <Alert type="success" message="导入完成" description="成功 12 人，无失败行。" />
    <Alert
      type="warning"
      message="代管中：华茂（HUAMAO）"
      description="写操作审计含 actor 与 targetTenantId。"
      action={<Button size="small">退出代管</Button>}
    />
    <Alert type="error" message="导入失败" description="模板缺少必填列「工号」。" closable />
  </div>
);

export default AlertDemo;
