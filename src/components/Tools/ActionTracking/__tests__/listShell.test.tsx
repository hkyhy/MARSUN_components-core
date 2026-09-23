import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PageShellProvider } from '../../../Layout/PageShell';
import ActionListTable from '../List/ActionListTable';
import ActionFilterBar from '../List/ActionFilterBar';

describe('ActionListTable 壳', () => {
  it('渲染空态与分页', () => {
    render(
      <PageShellProvider>
        <ActionListTable
          loading={false}
          items={[]}
          columns={[{ title: '标题', dataIndex: 'title', key: 'title' }]}
          total={0}
          currentPage={1}
          pageSize={20}
          onPageChange={() => undefined}
          tableName="test_actions"
          emptyText="暂无任务"
        />
      </PageShellProvider>,
    );
    expect(screen.getByText('暂无任务')).toBeTruthy();
  });
});

describe('ActionFilterBar canQuery 提示', () => {
  it('!canQuery 时展示 hint', () => {
    render(
      <ActionFilterBar
        value={[]}
        onChange={vi.fn()}
        list={[[]]}
        canQuery={false}
        queryBlockedHint="请保留创建时间"
      />,
    );
    expect(screen.getByText('请保留创建时间')).toBeTruthy();
  });
});
