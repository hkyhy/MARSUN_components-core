import { message } from 'antd';
import axios from 'axios';

export interface MarsunApiResponse<T = unknown> {
  code: number;
  message?: string;
  data?: T;
}

export interface CreateMarsunRequestOptions {
  baseURL?: string;
  timeout?: number;
  successCode?: number;
  getToken?: () => string | null;
  onUnauthorized?: () => void;
  isPublicUrl?: (url: string) => boolean;
  isOnLoginPage?: () => boolean;
  showError?: (msg: string) => void;
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
    getToken,
    onUnauthorized,
    isPublicUrl = () => false,
    isOnLoginPage = () => false,
    showError = (msg) => message.error(msg),
  } = options;

  const request = axios.create({
    baseURL,
    timeout,
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
      const data = response.data as MarsunApiResponse;
      if (data.code !== successCode) {
        if (!getSkipHandler(response.config.headers)) {
          showError(data.message || '请求失败');
        }
        return Promise.reject(new Error(data.message || '请求失败'));
      }
      return response.data;
    },
    (error) => {
      const url = error.config?.url ?? '';
      const skipHandler = getSkipHandler(error.config?.headers);

      if (error.response?.status === 401) {
        if (!isPublicUrl(url) && !isOnLoginPage()) {
          onUnauthorized?.();
        }
      } else if (!skipHandler) {
        const msg = error.response?.data?.message || error.message || '请求失败';
        showError(msg);
      }
      const msg = error.response?.data?.message || error.message || '请求失败';
      return Promise.reject(new Error(msg));
    },
  );

  return request as MarsunRequestClient;
}
