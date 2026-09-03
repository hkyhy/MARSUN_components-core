// @ts-nocheck
import { CancelButton, SubmitButton } from '@kne/react-form-antd';
import classnames from 'classnames';
import type { ReactNode } from 'react';
import Form from './Form';
import type { FormOverlaySharedProps } from './types';
import style from './style.module.scss';

export type BuildFormOverlayOptions = { close?: () => void };

/**
 * 抽出 formProps / autoClose / footer Cancel+Submit，供 Modal/Drawer 共用。
 * Adapted from kne-union/components-core FormInfo/FormModal buildFormOverlayProps.
 */
export function buildFormOverlayProps(
  props: FormOverlaySharedProps,
  { close }: BuildFormOverlayOptions = {},
) {
  const {
    formProps = {},
    saveText,
    okText,
    cancelText,
    autoClose = true,
    footerButtons,
    children,
    onClose,
    onCancel,
    className,
    ...rest
  } = props;

  const resolvedClose = close ?? onCancel ?? onClose;
  const resolvedFormProps =
    typeof formProps === 'function' ? formProps({ close: resolvedClose }) : formProps;
  const { onSubmit, ..._formProps } = Object.assign({}, resolvedFormProps) as {
    onSubmit?: (
      data: Record<string, unknown>,
      ctx: { close?: () => void },
      ...args: unknown[]
    ) => unknown;
    [key: string]: unknown;
  };

  return {
    ...rest,
    className: classnames(style['marsun-form-info-modal'], 'marsun-form-info-modal', className),
    onClose: resolvedClose,
    bodyScroll: true,
    destroyOnHidden: true,
    footerButtons:
      footerButtons ||
      ([
        {
          children: cancelText || '取消',
          ButtonComponent: CancelButton,
        },
        {
          type: 'primary',
          children: okText ?? saveText ?? '提交',
          ButtonComponent: SubmitButton,
          autoClose: false,
        },
      ] as unknown[]),
    modalRender: (node: ReactNode) => (
      <Form
        {..._formProps}
        onSubmit={async (data: Record<string, unknown>, ...args: unknown[]) => {
          const res = onSubmit && (await onSubmit(data, { close: resolvedClose }, ...args));
          if (res !== false) {
            autoClose && resolvedClose?.();
          }
          return res;
        }}
      >
        {node}
      </Form>
    ),
    children: typeof children === 'function' ? children({ close: resolvedClose }) : children,
  };
}
