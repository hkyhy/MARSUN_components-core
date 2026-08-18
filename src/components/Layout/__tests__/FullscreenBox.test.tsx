import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import FullscreenBox, { FullscreenToggle } from '../FullscreenBox';

afterEach(() => {
  document.body.style.overflow = '';
});

describe('FullscreenBox', () => {
  it('renders children and data-fullscreen when open', () => {
    const { rerender } = render(
      <FullscreenBox fullscreen={false}>
        <span>panel</span>
      </FullscreenBox>,
    );
    expect(screen.getByText('panel')).toBeInTheDocument();
    expect(document.querySelector('[data-fullscreen]')).not.toBeInTheDocument();

    rerender(
      <FullscreenBox fullscreen>
        <span>panel</span>
      </FullscreenBox>,
    );
    expect(document.querySelector('[data-fullscreen="1"]')).toBeInTheDocument();
  });

  it('exits on Escape', () => {
    const onChange = vi.fn();
    render(
      <FullscreenBox fullscreen onFullscreenChange={onChange}>
        <span>panel</span>
      </FullscreenBox>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('locks body overflow while open', () => {
    document.body.style.overflow = '';
    const { unmount } = render(
      <FullscreenBox fullscreen>
        <span>panel</span>
      </FullscreenBox>,
    );
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});

describe('FullscreenToggle', () => {
  it('toggles with accessible name 铺满全屏', () => {
    const onToggle = vi.fn();
    render(<FullscreenToggle fullscreen={false} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button', { name: '铺满全屏' }));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('shows 退出全屏 when already fullscreen', () => {
    render(<FullscreenToggle fullscreen onToggle={() => undefined} />);
    expect(screen.getByRole('button', { name: '退出全屏' })).toBeInTheDocument();
  });
});
