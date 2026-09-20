import { Maximize2, Minimize2, Plus, ZoomIn, ZoomOut } from '@/components/Icons';
import { Button, Tooltip } from 'antd';
import classNames from 'classnames';
import { useCallback, type ReactNode } from 'react';
import styles from './style.module.scss';

export const DEFAULT_CHAT_ZOOM_STEPS = [0.2, 0.35, 0.5, 0.7, 0.85, 1, 1.1] as const;

export type ChatPanelHeaderToolsProps = {
  contentZoom: number;
  zoomSteps?: readonly number[];
  onContentZoomChange: (z: number) => void;
  fullscreen?: boolean;
  onFullscreenChange?: (v: boolean) => void;
  onNewSession?: () => void;
  disableActions?: boolean;
  showZoom?: boolean;
  showNewSession?: boolean;
  showFullscreen?: boolean;
  /** 收起等额外槽位（渲染在工具按钮之后） */
  extra?: ReactNode;
  className?: string;
};

function nearestStepIndex(steps: readonly number[], value: number): number {
  let best = 0;
  let bestDist = Math.abs(steps[0]! - value);
  for (let i = 1; i < steps.length; i += 1) {
    const dist = Math.abs(steps[i]! - value);
    if (dist < bestDist) {
      best = i;
      bestDist = dist;
    }
  }
  return best;
}

const ChatPanelHeaderTools: React.FC<ChatPanelHeaderToolsProps> = ({
  contentZoom,
  zoomSteps = DEFAULT_CHAT_ZOOM_STEPS,
  onContentZoomChange,
  fullscreen = false,
  onFullscreenChange,
  onNewSession,
  disableActions = false,
  showZoom = true,
  showNewSession = true,
  showFullscreen = true,
  extra,
  className,
}) => {
  const bumpZoom = useCallback(
    (dir: -1 | 1) => {
      const idx = nearestStepIndex(zoomSteps, contentZoom);
      const next = zoomSteps[Math.min(zoomSteps.length - 1, Math.max(0, idx + dir))];
      if (typeof next === 'number') onContentZoomChange(next);
    },
    [contentZoom, onContentZoomChange, zoomSteps],
  );

  const minZoom = zoomSteps[0] ?? 0.2;
  const maxZoom = zoomSteps[zoomSteps.length - 1] ?? 1.1;

  return (
    <div
      className={classNames(
        'chat-panel-header-tools',
        'chat-panel-header-icon-actions',
        styles['chat-panel-header-tools'],
        className,
      )}
    >
      {showZoom ? (
        <>
          <Tooltip title="缩小对话内容（便于截全图）">
            <Button
              type="text"
              size="small"
              icon={<ZoomOut />}
              aria-label="缩小对话内容"
              disabled={contentZoom <= minZoom}
              onClick={() => bumpZoom(-1)}
            />
          </Tooltip>
          <Tooltip title="重置为 100%">
            <button
              type="button"
              className={classNames(
                'chat-panel-header-tools-zoom-label',
                styles['chat-panel-header-tools-zoom-label'],
              )}
              aria-label={`当前缩放 ${Math.round(contentZoom * 100)}%`}
              onClick={() => onContentZoomChange(1)}
            >
              {Math.round(contentZoom * 100)}%
            </button>
          </Tooltip>
          <Tooltip title="放大对话内容">
            <Button
              type="text"
              size="small"
              icon={<ZoomIn />}
              aria-label="放大对话内容"
              disabled={contentZoom >= maxZoom}
              onClick={() => bumpZoom(1)}
            />
          </Tooltip>
        </>
      ) : null}
      {showNewSession && onNewSession ? (
        <Tooltip title="新建会话">
          <Button
            type="text"
            size="small"
            icon={<Plus />}
            aria-label="新建会话"
            disabled={disableActions}
            onClick={onNewSession}
          />
        </Tooltip>
      ) : null}
      {showFullscreen && onFullscreenChange ? (
        <Tooltip title={fullscreen ? '退出全屏' : '全屏'}>
          <Button
            type="text"
            size="small"
            icon={fullscreen ? <Minimize2 /> : <Maximize2 />}
            aria-label={fullscreen ? '退出全屏' : '全屏'}
            disabled={disableActions}
            onClick={() => onFullscreenChange(!fullscreen)}
          />
        </Tooltip>
      ) : null}
      {extra}
    </div>
  );
};

export default ChatPanelHeaderTools;
