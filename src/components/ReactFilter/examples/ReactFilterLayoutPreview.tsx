// @ts-nocheck — ResponsiveProvider 无完整 TS 类型
import { ResponsiveProvider } from '@kne/responsive-utils';
import { Segmented } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import styles from '../../Filter/examples/FilterLayoutPreview.module.scss';

export type ReactFilterLayoutPreviewMode = 'desktop' | 'mobile';

const MOBILE_CONTAINER_WIDTH = 390;
const DESKTOP_CONTAINER_WIDTH = 1280;

type Props = {
  children: React.ReactNode;
  defaultMode?: ReactFilterLayoutPreviewMode;
  className?: string;
};

/**
 * ReactFilter showcase：Segmented + ResponsiveProvider(container) 强制双端布局。
 * （ReactFilter 无 Marsun layoutMode；靠 containerWidth < 768 切移动态）
 */
const ReactFilterLayoutPreview: React.FC<Props> = ({
  children,
  defaultMode = 'desktop',
  className,
}) => {
  const [layout, setLayout] = useState<ReactFilterLayoutPreviewMode>(defaultMode);
  const containerWidth = layout === 'mobile' ? MOBILE_CONTAINER_WIDTH : DESKTOP_CONTAINER_WIDTH;

  return (
    <div
      className={classNames('filter-layout-preview', styles['filter-layout-preview'], className)}
    >
      <div
        className={classNames(
          'filter-layout-preview-toolbar',
          styles['filter-layout-preview-toolbar'],
        )}
      >
        <span
          className={classNames(
            'filter-layout-preview-label',
            styles['filter-layout-preview-label'],
          )}
        >
          布局预览
        </span>
        <Segmented<ReactFilterLayoutPreviewMode>
          value={layout}
          onChange={setLayout}
          options={[
            { label: '桌面', value: 'desktop' },
            { label: '移动', value: 'mobile' },
          ]}
        />
      </div>
      <div
        className={classNames(
          'filter-layout-preview-stage',
          styles['filter-layout-preview-stage'],
          layout === 'mobile' && styles['filter-layout-preview-stage-mobile'],
        )}
      >
        <ResponsiveProvider mode="container" containerWidth={containerWidth}>
          {children}
        </ResponsiveProvider>
      </div>
    </div>
  );
};

export default ReactFilterLayoutPreview;
