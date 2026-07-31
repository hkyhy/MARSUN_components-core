import { Table, type TablePrefs } from '@/components';
import { Button, Space } from 'antd';
import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import styles from './style.module.scss';

type DemoRow = {
  id: string;
  factory: string;
  variety: string;
  value: number;
};

const ROWS: DemoRow[] = [
  { id: 'primary', factory: '1000', variety: 'JC40（主对标）', value: 12.1 },
  { id: 'c1', factory: '2000', variety: 'JC32', value: 13.2 },
  { id: 'c2', factory: '3000', variety: 'C40', value: 11.8 },
  { id: 'c3', factory: '4000', variety: 'JC50', value: 12.8 },
];

const MEMORY = new Map<string, TablePrefs>();

/** 行隐藏 + lockedRowKeys（主对标不可藏） */
const TableRowHideDemo: React.FC = () => {
  const [selected, setSelected] = useState<React.Key[]>(['primary', 'c1']);
  const [hint, setHint] = useState('');

  const fetchTablePrefs = useCallback(async (tableName: string) => {
    return MEMORY.get(tableName) ?? null;
  }, []);

  const saveTablePrefs = useCallback(async (tableName: string, prefs: TablePrefs) => {
    MEMORY.set(tableName, prefs);
  }, []);

  return (
    <div className={classNames('table-row-hide-demo-root', styles['table-row-hide-demo-root'])}>
      <p className={styles.hint}>
        勾选行后点「隐藏选中行」或行旁眼睛；主对标 <code>primary</code> 不可隐藏。行隐藏为会话
        state，不写 user_key。
        {hint ? ` ${hint}` : null}
      </p>
      <Space className={styles.extra} size="small">
        <Button size="small" onClick={() => setSelected(['primary', 'c1', 'c2'])}>
          全选对比行
        </Button>
      </Space>
      <Table<DemoRow>
        rowKey="id"
        pagination={false}
        tableName="demo_table_row_hide"
        rowConfigEnabled
        lockedRowKeys={['primary']}
        rowHideSelectedKeys={selected}
        fetchTablePrefs={fetchTablePrefs}
        saveTablePrefs={saveTablePrefs}
        onHiddenRowKeysChange={(keys) =>
          setHint(keys.length ? `已隐藏 ${keys.join(',')}` : '无隐藏行')
        }
        rowSelection={{
          selectedRowKeys: selected,
          onChange: (keys) => {
            const next = keys.includes('primary') ? keys : ['primary', ...keys];
            setSelected(next);
          },
          getCheckboxProps: (row) => ({
            disabled: row.id === 'primary',
          }),
        }}
        dataSource={ROWS}
        columns={[
          { title: '分厂', dataIndex: 'factory', key: 'factory', width: 96 },
          { title: '品种', dataIndex: 'variety', key: 'variety', width: 160 },
          { title: '值', dataIndex: 'value', key: 'value', width: 80 },
        ]}
      />
    </div>
  );
};

export default TableRowHideDemo;
