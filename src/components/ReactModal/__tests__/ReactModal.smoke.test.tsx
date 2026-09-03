import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from 'antd';
import {
  ReactModal,
  ReactDrawer,
  useModal,
  useDrawer,
  useConfirmModal,
  createModalRender,
  createDrawerRender,
  TabsLayout,
  ColumnsLayout,
  ScrollRegion,
  modalClassNames,
} from '../index';

describe('ReactModal smoke', () => {
  it('exports key members', () => {
    expect(ReactModal).toBeTruthy();
    expect(ReactDrawer).toBeTruthy();
    expect(useModal).toBeTypeOf('function');
    expect(useDrawer).toBeTypeOf('function');
    expect(useConfirmModal).toBeTypeOf('function');
    expect(createModalRender).toBeTypeOf('function');
    expect(createDrawerRender).toBeTypeOf('function');
    expect(TabsLayout).toBeTruthy();
    expect(ColumnsLayout).toBeTruthy();
    expect(ScrollRegion).toBeTruthy();
    expect(modalClassNames).toBeTruthy();
  });

  it('mounts ReactModal when open', () => {
    render(
      <ReactModal open title="烟雾弹层" onClose={() => undefined}>
        <div>弹层正文</div>
      </ReactModal>,
    );
    expect(screen.getByText('烟雾弹层')).toBeInTheDocument();
    expect(screen.getByText('弹层正文')).toBeInTheDocument();
  });

  it('useConfirmModal is callable under App', () => {
    let confirmFn: ((opts: Record<string, unknown>) => unknown) | null = null;
    function Probe() {
      confirmFn = useConfirmModal();
      return null;
    }
    render(
      <App>
        <Probe />
      </App>,
    );
    expect(confirmFn).toBeTypeOf('function');
    expect(() =>
      confirmFn?.({
        type: 'info',
        title: '提示',
        message: '可调用',
      }),
    ).not.toThrow();
  });
});
