import { Table } from '@/components';
import type { TableFetchHandle } from '@/components/Table';
import classNames from 'classnames';
import { useRef, useState } from 'react';
import styles from './style.module.scss';

type DemoRow = {
  id: string;
  name: string;
  factory: string;
};

const ALL: DemoRow[] = Array.from({ length: 37 }, (_, i) => ({
  id: String(i + 1),
  name: `品种-${i + 1}`,
  factory: `分厂 ${((i % 5) + 1) * 1000}`,
}));

/**
 * Table Fetch 双路径 Demo（showcase 假数据，非业务运行时 mock）。
 * - fetchData：Marsun pageData 主路径
 * - fetchUrl：Form FetchSelect 同构辅路径（本 Demo 用 data URL / 内存模拟见下方说明）
 */
const TableFetchDemo: React.FC = () => {
  const [factory, setFactory] = useState('');
  const fetchRef = useRef<TableFetchHandle>(null);

  return (
    <div className={classNames('table-fetch-demo-root', styles['table-fetch-demo-root'])}>
      <p className={styles.hint}>
        Showcase 假分页：筛选项变则回第 1 页；写后可 fetchRef.reload()。非业务接口 mock。
      </p>

      <h4 className={styles.blockTitle}>fetchData 路径</h4>
      <label className={styles.filter}>
        分厂筛选
        <input value={factory} onChange={(e) => setFactory(e.target.value)} placeholder="空=全部" />
      </label>
      <button type="button" onClick={() => fetchRef.current?.reload()}>
        reload
      </button>
      <Table<DemoRow>
        ref={fetchRef}
        rowKey="id"
        size="small"
        fetchParams={{ factory }}
        fetchData={async ({ currentPage, pageSize }) => {
          await new Promise((r) => setTimeout(r, 120));
          const filtered = factory ? ALL.filter((r) => r.factory.includes(factory)) : ALL;
          const start = (currentPage - 1) * pageSize;
          return {
            pageData: filtered.slice(start, start + pageSize),
            total: filtered.length,
            mapping: { note: 'showcase-extra' },
          };
        }}
        columns={[
          { title: '分厂', dataIndex: 'factory', width: 120 },
          { title: '品种', dataIndex: 'name', ellipsis: true },
        ]}
        pagination={{ pageSizeOptions: [10, 20], showTotal: (n) => `共 ${n} 条` }}
        defaultPageSize={10}
      />

      <h4 className={styles.blockTitle}>fetchUrl 路径</h4>
      <p className={styles.hint}>
        使用 fetchUrl + transformData；本页用相对路径配合 MarsunCoreProvider.fetch.baseUrl（showcase
        环境若无后端，可观察 loading/错态 Empty）。
      </p>
      <Table<DemoRow>
        rowKey="id"
        size="small"
        fetchUrl="/showcase/table-fetch-demo.json"
        transformData={(raw) => {
          const list = Array.isArray(raw)
            ? (raw as DemoRow[])
            : ((raw as { pageData?: DemoRow[] })?.pageData ?? []);
          return { pageData: list.slice(0, 5), total: list.length || 5 };
        }}
        columns={[
          { title: '分厂', dataIndex: 'factory', width: 120 },
          { title: '品种', dataIndex: 'name', ellipsis: true },
        ]}
        defaultPageSize={5}
      />
    </div>
  );
};

export default TableFetchDemo;
