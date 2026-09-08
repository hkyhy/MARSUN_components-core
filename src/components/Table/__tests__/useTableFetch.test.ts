import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { defaultTableTransformData, stableFetchParamsKey, useTableFetch } from '../useTableFetch';

describe('stableFetchParamsKey', () => {
  it('sorts object keys for stable serialization', () => {
    expect(stableFetchParamsKey({ b: 1, a: 2 })).toBe(stableFetchParamsKey({ a: 2, b: 1 }));
  });

  it('treats nullish as empty', () => {
    expect(stableFetchParamsKey(undefined)).toBe('');
    expect(stableFetchParamsKey(null)).toBe('');
  });
});

describe('defaultTableTransformData', () => {
  it('reads pageData + total + mapping as extra', () => {
    const mapped = defaultTableTransformData<{ id: string }>({
      pageData: [{ id: '1' }],
      total: 9,
      mapping: { factory: [] },
    });
    expect(mapped.pageData).toEqual([{ id: '1' }]);
    expect(mapped.total).toBe(9);
    expect(mapped.extra).toEqual({ factory: [] });
  });
});

describe('useTableFetch', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('props mode when dataSource is provided (including empty array)', async () => {
    const fetchData = vi.fn();
    const { result } = renderHook(() =>
      useTableFetch({ dataSource: [], fetchData, enabled: true }),
    );
    expect(result.current.fetchMode).toBe(false);
    expect(fetchData).not.toHaveBeenCalled();
    expect(result.current.rows).toEqual([]);
  });

  it('fetchData loads pageData and supports setPage', async () => {
    const fetchData = vi.fn(async (q: { currentPage: number; pageSize: number }) => ({
      pageData: [{ id: String(q.currentPage) }],
      total: 40,
    }));
    const { result } = renderHook(() =>
      useTableFetch<{ id: string }>({
        dataSource: undefined,
        fetchData,
        enabled: true,
        defaultPageSize: 20,
      }),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.fetchMode).toBe(true);
    expect(result.current.rows).toEqual([{ id: '1' }]);
    expect(result.current.total).toBe(40);

    act(() => result.current.setPage(2));
    await waitFor(() => expect(result.current.rows).toEqual([{ id: '2' }]));
    expect(fetchData).toHaveBeenCalledTimes(2);
  });

  it('resets to page 1 when fetchParams depsKey changes', async () => {
    const fetchData = vi.fn(async (q: { currentPage: number }) => ({
      pageData: [{ id: String(q.currentPage) }],
      total: 10,
    }));
    const { result, rerender } = renderHook(
      ({ params }) =>
        useTableFetch<{ id: string }>({
          dataSource: undefined,
          fetchData,
          fetchParams: params,
          enabled: true,
        }),
      { initialProps: { params: { factoryCode: 'A' } } },
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setPage(3));
    await waitFor(() => expect(result.current.currentPage).toBe(3));

    rerender({ params: { factoryCode: 'B' } });
    await waitFor(() => expect(result.current.currentPage).toBe(1));
    await waitFor(() => expect(result.current.rows).toEqual([{ id: '1' }]));
  });

  it('enabled=false does not call fetchData', async () => {
    const fetchData = vi.fn();
    renderHook(() =>
      useTableFetch({
        dataSource: undefined,
        fetchData,
        enabled: false,
      }),
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(fetchData).not.toHaveBeenCalled();
  });

  it('reload re-fetches', async () => {
    const fetchData = vi.fn(async () => ({ pageData: [{ id: 'x' }], total: 1 }));
    const { result } = renderHook(() =>
      useTableFetch<{ id: string }>({
        dataSource: undefined,
        fetchData,
        enabled: true,
      }),
    );
    await waitFor(() => expect(fetchData).toHaveBeenCalledTimes(1));
    act(() => result.current.reload());
    await waitFor(() => expect(fetchData).toHaveBeenCalledTimes(2));
  });

  it('failure clears rows and sets error', async () => {
    const onFetched = vi.fn();
    const fetchData = vi.fn(async () => {
      throw new Error('boom');
    });
    const { result } = renderHook(() =>
      useTableFetch<{ id: string }>({
        dataSource: undefined,
        fetchData,
        enabled: true,
        onFetched,
      }),
    );
    await waitFor(() => expect(result.current.error?.message).toBe('boom'));
    expect(result.current.rows).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(onFetched).toHaveBeenCalledWith(
      expect.objectContaining({ pageData: [], total: 0, error: expect.any(Error) }),
    );
  });

  it('drops stale response when a newer request finishes first', async () => {
    let resolveSlow: (v: unknown) => void = () => {};
    const slow = new Promise((resolve) => {
      resolveSlow = resolve;
    });
    const fetchData = vi
      .fn()
      .mockImplementationOnce(() => slow)
      .mockImplementationOnce(async () => ({ pageData: [{ id: 'fast' }], total: 1 }));

    const { result } = renderHook(() =>
      useTableFetch<{ id: string }>({
        dataSource: undefined,
        fetchData,
        enabled: true,
      }),
    );

    await waitFor(() => expect(fetchData).toHaveBeenCalledTimes(1));
    act(() => result.current.reload());
    await waitFor(() => expect(fetchData).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.rows).toEqual([{ id: 'fast' }]));

    await act(async () => {
      resolveSlow({ pageData: [{ id: 'slow' }], total: 1 });
      await Promise.resolve();
    });
    expect(result.current.rows).toEqual([{ id: 'fast' }]);
  });

  it('fetchUrl path uses global fetch', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ pageData: [{ id: 'u' }], total: 1 }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() =>
      useTableFetch<{ id: string }>({
        dataSource: undefined,
        fetchUrl: '/api/rows',
        baseUrl: 'http://example.test',
        enabled: true,
      }),
    );
    await waitFor(() => expect(result.current.rows).toEqual([{ id: 'u' }]));
    expect(fetchMock).toHaveBeenCalled();
    const calledUrl = String(fetchMock.mock.calls[0]?.[0] ?? '');
    expect(calledUrl).toContain('http://example.test/api/rows');
  });
});
