import { FilterPanel } from '@/components';
import { Input } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import styles from './style.module.scss';

const FilterPanelDemo: React.FC = () => {
  const [keyword, setKeyword] = useState('');

  return (
    <div className={classNames('filter-panel-demo-root', styles['filter-panel-demo-root'])}>
      <FilterPanel
        width={320}
        onConfirm={() => undefined}
        onReset={() => setKeyword('')}
      >
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="面板内自定义内容"
          allowClear
        />
      </FilterPanel>
    </div>
  );
};

export default FilterPanelDemo;
