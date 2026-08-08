// @ts-nocheck
import classnames from 'classnames';
import { useCallback, useMemo, useState } from 'react';
import style from './style.module.scss';
import { Col, Row, Space } from 'antd';
import { useIntl } from '@kne/react-intl';
import { useContext } from './context';
import get from 'lodash/get';
import useFilterIsMobile from './hooks/useFilterIsMobile';
import useHorizontalScrollShadows from './hooks/useHorizontalScrollShadows';
import useVisibleItemCount from './hooks/useVisibleItemCount';
import { getMobileFilterList, normalizeFilterList } from './normalizeFilterList';
import { FILTER_CLASS } from './filterClassNames';

const isValidFilterItem = (item) => !!item && (item.type || typeof item === 'function');

const useFilterItemRenderer = () => {
  const { value, onChange } = useContext();

  return useCallback(
    (item, index) => {
      if (typeof item === 'function') {
        return item((props) => ({
          index,
          value: value ? get(value.get(props?.name), 'value') : props?.value,
          onChange: onChange
            ? (nextValue) =>
                onChange({
                  name: props?.name,
                  label: props?.label,
                  value: nextValue,
                })
            : props?.onChange,
        }));
      }

      const ComponentItem = item.type;
      return (
        <ComponentItem
          {...Object.assign({}, item.props, {
            value: value ? get(value.get(item.props.name), 'value') : item.props.value,
            onChange: onChange
              ? (nextValue) =>
                  onChange({
                    name: item.props.name,
                    label: item.props.label,
                    value: nextValue,
                  })
              : item.props.onChange,
          })}
          key={item.key || item.props.name || index}
        />
      );
    },
    [onChange, value],
  );
};

const Line = ({ list, children, innerRef, nowrap }) => {
  const renderItem = useFilterItemRenderer();

  return (
    <div
      ref={innerRef}
      className={classnames(style['filter-line'], FILTER_CLASS.line, {
        [style['filter-line-nowrap']]: nowrap,
      })}
    >
      {list.filter(isValidFilterItem).map((item, index) => renderItem(item, index))}
      {children}
    </div>
  );
};

const CollapseButtons = ({ onClick, toggleUpText }) => (
  <>
    <Space size={4} className={classnames(style['un-expand-shadow'])}>
      <Space
        size={4}
        className={classnames(style['option'], style['filter-item'], FILTER_CLASS.item)}
      >
        {toggleUpText}
        <span className={style['filter-item-option-icon']}>▲</span>
      </Space>
    </Space>
    <Space size={4} className={classnames(style['un-expand'])} onClick={onClick}>
      <Space
        size={4}
        className={classnames(style['option'], style['filter-item'], FILTER_CLASS.item)}
      >
        {toggleUpText}
        <span className={style['filter-item-option-icon']}>▲</span>
      </Space>
    </Space>
  </>
);

const FilterLines = ({
  className,
  list = [],
  displayLine = 1,
  label,
  extra,
  children,
  visibleCountStrategy = 'asc',
}) => {
  const { mode, items: flatItems, lines } = useMemo(() => normalizeFilterList(list), [list]);
  const mobileList = useMemo(() => getMobileFilterList(list), [list]);
  const isFlatMode = mode === 'flat';
  const [isExpand, setIsExpand] = useState(false);
  const isMobile = useFilterIsMobile();
  const { scrollRef, showScrollPrev, showScrollNext } = useHorizontalScrollShadows({
    enabled: isMobile,
    refreshKey: list,
  });
  const { setContainerRef, setMeasureRef, setMoreMeasureRef, visibleCount, ready } =
    useVisibleItemCount({
      items: flatItems,
      enabled: !isMobile && isFlatMode,
      strategy: visibleCountStrategy,
    });
  const renderItem = useFilterItemRenderer();
  const { formatMessage } = useIntl({ moduleName: 'Filter' });

  // 未 ready：单行全量截断测量（不换行）；ready 后按 visibleCount 裁切；仅用户点开「更多」才换行
  const hasMoreFlat = isFlatMode && ready && visibleCount < flatItems.length;
  const visibleFlatItems = isFlatMode
    ? isExpand || !ready
      ? flatItems
      : flatItems.slice(0, visibleCount)
    : [];
  // 「更多」未点开时始终单行；展开后才允许换行
  const flatNowrap = isFlatMode && !isExpand;
  const hasMoreNested = !isFlatMode && lines.length > displayLine;
  const hasMore = isFlatMode ? hasMoreFlat : hasMoreNested;
  const visibleLines = !isFlatMode ? lines.slice(0, displayLine) : [];
  const hiddenLines = !isFlatMode ? lines.slice(displayLine) : [];
  const showLabel = isFlatMode ? flatItems.length > 0 : lines.length > 0;

  const setScrollContainerRef = useCallback(
    (node) => {
      scrollRef.current = node;
    },
    [scrollRef],
  );

  const setMeasureContainerRef = useCallback(
    (node) => {
      if (!isMobile && isFlatMode) {
        setContainerRef(node);
      } else {
        setContainerRef(null);
      }
    },
    [isFlatMode, isMobile, setContainerRef],
  );

  const scrollToNext = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      left: el.scrollLeft + el.clientWidth * 0.8,
      behavior: 'smooth',
    });
  }, [scrollRef]);

  const scrollToPrev = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      left: Math.max(el.scrollLeft - el.clientWidth * 0.8, 0),
      behavior: 'smooth',
    });
  }, [scrollRef]);

  const scrollItemIntoView = useCallback(
    (e) => {
      if (!isMobile) return;
      const container = scrollRef.current;
      const item =
        e.target.closest(`.${FILTER_CLASS.itemWrap}`) ||
        e.target.closest(`.${style['filter-item-wrap']}`) ||
        e.target.closest(`.${FILTER_CLASS.item}`) ||
        e.target.closest(`.${style['filter-item']}`);
      if (!container || !item) return;
      item.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    },
    [isMobile, scrollRef],
  );

  const toggleExpand = useCallback(() => {
    setIsExpand((value) => !value);
  }, []);

  const moreButtonLabel = (
    <>
      {formatMessage({ id: 'moreText' })}
      <span className={style['filter-item-option-icon']}>▼</span>
    </>
  );

  const moreButton = (
    <Space
      size={4}
      className={classnames(
        style['filter-item'],
        style['option'],
        FILTER_CLASS.item,
        FILTER_CLASS.more,
      )}
      onClick={toggleExpand}
    >
      {moreButtonLabel}
    </Space>
  );

  const collapseButton = (
    <Space
      size={4}
      className={classnames(
        style['filter-item'],
        style['option'],
        FILTER_CLASS.item,
        FILTER_CLASS.more,
      )}
      onClick={toggleExpand}
    >
      {formatMessage({ id: 'toggleUpText' })}
      <span className={style['filter-item-option-icon']}>▲</span>
    </Space>
  );

  const renderDesktopContent = () => {
    if (isFlatMode) {
      return (
        <Line list={visibleFlatItems} nowrap={flatNowrap}>
          {hasMoreFlat && !isExpand ? <span data-filter-more>{moreButton}</span> : null}
          {hasMoreFlat && isExpand ? <span data-filter-more>{collapseButton}</span> : null}
        </Line>
      );
    }

    return visibleLines.map((line, index) => (
      <Line key={index} list={line}>
        {hasMoreNested && !isExpand && index === displayLine - 1 ? moreButton : null}
      </Line>
    ));
  };

  const renderExpandedContent = () => {
    // 扁平模式展开已在主行全量渲染，more-row 仅嵌套 list 使用
    if (isFlatMode) {
      return null;
    }

    return hiddenLines.map((line, index) => (
      <Line key={index} list={line}>
        {index === hiddenLines.length - 1 ? (
          <CollapseButtons
            onClick={toggleExpand}
            toggleUpText={formatMessage({ id: 'toggleUpText' })}
          />
        ) : null}
      </Line>
    ));
  };

  return (
    <>
      <Space
        className={classnames(style['filter-title'], FILTER_CLASS.title, className)}
        align="top"
        size={16}
      >
        <span className={classnames(style['filter-label'], FILTER_CLASS.label)}>
          {showLabel && (label || formatMessage({ id: 'filterText' }))}
        </span>
        <Row justify="space-between" wrap={false} align="top">
          <Col className={classnames(style['filter-list'], FILTER_CLASS.list)} flex={1}>
            <div
              ref={setMeasureContainerRef}
              className={classnames(style['filter-list-scroll-wrap'], FILTER_CLASS.listScrollWrap, {
                // 未展开时单行裁切；展开后取消约束以允许换行
                [style['filter-list-constrained']]: !isMobile && isFlatMode && !isExpand,
                [style['has-scroll-prev']]: isMobile && showScrollPrev,
              })}
            >
              {!isMobile && isFlatMode ? (
                <div
                  ref={setMeasureRef}
                  className={classnames(
                    style['filter-line'],
                    style['filter-line-measure'],
                    FILTER_CLASS.line,
                  )}
                  aria-hidden
                >
                  {flatItems.filter(isValidFilterItem).map((item, index) => (
                    <div key={item.key || item.props?.name || index} data-filter-measure-item>
                      {renderItem(item, index)}
                    </div>
                  ))}
                  <div ref={setMoreMeasureRef} data-filter-measure-more>
                    <Space
                      size={4}
                      className={classnames(
                        style['filter-item'],
                        style['option'],
                        FILTER_CLASS.item,
                        FILTER_CLASS.more,
                      )}
                    >
                      {moreButtonLabel}
                    </Space>
                  </div>
                </div>
              ) : null}
              {isMobile && showScrollPrev ? (
                <button
                  type="button"
                  className={style['filter-scroll-prev']}
                  onClick={scrollToPrev}
                  aria-label="scroll prev"
                >
                  <span className={style['filter-scroll-prev-icon']}>‹</span>
                </button>
              ) : null}
              <div
                className={classnames(style['filter-list-scroll'], FILTER_CLASS.listScroll)}
                ref={setScrollContainerRef}
                onClick={scrollItemIntoView}
              >
                {isMobile
                  ? mobileList.map((item, index) => <Line key={index} list={[item]} />)
                  : renderDesktopContent()}
              </div>
              {isMobile && showScrollNext ? (
                <button
                  type="button"
                  className={style['filter-scroll-next']}
                  onClick={scrollToNext}
                  aria-label="scroll next"
                >
                  <span className={style['filter-scroll-next-icon']}>›</span>
                </button>
              ) : null}
            </div>
          </Col>
          <Col className={FILTER_CLASS.extra}>{extra}</Col>
        </Row>
      </Space>
      {children ? (
        <Space
          className={classnames(style['filter-title'], FILTER_CLASS.children)}
          align="center"
          size={16}
        >
          {children}
        </Space>
      ) : null}
      <Space
        className={classnames(style['filter-title'], FILTER_CLASS.moreRow, {
          [style['filter-title-hidden']]: isMobile || isFlatMode || !(hasMore && isExpand),
        })}
        align="top"
        size={16}
      >
        <span className={classnames(style['filter-label'], FILTER_CLASS.label)}>
          {formatMessage({ id: 'moreText' })}
        </span>
        <div className={classnames(style['filter-list'], FILTER_CLASS.list)}>
          {renderExpandedContent()}
        </div>
      </Space>
    </>
  );
};

export default FilterLines;
