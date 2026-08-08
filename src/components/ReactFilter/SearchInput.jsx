// @ts-nocheck
import { Input } from 'antd';
import withFilterValue from './withFilterValue';
import { useIntl } from '@kne/react-intl';
import { useEffect, useRef, useState } from 'react';
import withLocale from './withLocale';

const { Search } = Input;

const SearchInput = withLocale(
  withFilterValue(({ label, onChange, value, placeholder, searchDelay = 500, ...props }) => {
    const { formatMessage } = useIntl({ moduleName: 'Filter' });
    const propsValue = value?.value;
    const [inputValue, setInputValue] = useState(propsValue || '');
    const inputValueRef = useRef('');
    const onChangeRef = useRef(onChange);
    const searchTimerRef = useRef(null);
    const isComposingRef = useRef(false);
    inputValueRef.current = inputValue;
    onChangeRef.current = onChange;

    const clearSearchTimer = () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
        searchTimerRef.current = null;
      }
    };

    const submitSearch = (searchValue) => {
      onChangeRef.current?.(searchValue ? { label: searchValue, value: searchValue } : null);
    };

    const scheduleSearch = (searchValue) => {
      clearSearchTimer();
      searchTimerRef.current = setTimeout(() => {
        searchTimerRef.current = null;
        submitSearch(searchValue);
      }, searchDelay);
    };

    useEffect(() => {
      if (propsValue !== inputValueRef.current) {
        clearSearchTimer();
        setInputValue(propsValue || '');
      }
    }, [propsValue]);

    useEffect(() => {
      return () => {
        clearSearchTimer();
      };
    }, []);

    return (
      <Search
        {...props}
        placeholder={placeholder || formatMessage({ id: 'inputPlaceholder' }, { label })}
        value={inputValue}
        onChange={(e) => {
          const nextValue = e.target.value;
          setInputValue(nextValue);
          if (!isComposingRef.current) {
            scheduleSearch(nextValue);
          }
        }}
        onCompositionStart={() => {
          isComposingRef.current = true;
          clearSearchTimer();
        }}
        onCompositionEnd={(e) => {
          isComposingRef.current = false;
          const nextValue = e.target.value;
          setInputValue(nextValue);
          scheduleSearch(nextValue);
        }}
        onSearch={(searchValue) => {
          clearSearchTimer();
          submitSearch(searchValue);
        }}
      />
    );
  }),
);

export default SearchInput;
