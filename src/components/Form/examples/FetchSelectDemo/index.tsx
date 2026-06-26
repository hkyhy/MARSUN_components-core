import FetchSelect from '@/components/Form/FetchSelect';
import type { SelectOptionItem } from '@/components/Form/FetchSelect';
import optionsRaw from '@/components/Form/doc/select-options.mock.json';
import React, { useState } from 'react';
import styles from './style.module.scss';

const options = optionsRaw as SelectOptionItem[];

/** FetchSelect：props 模式选项列表 */
const FetchSelectDemo: React.FC = () => {
  const [value, setValue] = useState<string>();

  return (
    <div className={styles['fetch-select-demo']}>
      <FetchSelect
        style={{ width: 280 }}
        placeholder="请选择"
        options={options}
        value={value}
        onChange={setValue}
        allowClear
      />
      <p className={styles['fetch-select-demo-hint']}>当前值：{value ?? '（未选择）'}</p>
    </div>
  );
};

export default FetchSelectDemo;
