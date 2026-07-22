import { Table } from '@/components';
import classNames from 'classnames';
import React, { useState } from 'react';
import styles from './style.module.scss';

type DemoRow = {
  id: string;
  name: string;
  factory: string;
  status: string;
};

const ALL: DemoRow[] = Array.from({ length: 23 }, (_, i) => ({
  id: String(i + 1),
  name: `品种-${i + 1}`,
  factory: `分厂 ${((i % 5) + 1) * 1000}`,
  status: i % 3 === 0 ? '预警' : '正常',
}));

const TableBasicDemo: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const start = (page - 1) * pageSize;
  const data = ALL.slice(start, start + pageSize);

  return (
    <div className={classNames('table-basic-demo-root', styles['table-basic-demo-root'])}>
      <Table<DemoRow>
        rowKey="id"
        dataSource={data}
        columns={[
          { title: '分厂', dataIndex: 'factory', width: 120 },
          { title: '品种', dataIndex: 'name', ellipsis: true },
          { title: '状态', dataIndex: 'status', width: 80 },
        ]}
        pagination={{
          current: page,
          pageSize,
          total: ALL.length,
          onChange: (p, size) => {
            setPage(p);
            setPageSize(size);
          },
        }}
      />
    </div>
  );
};

export default TableBasicDemo;
