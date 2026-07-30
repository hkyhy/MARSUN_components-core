import ButtonGroup from '@kne/button-group';
import { Modal as AntModal } from 'antd';
import classNames from 'classnames';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Info } from '../../Icons';
import { TooltipInfo } from '../../TooltipInfo';
import { VirtualScrollbar } from '../../VirtualScrollbar';
import type { MarsunModalProps } from '../ModalTypes';
import {
  MODAL_SIZE_BODY_HEIGHT,
  resolveModalSizeAnchor,
  resolveModalWidth,
} from '../utils/resolveModalSize';
import styles from './style.module.scss';

function useViewportWidth(): number {
  const [vw, setVw] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200));

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return vw;
}

/**
 * 通用居中 Modal：必填标题、可选 info/description、标题 Action（ButtonGroup）、S/M/L 宽度（只可缩小）、固定 body 高。
 */
const Modal: React.FC<MarsunModalProps> = ({
  open,
  onCancel,
  title,
  info,
  description,
  actions,
  footer = null,
  size,
  width,
  children,
  className,
  destroyOnHidden = true,
  maskClosable = false,
  scrollable = false,
  closable = true,
}) => {
  const viewportWidth = useViewportWidth();
  const effectiveWidth = useMemo(
    () => resolveModalWidth({ size, width, viewportWidth }),
    [size, width, viewportWidth],
  );
  const sizeAnchor = useMemo(
    () => resolveModalSizeAnchor({ size, width, viewportWidth }),
    [size, width, viewportWidth],
  );
  const bodyHeight = MODAL_SIZE_BODY_HEIGHT[sizeAnchor];

  const visibleActions = useMemo(() => {
    const list = (actions ?? []).filter((a) => !a.hidden);
    const first = list[0];
    if (!first || first.type != null) return list;
    return [{ ...first, type: 'primary' as const }, ...list.slice(1)];
  }, [actions]);

  const titleNode = (
    <div className={classNames('marsun-modal-title-wrap', styles['marsun-modal-title-wrap'])}>
      <div className={classNames('marsun-modal-title-row', styles['marsun-modal-title-row'])}>
        <div className={classNames('marsun-modal-title-group', styles['marsun-modal-title-group'])}>
          <div className={classNames('marsun-modal-title', styles['marsun-modal-title'])}>
            {title}
          </div>
          {info?.length ? (
            <TooltipInfo
              content={info}
              placement="topLeft"
              overlayStyle={{ minWidth: 220, maxWidth: 360 }}
              overlayClassName="marsun-modal-info-tooltip"
            >
              <span
                className={classNames(
                  'marsun-modal-info-trigger',
                  styles['marsun-modal-info-trigger'],
                )}
              >
                <Info size={16} aria-hidden />
              </span>
            </TooltipInfo>
          ) : null}
        </div>
        {visibleActions.length > 0 ? (
          <div
            className={classNames(
              'marsun-modal-title-actions',
              styles['marsun-modal-title-actions'],
            )}
          >
            <ButtonGroup list={visibleActions} showLength={Math.max(visibleActions.length, 2)} />
          </div>
        ) : null}
      </div>
      {description ? (
        <div className={classNames('marsun-modal-description', styles['marsun-modal-description'])}>
          {description}
        </div>
      ) : null}
    </div>
  );

  const body: ReactNode = scrollable ? (
    <VirtualScrollbar
      wrapperClassName={classNames(
        'marsun-modal-scroll-wrapper',
        styles['marsun-modal-scroll-wrapper'],
      )}
      className={classNames('marsun-modal-scroll', styles['marsun-modal-scroll'])}
    >
      {children}
    </VirtualScrollbar>
  ) : (
    <div className={classNames('marsun-modal-body-inner', styles['marsun-modal-body-inner'])}>
      {children}
    </div>
  );

  return (
    <AntModal
      open={open}
      onCancel={onCancel}
      title={titleNode}
      footer={footer}
      width={effectiveWidth}
      centered
      closable={closable}
      maskClosable={maskClosable}
      destroyOnHidden={destroyOnHidden}
      className={classNames('marsun-modal', styles['marsun-modal'], className)}
      styles={{
        body: {
          height: bodyHeight,
          maxHeight: bodyHeight,
          overflow: 'hidden',
          paddingTop: 12,
          paddingBottom: 12,
        },
      }}
    >
      {body}
    </AntModal>
  );
};

export default Modal;
