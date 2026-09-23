/**
 * kne SuperSelect 远程分页下拉（对齐 EAM CycleForm / materialFilterRemoteSelect）。
 * App 注入 loadPage；core 禁直连业务 API。
 */

export const PAGED_SUPER_SELECT_PAGE_SIZE = 50;

export type PagedSuperSelectOption = {
  label: string;
  value: string;
};

export type PagedSuperSelectQuery = {
  keyword?: string;
  currentPage: number;
  pageSize: number;
};

export type PagedSuperSelectPage = {
  pageData: PagedSuperSelectOption[];
  totalCount: number;
};

export type CreatePagedSuperSelectApiOptions = {
  pageSize?: number;
  loadPage: (query: PagedSuperSelectQuery) => Promise<PagedSuperSelectPage>;
  /** 失败时回调（如 message.error）；未传则静默空页 */
  onError?: (error: unknown) => void;
};

type KneLoaderData = {
  currentPage?: number;
  perPage?: number;
  keyword?: string;
};

/** kne SuperSelect.api：data + loader → { pageData, totalCount } */
export function createPagedSuperSelectApi(options: CreatePagedSuperSelectApiOptions) {
  const pageSize = options.pageSize ?? PAGED_SUPER_SELECT_PAGE_SIZE;
  return {
    data: {
      currentPage: 1,
      perPage: pageSize,
      keyword: '',
    },
    loader: async ({ data }: { data?: KneLoaderData }) => {
      try {
        return await options.loadPage({
          keyword: data?.keyword,
          currentPage: data?.currentPage ?? 1,
          pageSize: data?.perPage ?? pageSize,
        });
      } catch (error) {
        options.onError?.(error);
        return { pageData: [] as PagedSuperSelectOption[], totalCount: 0 };
      }
    },
  };
}

/** kne SuperSelect.getSearchProps：搜索重置到第 1 页 */
export function pagedSuperSelectGetSearchProps(
  pageSize: number = PAGED_SUPER_SELECT_PAGE_SIZE,
): (args: { searchText?: string }) => {
  keyword: string;
  currentPage: number;
  perPage: number;
} {
  return ({ searchText }) => ({
    keyword: searchText || '',
    currentPage: 1,
    perPage: pageSize,
  });
}

/**
 * kne FetchScrollLoader：`open:false` = 滚动加载（非翻页器）。
 * 与 EAM machineFilterPagination / energyMaterialFilterPagination 同口径。
 */
export function pagedSuperSelectPagination(pageSize: number = PAGED_SUPER_SELECT_PAGE_SIZE): {
  open: false;
  paramsType: 'data';
  current: 'currentPage';
  pageSizeName: 'perPage';
  pageSize: number;
} {
  return {
    open: false,
    paramsType: 'data',
    current: 'currentPage',
    pageSizeName: 'perPage',
    pageSize,
  };
}
