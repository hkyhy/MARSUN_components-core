import { Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import React, { useMemo } from 'react';
import { filterVariableFeed, type VariableMentionItem } from './variableMention';
import styles from '../FormInfo/VariableMentionInput/style.module.scss';

export type VariablePickerProps = {
  variables?: VariableMentionItem[];
  disabled?: boolean;
  /** catalog 加载失败短文案；有值时优先于「暂无变量」 */
  catalogError?: string;
  onPick: (key: string) => void;
  /** 按钮文案，默认「插入变量」 */
  buttonText?: string;
  size?: 'small' | 'middle' | 'large';
  className?: string;
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
};

/**
 * Coze/Dify 风格：点选插入变量（中文 + code）。无 `/` 触发。
 */
export const VariablePicker: React.FC<VariablePickerProps> = ({
  variables,
  disabled,
  catalogError,
  onPick,
  buttonText = '插入变量',
  size = 'middle',
  className,
  getPopupContainer,
}) => {
  const list = useMemo(() => filterVariableFeed(variables, ''), [variables]);
  const empty = list.length === 0;
  const tip = catalogError ? `目录失败：${catalogError}` : empty ? '暂无 catalog 变量' : undefined;

  const items: MenuProps['items'] = empty
    ? [
        {
          key: '__empty',
          disabled: true,
          label: tip || '暂无变量',
        },
      ]
    : list.map((v) => ({
        key: v.key,
        label: (
          <span className={styles['var-mention-option']}>
            {v.label ? <span className={styles['var-mention-label']}>{v.label}</span> : null}
            <span className={styles['var-mention-token']}>{v.key}</span>
          </span>
        ),
        onClick: () => onPick(v.key),
      }));

  return (
    <Dropdown
      disabled={disabled || empty}
      trigger={['click']}
      getPopupContainer={getPopupContainer}
      dropdownRender={(menu) => <div onMouseDown={(e) => e.preventDefault()}>{menu}</div>}
      menu={{ items }}
    >
      <Button
        type="default"
        size={size}
        disabled={disabled || empty}
        title={tip}
        className={className}
      >
        {buttonText}
      </Button>
    </Dropdown>
  );
};

export default VariablePicker;
