import { SemanticTag } from '@/components/Tag';
import { ChevronDown, ChevronUp, X } from '@/components/Icons';
import { Button, Space, Tooltip } from 'antd';
import classNames from 'classnames';
import React, { useMemo, useRef, useState } from 'react';
import styles from './style.module.scss';
import { FilterLayoutProvider } from '../FilterLayoutContext';
import { resolveFilterVisible, type BaseFilterProps, type FilterVisibilityContext } from '../types';
import { useFilterLayoutMode } from '../useFilterLayoutMode';
import { useHorizontalScrollShadows } from '../useHorizontalScrollShadows';
import { FilterProvider, useFilterState } from '../useFilterState';

const DEFAULT_SELECTED_TAG_MAX_LENGTH = 20;

function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return { display: text, truncated: false };
  }
  return { display: `${text.slice(0, maxLength)}...`, truncated: true };
}

/** list 项：hidden===true 或 display===false 时不渲染；非 ReactElement 原样保留 */
function filterVisibleListItems(
  items: React.ReactNode[] | undefined,
  ctx: FilterVisibilityContext,
): React.ReactNode[] | undefined {
  if (!items) return items;
  return items.filter((item) => {
    if (!React.isValidElement(item)) return true;
    const props = item.props as Pick<BaseFilterProps, 'display' | 'hidden'>;
    return resolveFilterVisible({ display: props.display, hidden: props.hidden }, ctx);
  });
}

interface CommonFilterProps {
  children?: React.ReactNode;
  /** 筛选项 JSX 数组，如 [<FilterInput .../>, <FilterSelect .../>]；支持 props.hidden / props.display 控制是否渲染 */
  list?: React.ReactNode[];
  /** 右侧额外内容（与筛选项两端对齐） */
  extra?: React.ReactNode;
  /** 清空全部回调 */
  onClearAll?: () => void;
  /** 左侧标签文字；移动端默认隐藏 */
  label?: string;
  /** 已选标签 value 最大字符数，超出显示 ... 并在 hover 时展示完整内容 */
  selectedTagMaxLength?: number;
  /**
   * 默认展示的筛选项个数；超出收入「更多」。未传或 ≤0：全部展示。
   * 移动端布局下忽略（全部横滑）。
   */
  displayLine?: number;
  /**
   * 布局：`auto` 默认跟**视口**；`mobile` / `desktop` 强制。
   * 亦可用 `forceMobile`（true→mobile，false→desktop）。
   */
  layoutMode?: 'auto' | 'mobile' | 'desktop';
  /** @deprecated 使用 layoutMode；true→mobile，false→desktop */
  forceMobile?: boolean;
  /**
   * 为 true 时 `layoutMode="auto"` 按根容器宽度判定（窄预览框）。
   * 默认 false，避免 showcase 半栏误判移动端导致弹出空白大面板。
   */
  measureContainer?: boolean;
}

/**
 * 通用筛选栏容器
 *
 * 内部通过 useFilterState 管理各子组件的注册状态，
 * 子组件（FilterInput / FilterSelect / FilterTreeSelect）自行通过 useFilterRegister 注册选中项。
 * 外部不再需要手动维护 selectedItems 数组。
 *
 * 双端：窄屏横滑 pill、visited 打开态、sheet 弹出（经 FilterPopover）；见 SKILL #46 / filter §5.0。
 */
const CommonFilter: React.FC<CommonFilterProps> = ({
  children,
  list,
  extra,
  onClearAll,
  label = '筛选',
  selectedTagMaxLength = DEFAULT_SELECTED_TAG_MAX_LENGTH,
  displayLine,
  layoutMode = 'auto',
  forceMobile,
  measureContainer = false,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const itemsScrollRef = useRef<HTMLDivElement>(null);
  const selectedScrollRef = useRef<HTMLDivElement>(null);
  const { isMobile: detectedMobile } = useFilterLayoutMode({
    containerRef: rootRef,
    measureContainer,
  });
  const resolvedMode: 'auto' | 'mobile' | 'desktop' =
    forceMobile === true ? 'mobile' : forceMobile === false ? 'desktop' : layoutMode;
  const isMobile = resolvedMode === 'mobile' || (resolvedMode === 'auto' && detectedMobile);
  const [moreOpen, setMoreOpen] = useState(false);
  const [selectedExpanded, setSelectedExpanded] = useState(false);

  const { selectedItems, register, unregister, clearAll, values, setFieldValue, clearFieldValue } =
    useFilterState();

  const filterCtx = useMemo(
    () => ({ register, unregister, values, setFieldValue, clearFieldValue }),
    [register, unregister, values, setFieldValue, clearFieldValue],
  );

  const visibleList = useMemo(() => filterVisibleListItems(list, values), [list, values]);

  const flatItems = useMemo(() => {
    const fromList = visibleList ?? [];
    const fromChildren = React.Children.toArray(children);
    return [...fromList, ...fromChildren];
  }, [visibleList, children]);

  const { primaryItems, moreItems } = useMemo(() => {
    if (!displayLine || displayLine <= 0 || isMobile) {
      return { primaryItems: flatItems, moreItems: [] as React.ReactNode[] };
    }
    return {
      primaryItems: flatItems.slice(0, displayLine),
      moreItems: flatItems.slice(displayLine),
    };
  }, [flatItems, displayLine, isMobile]);

  const itemsShadows = useHorizontalScrollShadows(itemsScrollRef);
  const selectedShadows = useHorizontalScrollShadows(selectedScrollRef);

  const handleClearAll = React.useCallback(() => {
    clearAll();
    onClearAll?.();
  }, [clearAll, onClearAll]);

  return (
    <div
      ref={rootRef}
      data-layout={isMobile ? 'mobile' : 'desktop'}
      className={classNames(
        'common-filter-root',
        styles['common-filter-root'],
        isMobile && ['common-filter-is-mobile', styles['common-filter-is-mobile']],
      )}
    >
      <div className={classNames('common-filter-container', styles['common-filter-container'])}>
        {!isMobile && (
          <span className={classNames('common-filter-label', styles['common-filter-label'])}>
            {label}
          </span>
        )}
        <FilterLayoutProvider isMobile={isMobile}>
          <FilterProvider ctx={filterCtx}>
            <div className={classNames('common-filter-content', styles['common-filter-content'])}>
              <div
                className={classNames(
                  'common-filter-items-wrap',
                  styles['common-filter-items-wrap'],
                )}
              >
                {isMobile && itemsShadows.showPrev && (
                  <div
                    className={classNames(
                      'common-filter-scroll-shadow-prev',
                      styles['common-filter-scroll-shadow-prev'],
                    )}
                  />
                )}
                <div
                  ref={itemsScrollRef}
                  className={classNames('common-filter-items', styles['common-filter-items'])}
                >
                  {primaryItems}
                  {moreItems.length > 0 && (
                    <>
                      <Button
                        type="link"
                        size="small"
                        className={classNames(
                          'common-filter-more-btn',
                          styles['common-filter-more-btn'],
                        )}
                        onClick={() => setMoreOpen((v) => !v)}
                      >
                        {moreOpen ? '收起' : '更多'}
                        {moreOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </Button>
                      {moreOpen && moreItems}
                    </>
                  )}
                </div>
                {isMobile && itemsShadows.showNext && (
                  <div
                    className={classNames(
                      'common-filter-scroll-shadow-next',
                      styles['common-filter-scroll-shadow-next'],
                    )}
                  />
                )}
              </div>
              {extra && (
                <div className={classNames('common-filter-extra', styles['common-filter-extra'])}>
                  {extra}
                </div>
              )}
            </div>
          </FilterProvider>
        </FilterLayoutProvider>
      </div>

      {selectedItems.length > 0 && (
        <div className={classNames('common-filter-selected', styles['common-filter-selected'])}>
          <div
            className={classNames(
              'common-filter-selected-main',
              styles['common-filter-selected-main'],
            )}
          >
            {!isMobile && (
              <span
                className={classNames(
                  'common-filter-selected-title',
                  styles['common-filter-selected-title'],
                )}
              >
                您已选择
              </span>
            )}
            <div
              className={classNames(
                'common-filter-selected-tags-wrap',
                styles['common-filter-selected-tags-wrap'],
              )}
            >
              {isMobile && !selectedExpanded && selectedShadows.showPrev && (
                <div
                  className={classNames(
                    'common-filter-scroll-shadow-prev',
                    styles['common-filter-scroll-shadow-prev'],
                  )}
                />
              )}
              <div
                ref={selectedScrollRef}
                className={classNames(
                  'common-filter-selected-tags',
                  styles['common-filter-selected-tags'],
                  isMobile && !selectedExpanded && styles['common-filter-selected-tags-scroll'],
                  isMobile && selectedExpanded && styles['common-filter-selected-tags-expand'],
                )}
              >
                <Space size={[8, 8]} wrap={!isMobile || selectedExpanded}>
                  {selectedItems.map((s) => {
                    const { display, truncated } = truncateText(s.valueLabel, selectedTagMaxLength);
                    const valueNode = truncated ? (
                      <Tooltip title={s.valueLabel}>
                        <span
                          className={classNames(
                            'common-filter-tag-value',
                            styles['common-filter-tag-value'],
                          )}
                        >
                          {display}
                        </span>
                      </Tooltip>
                    ) : (
                      <span
                        className={classNames(
                          'common-filter-tag-value',
                          styles['common-filter-tag-value'],
                        )}
                      >
                        {display}
                      </span>
                    );

                    return (
                      <SemanticTag key={s.key} color="primary">
                        <span
                          className={classNames('common-filter-tag', styles['common-filter-tag'])}
                        >
                          <span
                            className={classNames(
                              'common-filter-tag-label',
                              styles['common-filter-tag-label'],
                            )}
                            style={{ color: 'var(--font-color)' }}
                          >
                            {s.label}：
                          </span>
                          {valueNode}
                          <X
                            className={classNames(
                              'common-filter-tag-close',
                              styles['common-filter-tag-close'],
                              s.removable === false && styles['common-filter-tag-close-disabled'],
                            )}
                            onClick={(e) => {
                              e.preventDefault();
                              if (s.removable === false) return;
                              s.onRemove();
                            }}
                          />
                        </span>
                      </SemanticTag>
                    );
                  })}
                </Space>
              </div>
              {isMobile && !selectedExpanded && selectedShadows.showNext && (
                <div
                  className={classNames(
                    'common-filter-scroll-shadow-next',
                    styles['common-filter-scroll-shadow-next'],
                  )}
                />
              )}
            </div>
            {isMobile && (
              <Button
                type="link"
                size="small"
                className={classNames(
                  'common-filter-selected-toggle',
                  styles['common-filter-selected-toggle'],
                )}
                onClick={() => setSelectedExpanded((v) => !v)}
              >
                {selectedExpanded ? '收起' : '展开'}
              </Button>
            )}
          </div>
          <Button
            type="link"
            size="small"
            onClick={handleClearAll}
            className={classNames('common-filter-clear-btn', styles['common-filter-clear-btn'])}
          >
            清空全部
          </Button>
        </div>
      )}
    </div>
  );
};

export default CommonFilter;
export type { CommonFilterProps };
