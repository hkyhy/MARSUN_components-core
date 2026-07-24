import { SemanticTag } from '@/components/Tag';
import { X } from '@/components/Icons';
import { Button, Space, Tooltip } from 'antd';
import classNames from 'classnames';
import React, { useMemo } from 'react';
import styles from './style.module.scss';
import { FilterProvider, useFilterState } from '../useFilterState';

const DEFAULT_SELECTED_TAG_MAX_LENGTH = 20;

function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return { display: text, truncated: false };
  }
  return { display: `${text.slice(0, maxLength)}...`, truncated: true };
}

interface CommonFilterProps {
  children?: React.ReactNode;
  /** 筛选项 JSX 数组，如 [<FilterInput .../>, <FilterSelect .../>] */
  list?: React.ReactNode[];
  /** 右侧额外内容（与筛选项两端对齐） */
  extra?: React.ReactNode;
  /** 清空全部回调 */
  onClearAll?: () => void;
  /** 左侧标签文字 */
  label?: string;
  /** 已选标签 value 最大字符数，超出显示 ... 并在 hover 时展示完整内容 */
  selectedTagMaxLength?: number;
}

/**
 * 通用筛选栏容器
 *
 * 内部通过 useFilterState 管理各子组件的注册状态，
 * 子组件（FilterInput / FilterSelect / FilterTreeSelect）自行通过 useFilterRegister 注册选中项。
 * 外部不再需要手动维护 selectedItems 数组。
 *
 * 用法一（children 模式）：
 * ```tsx
 * <CommonFilter label="筛选">
 *   <FilterInput filterKey="keyword" label="关键词" value={keyword} onChange={setKeyword} />
 *   <FilterSelect filterKey="status" label="状态" options={options} value={status} onChange={setStatus} />
 * </CommonFilter>
 * ```
 *
 * 用法二（list 模式）：
 * ```tsx
 * const filterList = [
 *   <FilterInput key="keyword" filterKey="keyword" label="关键词" value={keyword} onChange={setKeyword} />,
 *   <FilterSelect key="status" filterKey="status" label="状态" options={options} value={status} onChange={setStatus} />,
 * ];
 * <CommonFilter label="筛选" list={filterList} extra={<Button>导出</Button>} />
 * ```
 */
const CommonFilter: React.FC<CommonFilterProps> = ({
  children,
  list,
  extra,
  onClearAll,
  label = '筛选',
  selectedTagMaxLength = DEFAULT_SELECTED_TAG_MAX_LENGTH,
}) => {
  const { selectedItems, register, unregister, clearAll, values, setFieldValue, clearFieldValue } =
    useFilterState();

  const filterCtx = useMemo(
    () => ({ register, unregister, values, setFieldValue, clearFieldValue }),
    [register, unregister, values, setFieldValue, clearFieldValue],
  );

  // 合并外部 onClearAll 和内部的 clearAll
  const handleClearAll = React.useCallback(() => {
    clearAll();
    onClearAll?.();
  }, [clearAll, onClearAll]);

  return (
    <div className={classNames('common-filter-root', styles['common-filter-root'])}>
      {/* 筛选行 */}
      <div className={classNames('common-filter-container', styles['common-filter-container'])}>
        <span className={classNames('common-filter-label', styles['common-filter-label'])}>
          {label}
        </span>
        <FilterProvider ctx={filterCtx}>
          <div className={classNames('common-filter-content', styles['common-filter-content'])}>
            <div className={classNames('common-filter-items', styles['common-filter-items'])}>
              {list}
              {children}
            </div>
            {extra && (
              <div className={classNames('common-filter-extra', styles['common-filter-extra'])}>
                {extra}
              </div>
            )}
          </div>
        </FilterProvider>
      </div>

      {/* 已选择行 */}
      {selectedItems.length > 0 && (
        <div className={classNames('common-filter-selected', styles['common-filter-selected'])}>
          <div
            className={classNames(
              'common-filter-selected-main',
              styles['common-filter-selected-main'],
            )}
          >
            <span
              className={classNames(
                'common-filter-selected-title',
                styles['common-filter-selected-title'],
              )}
            >
              您已选择
            </span>
            <Space
              size={[8, 8]}
              wrap
              className={classNames(
                'common-filter-selected-tags',
                styles['common-filter-selected-tags'],
              )}
            >
              {selectedItems.map((s) => {
                const { display, truncated } = truncateText(s.valueLabel, selectedTagMaxLength);
                const valueNode = truncated ? (
                  <Tooltip title={s.valueLabel}>
                    <span>{display}</span>
                  </Tooltip>
                ) : (
                  <span>{display}</span>
                );

                return (
                  <SemanticTag key={s.key} color="primary">
                    <span className={classNames('common-filter-tag', styles['common-filter-tag'])}>
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
