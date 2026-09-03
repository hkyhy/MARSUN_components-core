import type { CSSProperties, ReactNode } from 'react';
import type { ButtonProps } from 'antd';

export type FormInfoList = ReactNode[];

export interface FormInfoProps {
  className?: string;
  /** 固定列数；或传入 FlexBox 断点配置（非整数时走 useFlexBox） */
  column?: number | Array<{ width: number; col: number; size?: number }> | Record<string, unknown>;
  list?: FormInfoList;
  gap?: number;
  title?: ReactNode;
  subtitle?: ReactNode;
  extra?: ReactNode;
  bordered?: boolean;
  nestDepth?: number;
  block?: boolean;
  styles?: Record<string, CSSProperties>;
  style?: CSSProperties;
  [key: string]: unknown;
}

export interface FormProps {
  className?: string;
  type?: string;
  data?: Record<string, unknown>;
  onSubmit?: (data: Record<string, unknown>, ...args: unknown[]) => unknown | Promise<unknown>;
  children?: ReactNode;
  [key: string]: unknown;
}

export interface FormOverlaySharedProps {
  formProps?: Record<string, unknown> | ((ctx: { close?: () => void }) => Record<string, unknown>);
  autoClose?: boolean;
  okType?: string;
  okButtonProps?: Record<string, unknown>;
  okText?: ReactNode;
  saveText?: ReactNode;
  onOk?: (...args: unknown[]) => unknown;
  cancelButtonProps?: Record<string, unknown>;
  cancelText?: ReactNode;
  footer?:
    ReactNode | ((ctx: { defaultFooter: ReactNode; props: Record<string, unknown> }) => ReactNode);
  footerButtons?: unknown[];
  children?: ReactNode | ((ctx: { close?: () => void }) => ReactNode);
  onClose?: () => void;
  onCancel?: () => void;
  className?: string;
  title?: ReactNode;
  [key: string]: unknown;
}

export interface FormModalProps extends FormOverlaySharedProps {
  open?: boolean;
  width?: string | number;
  size?: string;
  destroyOnHidden?: boolean;
  /** 宿主渲染：createModalRender / createDrawerRender 或自定义 */
  renderModal?: (hostProps: Record<string, unknown>) => ReactNode;
}

export interface FormDrawerProps extends FormOverlaySharedProps {
  open?: boolean;
  placement?: 'left' | 'right' | 'top' | 'bottom';
  width?: string | number;
  size?: string;
  destroyOnHidden?: boolean;
}

export interface FormItemProps {
  children: (api: Record<string, unknown> & { formData?: Record<string, unknown> }) => ReactNode;
}

export interface ErrorTipProps {
  name: string;
  groupName?: string;
  groupIndex?: number;
  overlayClassName?: string;
  errorRender?: (error: Record<string, unknown> & { closeHover?: () => void }) => ReactNode;
  children?: ReactNode;
}

export interface FormApiButtonProps extends Omit<ButtonProps, 'onClick'> {
  onClick?: (
    formContext: Record<string, unknown>,
    e: React.MouseEvent,
  ) => unknown | Promise<unknown>;
}

export interface ListProps {
  className?: string;
  itemClassName?: string;
  removeIcon?: ReactNode;
  removeText?: ReactNode;
  addText?: ReactNode;
  addIcon?: ReactNode;
  important?: boolean;
  title?: ReactNode;
  name: string;
  list?: FormInfoList | ((...groupArgs: unknown[]) => FormInfoList);
  empty?: ReactNode;
  itemTitle?: ReactNode | ((ctx: { index: number; id?: string }) => ReactNode);
  bordered?: boolean;
  nestDepth?: number;
  block?: boolean;
  maxLength?: number;
  minLength?: number;
  defaultLength?: number;
  [key: string]: unknown;
}

export interface TableListProps {
  className?: string;
  addIcon?: ReactNode;
  addText?: ReactNode;
  removeIcon?: ReactNode;
  removeText?: ReactNode;
  title?: ReactNode;
  bordered?: boolean;
  name: string;
  list?: FormInfoList | ((...groupArgs: unknown[]) => FormInfoList);
  empty?: ReactNode;
  renderMobile?: boolean | ((...args: unknown[]) => ReactNode);
  block?: boolean;
  [key: string]: unknown;
}

export interface MultiFieldProps {
  name: string;
  label?: ReactNode;
  rule?: string;
  field: React.ComponentType<Record<string, unknown>>;
  addText?: ReactNode | ((label?: ReactNode) => ReactNode);
  addIcon?: ReactNode;
  removeIcon?: ReactNode;
  removeText?: ReactNode | ((label?: ReactNode) => ReactNode);
  empty?: ReactNode;
  className?: string;
  [key: string]: unknown;
}

export interface StepsItem {
  key?: string | number;
  id?: string | number;
  title?: ReactNode;
  column?: number;
  gap?: number;
  list?: FormInfoList;
  fieldNames?: string[];
  children?: ReactNode;
}

export interface StepsProps {
  className?: string;
  stepsClassName?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  bordered?: boolean;
  items?: StepsItem[];
  showActions?: boolean;
  prevText?: ReactNode;
  nextText?: ReactNode;
  prevIcon?: ReactNode;
  nextIcon?: ReactNode;
  current?: number;
  defaultCurrent?: number;
  onChange?: (current: number) => void;
  direction?: string;
  orientation?: string;
  [key: string]: unknown;
}

export interface FormStepsItem {
  title?: ReactNode;
  formProps?: Record<string, unknown>;
  children?:
    | ReactNode
    | ((ctx: {
        isLastStep: boolean;
        currentStep: number;
        onStepChange: (n: number) => void;
        getStepCache: () => unknown[];
      }) => ReactNode);
}

export interface FormStepsProps {
  className?: string;
  stepsClassName?: string;
  autoStep?: boolean;
  onComplete?: (cache: unknown[]) => unknown | Promise<unknown>;
  children?:
    | ReactNode
    | ((ctx: {
        children: ReactNode;
        isLastStep: boolean;
        currentStep: number;
        onStepChange: (n: number) => void;
        getStepCache: () => unknown[];
      }) => ReactNode);
  items?: FormStepsItem[];
  current?: number;
  defaultCurrent?: number;
  onChange?: (current: number) => void;
  direction?: string;
  orientation?: string;
  [key: string]: unknown;
}

export interface FormStepsModalProps {
  items?: FormStepsItem[];
  modalProps?: FormModalProps & { autoClose?: boolean };
  completeText?: ReactNode;
  nextText?: ReactNode;
  autoStep?: boolean;
  onComplete?: (data: unknown[]) => unknown | Promise<unknown>;
  className?: string;
  [key: string]: unknown;
}
