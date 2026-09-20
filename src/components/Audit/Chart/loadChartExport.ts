import { createElement, type ComponentType } from 'react';
import { Empty } from 'antd';

type ChartsModule = typeof import('@ant-design/charts');

/** 动态加载图种；失败回落 Empty（禁 JSX，保持 .ts） */
export function loadChartExport<K extends keyof ChartsModule>(
  exportName: K,
): Promise<{ default: ComponentType<Record<string, unknown>> }> {
  return import('@ant-design/charts')
    .then((m) => {
      const Comp = m[exportName];
      if (!Comp) {
        throw new Error(`@ant-design/charts missing export: ${String(exportName)}`);
      }
      return { default: Comp as ComponentType<Record<string, unknown>> };
    })
    .catch((err: unknown) => {
      console.error(`[loadChartExport] ${String(exportName)} failed`, err);
      const Fallback: ComponentType<Record<string, unknown>> = () =>
        createElement(Empty, { description: '图表资源过期，请刷新页面' });
      return { default: Fallback };
    });
}
