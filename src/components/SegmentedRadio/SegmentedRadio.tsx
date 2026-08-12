import { Radio } from 'antd';
import type { RadioGroupProps, RadioChangeEvent } from 'antd/es/radio/interface';
import classNames from 'classnames';
import type { CSSProperties, ReactNode } from 'react';
import styles from './style.module.scss';

export type SegmentedRadioOption<T = string | number> = {
  label: ReactNode;
  value: T;
  disabled?: boolean;
};

export type SegmentedRadioProps<T = string | number> = Omit<
  RadioGroupProps,
  'options' | 'onChange' | 'optionType' | 'buttonStyle'
> & {
  /** 选项列表 */
  options: SegmentedRadioOption<T>[];
  /** 当前值（受控） */
  value?: T;
  /** 默认值（非受控） */
  defaultValue?: T;
  /** 选中变化：直接回传 value，无需 e.target.value */
  onChange?: (value: T) => void;
  /** 尺寸：small / middle / large，默认 middle */
  size?: RadioGroupProps['size'];
  /** 整组禁用 */
  disabled?: boolean;
  /** 按钮样式：默认 solid（实心） */
  buttonStyle?: RadioGroupProps['buttonStyle'];
  /** 撑满容器宽度（每个按钮等分） */
  block?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * 分段单选：基于 antd Radio.Group 的 button+solid 形态，
 * 统一项目内「分段按钮」交互与样式（对齐批量设置三大类的 panel-radio）。
 *
 * - 默认 optionType="button" buttonStyle="solid"
 * - onChange 直接回传 value，屏蔽 RadioChangeEvent
 * - block=true 时按钮等分容器宽度并自动换行
 */
function SegmentedRadioInner<T = string | number>(props: SegmentedRadioProps<T>) {
  const {
    options,
    value,
    defaultValue,
    onChange,
    size,
    disabled,
    buttonStyle = 'solid',
    block,
    className,
    style,
    ...rest
  } = props;

  const handleChange = (e: RadioChangeEvent) => {
    onChange?.(e.target.value as T);
  };

  return (
    <Radio.Group
      {...rest}
      data-testid="components-core-segmented-radio"
      className={classNames(
        'marsun-segmented-radio',
        styles['segmented-radio'],
        block && styles['block'],
        className,
      )}
      style={style}
      options={options as RadioGroupProps['options']}
      value={value as RadioGroupProps['value']}
      defaultValue={defaultValue as RadioGroupProps['defaultValue']}
      onChange={handleChange}
      size={size}
      disabled={disabled}
      optionType="button"
      buttonStyle={buttonStyle}
    />
  );
}

const SegmentedRadio = SegmentedRadioInner as <T = string | number>(
  props: SegmentedRadioProps<T>,
) => React.ReactElement;

export default SegmentedRadio;
