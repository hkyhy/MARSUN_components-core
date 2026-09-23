import {
  ActionFilterBar,
  ActionListTable,
  ActionTrackingShell,
  canQueryActionList,
  CreateActionModal,
  defaultCreatedRange,
  type ActionListFilters,
  type CreateActionSubmitPayload,
} from '@/components/Tools/ActionTracking';
import { PageShellProvider } from '@/components/Layout/PageShell';
import { InputFilterItem, type FilterValue } from '@/components/ReactFilter';
import { message } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ACTION_DIMENSIONS,
  ACTION_LIST_SEED,
  createActionLoadersFromFixture,
  dimensionLabel,
  statusLabel,
} from '@/components/Tools/ActionTracking/doc/actionTracking.fixture';
import type { ActionListRowBase } from '@/components/Tools/ActionTracking';

/** 1. 页壳 + 筛选 + 列表 + 建单弹层（fixture） */
const ShellPageDemo: React.FC = () => {
  const range = useMemo(() => defaultCreatedRange(), []);
  const [filters, setFilters] = useState<ActionListFilters>({ ...range });
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [rows, setRows] = useState<ActionListRowBase[]>(ACTION_LIST_SEED);
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

  const loaders = useMemo(() => createActionLoadersFromFixture(), []);

  const onSubmit = useCallback(async (payload: CreateActionSubmitPayload) => {
    const id = `act-${Date.now()}`;
    setRows((prev) => [
      {
        id,
        title: payload.title,
        status: payload.status,
        dimension: payload.dimension,
        assignee: payload.assignee,
        owner: payload.allocator,
        factoryName: payload.factoryName || payload.factory,
        metricName: payload.metric,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    message.success(`已写入 fixture：${payload.title}`);
    return id;
  }, []);

  return (
    <PageShellProvider>
      <ActionTrackingShell
        title="行动跟踪（Showcase）"
        description="loaders / 列 / EP 由 App 注入；本页为 fixture 演示"
        syncPageMeta={false}
        fillHeight={false}
        actions={[
          {
            key: 'create',
            children: '新建任务',
            type: 'primary',
            onClick: () => setCreateOpen(true),
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
        modalSlot={
          <CreateActionModal
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            onCreated={() => setCreateOpen(false)}
            dimensionOptions={ACTION_DIMENSIONS}
            loaders={loaders}
            titlePlaceholder="例如：排查用能 EI 偏高"
            metricPlaceholder="例如：EI"
            onSubmit={onSubmit}
          />
        }
      />
    </PageShellProvider>
  );
};

export default ShellPageDemo;
