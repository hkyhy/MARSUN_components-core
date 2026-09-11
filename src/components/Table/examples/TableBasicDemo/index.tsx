import { Table, type TablePrefs } from '@/components';
import classNames from 'classnames';
import React, { useCallback, useRef, useState } from 'react';
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

const TABLE_NAME = 'showcase_table_basic_resize';

/**
 * 列宽拖拽验收（可当场验）：
 * 1. 叶子列表头右缘可拖；齿轮 / 分组表头不可拖
 * 2. 宽度落在 48～480；拖过界停在边界
 * 3. 有 saveTablePrefs：松手后点「模拟刷新」仍保持（内存 Map）
 * 4. 无 save 时仅会话（本 Demo 始终有 save；可关 save 对照）
 * 5. 拖「状态」列把手不触发排序；点标题文字才排序
 * 6. 双击把手重置该列自定义 width
 * 7. 拖 A 时 B/C 视觉宽度不变（起拖锁兄弟 + 弹性占位）
 */
const TableBasicDemo: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [prefsNote, setPrefsNote] = useState('尚未拖宽');
  const [mountKey, setMountKey] = useState(0);
  const prefsStoreRef = useRef<Record<string, TablePrefs>>({});
  const start = (page - 1) * pageSize;
  const data = ALL.slice(start, start + pageSize);

  const fetchTablePrefs = useCallback(async (name: string) => {
    return prefsStoreRef.current[name] ?? null;
  }, []);

  const saveTablePrefs = useCallback(async (name: string, prefs: TablePrefs) => {
    prefsStoreRef.current[name] = prefs;
  }, []);

  return (
    <div className={classNames('table-basic-demo-root', styles['table-basic-demo-root'])}>
      <p style={{ marginBottom: 8, color: '#64748b', fontSize: 13 }}>
        表头右缘拖宽 · 双击重置 · 默认 48～480 · 拖 A 时 B/C 应不动。{prefsNote}
      </p>
      <p style={{ marginBottom: 8 }}>
        <button type="button" onClick={() => setMountKey((k) => k + 1)}>
          模拟刷新（重挂载，读内存 prefs）
        </button>
      </p>
      <Table<DemoRow>
        key={mountKey}
        rowKey="id"
        tableName={TABLE_NAME}
        columnResizeEnabled
        columnConfigEnabled={false}
        fetchTablePrefs={fetchTablePrefs}
        saveTablePrefs={saveTablePrefs}
        dataSource={data}
        onTablePrefsChange={(prefs) => {
          const widths = prefs.columns
            .filter((c) => typeof c.width === 'number')
            .map((c) => `${c.id}:${c.width}`)
            .join(', ');
          setPrefsNote(widths ? `已存 width：${widths}` : '无自定义 width');
        }}
        columns={[
          { title: '分厂', dataIndex: 'factory', key: 'factory', width: 120 },
          { title: '品种', dataIndex: 'name', key: 'name', ellipsis: true },
          {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 80,
            sorter: (a, b) => a.status.localeCompare(b.status),
          },
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
