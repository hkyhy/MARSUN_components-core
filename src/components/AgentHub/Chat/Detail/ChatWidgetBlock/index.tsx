import type { ChatWidget } from '@/components/AgentHub/types';
import { VirtualScrollbar } from '@/components/VirtualScrollbar';
import { Table } from 'antd';
import classNames from 'classnames';
import ChatWidgetSparkline from './ChatWidgetSparkline';
import styles from './style.module.scss';

export interface ChatWidgetBlockProps {
  widgets?: ChatWidget[];
  className?: string;
  compact?: boolean;
  /** 置于正文之前时去掉顶部分隔线 */
  leading?: boolean;
}

const DEFAULT_BAR_COLORS = ['#2563eb', '#16a34a', '#ea580c', '#9333ea'];
const TABLE_COLUMN_MIN_WIDTH = 72;
const TABLE_COLUMN_MAX_WIDTH = 112;

const TABLE_COLUMN_KEY_WIDTH: Record<string, number> = {
  date: 96,
  process: 88,
  param: 96,
  before: 80,
  after: 80,
  operator: 72,
  indicator: 96,
  domain: 72,
  relation: 64,
  coeff: 64,
};

function resolveTableColumnWidth(column: { key: string; label: string; width?: number }) {
  const hinted = TABLE_COLUMN_KEY_WIDTH[column.key];
  const preferred = column.width ?? hinted ?? column.label.length * 12 + 24;
  return Math.min(TABLE_COLUMN_MAX_WIDTH, Math.max(TABLE_COLUMN_MIN_WIDTH, preferred));
}

function resolveTableScrollWidth(columns: { key: string; label: string; width?: number }[]) {
  return columns.reduce((sum, column) => sum + resolveTableColumnWidth(column), 0);
}

function renderChatWidgetTable(
  columns: NonNullable<ChatWidget['columns']>,
  rows: ChatWidget['rows'],
) {
  const scrollWidth = resolveTableScrollWidth(columns);
  return (
    <VirtualScrollbar
      direction="horizontal"
      wrapperClassName={styles['chat-widget-table-scroll-wrapper']}
      className={styles['chat-widget-table-scroll']}
    >
      <Table
        size="small"
        pagination={false}
        tableLayout="fixed"
        className={styles['chat-widget-table']}
        style={{ width: scrollWidth, minWidth: scrollWidth }}
        columns={columns.map((column) => ({
          title: column.label,
          dataIndex: column.key,
          key: column.key,
          width: resolveTableColumnWidth(column),
          ellipsis: { showTitle: true },
        }))}
        dataSource={(rows || []).map((row, rowIndex) => ({ ...row, key: rowIndex }))}
      />
    </VirtualScrollbar>
  );
}

const ChatWidgetBlock: React.FC<ChatWidgetBlockProps> = ({
  widgets = [],
  className,
  compact = false,
  leading = false,
}) => {
  if (!widgets.length) return null;

  return (
    <div
      className={classNames(
        'chat-widget-block',
        styles['chat-widget-block'],
        compact && styles['chat-widget-block--compact'],
        leading && styles['chat-widget-block--leading'],
        className,
      )}
    >
      {widgets.map((widget, index) => (
        <div key={`${widget.type}-${index}`} className={styles['chat-widget-item']}>
          {widget.title ? <div className={styles['chat-widget-title']}>{widget.title}</div> : null}

          {widget.type === 'line_chart' && widget.series?.length ? (
            <ChatWidgetSparkline series={widget.series} />
          ) : null}

          {widget.type === 'bar_chart' && widget.categories?.length && widget.series?.length ? (
            <div className={styles['chat-widget-bars']}>
              {widget.series.map((seriesItem, seriesIndex) => {
                const values = (seriesItem.y || []).map((v) => Number(v));
                const max = Math.max(...values, 1);
                const color =
                  seriesItem.color || DEFAULT_BAR_COLORS[seriesIndex % DEFAULT_BAR_COLORS.length];
                return (
                  <div key={seriesIndex} className={styles['chat-widget-bar-group']}>
                    <div className={styles['chat-widget-bar-group-title']}>{seriesItem.name}</div>
                    <div className={styles['chat-widget-bar-row']}>
                      {widget.categories?.map((category, categoryIndex) => {
                        const value = values[categoryIndex] ?? 0;
                        return (
                          <div key={category} className={styles['chat-widget-bar-cell']}>
                            <div
                              className={styles['chat-widget-bar']}
                              style={{
                                height: `${Math.max(8, (value / max) * 48)}px`,
                                backgroundColor: color,
                              }}
                            />
                            <span>{category}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {widget.type === 'bar_chart' && !widget.categories?.length && widget.series?.length ? (
            <ChatWidgetSparkline series={widget.series} />
          ) : null}

          {widget.type === 'table' && widget.columns?.length
            ? renderChatWidgetTable(widget.columns, widget.rows)
            : null}

          {widget.type === 'metric_cards' && widget.items?.length ? (
            <div className={styles['chat-widget-metric-cards']}>
              {widget.items.map((item, itemIndex) => (
                <div key={itemIndex} className={styles['chat-widget-metric-card']}>
                  <div className={styles['chat-widget-metric-card-label']}>
                    {String(item.label || '')}
                  </div>
                  <div className={styles['chat-widget-metric-card-value']}>
                    {String(item.value ?? '—')}
                    {item.unit ? <span>{String(item.unit)}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {(widget.type === 'doc_list' ||
            widget.type === 'case_list' ||
            widget.type === 'link_list') &&
          widget.items?.length ? (
            <ul className={styles['chat-widget-list']}>
              {widget.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  {item.href ? (
                    <a href={String(item.href)} target="_blank" rel="noreferrer">
                      {String(item.label || item.doc || item.id || itemIndex + 1)}
                    </a>
                  ) : (
                    <span>
                      {String(
                        item.label || item.doc || item.snippet || item.rootCause || itemIndex + 1,
                      )}
                    </span>
                  )}
                  {item.description || item.snippet ? (
                    <div className={styles['chat-widget-list-desc']}>
                      {String(item.description || item.snippet)}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default ChatWidgetBlock;
