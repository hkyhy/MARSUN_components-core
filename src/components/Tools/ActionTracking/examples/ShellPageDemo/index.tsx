import {
  ActionFilterBar,
  ActionListTable,
  ActionTrackingShell,
  canQueryActionList,
  defaultCreatedRange,
  type ActionListFilters,
  type ActionListRowBase,
} from '@/components/Tools/ActionTracking';
import { PageShellProvider } from '@/components/Layout/PageShell';
import { InputFilterItem, type FilterValue } from '@/components/ReactFilter';
import { message } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ACTION_LIST_SEED,
  dimensionLabel,
  statusLabel,
} from '@/components/Tools/ActionTracking/doc/actionTracking.fixture';

/** 页壳 + 筛选 + 列表（fixture）；建单 Form 已迁出业务 App */
const ShellPageDemo: React.FC = () => {
  const range = useMemo(() => defaultCreatedRange(), []);
  const [filters, setFilters] = useState<ActionListFilters>({ ...range });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rows] = useState<ActionListRowBase[]>(ACTION_LIST_SEED);
  const canQuery = canQueryActionList(filters);

  const filterValue = useMemo((): FilterValue => {
    const items: FilterValue = [];
    if (filters.q) {
      items.push({ name: 'q', label: '关键词', value: filters.q });
    }
    return items;
  }, [filters.q]);

  const onFilterChange = useCallback((next: FilterValue) => {
    const qItem = next.find((i) => i.name === 'q');
    const q =
      typeof qItem?.value === 'object' && qItem?.value != null && 'value' in (qItem.value as object)
        ? String((qItem.value as { value: unknown }).value ?? '')
        : qItem
          ? String(qItem.value ?? '')
          : '';
    setFilters((prev) => ({ ...prev, q: q || undefined }));
    setPage(1);
  }, []);

  const visible = useMemo(() => {
    if (!canQuery) return [];
    const q = String(filters.q || '')
      .trim()
      .toLowerCase();
    return rows.filter(
      (r) =>
        !q ||
        String(r.title || '')
          .toLowerCase()
          .includes(q),
    );
  }, [canQuery, filters.q, rows]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return visible.slice(start, start + pageSize);
  }, [page, pageSize, visible]);

  return (
    <PageShellProvider>
      <ActionTrackingShell
        title="行动跟踪（Showcase）"
        description="List/Shell 在 core；新建/跟进/取消 Form 由业务 App 实现"
        syncPageMeta={false}
        fillHeight={false}
        actions={[
          {
            key: 'create',
            children: '新建任务',
            type: 'primary',
            onClick: () =>
              message.info('建单 Form 已迁出业务 App（见 ActionTracking/BOUNDARY.md）'),
          },
        ]}
        filterSlot={
          <ActionFilterBar
            value={filterValue}
            onChange={onFilterChange}
            canQuery={canQuery}
            list={[
              [
                {
                  type: InputFilterItem,
                  props: { name: 'q', label: '关键词', placeholder: '搜标题' },
                },
              ],
            ]}
          />
        }
        listSlot={
          <ActionListTable
            loading={false}
            items={pageRows}
            total={visible.length}
            currentPage={page}
            pageSize={pageSize}
            onPageChange={(p, ps) => {
              setPage(p);
              setPageSize(ps);
            }}
            tableName="showcase_action_tracking"
            columns={[
              { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
              {
                title: '类型',
                dataIndex: 'dimension',
                key: 'dimension',
                width: 88,
                render: (v: string) => dimensionLabel(v),
              },
              {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                width: 96,
                render: (v: string) => statusLabel(v),
              },
              { title: '执行人', dataIndex: 'assignee', key: 'assignee', width: 100 },
              { title: '分厂', dataIndex: 'factoryName', key: 'factoryName', width: 100 },
            ]}
            scrollX={720}
          />
        }
      />
    </PageShellProvider>
  );
};

export default ShellPageDemo;
