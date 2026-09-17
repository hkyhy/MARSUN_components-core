/**
 * FormInfo Input 扩展：enableVariableMention 时走 VariableMentionField（「插入变量」→ {{key}}）。
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
import { type ComponentType, type ReactNode } from 'react';
import { withNormalizedLabelTips } from '@/components/Form/normalizeLabelTips';
import { VariableMentionField } from './VariableMentionInput';
import type { VariableMentionItem } from '@/components/Editor/variableMention';

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
  /** 开启 `/` 变量 Mention；与 variables 联用 */
  enableVariableMention?: boolean;
  variables?: VariableMentionItem[];
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

function InputSwitch(props: FieldProps) {
  if (props.enableVariableMention) {
    return <VariableMentionField {...props} />;
  }
  return <InputBase {...props} />;
}

export const Input = Object.assign(
  withNormalizedLabelTips(InputSwitch as ComponentType<FieldProps>),
  {
    Password: withNormalizedLabelTips(InputBase.Password),
  },
) as InputType;

export const TextArea = withNormalizedLabelTips(
  BaseTextArea as ComponentType<FieldProps>,
) as ComponentType<FieldProps>;
export const Select = withNormalizedLabelTips(
  BaseSelect as ComponentType<FieldProps>,
) as ComponentType<FieldProps>;
export const TreeSelect = withNormalizedLabelTips(
  BaseTreeSelect as ComponentType<FieldProps>,
) as ComponentType<FieldProps>;

export {
  SuperSelect,
  SUPER_SELECT_ALL_VALUE,
  isSuperSelectAllValue,
} from '@/components/Form/SuperSelect';
export type { SuperSelectProps, SuperSelectOption } from '@/components/Form/SuperSelect';
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
