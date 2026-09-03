/**
 * FormInfo 数字区间字段（纱支分档等）。
 * 值：`[min, max] | null`；单侧可空。
 * 经 `hooks.useDecorator` 接入 kne FormInfo，支持 `name` / `label` / `rule`（如 `REQ`、`RANGE_ASC`）。
 * 区间有序校验：在 Form/`formProps` 注册 `rules={inputRangeRules}`，字段写 `rule="RANGE_ASC"`。
 */
import { InputNumber, Space, Typography } from 'antd';
import * as ReactFormAntd from '@kne/react-form-antd';
import classNames from 'classnames';
import type { ComponentType, FC, ReactNode } from 'react';
import { withNormalizedLabelTips } from './normalizeLabelTips';
import styles from './InputRange.module.scss';

export type InputRangeValue = [number | null | undefined, number | null | undefined] | null;

export type InputRangeProps = {
  name: string;
  label?: ReactNode;
  labelTips?: ReactNode | ((props: InputRangeProps) => ReactNode);
  rule?: string;
  disabled?: boolean;
  placeholder?: string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  unit?: string;
  min?: number;
  max?: number;
  precision?: number;
  step?: number;
};

type FieldRenderProps = {
  value?: InputRangeValue;
  onChange?: (v: InputRangeValue) => void;
  disabled?: boolean;
  id?: string;
};

type KneHooks = {
  useDecorator: (
    opts: Record<string, unknown>,
  ) => (Comp: ComponentType<FieldRenderProps>) => ReactNode;
};

function normalizePair(
  minVal: number | null | undefined,
  maxVal: number | null | undefined,
): InputRangeValue {
  if (minVal == null && maxVal == null) return null;
  return [minVal ?? null, maxVal ?? null];
}

const InputRangeField: FC<
  FieldRenderProps & {
    minPlaceholder?: string;
    maxPlaceholder?: string;
    unit?: string;
    min?: number;
    max?: number;
    precision?: number;
    step?: number;
  }
> = ({
  value,
  onChange,
  disabled,
  minPlaceholder = '下限',
  maxPlaceholder = '上限',
  unit,
  min,
  max,
  precision,
  step,
}) => {
  const minVal = value?.[0] ?? undefined;
  const maxVal = value?.[1] ?? undefined;

  return (
    <Space
      className={classNames('marsun-form-input-range', styles['marsun-form-input-range'])}
      size={8}
      align="center"
      style={{ width: '100%' }}
    >
      <InputNumber
        className={classNames(
          'marsun-form-input-range-min',
          styles['marsun-form-input-range-input'],
        )}
        value={minVal}
        disabled={disabled}
        placeholder={minPlaceholder}
        min={min}
        max={max}
        precision={precision}
        step={step}
        onChange={(v) => onChange?.(normalizePair(v as number | null, maxVal))}
      />
      <Typography.Text type="secondary">~</Typography.Text>
      <InputNumber
        className={classNames(
          'marsun-form-input-range-max',
          styles['marsun-form-input-range-input'],
        )}
        value={maxVal}
        disabled={disabled}
        placeholder={maxPlaceholder}
        min={min}
        max={max}
        precision={precision}
        step={step}
        onChange={(v) => onChange?.(normalizePair(minVal, v as number | null))}
      />
      {unit ? (
        <Typography.Text type="secondary" className={styles['marsun-form-input-range-unit']}>
          {unit}
        </Typography.Text>
      ) : null}
    </Space>
  );
};

const InputRangeInner: FC<InputRangeProps> = (props) => {
  const { useDecorator } = (ReactFormAntd as unknown as { hooks: KneHooks }).hooks;
  // 与 kne Input/InputNumber 一致：render(稳定组件)。禁止在 render 内新建 Bound，
  // 否则每次 onChange→重渲染都会换组件类型，Input 被卸载，焦点弹掉无法连续输入。
  const { placeholder: _ignoredPlaceholder, ...decoratorProps } = props;

  const render = useDecorator({
    fieldName: 'inputRange',
    ...decoratorProps,
  });

  return render(InputRangeField);
};

InputRangeInner.displayName = 'InputRange';

export const InputRange = withNormalizedLabelTips(
  InputRangeInner as ComponentType<InputRangeProps>,
) as ComponentType<InputRangeProps>;

export default InputRange;
