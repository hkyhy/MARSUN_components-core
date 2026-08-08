// @ts-nocheck
import { App, Tag, Space } from 'antd';
import { SelectAddress, createAddressApi } from '@kne/super-select-plus';
import '@kne/super-select-plus/dist/index.css';
import { useIntl } from '@kne/react-intl';
import { useMemo, useState, useEffect } from 'react';
import withLocale from '../../withLocale';
import useFilterPopupContainer from '../../hooks/useFilterPopupContainer';
import style from '../../style.module.scss';

const { CheckableTag } = Tag;

const getLabelForLocal = (item, locale) => {
  if (locale === 'en-US') {
    return item?.enName || item?.name;
  }
  return item?.name;
};

const CityFilterItemInner = ({ value, onChange, single = false, maxLength = 5, ...props }) => {
  const { message } = App.useApp();
  const { getPopupContainer } = useFilterPopupContainer();
  const { locale } = useIntl();
  const { formatMessage } = useIntl({ moduleName: 'Filter' });
  const [addressApi, setAddressApi] = useState(null);

  useEffect(() => {
    let cancelled = false;
    SelectAddress.defaultData().then((data) => {
      if (!cancelled && data) {
        setAddressApi(createAddressApi(data));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const cityList = useMemo(() => {
    return addressApi ? addressApi.getChinaHotCities() : [];
  }, [addressApi]);

  return (
    <Space size={4} wrap block>
      {cityList.map((city) => {
        const label = getLabelForLocal(city, locale);
        return (
          <CheckableTag
            key={city.code}
            size="small"
            checked={
              single
                ? value?.value === city.code
                : !!(value || []).find(({ value }) => value === city.code)
            }
            onChange={(checked) => {
              if (single) {
                onChange(checked ? city : null);
                return;
              }
              const newValue = (value || []).slice(0);
              checked
                ? newValue.push(Object.assign({}, city, { label, value: city.code }))
                : (() => {
                    const index = newValue.findIndex(({ value }) => value === city.code);
                    newValue.splice(index, 1);
                  })();
              if (newValue.length > maxLength) {
                message.error(formatMessage({ id: 'maxSelectedCount' }, { count: maxLength }));
                return;
              }
              onChange(newValue);
            }}
          >
            {label}
          </CheckableTag>
        );
      })}
      <CheckableTag
        className={style['filter-advanced-item-other']}
        size="small"
        checked={
          (single ? value?.value : value?.length > 0) &&
          !cityList.find(({ code }) =>
            single ? value?.value === code : !!(value || []).find(({ value }) => value === code),
          )
        }
      >
        {formatMessage({ id: 'otherText' })}
        <SelectAddress
          {...props}
          getPopupContainer={getPopupContainer}
          className={style['filter-advanced-item-other-inner']}
          maxLength={maxLength}
          allowClear={false}
          value={value}
          single={single}
          onChange={(value) => {
            if (value.length > maxLength) {
              message.error(formatMessage({ id: 'maxSelectedCount' }, { count: maxLength }));
              return;
            }
            onChange(value);
          }}
        />
      </CheckableTag>
    </Space>
  );
};

const CityFilterItem = withLocale(CityFilterItemInner);

export default CityFilterItem;
