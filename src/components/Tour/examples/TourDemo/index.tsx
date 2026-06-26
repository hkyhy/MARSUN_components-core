import { AppTour } from '@/components/Tour';
import type { AppTourStep } from '@/components/Tour/AppTour';
import { Button, Card, Space } from 'antd';
import React, { useRef } from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

const TourDemo: React.FC = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const steps: AppTourStep[] = [
    {
      title: '欢迎使用',
      description: '这是导览第一步，介绍页面头部区域。',
      target: () => headerRef.current!,
      placement: 'bottom',
    },
    {
      title: '快捷操作',
      description: '常用功能入口，可在此放置操作按钮。',
      target: () => actionRef.current!,
      placement: 'left',
    },
    {
      title: '内容区域',
      description: '主要业务内容展示在此区域。',
      target: () => contentRef.current!,
      placement: 'top',
    },
  ];

  const handleReset = () => {
    localStorage.removeItem('marsun-core-tour-demo');
    window.location.reload();
  };

  return (
    <div className={classNames('tour-demo-container', styles['tour-demo-container'])}>
      <Space style={{ marginBottom: 16 }}>
        <AppTour steps={steps} storageKey="marsun-core-tour-demo" autoOpen={false} />
        <Button size="small" onClick={handleReset}>
          重置导览记录
        </Button>
      </Space>

      <div ref={headerRef} className={classNames('tour-demo-wrapper', styles['tour-demo-wrapper'])}>
        <h4>页面头部</h4>
        <p>AppTour 基于 antd Tour，通过 steps + target 锚点定位元素。</p>
      </div>

      <div ref={actionRef} className={classNames('tour-demo-inner', styles['tour-demo-inner'])}>
        <h4>快捷操作区</h4>
        <Space>
          <Button type="primary" size="small">新建</Button>
          <Button size="small">导入</Button>
        </Space>
      </div>

      <Card ref={contentRef} size="small" title="内容区域" className={classNames('tour-demo-footer', styles['tour-demo-footer'])}>
        <p>点击左上角「?」图标手动开启导览；设置 storageKey 后首次访问可自动弹出。</p>
      </Card>
    </div>
  );
};

export default TourDemo;
