import { StatCardList, type StatItem } from '@/components/Stat';
import { Alert, Button, Typography } from 'antd';
import React, { useMemo } from 'react';
import styles from './style.module.scss';
import type { AuditDayStats } from './types';

export type AuditDayStatsBarProps = {
  stats: AuditDayStats | null;
  loading?: boolean;
  error?: string | null;
  /** 导出按钮 */
  onExport?: () => void;
  exportLoading?: boolean;
  exportDisabled?: boolean;
  className?: string;
};

/** 列表顶栏日汇总 + 可选导出 */
export const AuditDayStatsBar: React.FC<AuditDayStatsBarProps> = ({
  stats,
  loading,
  error,
  onExport,
  exportLoading,
  exportDisabled,
  className,
}) => {
  const items = useMemo((): StatItem[] => {
    if (!stats) return [];
    const success = stats.byStatus?.success ?? 0;
    const fail = (stats.byStatus?.fail ?? 0) + (stats.byStatus?.error ?? 0);
    return [
      { title: '当日事件', value: stats.total, tone: 'blue', color: '#1677ff' },
      { title: '成功', value: success, tone: 'mint', color: '#0d9f8a' },
      { title: '失败', value: fail, tone: 'rose', color: '#cf1322' },
      {
        title: '平均耗时',
        value: stats.avgDurationMs ?? '—',
        suffix: stats.avgDurationMs != null ? 'ms' : undefined,
        tone: 'lilac',
        color: '#722ed1',
      },
      {
        title: '最大耗时',
        value: stats.maxDurationMs ?? '—',
        suffix: stats.maxDurationMs != null ? 'ms' : undefined,
        tone: 'peach',
        color: '#d46b08',
      },
    ];
  }, [stats]);

  if (error) {
    return (
      <div className={className}>
        <Alert type="error" showIcon message={error} />
      </div>
    );
  }
  if (loading && !stats) {
    return (
      <Typography.Text type="secondary" className={className}>
        汇总加载中…
      </Typography.Text>
    );
  }
  if (!stats) {
    return null;
  }

  return (
    <div className={`${styles.statsBar} ${className || ''}`}>
      <div className={styles.statsBarCards}>
        <StatCardList items={items} inline fontSize={18} gutter={[12, 8]} />
      </div>
      {onExport ? (
        <Button
          type="default"
          loading={exportLoading}
          disabled={exportDisabled || stats.total === 0}
          onClick={onExport}
        >
          导出 CSV
        </Button>
      ) : null}
    </div>
  );
};

export default AuditDayStatsBar;
