// @ts-nocheck
import FilterOuter from '../FilterOuter';
import FilterLines from '../FilterLines';
import { Flex } from 'antd';
import advancedFields from './fields';
import { useIntl } from '@kne/react-intl';
import { useContext } from '../context';
import style from '../style.module.scss';
import FilterValueDisplay from '../FilterValueDisplay';
import withLocale from '../withLocale';
import get from 'lodash/get';
import classnames from 'classnames';
import { FILTER_CLASS } from '../filterClassNames';

const Line = ({ list }) => {
  const { value, onChange } = useContext();
  return (
    <Flex gap={8}>
      {list.map((item, index) => {
        const ComponentItem = item.type;
        return (
          <Flex gap={16} key={item.key || item.props.name || index} align="center">
            <div className={classnames(style['filter-label'], FILTER_CLASS.label)}>
              {item.props.label}:
            </div>
            <Flex wrap={true} align="center">
              <ComponentItem
                {...item.props}
                value={value ? get(value.get(item.props.name), 'value') : item.props.value}
                onChange={
                  onChange
                    ? (value) =>
                        onChange({
                          name: item.props.name,
                          label: item.props.label,
                          value,
                        })
                    : item.props.onChange
                }
              />
            </Flex>
          </Flex>
        );
      })}
    </Flex>
  );
};

const AdvancedFilter = withLocale((props) => {
  const { formatMessage } = useIntl({ moduleName: 'Filter' });
  return (
    <FilterOuter {...props}>
      {({ value, onChange, props: filterProps = {} }) => {
        const { list, more } = filterProps;
        return (
          <div>
            <Flex
              gap={8}
              vertical
              className={classnames(style['filter-advanced'], FILTER_CLASS.advanced)}
            >
              {list &&
                list.map((item, index) => {
                  return <Line key={index} list={item} />;
                })}
              {more && (
                <FilterLines
                  className={style['filter-advanced-more']}
                  label={`${formatMessage({ id: 'moreText' })}:`}
                  list={[more]}
                />
              )}
            </Flex>
            {value && value.length > 0 && <FilterValueDisplay value={value} onChange={onChange} />}
          </div>
        );
      }}
    </FilterOuter>
  );
});

AdvancedFilter.fields = advancedFields;
export default AdvancedFilter;

export { advancedFields };
