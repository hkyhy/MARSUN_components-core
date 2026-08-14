import { FilterTrigger } from '@/components';
import { Space } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import FilterLayoutPreview from '../FilterLayoutPreview';
import styles from './style.module.scss';

const FilterTriggerDemo: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <FilterLayoutPreview>
      <Space
        size="large"
        className={classNames('filter-trigger-demo-root', styles['filter-trigger-demo-root'])}
        wrap
      >
        <FilterTrigger label="未选中" active={false} />
        <FilterTrigger label="已选中" active />
        <FilterTrigger
          label="可展开"
          active={open}
          open={open}
          onClick={() => setOpen((v) => !v)}
        />
        <FilterTrigger label="加载中" active={false} loading />
        <FilterTrigger label="加载中(已选)" active loading />
      </Space>
    </FilterLayoutPreview>
  );
};

export default FilterTriggerDemo;
