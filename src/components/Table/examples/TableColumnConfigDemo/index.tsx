import { Table, type TableColumnConfigItem } from '@/components';
import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import styles from './style.module.scss';

type DemoRow = {
  id: string;
  factory: string;
  variety: string;
  finished: number;
  semi: number;
  raw: number;
};

const ROWS: DemoRow[] = [
  { id: '1', factory: '1000', variety: 'JC40', finished: 12.1, semi: 11.8, raw: 10.5 },
  { id: '2', factory: '2000', variety: 'JC32', finished: 13.2, semi: 12.0, raw: 11.1 },
];

const MEMORY = new Map<string, TableColumnConfigItem[]>();

const TableColumnConfigDemo: React.FC = () => {
  const fetchColumnConfig = useCallback(async (tableName: string) => {
    return MEMORY.get(tableName) ?? null;
  }, []);

  const saveColumnConfig = useCallback(
    async (tableName: string, items: TableColumnConfigItem[]) => {
      MEMORY.set(tableName, items);
    },
    [],
  );

  const [hint, setHint] = useState('');

  return (
    <div
      className={classNames(
        'table-column-config-demo-root',
        styles['table-column-config-demo-root'],
      )}
    >
      <p className={styles.hint}>
        传入 <code>tableName</code> 后最右侧独立列出现齿轮（跨多级表头高度）；确定后写入
        fetch/save（本例为内存）。
        {hint ? ` 已保存 ${hint} 项。` : null}
      </p>
      <Table<DemoRow>
        rowKey="id"
        pagination={false}
        tableName="demo_table_column_config"
        fetchColumnConfig={fetchColumnConfig}
        saveColumnConfig={saveColumnConfig}
        onColumnConfigChange={(items) => setHint(String(items.length))}
        dataSource={ROWS}
        columns={[
          { title: '分厂', dataIndex: 'factory', key: 'factory', width: 96 },
          { title: '品种', dataIndex: 'variety', key: 'variety', width: 120 },
          {
            title: 'TGCV',
            key: 'TGCV',
            align: 'center',
            children: [
              { title: '成品', dataIndex: 'finished', key: 'TGCV_finished', width: 72 },
              { title: '半制品', dataIndex: 'semi', key: 'TGCV_semi', width: 72 },
              { title: '原料', dataIndex: 'raw', key: 'TGCV_raw', width: 72 },
            ],
          },
        ]}
      />
    </div>
  );
};

export default TableColumnConfigDemo;
