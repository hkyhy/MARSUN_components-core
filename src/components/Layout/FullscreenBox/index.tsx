import { Maximize2, Minimize2 } from '@/components/Icons';
import { Button, Tooltip } from 'antd';
import classNames from 'classnames';
import { useEffect, type HTMLAttributes, type ReactNode } from 'react';
import styles from './style.module.scss';

export type FullscreenBoxProps = {
  children: ReactNode;
  className?: string;
  /** 全屏时附加 class（如加大 padding） */
  fullscreenClassName?: string;
  fullscreen: boolean;
  onFullscreenChange?: (fullscreen: boolean) => void;
  /** Esc 退出，默认 true */
  exitOnEsc?: boolean;
  /** 全屏时锁定 body 滚动，默认 true */
  lockScroll?: boolean;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

/**
 * CSS 铺满视口（非浏览器 Fullscreen API）。Esc 退出；z-index 1100 对齐业务浮层。
 * 弹层（Modal / FormModal）须高于 1100（core `zIndexPopupBase` = 1200）。
 */
const FullscreenBox: React.FC<FullscreenBoxProps> = ({
  children,
  className,
  fullscreenClassName,
  fullscreen,
  onFullscreenChange,
  exitOnEsc = true,
  lockScroll = true,
  ...rest
}) => {
  useEffect(() => {
    if (!fullscreen) return undefined;

    const onKey = (e: KeyboardEvent) => {
      if (!exitOnEsc || e.key !== 'Escape') return;
      if (document.querySelector('.ant-modal-wrap')) return;
      onFullscreenChange?.(false);
    };
    const prevOverflow = document.body.style.overflow;
    if (lockScroll) document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      if (lockScroll) document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [exitOnEsc, fullscreen, lockScroll, onFullscreenChange]);

  return (
    <div
      {...rest}
      className={classNames(
        'marsun-fullscreen-box',
        styles['marsun-fullscreen-box'],
        fullscreen && styles['marsun-fullscreen-box--open'],
        className,
        fullscreen && fullscreenClassName,
      )}
      data-fullscreen={fullscreen ? '1' : undefined}
    >
      {children}
    </div>
  );
};

export type FullscreenToggleProps = {
  fullscreen: boolean;
  onToggle: () => void;
  className?: string;
  /** 图标旁标题（如对比矩阵：点标题也可全屏） */
  children?: ReactNode;
};

export const FullscreenToggle: React.FC<FullscreenToggleProps> = ({
  fullscreen,
  onToggle,
  className,
  children,
}) => (
  <Tooltip title={fullscreen ? '退出全屏（Esc）' : '铺满全屏'}>
    <Button
      type="text"
      size="small"
      htmlType="button"
      className={classNames(
        'marsun-fullscreen-toggle',
        styles['marsun-fullscreen-toggle'],
        className,
      )}
      icon={fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      aria-label={fullscreen ? '退出全屏' : '铺满全屏'}
      aria-pressed={fullscreen}
      onClick={onToggle}
    >
      {children ? (
        <span
          className={classNames(
            'marsun-fullscreen-toggle-title',
            styles['marsun-fullscreen-toggle-title'],
          )}
        >
          {children}
        </span>
      ) : null}
    </Button>
  </Tooltip>
);

export default FullscreenBox;
export { useFullscreen } from './useFullscreen';
