// @ts-nocheck — vendor ReactFilter JSX 无完整 Props 类型
import Filter, { InputFilterItem, type FilterValue } from '@/components/ReactFilter';
import React, { useState } from 'react';
import ReactFilterLayoutPreview from './ReactFilterLayoutPreview';

/**
 * ReactFilter（@kne/react-filter 厂商移植）基础示例：Filter + list 声明式筛选项
 */
const BaseDemo: React.FC = () => {
  const [value, setValue] = useState<FilterValue>([]);

  return (
    <ReactFilterLayoutPreview>
      <Filter
        value={value}
        onChange={setValue}
        list={[
          [
            {
              type: InputFilterItem,
              props: { name: 'keyword', label: '关键词', placeholder: '搜索' },
            },
          ],
        ]}
      />
    </ReactFilterLayoutPreview>
  );
};

export default BaseDemo;
