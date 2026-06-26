import { ConfigProvider } from 'antd';
import type { ThemeConfig } from 'antd';
import React, { useEffect, useMemo } from 'react';
import { DEFAULT_PRIMARY_COLOR, applyThemeToCssVariables, generateTheme } from '@/theme';
import {
  MarsunCoreContext,
  type MarsunAuthContext,
  type MarsunFetchContext,
} from './context';

export type MarsunCoreProviderProps = {
  children: React.ReactNode;
  /** 主题覆盖；外层已有 ConfigProvider 时 token 自然优先 */
  theme?: {
    primaryColor?: string;
    themeConfig?: ThemeConfig;
  };
  /** 鉴权注入（Auth / AgentHub guards 使用） */
  auth?: Partial<MarsunAuthContext>;
  /** fetch 模式默认配置 */
  fetch?: MarsunFetchContext;
  /** 设为 false 时不渲染内部 ConfigProvider（消费方已包裹时） */
  withConfigProvider?: boolean;
};

const MarsunCoreProvider: React.FC<MarsunCoreProviderProps> = ({
  children,
  theme: themeProp,
  auth: authProp,
  fetch: fetchProp,
  withConfigProvider = true,
}) => {
  const primaryColor = themeProp?.primaryColor ?? DEFAULT_PRIMARY_COLOR;

  const contextValue = useMemo(
    () => ({
      auth: {
        isAuthenticated: authProp?.isAuthenticated ?? false,
        user: authProp?.user ?? null,
        hasAnyRole: authProp?.hasAnyRole ?? (() => false),
        hasPermission: authProp?.hasPermission ?? (() => false),
      },
      fetch: fetchProp ?? {},
      theme: {
        primaryColor,
        themeConfig: themeProp?.themeConfig,
      },
    }),
    [authProp, fetchProp, primaryColor, themeProp?.themeConfig],
  );

  const antdTheme = themeProp?.themeConfig ?? generateTheme(primaryColor);

  useEffect(() => {
    applyThemeToCssVariables(primaryColor);
  }, [primaryColor]);

  const content = withConfigProvider ? (
    <ConfigProvider
      theme={antdTheme}
      getPopupContainer={() => document.body}
    >
      {children}
    </ConfigProvider>
  ) : (
    children
  );

  return (
    <MarsunCoreContext.Provider value={contextValue}>{content}</MarsunCoreContext.Provider>
  );
};

export default MarsunCoreProvider;
export { MarsunCoreContext, useMarsunAuth, useMarsunCore, useMarsunFetch } from './context';
