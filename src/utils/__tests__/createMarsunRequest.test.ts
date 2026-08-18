import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { createMarsunRequest, isMarsunEnvelope } from '../createMarsunRequest';

/**
 * createMarsunRequest 拦截器行为单测。
 * 用 axios-mock-adapter 拦截真实网络，覆盖三类响应：
 *  - Marsun 信封 { code, message, data }
 *  - Agent / FastAPI 扁平 JSON（无 code，错误体 { detail } 且 HTTP 非 2xx）
 *  - 二进制 blob（responseType: 'blob'）
 */

type Client = ReturnType<typeof createMarsunRequest>;

function setup(options: Parameters<typeof createMarsunRequest>[0] = {}): {
  client: Client;
  mock: MockAdapter;
  showError: ReturnType<typeof vi.fn>;
  onUnauthorized: ReturnType<typeof vi.fn>;
} {
  const showError = vi.fn();
  const onUnauthorized = vi.fn();
  const client = createMarsunRequest({ baseURL: '', showError, onUnauthorized, ...options });
  // client 运行时即 axios 实例；axios-mock-adapter 绑定到该实例拦截真实网络
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mock = new MockAdapter(client as any);
  return { client, mock, showError, onUnauthorized };
}

describe('isMarsunEnvelope', () => {
  it('识别成功信封与仅 code 错误信封', () => {
    expect(isMarsunEnvelope({ code: 0, data: 1 })).toBe(true);
    expect(isMarsunEnvelope({ code: 500 })).toBe(true);
  });

  it('拒绝 kne 风格 { code:200, results } 与非数字 code', () => {
    expect(isMarsunEnvelope({ code: 200, results: [] })).toBe(false);
    expect(isMarsunEnvelope({ code: '0', data: 1 })).toBe(false);
    expect(isMarsunEnvelope({ summary: 'ok' })).toBe(false);
  });
});

describe('createMarsunRequest', () => {
  let originalLocation: typeof window.location;

  beforeEach(() => {
    originalLocation = window.location;
    // isOnLoginPage 默认实现读 window.location.pathname，mock 为非登录页
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, pathname: '/home' },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
  });

  it('信封成功：返回完整信封 { code, message, data }', async () => {
    const { client, mock } = setup();
    mock.onGet('/x').reply(200, { code: 0, message: 'ok', data: { a: 1 } });
    const res = await client.get('/x');
    expect(res).toEqual({ code: 0, message: 'ok', data: { a: 1 } });
    mock.restore();
  });

  it('信封 code != 0：reject 并 showError', async () => {
    const { client, mock, showError } = setup();
    mock.onGet('/x').reply(200, { code: 500, message: '业务错误' });
    await expect(client.get('/x')).rejects.toThrow('业务错误');
    expect(showError).toHaveBeenCalledWith('业务错误');
    mock.restore();
  });

  it('无 code 的扁平 JSON：透传当成功（Agent 微服务）', async () => {
    const { client, mock, showError } = setup();
    mock.onGet('/agent').reply(200, { summary: 'hi', items: [1, 2] });
    const res = await client.get('/agent');
    expect(res).toEqual({ summary: 'hi', items: [1, 2] });
    expect(showError).not.toHaveBeenCalled();
    mock.restore();
  });

  it('responseType=blob：透传二进制，不读 code', async () => {
    const { client, mock } = setup();
    const blob = new Blob(['bytes'], { type: 'text/csv' });
    mock.onGet('/export').reply(200, blob, { 'content-type': 'text/csv' });
    const res = await client.request({ url: '/export', responseType: 'blob' });
    expect(res).toBeInstanceOf(Blob);
    mock.restore();
  });

  it('401：触发 onUnauthorized，不 showError', async () => {
    const { client, mock, showError, onUnauthorized } = setup();
    mock.onGet('/secure').reply(401, { message: '未登录' });
    await expect(client.get('/secure')).rejects.toThrow();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    // 401 走 onUnauthorized，不进 showError 分支
    expect(showError).not.toHaveBeenCalled();
    mock.restore();
  });

  it('X-Skip-Error-Handler：非 2xx 不弹错但仍 reject', async () => {
    const { client, mock, showError } = setup();
    mock.onGet('/silent').reply(500, { message: '内部错误' });
    await expect(
      client.request({ url: '/silent', headers: { 'X-Skip-Error-Handler': 'true' } }),
    ).rejects.toThrow('内部错误');
    expect(showError).not.toHaveBeenCalled();
    mock.restore();
  });

  it('getResponseError 自定义：错误信息走自定义提取', async () => {
    const getResponseError = vi.fn(() => '自定义错误');
    const { client, mock, showError } = setup({ getResponseError });
    mock.onGet('/x').reply(500, { detail: '原始' });
    await expect(client.get('/x')).rejects.toThrow('自定义错误');
    expect(showError).toHaveBeenCalledWith('自定义错误');
    expect(getResponseError).toHaveBeenCalled();
    mock.restore();
  });

  it('无 response.data 的非 2xx：兜底「请求失败」', async () => {
    const { client, mock, showError } = setup();
    mock.onGet('/x').reply(502);
    await expect(client.get('/x')).rejects.toThrow('请求失败');
    expect(showError).toHaveBeenCalledWith('请求失败');
    mock.restore();
  });

  it('axios 超时（ETIMEDOUT）：走错误分支兜底', async () => {
    const { client, mock, showError } = setup({ timeout: 100 });
    mock.onGet('/slow').timeout();
    await expect(client.get('/slow')).rejects.toThrow();
    // 超时无 response.data，兜底「请求失败」
    expect(showError).toHaveBeenCalledWith('请求失败');
    mock.restore();
  });

  it('getToken() 返回 null：请求不带 Authorization', async () => {
    const getToken = vi.fn(() => null);
    const { client, mock } = setup({ getToken });
    let capturedHeaders: Record<string, string> = {};
    mock.onGet('/x').reply((config) => {
      capturedHeaders = config.headers || {};
      return [200, { code: 0, data: 1 }];
    });
    await client.get('/x');
    expect(capturedHeaders.Authorization).toBeUndefined();
    expect(getToken).toHaveBeenCalled();
    mock.restore();
  });

  it('Agent 错误体 { detail } 以非 2xx 返回：走错误拦截器，不被扁平透传误判为成功', async () => {
    const { client, mock, showError } = setup();
    mock.onGet('/agent/error').reply(422, { detail: '参数错误' });
    await expect(client.get('/agent/error')).rejects.toThrow('参数错误');
    expect(showError).toHaveBeenCalledWith('参数错误');
    mock.restore();
  });

  it('2xx + 无 code 合法透传对照（与上一例对照，确认扁平透传只对 2xx 生效）', async () => {
    const { client, mock, showError } = setup();
    mock.onGet('/agent/ok').reply(200, { detail: '这不是错误，是合法扁平载荷' });
    const res = await client.get('/agent/ok');
    expect(res).toEqual({ detail: '这不是错误，是合法扁平载荷' });
    expect(showError).not.toHaveBeenCalled();
    mock.restore();
  });

  it('passThroughEnvelopeError：code != 0 时不 reject 不 showError，原样返回信封', async () => {
    const { client, mock, showError } = setup({ passThroughEnvelopeError: true });
    mock.onGet('/x').reply(200, { code: 500, message: '业务错误', data: null });
    const res = await client.get('/x');
    expect(res).toEqual({ code: 500, message: '业务错误', data: null });
    expect(showError).not.toHaveBeenCalled();
    mock.restore();
  });

  it('passThroughEnvelopeError 不影响 blob 透传与扁平透传', async () => {
    const { client, mock } = setup({ passThroughEnvelopeError: true });
    mock.onGet('/flat').reply(200, { ok: 1 });
    const flat = await client.get('/flat');
    expect(flat).toEqual({ ok: 1 });
    const blob = new Blob(['b'], { type: 'text/plain' });
    mock.onGet('/export').reply(200, blob, { 'content-type': 'text/plain' });
    const out = await client.request({ url: '/export', responseType: 'blob' });
    expect(out).toBeInstanceOf(Blob);
    mock.restore();
  });

  it('{ code: 200, results } 视为扁平透传，不当信封误判', async () => {
    const { client, mock, showError } = setup();
    mock.onGet('/kne-like').reply(200, { code: 200, results: [1] });
    const res = await client.get('/kne-like');
    expect(res).toEqual({ code: 200, results: [1] });
    expect(showError).not.toHaveBeenCalled();
    mock.restore();
  });

  it('仅 { code: 500 } 仍当信封 reject', async () => {
    const { client, mock, showError } = setup();
    mock.onGet('/x').reply(200, { code: 500 });
    await expect(client.get('/x')).rejects.toThrow('请求失败');
    expect(showError).toHaveBeenCalled();
    mock.restore();
  });

  it('isPublicUrl：401 不触发 onUnauthorized', async () => {
    const { client, mock, onUnauthorized } = setup({
      isPublicUrl: (url) => url.includes('/auth/'),
    });
    mock.onGet('/api/auth/session').reply(401, { message: '未登录' });
    await expect(client.get('/api/auth/session')).rejects.toThrow();
    expect(onUnauthorized).not.toHaveBeenCalled();
    mock.restore();
  });

  it('FormData 不强制 application/json', async () => {
    const { client, mock } = setup();
    let contentType: unknown;
    mock.onPost('/upload').reply((config) => {
      const headers = config.headers as Record<string, string> | undefined;
      contentType = headers?.['Content-Type'] ?? headers?.['content-type'];
      return [200, { code: 0, data: true }];
    });
    const fd = new FormData();
    fd.append('f', '1');
    await client.post('/upload', fd);
    expect(String(contentType ?? '')).not.toContain('application/json');
    mock.restore();
  });

  it('AbortSignal：abort 后 reject', async () => {
    const { client, mock } = setup();
    mock.onGet('/slow').reply(() => new Promise(() => undefined));
    const ac = new AbortController();
    const pending = client.get('/slow', { signal: ac.signal });
    ac.abort();
    await expect(pending).rejects.toThrow();
    mock.restore();
  });
});
