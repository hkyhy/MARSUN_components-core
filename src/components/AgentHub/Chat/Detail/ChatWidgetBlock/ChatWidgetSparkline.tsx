import Sparkline from '@/components/Sparkline/Sparkline';
import type { ChatWidgetSeries } from '@/components/AgentHub/types';
import classNames from 'classnames';
import styles from './style.module.scss';

const DEFAULT_COLORS = ['#2563eb', '#16a34a', '#ea580c', '#9333ea', '#dc2626'];

type ChatWidgetSparklineProps = {
  series: ChatWidgetSeries[];
  className?: string;
};

const ChatWidgetSparkline: React.FC<ChatWidgetSparklineProps> = ({ series, className }) => {
  const axisLabels = series.find((item) => item.x?.length)?.x;

  return (
    <div className={classNames(styles['chat-widget-sparklines'], className)}>
      {series.map((item, index) => {
        const values = (item.y || []).map((v) => Number(v));
        const color = item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
        const latest = values.length ? values[values.length - 1] : null;

        return (
          <div
            key={`${item.name || 'series'}-${index}`}
            className={styles['chat-widget-sparkline-row']}
          >
            <span className={styles['chat-widget-sparkline-label']} title={item.name}>
              <span
                className={styles['chat-widget-sparkline-dot']}
                style={{ backgroundColor: color }}
              />
              {item.name || `系列 ${index + 1}`}
            </span>
            <Sparkline
              data={values}
              width={108}
              height={24}
              color={color}
              className={styles['chat-widget-sparkline-chart']}
            />
            <span className={styles['chat-widget-sparkline-value']}>
              {latest != null && !Number.isNaN(latest) ? latest : '—'}
            </span>
          </div>
        );
      })}
      {axisLabels && axisLabels.length > 1 ? (
        <div className={styles['chat-widget-sparkline-footer']}>
          {axisLabels[0]} → {axisLabels[axisLabels.length - 1]}
        </div>
      ) : null}
    </div>
  );
};

export default ChatWidgetSparkline;
