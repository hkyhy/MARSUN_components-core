// @ts-nocheck
import FilterLines from './FilterLines';
import FilterValueDisplay from './FilterValueDisplay';
import FilterOuter from './FilterOuter';
import withLocale from './withLocale';

const Filter = withLocale(({ defaultValue = [], ...props }) => {
  return (
    <FilterOuter {...props} defaultValue={defaultValue}>
      {({ props: filterProps = {}, value, onChange }) => {
        const { extraExpand, ...others } = filterProps;
        return (
          <>
            <FilterLines {...others} />
            {value && value.length > 0 && (
              <FilterValueDisplay value={value} onChange={onChange} extraExpand={extraExpand} />
            )}
          </>
        );
      }}
    </FilterOuter>
  );
});

export default Filter;
