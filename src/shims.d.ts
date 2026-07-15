declare module '*.module.scss' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.mock.json' {
  const value: unknown;
  export default value;
}

declare module '@kne/button-group' {
  import type { FC, ReactNode } from 'react';

  export interface ButtonGroupItem {
    key?: string;
    label?: ReactNode;
    onClick?: () => void;
    hidden?: boolean;
    disabled?: boolean;
    [key: string]: unknown;
  }

  export interface ButtonGroupProps {
    listArray?: ButtonGroupItem[];
    children?: ReactNode;
    [key: string]: unknown;
  }

  const ButtonGroup: FC<ButtonGroupProps>;
  export default ButtonGroup;
}

declare module '@kne/react-form' {
  import type { ComponentType, FC, ReactNode, Ref } from 'react';

  export const useField: (props: Record<string, unknown>) => Record<string, unknown>;
  export const useFormApi: () => { openApi: Record<string, unknown> };
  export const useFormContext: () => { openApi: Record<string, unknown> };
  export const useSubmit: () => {
    isLoading: boolean;
    isPass: boolean;
    onClick: () => void;
  };
  export const useReset: () => { onClick: () => void };
  export const useGroup: () => Record<string, unknown>;

  export type GroupListRenderProps = {
    index: number;
    onRemove: () => void;
    length: number;
  };

  export const GroupList: ComponentType<{
    name: string;
    defaultLength?: number;
    reverseOrder?: boolean;
    ref?: Ref<{ onAdd: () => void }>;
    children?: (ctx: GroupListRenderProps) => ReactNode;
  }>;

  export const RULES: Record<string, unknown>;
  export const preset: (...args: unknown[]) => unknown;
  export const interceptors: Record<string, unknown>;
  export const compileErrMsg: (...args: unknown[]) => unknown;
  export const computedFieldValueFromFormData: (...args: unknown[]) => unknown;
  export const computedFormDataFormState: (...args: unknown[]) => unknown;
  export const filterEmpty: (...args: unknown[]) => unknown;
  export const findField: (...args: unknown[]) => unknown;
  export const formUtils: Record<string, unknown>;
  export const isEmpty: ((...args: unknown[]) => boolean) & {
    filterEmpty?: (...args: unknown[]) => unknown;
  };
  export const isNotEmpty: (...args: unknown[]) => boolean;
  export const matchFields: (...args: unknown[]) => unknown;
  export const stateToError: (...args: unknown[]) => unknown;
  export const stateToIsPass: (...args: unknown[]) => unknown;

  const ReactForm: FC<{
    data?: Record<string, unknown>;
    rules?: Record<
      string,
      (
        value: string,
      ) => Promise<{ result: boolean; errMsg: string }> | { result: boolean; errMsg: string }
    >;
    onSubmit?: (data: Record<string, unknown>) => void | Promise<void>;
    debug?: boolean;
    children?: ReactNode;
    ref?: Ref<Record<string, unknown>>;
  }>;

  export default ReactForm;
}

declare module '@kne/react-form-antd' {
  import type { ComponentType, FC, ReactNode } from 'react';

  type FieldComponent = ComponentType<Record<string, unknown>>;

  export const Input: FieldComponent;
  export const TextArea: FieldComponent;
  export const Select: FieldComponent;
  export const InputNumber: FieldComponent;
  export const Switch: FieldComponent;
  export const SubmitButton: FieldComponent;
  export const ResetButton: FieldComponent;
  export const CancelButton: FieldComponent;
  export const Checkbox: FieldComponent;
  export const CheckboxGroup: FieldComponent;
  export const RadioGroup: FieldComponent;
  export const DatePicker: FieldComponent;
  export const DatePickerToday: FieldComponent;
  export const TimePicker: FieldComponent;
  export const TreeSelect: FieldComponent;
  export const Cascader: FieldComponent;
  export const Rate: FieldComponent;
  export const Slider: FieldComponent;

  const FormAntd: FC<{ children?: ReactNode; [key: string]: unknown }>;
  export default FormAntd;
}
