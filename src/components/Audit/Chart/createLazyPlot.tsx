import { lazy, Suspense, isValidElement, type ComponentType } from 'react';
import ChartLazyBoundary from './ChartLazyBoundary';
import { loadChartExport } from './loadChartExport';

type ChartsModule = typeof import('@ant-design/charts');

function isPlotMarkList(value: unknown): value is Record<string, unknown>[] {
  if (!Array.isArray(value)) return false;
  if (value.length === 0) return true;
  const first = value[0];
  if (first == null || typeof first !== 'object' || isValidElement(first)) return false;
  return 'type' in first;
}

/** Audit 内懒加载图种；定高避免 height:inherit → 空白 */
export function createLazyPlot<K extends keyof ChartsModule>(exportName: K) {
  const Plot = lazy(() => loadChartExport(exportName)) as unknown as ComponentType<
    Record<string, unknown>
  >;

  function LazyPlot(props: Record<string, unknown>) {
    const height = typeof props.height === 'number' ? props.height : 300;
    const { containerStyle: userContainerStyle, marks, children, ...rest } = props;
    const containerStyle = {
      width: '100%',
      height,
      ...(typeof userContainerStyle === 'object' && userContainerStyle
        ? (userContainerStyle as Record<string, unknown>)
        : {}),
    };
    const plotProps: Record<string, unknown> = {
      ...rest,
      height,
      autoFit: true,
      containerStyle,
    };
    if (marks !== undefined) {
      plotProps.children = marks;
    } else if (isPlotMarkList(children)) {
      plotProps.children = children;
    }

    return (
      <ChartLazyBoundary height={height}>
        <Suspense fallback={<div style={{ height }} aria-hidden />}>
          <Plot {...plotProps} />
        </Suspense>
      </ChartLazyBoundary>
    );
  }

  LazyPlot.displayName = `Lazy${String(exportName)}`;
  return LazyPlot;
}

export const LazyBar = createLazyPlot('Bar');
export const LazyColumn = createLazyPlot('Column');
export const LazyLine = createLazyPlot('Line');
