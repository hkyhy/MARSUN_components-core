import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ResizableHeaderCell from '../ResizableHeaderCell';

afterEach(() => {
  cleanup();
});

describe('ResizableHeaderCell', () => {
  it('renders plain th when onResize missing', () => {
    render(
      <table>
        <thead>
          <tr>
            <ResizableHeaderCell width={120}>标题</ResizableHeaderCell>
          </tr>
        </thead>
      </table>,
    );
    expect(screen.queryByRole('separator')).toBeNull();
    expect(screen.getByText('标题')).toBeTruthy();
  });

  it('drags and reports clamped width', () => {
    const onResize = vi.fn();
    const onResizeStop = vi.fn();
    render(
      <table>
        <thead>
          <tr>
            <ResizableHeaderCell width={100} onResize={onResize} onResizeStop={onResizeStop}>
              标题
            </ResizableHeaderCell>
          </tr>
        </thead>
      </table>,
    );
    const handle = screen.getByRole('separator');
    fireEvent.mouseDown(handle, { clientX: 0 });
    fireEvent.mouseMove(document, { clientX: 50 });
    fireEvent.mouseUp(document);
    expect(onResize).toHaveBeenCalled();
    const last = onResize.mock.calls.at(-1)?.[0];
    expect(last).toBe(150);
    expect(onResizeStop).toHaveBeenCalledWith(150);
  });

  it('clamps to max on drag', () => {
    const onResize = vi.fn();
    render(
      <table>
        <thead>
          <tr>
            <ResizableHeaderCell width={400} maxWidth={480} onResize={onResize}>
              标题
            </ResizableHeaderCell>
          </tr>
        </thead>
      </table>,
    );
    const handle = screen.getByRole('separator');
    fireEvent.mouseDown(handle, { clientX: 0 });
    fireEvent.mouseMove(document, { clientX: 200 });
    fireEvent.mouseUp(document);
    expect(onResize.mock.calls.at(-1)?.[0]).toBe(480);
  });

  it('double-click handle calls onReset', () => {
    const onReset = vi.fn();
    const onResize = vi.fn();
    render(
      <table>
        <thead>
          <tr>
            <ResizableHeaderCell width={120} onResize={onResize} onReset={onReset}>
              标题
            </ResizableHeaderCell>
          </tr>
        </thead>
      </table>,
    );
    fireEvent.doubleClick(screen.getByRole('separator'));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
