import { describe, expect, it } from 'vitest';
import { act, render } from '@testing-library/react';
import { App, ConfigProvider, Modal } from 'antd';
import { useConfirmModal } from '../index';
import { LAYOUT_TOKENS } from '../../../theme/constants';

describe('useConfirmModal zIndex', () => {
  it('二次确认须高于 core 主题下的 Modal（zIndexPopupBase=1200）', () => {
    let confirmFn: ((opts: Record<string, unknown>) => unknown) | null = null;
    function Probe() {
      confirmFn = useConfirmModal();
      return null;
    }
    render(
      <ConfigProvider theme={{ token: { zIndexPopupBase: LAYOUT_TOKENS.zIndexPopupBase } }}>
        <App>
          <Modal open title="报告弹层">
            <div>报告正文</div>
          </Modal>
          <Probe />
        </App>
      </ConfigProvider>,
    );

    act(() => {
      confirmFn?.({
        type: 'confirm',
        danger: true,
        title: '删除该条目？',
        message: '删除后不可恢复。',
        confirmText: '删除',
      });
    });

    const wraps = [...document.querySelectorAll<HTMLElement>('.ant-modal-wrap')];
    const confirmWrap = wraps.find((w) => w.textContent?.includes('删除该条目？'));
    expect(confirmWrap).toBeTruthy();
    // Modal wrap 的 z-index 来自 CSS var(--ant-z-index-popup-base)=1200；
    // 确认弹窗走内联 zIndex，必须严格高于它才不会被报告弹窗压住。
    const confirmZ = Number(confirmWrap!.style.zIndex);
    expect(confirmZ).toBeGreaterThan(LAYOUT_TOKENS.zIndexPopupBase);
  });

  it('显式传入 zIndex 时仍按传入值生效', () => {
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

    act(() => {
      confirmFn?.({ type: 'confirm', title: '自定义层级？', message: 'x', zIndex: 1500 });
    });

    const wraps = [...document.querySelectorAll<HTMLElement>('.ant-modal-wrap')];
    const confirmWrap = wraps.find((w) => w.textContent?.includes('自定义层级？'));
    expect(confirmWrap?.style.zIndex).toBe('1500');
  });
});
