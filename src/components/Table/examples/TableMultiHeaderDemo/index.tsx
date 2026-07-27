import { Table } from '@/components';
import classNames from 'classnames';
import React from 'react';
import styles from './style.module.scss';

type DemoRow = {
  id: string;
  factory: string;
  variety: string;
  finished: number;
  semi: number;
  raw: number;
  cvFinished: number;
  cvSemi: number;
  cvRaw: number;
};

const ROWS: DemoRow[] = [
  {
    id: '1',
    factory: '1000',
    variety: 'JC40',
    finished: 12.1,
    semi: 11.8,
    raw: 10.5,
    cvFinished: 2.3,
    cvSemi: 2.1,
    cvRaw: 1.9,
  },
  {
    id: '2',
    factory: '2000',
    variety: 'JC32',
    finished: 13.2,
    semi: 12.0,
    raw: 11.1,
    cvFinished: 2.5,
    cvSemi: 2.2,
    cvRaw: 2.0,
  },
  {
    id: '3',
    factory: '3000',
    variety: 'C40',
    finished: 11.8,
    semi: 11.2,
    raw: 10.0,
    cvFinished: 2.1,
    cvSemi: 1.9,
    cvRaw: 1.7,
  },
];

const TableMultiHeaderDemo: React.FC = () => {
  return (
    <div
      className={classNames('table-multi-header-demo-root', styles['table-multi-header-demo-root'])}
    >
      <Table<DemoRow>
        rowKey="id"
        pagination={false}
        dataSource={ROWS}
        columns={[
          { title: '分厂', dataIndex: 'factory', key: 'factory', width: 96, fixed: 'left' },
          { title: '品种', dataIndex: 'variety', key: 'variety', width: 120, fixed: 'left' },
          {
            title: 'TGCV',
            key: 'TGCV',
            align: 'center',
            children: [
              {
                title: '成品',
                dataIndex: 'finished',
                key: 'TGCV_finished',
                width: 72,
                align: 'center',
              },
              { title: '半制品', dataIndex: 'semi', key: 'TGCV_semi', width: 72, align: 'center' },
              { title: '原料', dataIndex: 'raw', key: 'TGCV_raw', width: 72, align: 'center' },
            ],
          },
          {
            title: 'CV%',
            key: 'CV',
            align: 'center',
            children: [
              {
                title: '成品',
                dataIndex: 'cvFinished',
                key: 'CV_finished',
                width: 72,
                align: 'center',
              },
              { title: '半制品', dataIndex: 'cvSemi', key: 'CV_semi', width: 72, align: 'center' },
              { title: '原料', dataIndex: 'cvRaw', key: 'CV_raw', width: 72, align: 'center' },
            ],
          },
        ]}
      />
    </div>
  );
};

export default TableMultiHeaderDemo;
