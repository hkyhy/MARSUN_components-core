// @ts-nocheck
import { Tag, App, Space } from 'antd';
import isEqual from 'lodash/isEqual';
import { useIntl } from '@kne/react-intl';
import withLocale from '../../withLocale';

const { CheckableTag } = Tag;

const ListFilterItem = withLocale(
  ({ value, onChange, label, single = false, maxLength = 5, items = [] }) => {
    const { message } = App.useApp();
    const { formatMessage } = useIntl({ moduleName: 'Filter' });

    return (
      <Space size={4} wrap block>
        {items.map(({ label: itemLabel, value: itemValue }) => {
          return (
            <CheckableTag
              key={itemLabel}
              size="small"
              checked={
                single
                  ? isEqual(itemValue, value?.value)
                  : !!(value || []).find(({ value }) => isEqual(itemValue, value))
              }
              onChange={(checked) => {
                if (single) {
                  onChange(checked ? { value: itemValue, label: itemLabel } : null);
                  return;
                }
                const newValue = (value || []).slice(0);
                if (checked) {
                  newValue.push({ value: itemValue, label: itemLabel });
                } else {
                  const index = newValue.findIndex(({ value }) => isEqual(itemValue, value));
                  if (index > -1) {
                    newValue.splice(index, 1);
                  }
                }
                if (newValue.length > maxLength) {
                  message.error(formatMessage({ id: 'maxSelectedCount' }, { count: maxLength }));
                  return;
                }
                onChange(newValue);
              }}
            >
              {itemLabel}
            </CheckableTag>
          );
        })}
      </Space>
    );
  },
);

export default ListFilterItem;
