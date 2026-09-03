/**
 * 字段包装：withNormalizedLabelTips；引擎按钮再导出。
 */
import {
  CancelButton as BaseCancelButton,
  Input as BaseInput,
  InputNumber as BaseInputNumber,
  RadioGroup as BaseRadioGroup,
  ResetButton as BaseResetButton,
  Select as BaseSelect,
  SubmitButton as BaseSubmitButton,
  Switch as BaseSwitch,
  TextArea as BaseTextArea,
  TreeSelect as BaseTreeSelect,
} from '@kne/react-form-antd';
import type { ComponentType, ReactNode } from 'react';
import { withNormalizedLabelTips } from '@/components/Form/normalizeLabelTips';

type FieldProps = {
  name: string;
  label?: ReactNode;
  labelTips?: ReactNode | ((props: FieldProps) => ReactNode);
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

type InputType = ComponentType<FieldProps> & { Password: ComponentType<FieldProps> };
const InputBase = BaseInput as unknown as InputType;
const InputWrapped = withNormalizedLabelTips(InputBase);
export const Input = Object.assign(InputWrapped, {
  Password: withNormalizedLabelTips(InputBase.Password),
}) as InputType;

export const TextArea = withNormalizedLabelTips(
  BaseTextArea as ComponentType<FieldProps>,
) as ComponentType<FieldProps>;
export const Select = withNormalizedLabelTips(
  BaseSelect as ComponentType<FieldProps>,
) as ComponentType<FieldProps>;
export const TreeSelect = withNormalizedLabelTips(
  BaseTreeSelect as ComponentType<FieldProps>,
) as ComponentType<FieldProps>;
export const InputNumber = withNormalizedLabelTips(
  BaseInputNumber as ComponentType<FieldProps>,
) as ComponentType<FieldProps>;
export const Switch = withNormalizedLabelTips(
  BaseSwitch as ComponentType<FieldProps>,
) as ComponentType<FieldProps>;
export const RadioGroup = withNormalizedLabelTips(
  BaseRadioGroup as ComponentType<FieldProps>,
) as ComponentType<FieldProps>;

export const SubmitButton = BaseSubmitButton as ComponentType<ButtonProps>;
export const ResetButton = BaseResetButton as ComponentType<ButtonProps>;
export const CancelButton = BaseCancelButton as ComponentType<ButtonProps>;
