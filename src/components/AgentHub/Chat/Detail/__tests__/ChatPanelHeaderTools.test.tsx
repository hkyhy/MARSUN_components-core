import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ChatPanelHeaderTools, { DEFAULT_CHAT_ZOOM_STEPS } from '../ChatPanelHeaderTools';

describe('ChatPanelHeaderTools', () => {
  it('steps zoom and toggles fullscreen', () => {
    const onContentZoomChange = vi.fn();
    const onFullscreenChange = vi.fn();

    render(
      <ChatPanelHeaderTools
        contentZoom={1}
        zoomSteps={DEFAULT_CHAT_ZOOM_STEPS}
        onContentZoomChange={onContentZoomChange}
        fullscreen={false}
        onFullscreenChange={onFullscreenChange}
        onNewSession={() => undefined}
      />,
    );

    fireEvent.click(screen.getByLabelText('缩小对话内容'));
    expect(onContentZoomChange).toHaveBeenCalledWith(0.85);

    fireEvent.click(screen.getByLabelText('全屏'));
    expect(onFullscreenChange).toHaveBeenCalledWith(true);
  });
});
