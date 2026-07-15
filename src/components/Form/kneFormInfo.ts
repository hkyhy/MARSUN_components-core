/**
 * 经 core 再导出 @kne/form-info（业务唯一入口）。
 * 布局组件来自 @kne/form-info；字段组件须从 @kne/react-form-antd 具名导入
 * （form-info 的 `export *` 在 Vite 下经 namespace 读取时常为 undefined）。
 */
import '@kne/form-info/dist/index.css';
import FormInfoBase, {
  Form as KneForm,
  FormModal as KneFormModal,
  FormSteps as KneFormSteps,
  FormStepsModal as KneFormStepsModal,
  List as KneList,
  MultiField as KneMultiField,
  TableList as KneTableList,
  type FormModalProps,
  type FormProps,
  type FormStepsModalProps,
  type FormStepsProps,
  type ListProps,
  type MultiFieldProps,
  type TableListProps,
  type FormInfoProps,
} from '@kne/form-info';
import {
  CancelButton as KneCancelButton,
  Input as KneInput,
  InputNumber as KneInputNumber,
  ResetButton as KneResetButton,
  Select as KneSelect,
  SubmitButton as KneSubmitButton,
  Switch as KneSwitch,
  TextArea as KneTextArea,
} from '@kne/react-form-antd';
import type { ComponentType, FC, ReactNode } from 'react';

type FieldProps = {
  name: string;
  label?: ReactNode;
  rule?: string;
  placeholder?: string;
  disabled?: boolean;
  block?: boolean;
  rows?: number;
  options?: unknown[];
  [key: string]: unknown;
};

type ButtonProps = {
  children?: ReactNode;
  type?: string;
  loading?: boolean;
  [key: string]: unknown;
};

type ItemTitleCtx = { index: number; data?: Record<string, unknown> };

export type {
  FormInfoProps,
  FormProps,
  FormModalProps,
  FormStepsProps,
  FormStepsModalProps,
  ListProps,
  TableListProps,
  MultiFieldProps,
};

export const FormInfo = FormInfoBase;
export const Form = KneForm;
export const FormModal = KneFormModal as FC<FormModalProps & { children?: ReactNode }>;
export const FormSteps = KneFormSteps as FC<FormStepsProps>;
export const FormStepsModal = KneFormStepsModal as FC<FormStepsModalProps>;

export const List = KneList as FC<
  Omit<ListProps, 'itemTitle'> & {
    maxLength?: number;
    itemTitle?: (ctx: ItemTitleCtx) => string;
  }
>;
export const TableList = KneTableList as FC<
  Omit<TableListProps, 'itemTitle'> & {
    itemTitle?: (ctx: ItemTitleCtx) => string;
  }
>;
export const MultiField = KneMultiField as FC<MultiFieldProps>;

export const Input = KneInput as ComponentType<FieldProps>;
export const TextArea = KneTextArea as ComponentType<FieldProps>;
export const Select = KneSelect as ComponentType<FieldProps>;
export const InputNumber = KneInputNumber as ComponentType<FieldProps>;
export const Switch = KneSwitch as ComponentType<FieldProps>;
export const SubmitButton = KneSubmitButton as ComponentType<ButtonProps>;
export const ResetButton = KneResetButton as ComponentType<ButtonProps>;
export const CancelButton = KneCancelButton as ComponentType<ButtonProps>;
