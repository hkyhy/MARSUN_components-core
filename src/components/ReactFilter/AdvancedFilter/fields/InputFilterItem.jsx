// @ts-nocheck
import { Input, Space, Button } from 'antd';
import { useState, useEffect, useRef } from 'react';
import { useIntl } from '@kne/react-intl';
import withLocale from '../../withLocale';

const InputFilterItem = withLocale(({ value, label, onChange, ...props }) => {
  const propsValue = value?.value;
  const [inputValue, setInputValue] = useState(propsValue || '');
  const [active, setActive] = useState(false);
  const { formatMessage } = useIntl({ moduleName: 'Filter' });

  const searchHandler = () => {
    onChange(inputValue ? { label: inputValue, value: inputValue } : null);
  };

  const handleBlur = () => {
    setActive(false);
    searchHandler();
  };

  const inputValueRef = useRef('');
  inputValueRef.current = inputValue;

  useEffect(() => {
    if (propsValue !== inputValueRef.current) {
      setInputValue(propsValue);
    }
  }, [propsValue]);

  return (
    <Space.Compact>
      <Input
        placeholder={`${formatMessage({ id: 'pleaseInput' })}${label}`}
        {...props}
        size="small"
        value={inputValue}
        onFocus={() => {
          setActive(true);
        }}
        onBlur={handleBlur}
        onChange={(e) => {
          setInputValue(e.target.value);
        }}
        onPressEnter={searchHandler}
      />
      {active && (
        <Button size="small" type="primary" onClick={searchHandler}>
          {formatMessage({ id: 'determineText' })}
        </Button>
      )}
    </Space.Compact>
  );
});

export default InputFilterItem;
