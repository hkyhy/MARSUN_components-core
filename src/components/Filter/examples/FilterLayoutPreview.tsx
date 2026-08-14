import { FilterLayoutProvider } from '@/components';
import { Segmented } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import styles from './FilterLayoutPreview.module.scss';

export type FilterLayoutPreviewMode = 'desktop' | 'mobile';

export type FilterLayoutPreviewProps = {
  children: React.ReactNode | ((mode: FilterLayoutPreviewMode) => React.ReactNode);
  /** 为独立 Filter*（无 CommonFilter）注入 isMobile；CommonFilter 场景仍建议传 layoutMode */
  provideLayout?: boolean;
  defaultMode?: FilterLayoutPreviewMode;
  className?: string;
};

/**
 * Showcase 双端预览壳：Segmented → desktop | mobile。
 * CommonFilter 用 render props 取 mode 赋给 layoutMode；独立 Filter* 靠 FilterLayoutProvider。
 */
const FilterLayoutPreview: React.FC<FilterLayoutPreviewProps> = ({
  children,
  provideLayout = true,
  defaultMode = 'desktop',
  className,
}) => {
  const [layout, setLayout] = useState<FilterLayoutPreviewMode>(defaultMode);
  const content = typeof children === 'function' ? children(layout) : children;
  const body = provideLayout ? (
    <FilterLayoutProvider isMobile={layout === 'mobile'}>{content}</FilterLayoutProvider>
  ) : (
    content
  );

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
        <Segmented<FilterLayoutPreviewMode>
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
        {body}
      </div>
    </div>
  );
};

export default FilterLayoutPreview;
