import { CommonFilter, FilterInput, FilterSelect, type FilterSelectValue } from '@/components';
import React, { useState } from 'react';
import { DEPT_OPTIONS, STATUS_OPTIONS } from './mock';
import styles from './CommonFilterMobileDemo.module.scss';
import classNames from 'classnames';

/**
 * 窄屏 / 移动端布局演示（layoutMode=mobile）。
 * 验收：横滑 pill、隐藏「筛选」文案、已选横滑与展开。
 * 桌面↔移动切换见 CommonFilterLayoutSwitchDemo。
 */
const CommonFilterMobileDemo: React.FC = () => {
  const [status, setStatus] = useState<FilterSelectValue>('passed');
  const [dept, setDept] = useState<FilterSelectValue>(undefined);
  const [keyword, setKeyword] = useState<string | undefined>('指标');

  return (
    <div className={classNames('common-filter-mobile-demo', styles['common-filter-mobile-demo'])}>
      <p
        className={classNames(
          'common-filter-mobile-demo-hint',
          styles['common-filter-mobile-demo-hint'],
        )}
      >
        layoutMode=&quot;mobile&quot;：模拟窄屏横滑 chip / pill /
        已选展开（真实环境默认跟视口宽度；半栏勿误判）
      </p>
      <CommonFilter
        layoutMode="mobile"
        onClearAll={() => {
          setStatus(undefined);
          setDept(undefined);
          setKeyword(undefined);
        }}
      >
        <FilterSelect
          label="状态"
          filterKey="status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={setStatus}
        />
        <FilterSelect
          label="部门"
          filterKey="dept"
          options={DEPT_OPTIONS}
          value={dept}
          onChange={setDept}
          searchable
        />
        <FilterInput
          label="指标/摘要/ID"
          filterKey="keyword"
          value={keyword}
          onChange={setKeyword}
        />
        <FilterSelect
          label="优先级"
          filterKey="priority"
          options={[
            { label: '高', value: 'high' },
            { label: '中', value: 'mid' },
            { label: '低', value: 'low' },
          ]}
          value={undefined}
          onChange={() => {}}
        />
      </CommonFilter>
    </div>
  );
};

export default CommonFilterMobileDemo;
