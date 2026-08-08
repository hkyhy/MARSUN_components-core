// @ts-nocheck
import { Button, Space, Tag, Tooltip } from 'antd';
import style from './style.module.scss';
import classnames from 'classnames';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';
import { useState } from 'react';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import useFilterIsMobile from './hooks/useFilterIsMobile';
import useHorizontalScrollShadows from './hooks/useHorizontalScrollShadows';
import { FILTER_CLASS } from './filterClassNames';

const isDisplayValueEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
};

const FilterValueDisplay = withLocale(
  ({ value: filterValue, extraExpand, onChange, className, hideLabel, flush }) => {
    const { formatMessage } = useIntl({ moduleName: 'Filter' });
    const [isExpand, setIsExpand] = useState(false);
    const isMobile = useFilterIsMobile();
    // 防御：受控 value 里可能残留多选清空后的 { value: [] }
    const displayValue = (Array.isArray(filterValue) ? filterValue : []).filter(
      (item) => !isDisplayValueEmpty(item?.value),
    );
    const { scrollRef, isOverflow, showScrollPrev, showScrollNext } = useHorizontalScrollShadows({
      enabled: isMobile,
      suspend: isExpand,
      preserveOverflowOnSuspend: true,
      refreshKey: displayValue,
    });

    if (displayValue.length === 0) {
      return null;
    }

    const tags = displayValue.map(({ name, label, value }, index) => {
      const valueLabels = Array.isArray(value)
        ? value.map((item) => item?.label).filter(Boolean)
        : value?.label
          ? [value.label]
          : [];
      const valueLabel = valueLabels.join('，');
      const content = (
        <span
          className={classnames(style['filter-value-tag-content'], FILTER_CLASS.valueTagContent)}
        >
          {valueLabel}
        </span>
      );
      const tooltipTitle = valueLabels.length ? (
        <div className={style['filter-value-tag-tooltip']}>
          {valueLabels.map((text, i) => (
            <div key={`${name}-${i}`} className={style['filter-value-tag-tooltip-line']}>
              {text}
            </div>
          ))}
        </div>
      ) : null;
      return (
        <Tag
          key={name}
          closable
          className={classnames(style['filter-value-tag'], FILTER_CLASS.valueTag)}
          onClose={() => {
            const newValue = displayValue.slice(0);
            newValue.splice(index, 1);
            onChange(newValue);
          }}
        >
          <span className={classnames(style['filter-value-tag-label'], FILTER_CLASS.valueTagLabel)}>
            {label}:
          </span>
          {tooltipTitle ? (
            <Tooltip
              title={tooltipTitle}
              rootClassName={style['filter-value-tag-tooltip-root']}
              overlayClassName={style['filter-value-tag-tooltip-root']}
            >
              {content}
            </Tooltip>
          ) : (
            content
          )}
        </Tag>
      );
    });

    const clearButton = (
      <Button
        size="small"
        className={FILTER_CLASS.valueClear}
        onClick={() => {
          onChange([]);
        }}
      >
        {formatMessage({ id: 'clearAllText' })}
      </Button>
    );

    return (
      <Space
        className={classnames(
          style['filter-title'],
          style['filter-value-display'],
          FILTER_CLASS.valueDisplay,
          {
            [style['is-flush']]: flush,
          },
          className,
        )}
        align="top"
        size={hideLabel ? 0 : 16}
      >
        {hideLabel ? null : (
          <span className={classnames(style['filter-label'], FILTER_CLASS.label)}>
            {formatMessage({ id: 'selectedText' })}
          </span>
        )}
        {isMobile ? (
          <div
            className={classnames(
              style['filter-value-display-content'],
              !isOverflow && style['is-not-overflow'],
            )}
          >
            <div
              className={classnames(
                style['filter-value-tags-wrap'],
                isExpand && style['is-expand'],
              )}
            >
              {showScrollPrev ? (
                <div
                  className={classnames(
                    style['filter-scroll-prev-shadow'],
                    style['filter-value-scroll-prev-shadow'],
                  )}
                />
              ) : null}
              <div
                ref={scrollRef}
                className={classnames(
                  style['filter-line'],
                  style['filter-value-tags'],
                  FILTER_CLASS.line,
                  isExpand && style['is-expand'],
                )}
              >
                {tags}
              </div>
              {showScrollNext ? (
                <div className={classnames(style['filter-value-scroll-next-shadow'])} />
              ) : null}
            </div>
            <div
              className={classnames(
                style['filter-value-actions'],
                FILTER_CLASS.valueActions,
                isOverflow && style['is-overflow'],
              )}
            >
              <div className={style['filter-value-action-right']}>
                <Space size={4}>
                  {extraExpand}
                  {clearButton}
                </Space>
              </div>
              {isOverflow ? (
                <Button
                  type="link"
                  size="small"
                  className={classnames(style['filter-value-toggle'], FILTER_CLASS.valueToggle)}
                  icon={isExpand ? <UpOutlined /> : <DownOutlined />}
                  onClick={() => {
                    setIsExpand((value) => !value);
                  }}
                >
                  {isExpand ? '收起' : '展开'}
                </Button>
              ) : null}
              <div className={style['filter-value-action-placeholder']}>
                {extraExpand}
                <Button size="small" className={FILTER_CLASS.valueClear}>
                  {formatMessage({ id: 'clearAllText' })}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className={classnames(style['filter-line'], FILTER_CLASS.line)}>
            {tags}
            <Space size={4} className={classnames(style['un-expand-shadow'])}>
              {extraExpand}
              <Button size="small" className={FILTER_CLASS.valueClear}>
                {formatMessage({ id: 'clearAllText' })}
              </Button>
            </Space>
            <Space size={4} className={classnames(style['un-expand'], FILTER_CLASS.valueActions)}>
              {extraExpand}
              {clearButton}
            </Space>
          </div>
        )}
      </Space>
    );
  },
);

export default FilterValueDisplay;
