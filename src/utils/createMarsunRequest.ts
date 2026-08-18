import { message } from 'antd';
import axios from 'axios';

export interface MarsunApiResponse<T = unknown> {
  code: number;
  message?: string;
  data?: T;
}

export interface MarsunRequestErrorResponse {
  data?: unknown;
  status?: number;
  config?: unknown;
}

export interface CreateMarsunRequestOptions {
  baseURL?: string;
  timeout?: number;
  successCode?: number;
  /** Cookie 会话 SSO：跨域携带凭证 */
  withCredentials?: boolean;
  getToken?: () => string | null;
  onUnauthorized?: () => void;
  isPublicUrl?: (url: string) => boolean;
  isOnLoginPage?: () => boolean;
  showError?: (msg: string) => void;
  /** 自定义错误信息提取；默认按 message/detail/msg 顺序兜底 */
  getResponseError?: (response: MarsunRequestErrorResponse | undefined) => string;
  /** 信封 code != successCode 时不 reject、不 showError，原样返回信封由调用方自判（用于复用既有 unwrap 逻辑的接入方） */
  passThroughEnvelopeError?: boolean;
}

/** 与 axios 实例兼容的请求客户端（避免对外暴露 axios 类型，消除多副本 axios 的类型冲突） */
export interface MarsunRequestClient {
  get<T = unknown>(url: string, config?: unknown): Promise<T>;
  post<T = unknown>(url: string, data?: unknown, config?: unknown): Promise<T>;
  put<T = unknown>(url: string, data?: unknown, config?: unknown): Promise<T>;
  patch<T = unknown>(url: string, data?: unknown, config?: unknown): Promise<T>;
  delete<T = unknown>(url: string, config?: unknown): Promise<T>;
  request<T = unknown>(config: unknown): Promise<T>;
}

const SKIP_ERROR_HEADER = 'X-Skip-Error-Handler';

function getSkipHandler(headers: unknown): boolean {
  return Boolean((headers as Record<string, string> | undefined)?.[SKIP_ERROR_HEADER]);
}

/** 创建带鉴权、统一错误处理的 axios 实例 */
export function createMarsunRequest(options: CreateMarsunRequestOptions = {}): MarsunRequestClient {
  const {
    baseURL = '/api',
    timeout = 30000,
    successCode = 0,
    withCredentials = false,
    getToken,
    onUnauthorized,
    isPublicUrl = () => false,
    isOnLoginPage = () => false,
    showError = (msg) => message.error(msg),
    getResponseError,
    passThroughEnvelopeError = false,
  } = options;

  const extractError = (response: MarsunRequestErrorResponse | undefined): string => {
    if (getResponseError) return getResponseError(response);
    const data = response?.data as { message?: string; detail?: string; msg?: string } | undefined;
    return data?.message || data?.detail || data?.msg || '请求失败';
  };

  const request = axios.create({
    baseURL,
    timeout,
    withCredentials,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  request.interceptors.request.use(
    (config) => {
      const token = getToken?.();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  request.interceptors.response.use(
    (response) => {
      const responseType = (response.config as { responseType?: string } | undefined)?.responseType;
      if (responseType === 'blob' || responseType === 'arraybuffer') {
        return response.data;
      }
      const data = response.data;
      const isEnvelope = data && typeof data === 'object' && 'code' in data;
      if (!isEnvelope) {
        return data;
      }
      const envelope = data as MarsunApiResponse;
      if (envelope.code !== successCode) {
        if (passThroughEnvelopeError) {
          return data;
        }
        if (!getSkipHandler(response.config.headers)) {
          showError(envelope.message || '请求失败');
        }
        return Promise.reject(new Error(envelope.message || '请求失败'));
      }
      return data;
    },
    (error) => {
      const url = error.config?.url ?? '';
      const skipHandler = getSkipHandler(error.config?.headers);

      if (error.response?.status === 401) {
        if (!isPublicUrl(url) && !isOnLoginPage()) {
          onUnauthorized?.();
        }
      } else if (!skipHandler) {
        showError(extractError(error.response));
      }
      return Promise.reject(new Error(extractError(error.response)));
    },
  );

  return request as MarsunRequestClient;
}
