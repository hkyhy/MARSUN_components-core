import { useField } from '../../../Form';
import classNames from 'classnames';
import PersonRoleCascader from './PersonRoleCascader';
import type { ActionPersonCascadeOption } from './types';
import styles from './PersonRoleCascaderField.module.scss';

export type PersonRoleCascaderFieldProps = {
  /** 写入 FormInfo 的字段名（userId） */
  name: string;
  label: string;
  cascadeOptions: ActionPersonCascadeOption[];
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  emptyHint?: string;
  /** 默认选中的 userId（如上次分配人） */
  defaultUserId?: string;
};

/**
 * form-info 包装：useField 注册 + 与 FormInfo 字段同壳（label / 间距 / 必填星号）。
 * 勿传 errMsg（kne getErrMsg 会无条件画红字）。
 */
const PersonRoleCascaderField: React.FC<PersonRoleCascaderFieldProps> = ({
  name,
  label,
  cascadeOptions,
  loading,
  disabled,
  placeholder,
  emptyHint,
  defaultUserId,
}) => {
  const { value, onChange } = useField({
    name,
    label,
    rule: 'REQ',
  }) as {
    value?: unknown;
    onChange: (next: string) => void;
  };

  return (
    <div
      className={classNames(
        'react-form__field',
        'person-role-cascader-field',
        styles['person-role-cascader-field'],
      )}
    >
      <div className="react-form__field-main">
        <div
          className={classNames(
            'react-form__field-label',
            'is-req',
            'marsun-form-info-is-req',
            styles['person-role-cascader-field-label'],
          )}
        >
          {label}
        </div>
        <div className="react-form__field-input">
          <PersonRoleCascader
            value={String(value ?? '')}
            onChange={onChange}
            cascadeOptions={cascadeOptions}
            loading={loading}
            disabled={disabled}
            placeholder={placeholder}
            emptyHint={emptyHint}
            defaultUserId={defaultUserId}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonRoleCascaderField;
