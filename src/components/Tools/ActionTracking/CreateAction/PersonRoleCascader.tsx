import { useEffect, useMemo, useState } from 'react';
import { Cascader, Spin } from 'antd';
import type { DefaultOptionType } from 'antd/es/cascader';
import classNames from 'classnames';
import { cascadePathStillValid, findPersonCascadePath } from './personCascadePath';
import type { ActionPersonCascadeOption } from './types';
import styles from './PersonRoleCascader.module.scss';

export type PersonRoleCascaderProps = {
  value?: string;
  onChange?: (userId: string) => void;
  cascadeOptions: ActionPersonCascadeOption[];
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  emptyHint?: string;
  /** 尚无 value 时写入默认 userId */
  defaultUserId?: string;
};

/**
 * 角色→用户两级级联（受控 userId）。
 * 同一人多角色：保留用户点选角色枝（S3 path 语义）。
 */
const PersonRoleCascader: React.FC<PersonRoleCascaderProps> = ({
  value,
  onChange,
  cascadeOptions,
  loading,
  disabled,
  placeholder,
  emptyHint,
  defaultUserId,
}) => {
  const [path, setPath] = useState<string[] | undefined>();
  const fieldUserId = String(value ?? '').trim();

  useEffect(() => {
    if (!fieldUserId) {
      setPath(undefined);
      return;
    }
    if (!cascadeOptions.length) return;
    if (cascadePathStillValid(cascadeOptions, path, fieldUserId)) return;
    const preferRole = path && path.length >= 2 ? String(path[0] || '') : undefined;
    const next = findPersonCascadePath(cascadeOptions, fieldUserId, preferRole);
    if (next) setPath(next);
    // path 故意不进 deps：仅在 fieldUserId / options 变化时校正
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 见上
  }, [cascadeOptions, fieldUserId]);

  useEffect(() => {
    if (fieldUserId || !defaultUserId || !cascadeOptions.length) return;
    const next = findPersonCascadePath(cascadeOptions, defaultUserId);
    if (!next) return;
    setPath(next);
    onChange?.(defaultUserId);
  }, [cascadeOptions, defaultUserId, fieldUserId, onChange]);

  const options = useMemo(() => cascadeOptions as DefaultOptionType[], [cascadeOptions]);

  return (
    <Cascader
      allowClear
      changeOnSelect={false}
      disabled={disabled || loading || options.length === 0}
      loading={loading}
      options={options}
      value={path}
      style={{ width: '100%' }}
      className={classNames(
        'react-form__field-component',
        'person-role-cascader',
        styles['person-role-cascader'],
      )}
      placeholder={
        loading ? '加载中…' : options.length === 0 ? emptyHint || '暂无人员' : placeholder
      }
      showSearch={{
        filter: (inputValue, optPath) => {
          const q = inputValue.trim().toLowerCase();
          if (!q) return true;
          return optPath.some((n) =>
            String(n.label || '')
              .toLowerCase()
              .includes(q),
          );
        },
      }}
      displayRender={(labels) => {
        const parts = labels.filter(Boolean);
        return parts.length ? String(parts[parts.length - 1]) : '';
      }}
      notFoundContent={loading ? <Spin size="small" /> : emptyHint || '暂无人员'}
      onChange={(next) => {
        const p = (next as string[] | undefined) || undefined;
        setPath(p);
        const userId = p && p.length >= 2 ? String(p[p.length - 1] || '') : '';
        onChange?.(userId);
      }}
    />
  );
};

export default PersonRoleCascader;
