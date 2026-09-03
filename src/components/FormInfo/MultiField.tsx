// @ts-nocheck
import { MultiField as MultiFieldBase } from '@kne/react-form-plus';
import { Button } from 'antd';
import classnames from 'classnames';
import type { ReactNode } from 'react';
import { Empty } from '@/components/Empty';
import { Plus, Trash2 } from '@/components/Icons';
import type { MultiFieldProps } from './types';
import withLocale, { useFormInfoLocale } from './withLocale';
import style from './style.module.scss';

const MultiField = withLocale((p: MultiFieldProps) => {
  const { formatMessage } = useFormInfoLocale();
  const { className, addText, addIcon, removeIcon, removeText, ...others } = Object.assign(
    {
      addText: formatMessage({ id: 'addText' }),
      addIcon: <Plus size={14} />,
      removeIcon: <Trash2 size={14} />,
      removeText: null as ReactNode,
      empty: <Empty iconType="simple" description={false} />,
    },
    p,
  );

  return (
    <MultiFieldBase
      {...others}
      itemRender={(
        children: ReactNode,
        { id, allowRemove, onRemove }: { id: string; allowRemove: boolean; onRemove: () => void },
      ) => (
        <div
          key={id}
          className={classnames('multi-field-item', style['marsun-form-info-multi-field-item'])}
        >
          {children}
          <div>
            <div
              className={classnames(
                style['react-form__field-label'],
                'react-form__field-label',
                'multi-field-delete-label',
              )}
            />
            <Button icon={removeIcon} onClick={onRemove} disabled={!allowRemove}>
              {typeof removeText === 'function' ? removeText(others.label) : removeText}
            </Button>
          </div>
        </div>
      )}
    >
      {(children: ReactNode, { allowAdd, onAdd }: { allowAdd: boolean; onAdd: () => void }) => (
        <div
          className={classnames(className, 'multi-field', style['marsun-form-info-multi-field'])}
        >
          {children}
          {allowAdd && (
            <Button
              className={classnames(
                'multi-field-add-btn',
                style['marsun-form-info-multi-field-add-btn'],
              )}
              type="dashed"
              onClick={onAdd}
              icon={addIcon}
            >
              {typeof addText === 'function'
                ? addText(others.label)
                : `${addText}${others.label ?? ''}`}
            </Button>
          )}
        </div>
      )}
    </MultiFieldBase>
  );
});

export default MultiField;
