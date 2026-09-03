// @ts-nocheck
import classnames from 'classnames';
import { ReactDrawer, useDrawer } from '@/components/ReactModal';
import { buildFormOverlayProps } from './buildFormOverlayProps';
import type { FormDrawerProps } from './types';
import style from './style.module.scss';

const buildFormDrawerProps = (props: FormDrawerProps, options?: { close?: () => void }) => {
  const { placement = 'right', className, ...rest } = props;
  return {
    ...buildFormOverlayProps({ ...rest, className }, options),
    placement,
    className: classnames(style['marsun-form-info-drawer'], 'marsun-form-info-drawer', className),
  };
};

/**
 * 受控 FormDrawer：挂本仓 ReactDrawer；placement 默认 right；destroyOnHidden。
 */
const FormDrawer = (props: FormDrawerProps) => {
  const { open, onCancel, onClose, ...rest } = props;
  const close = onCancel ?? onClose;
  const overlayProps = buildFormDrawerProps(
    { ...rest, onClose: close, onCancel: close },
    { close },
  );
  return <ReactDrawer {...overlayProps} open={!!open} destroyOnHidden />;
};

export default FormDrawer;

export const useFormDrawer = () => {
  const drawer = useDrawer();
  return (props: FormDrawerProps = {}) => {
    const api: { close?: () => void } = {};
    const close = () => api.close?.();
    const opened = drawer(
      buildFormDrawerProps(
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
