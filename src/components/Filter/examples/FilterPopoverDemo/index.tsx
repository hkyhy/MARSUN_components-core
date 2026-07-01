import { FilterPopover } from '@/components';
import { Input } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import styles from './style.module.scss';

const FilterPopoverDemo: React.FC = () => {
  const [value, setValue] = useState('');
  const [draft, setDraft] = useState('');

  return (
    <div className={classNames('filter-popover-demo-root', styles['filter-popover-demo-root'])}>
      <FilterPopover
        label="关键词"
        active={Boolean(value)}
        onConfirm={() => setValue(draft)}
        onReset={() => setDraft(value)}
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="输入后点确定生效"
          allowClear
        />
      </FilterPopover>
    </div>
  );
};

export default FilterPopoverDemo;
