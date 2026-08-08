// @ts-nocheck
import classnames from 'classnames';
import style from './style.module.scss';
import { FILTER_CLASS } from './filterClassNames';

// 不用 ant Space / withLocale：避免首帧 inline-flex 未就绪或 intl Fetch 空挂载导致宽度为 0
const FilterItem = ({ open, active, label, children }) => {
  return (
    <div className={classnames(style['filter-item-wrap'], FILTER_CLASS.itemWrap)}>
      <div
        className={classnames(style['filter-item'], FILTER_CLASS.item, {
          [style['is-active']]: active,
          [FILTER_CLASS.itemActive]: active,
          [style['is-visited']]: open,
          [FILTER_CLASS.itemVisited]: open,
        })}
      >
        <span className={classnames(style['filter-item-label'], FILTER_CLASS.itemLabel)}>
          <span>{label}</span>
          <span className={classnames(style['filter-item-icon'], FILTER_CLASS.itemIcon)}>▼</span>
        </span>
        {children != null ? (
          <div className={classnames(style['filter-item-field'], FILTER_CLASS.itemField)}>
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default FilterItem;
