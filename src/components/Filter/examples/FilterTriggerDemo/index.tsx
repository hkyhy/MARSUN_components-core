import { FilterTrigger } from '@/components';
import { Space } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import styles from './style.module.scss';

const FilterTriggerDemo: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <Space
      size="large"
      className={classNames('filter-trigger-demo-root', styles['filter-trigger-demo-root'])}
    >
      <FilterTrigger label="未选中" active={false} />
      <FilterTrigger label="已选中" active />
      <FilterTrigger
        label="可展开"
        active={open}
        open={open}
        onClick={() => setOpen((v) => !v)}
      />
    </Space>
  );
};

export default FilterTriggerDemo;
