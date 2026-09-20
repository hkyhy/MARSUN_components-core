import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Empty } from 'antd';

type Props = { height?: number; children: ReactNode };
type State = { failed: boolean };

export default class ChartLazyBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ChartLazyBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      const height = this.props.height ?? 300;
      return (
        <div style={{ minHeight: height }}>
          <Empty description="图表加载失败，请刷新页面后重试" />
        </div>
      );
    }
    return this.props.children;
  }
}
