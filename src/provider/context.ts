import type { ThemeConfig } from 'antd';
import { createContext, useContext } from 'react';

export type MarsunAuthContext = {
  isAuthenticated: boolean;
  user: Record<string, unknown> | null;
  hasAnyRole?: (roles: string[]) => boolean;
  hasPermission?: (permission: string) => boolean;
};

export type MarsunFetchContext = {
  baseUrl?: string;
  timeoutMs?: number;
  headers?: Record<string, string>;
};

export type MarsunCoreContextValue = {
  auth: MarsunAuthContext;
  fetch: MarsunFetchContext;
  theme: {
    primaryColor: string;
    themeConfig?: ThemeConfig;
  };
};

const defaultAuth: MarsunAuthContext = {
  isAuthenticated: false,
  user: null,
  hasAnyRole: () => false,
  hasPermission: () => false,
};

export const MarsunCoreContext = createContext<MarsunCoreContextValue>({
  auth: defaultAuth,
  fetch: {},
  theme: { primaryColor: '#1677ff' },
});

export function useMarsunCore(): MarsunCoreContextValue {
  return useContext(MarsunCoreContext);
}

export function useMarsunAuth(): MarsunAuthContext {
  return useContext(MarsunCoreContext).auth;
}

export function useMarsunFetch(): MarsunFetchContext {
  return useContext(MarsunCoreContext).fetch;
}
