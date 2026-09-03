// @ts-nocheck
/**
 * 轻量中文字典 HOC；不引入 @kne/react-intl。
 */
import type { ComponentType } from 'react';
import zhCN, { type FormInfoLocaleKey } from './locale/zh-CN';

type FormatValues = Record<string, string | number>;

export function formatLocaleMessage(id: FormInfoLocaleKey, values?: FormatValues): string {
  let text: string = zhCN[id] ?? id;
  if (values) {
    Object.entries(values).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  return text;
}

export function useFormInfoLocale() {
  return {
    formatMessage: ({ id }: { id: FormInfoLocaleKey }, values?: FormatValues) =>
      formatLocaleMessage(id, values),
  };
}

export default function withLocale<P extends object>(Component: ComponentType<P>) {
  function WithLocale(props: P) {
    return <Component {...props} />;
  }
  WithLocale.displayName = `WithLocale(${Component.displayName || Component.name || 'Component'})`;
  return WithLocale;
}
