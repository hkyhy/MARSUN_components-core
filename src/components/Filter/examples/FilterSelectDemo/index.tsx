import { FilterSelect } from '@/components';
import React, { useState } from 'react';
import { SEARCHABLE_OPTIONS, SINGLE_SELECT_OPTIONS } from '../mock';
import styles from './style.module.scss';
import classNames from 'classnames';

const FilterSelectDemo: React.FC = () => {
  const [value, setValue] = useState<string | number | undefined>(undefined);
  const [multiValue, setMultiValue] = useState<string | number | undefined>(undefined);

  return (
    <div className={classNames('filter-select-demo-root', styles['filter-select-demo-root'])}>
      <FilterSelect
        label="单选"
        filterKey="singleSelect"
        options={SINGLE_SELECT_OPTIONS}
        value={value}
        onChange={setValue}
      />
      <FilterSelect
        label="可搜索"
        filterKey="searchable"
        searchable
        options={SEARCHABLE_OPTIONS}
        value={multiValue}
        onChange={setMultiValue}
      />
    </div>
  );
};

export default FilterSelectDemo;
