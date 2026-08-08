// @ts-nocheck
import classnames from 'classnames';
import style from './style.module.scss';
import FilterProvider from './FilterProvider';
import useFilterIsMobile from './hooks/useFilterIsMobile';
import useFilterViewportVars from './hooks/useFilterViewportVars';
import { FILTER_CLASS } from './filterClassNames';

const FilterOuter = ({ children, className, ...props }) => {
  const isMobile = useFilterIsMobile();
  const boundaryRef = useFilterViewportVars();

  return (
    <FilterProvider {...props}>
      {(context) => (
        <div
          ref={boundaryRef}
          className={classnames(
            style['filter'],
            FILTER_CLASS.root,
            isMobile && style['is-mobile'],
            isMobile && FILTER_CLASS.isMobile,
            className,
          )}
        >
          {children({ ...context, props })}
        </div>
      )}
    </FilterProvider>
  );
};

export default FilterOuter;
