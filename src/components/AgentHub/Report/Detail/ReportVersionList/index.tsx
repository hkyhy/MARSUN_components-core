import { Empty } from '@/components/Empty';
import { VirtualScrollbar } from '@/components/VirtualScrollbar';
import { formatDateTimeDisplay } from '@/utils/date';
import classNames from 'classnames';
import type { ReportVersionItem } from '../../types';
import styles from './style.module.scss';

export type ReportVersionListProps = {
  items: ReportVersionItem[];
  emptyDescription?: string;
  /** 默认 formatDateTimeDisplay */
  formatTime?: (value: string) => string;
  selectedId?: string | null;
  onSelect?: (item: ReportVersionItem) => void;
  className?: string;
  title?: string;
};

/** 报告版本 / 归档历史列表（扁平，无块级 border） */
const ReportVersionList: React.FC<ReportVersionListProps> = ({
  items,
  emptyDescription = '尚无归档',
  formatTime = formatDateTimeDisplay,
  selectedId,
  onSelect,
  className,
  title = '归档历史',
}) => {
  return (
    <aside
      className={classNames(
        'marsun-report-version-list',
        styles['marsun-report-version-list'],
        className,
      )}
    >
      {title ? (
        <h3
          className={classNames(
            'marsun-report-version-list-title',
            styles['marsun-report-version-list-title'],
          )}
        >
          {title}
        </h3>
      ) : null}
      <VirtualScrollbar
        className={classNames(
          'marsun-report-version-list-scroll',
          styles['marsun-report-version-list-scroll'],
        )}
        wrapperClassName={styles['marsun-report-version-list-scroll-wrap']}
      >
        {items.length === 0 ? (
          <Empty iconType="simple" description={emptyDescription} />
        ) : (
          <ul
            className={classNames(
              'marsun-report-version-list-items',
              styles['marsun-report-version-list-items'],
            )}
          >
            {items.map((item) => {
              const label = (
                <>
                  <strong>{formatTime(item.at)}</strong>
                  {item.by ? <span> · {item.by}</span> : null}
                </>
              );
              if (!onSelect) {
                return (
                  <li key={item.id}>
                    <div
                      className={classNames(
                        'marsun-report-version-list-item',
                        styles['marsun-report-version-list-item'],
                        styles['marsun-report-version-list-item--static'],
                      )}
                    >
                      {label}
                    </div>
                  </li>
                );
              }
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={classNames(
                      'marsun-report-version-list-item',
                      styles['marsun-report-version-list-item'],
                      selectedId === item.id && styles['marsun-report-version-list-item--selected'],
                    )}
                    onClick={() => onSelect(item)}
                  >
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </VirtualScrollbar>
    </aside>
  );
};

export default ReportVersionList;
