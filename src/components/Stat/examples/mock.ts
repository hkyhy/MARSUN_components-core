import type { StatItem } from '@/components';

/** 统计卡片 mock 数据 */
export const MOCK_STAT_ITEMS: StatItem[] = [
  { title: '总文件数', value: 128, color: '#1677ff' },
  { title: '待审核', value: 12, color: '#fa8c16' },
  { title: '已通过', value: 98, color: '#52c41a' },
  { title: '已驳回', value: 5, color: '#f5222d' },
];

/** 大数值 mock 数据 */
export const MOCK_LARGE_STAT_ITEMS: StatItem[] = [
  { title: '总存储', value: 1024, color: '#722ed1', suffix: 'GB' },
  { title: '本月上传', value: 356, color: '#13c2c2', suffix: '份' },
  { title: '活跃用户', value: 48, color: '#eb2f96', suffix: '人' },
  { title: '平均评分', value: 4.7, color: '#faad14', suffix: '分' },
];
