import { describe, expect, it, vi } from 'vitest';
import {
  createPagedSuperSelectApi,
  pagedSuperSelectGetSearchProps,
  pagedSuperSelectPagination,
  PAGED_SUPER_SELECT_PAGE_SIZE,
} from '../createPagedSuperSelectApi';

describe('createPagedSuperSelectApi', () => {
  it('maps kne data → loadPage query and returns page', async () => {
    const loadPage = vi.fn(async () => ({
      pageData: [{ value: 'V1', label: '品种1' }],
      totalCount: 1,
    }));
    const api = createPagedSuperSelectApi({ loadPage, pageSize: 20 });
    expect(api.data).toEqual({ currentPage: 1, perPage: 20, keyword: '' });
    const page = await api.loader({
      data: { currentPage: 2, perPage: 20, keyword: '棉' },
    });
    expect(loadPage).toHaveBeenCalledWith({
      keyword: '棉',
      currentPage: 2,
      pageSize: 20,
    });
    expect(page).toEqual({
      pageData: [{ value: 'V1', label: '品种1' }],
      totalCount: 1,
    });
  });

  it('onError + empty page when loadPage throws', async () => {
    const onError = vi.fn();
    const api = createPagedSuperSelectApi({
      loadPage: async () => {
        throw new Error('boom');
      },
      onError,
    });
    const page = await api.loader({ data: {} });
    expect(onError).toHaveBeenCalled();
    expect(page).toEqual({ pageData: [], totalCount: 0 });
  });
});

describe('pagedSuperSelect helpers', () => {
  it('getSearchProps resets page', () => {
    const getSearchProps = pagedSuperSelectGetSearchProps(30);
    expect(getSearchProps({ searchText: 'x' })).toEqual({
      keyword: 'x',
      currentPage: 1,
      perPage: 30,
    });
  });

  it('pagination open:false scroll mode', () => {
    expect(pagedSuperSelectPagination()).toEqual({
      open: false,
      paramsType: 'data',
      current: 'currentPage',
      pageSizeName: 'perPage',
      pageSize: PAGED_SUPER_SELECT_PAGE_SIZE,
    });
  });
});
