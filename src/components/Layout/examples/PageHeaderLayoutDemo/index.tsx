import { PageHeaderLayout } from '@/components';
import ButtonGroup from '@kne/button-group';
import React from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

const PageHeaderLayoutDemo: React.FC = () => {
  const headerListArray: Record<string, unknown>[] = [
    {
      children: '新建文件夹',
      onClick: () => console.log('新建文件夹'),
    },
    {
      type: 'primary',
      children: '上传文件',
      onClick: () => console.log('上传文件'),
    },
  ];

  return (
    <PageHeaderLayout
      title="页面标题"
      actions={<ButtonGroup list={headerListArray} />}
      description="页面说明提示，用于解释当前页面的用途或注意事项。"
    >
      <div className={classNames('page-header-layout-demo-header', styles['page-header-layout-demo-header'])}>页面内容区域</div>
    </PageHeaderLayout>
  );
};

export default PageHeaderLayoutDemo;
