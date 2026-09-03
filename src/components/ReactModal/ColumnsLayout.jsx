// @ts-nocheck
// Ported from https://github.com/kne-union/react-modal/blob/master/src/ColumnsLayout.js
import { Children } from 'react';
import classnames from 'classnames';
import styles from './layouts.module.scss';

const resolveColStyle = (width) => {
  if (width == null || width === '1fr') {
    return { flex: '1 1 0%', minWidth: 0 };
  }
  return { flex: 'none', width, minWidth: 0 };
};

const ColumnsLayout = ({ widths, className, children, ...props }) => {
  const cols = Children.toArray(children);

  return (
    <div className={classnames(styles['modal-columns-layout'], className)} {...props}>
      {cols.map((child, index) => (
        <div
          key={index}
          className={styles['modal-columns-layout__col']}
          style={widths ? resolveColStyle(widths[index]) : undefined}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export default ColumnsLayout;
