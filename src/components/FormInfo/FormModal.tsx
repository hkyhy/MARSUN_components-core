// @ts-nocheck
import classnames from 'classnames';
import { ReactModal, useModal } from '@/components/ReactModal';
import { buildFormOverlayProps } from './buildFormOverlayProps';
import type { FormModalProps } from './types';
import style from './style.module.scss';

/**
 * 受控 FormModal：默认挂本仓 ReactModal；可传 renderModal（createModalRender/createDrawerRender）切换宿主。
 * destroyOnHidden。
 */
const FormModal = (props: FormModalProps) => {
  const { open, onCancel, onClose, renderModal, ...rest } = props;
  const close = onCancel ?? onClose;
  const overlayProps = buildFormOverlayProps(
    { ...rest, onClose: close, onCancel: close },
    { close },
  );
  const hostProps = {
    ...overlayProps,
    open: !!open,
    className: classnames(
      style['marsun-form-info-modal'],
      'marsun-form-info-modal',
      overlayProps.className,
    ),
    destroyOnHidden: true as const,
  };
  if (typeof renderModal === 'function') {
    return renderModal(hostProps);
  }
  return <ReactModal {...hostProps} />;
};

export default FormModal;

/** 命令式打开：内部挂 useModal */
export const useFormModal = () => {
  const modal = useModal();
  return (props: FormModalProps = {}) => {
    const api: { close?: () => void } = {};
    const close = () => api.close?.();
    const opened = modal(
      buildFormOverlayProps(
        {
          ...props,
          onClose: props.onClose || props.onCancel || close,
        },
        { close },
      ),
    );
    api.close = opened.close;
    return opened;
  };
};
