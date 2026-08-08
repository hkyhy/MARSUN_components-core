// @ts-nocheck
import { CheckOutlined } from '@ant-design/icons';
import { SelectTree, createTreeUtils } from '@kne/super-select';
import { Checkbox, Flex } from 'antd';
import classnames from 'classnames';
import { useCallback, useMemo } from 'react';
import buildSelectTreeMapping from '../buildSelectTreeMapping';
import flattenSelectTreeOptions from '../flattenSelectTreeOptions';
import withFieldItem from '../withFieldItem';

function toValueObjects(ids, mapping, valueKey, labelKey) {
  return ids
    .map((id) => {
      const node = mapping.get(id);
      if (!node) return null;
      const { children: _children, ...rest } = node;
      return {
        ...rest,
        [valueKey]: node.id,
        [labelKey]: node.label,
      };
    })
    .filter(Boolean);
}

/**
 * SelectTree 筛选字段：
 * - 嵌套 children → 扁平 parentId（对齐 kne parseTreeData）
 * - 多选时用 createTreeUtils 做父子勾选联动（kne SelectTree 默认只切当前项）
 */
const SelectTreeField = (props) => {
  const {
    options,
    valueKey = 'id',
    parentKey = 'parentId',
    childrenKey = 'children',
    labelKey = 'name',
    single,
    renderItem: renderItemProp,
    ...rest
  } = props;

  const flatOptions = useMemo(
    () => flattenSelectTreeOptions(options, { valueKey, parentKey, childrenKey }),
    [options, valueKey, parentKey, childrenKey],
  );

  const treeUtils = useMemo(() => {
    const mapping = buildSelectTreeMapping(flatOptions, { valueKey, parentKey, labelKey });
    return createTreeUtils(mapping);
  }, [flatOptions, valueKey, parentKey, labelKey]);

  const renderItem = useCallback(
    (contextProps) => {
      if (typeof renderItemProp === 'function') {
        return renderItemProp(contextProps);
      }

      const item = contextProps.item;
      const fieldProps = contextProps.props;
      const isSelectedAll = contextProps.isSelectedAll;
      const value = contextProps.value || [];
      const setValue = contextProps.setValue;
      const onOpenChange = contextProps.onOpenChange;
      const isPopup = fieldProps.isPopup;
      const renderItemContent = fieldProps.renderItemContent;
      const itemValueKey = fieldProps.valueKey || valueKey;

      const currentIds = value.map((target) => target[itemValueKey]);
      const exactChecked = currentIds.includes(item[itemValueKey]);

      // 单选保持 kne 原语义；多选走父子联动
      if (single) {
        return (
          <Flex
            className={classnames('select-tree-item', {
              'is-selected': exactChecked,
              'is-disabled': item.disabled,
            })}
            key={item[itemValueKey]}
            onClick={() => {
              if (item.disabled || isSelectedAll) return;
              setValue(exactChecked ? [] : [item]);
              if (isPopup) onOpenChange(false);
            }}
          >
            <Flex vertical gap={8} flex={1} className="select-tree-item-content">
              {renderItemContent(contextProps)}
            </Flex>
            <div className="single-checked">{exactChecked && <CheckOutlined />}</div>
          </Flex>
        );
      }

      const { checked, indeterminate } = treeUtils.computedCheckboxStatus(
        item[itemValueKey],
        currentIds,
      );

      return (
        <Flex
          className={classnames('select-tree-item', {
            'is-selected': checked,
            'is-disabled': item.disabled,
          })}
          key={item[itemValueKey]}
          onClick={() => {
            if (item.disabled || isSelectedAll) return;
            const nextIds = checked
              ? treeUtils.setNodeUnchecked(item[itemValueKey], currentIds)
              : treeUtils.setNodeChecked(item[itemValueKey], currentIds);
            setValue(
              toValueObjects(
                nextIds,
                treeUtils.mapping,
                itemValueKey,
                fieldProps.labelKey || labelKey,
              ),
            );
          }}
        >
          <Flex>
            <Checkbox
              checked={isSelectedAll || checked}
              indeterminate={!isSelectedAll && indeterminate}
              disabled={isSelectedAll || item.disabled}
            />
          </Flex>
          <Flex vertical gap={8} flex={1} className="select-tree-item-content">
            {renderItemContent(contextProps)}
          </Flex>
        </Flex>
      );
    },
    [renderItemProp, single, treeUtils, valueKey, labelKey],
  );

  return (
    <SelectTree
      {...rest}
      single={single}
      options={flatOptions}
      valueKey={valueKey}
      parentKey={parentKey}
      childrenKey={childrenKey}
      labelKey={labelKey}
      renderItem={renderItem}
    />
  );
};

export default withFieldItem(SelectTreeField, { forcePopup: true });
