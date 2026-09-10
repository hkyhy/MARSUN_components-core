import { StatCardList, type StatItem } from '@/components';
import React from 'react';

const ITEMS: StatItem[] = [
  { title: '寿命进度', value: 72.5, precision: 1, suffix: '%', color: '#cf1322', tone: 'rose' },
  { title: '供应商', value: 'S-001', color: '#1677ff', tone: 'blue' },
  { title: '早损率', value: 3.2, precision: 1, suffix: '%', color: '#0d9f8a', tone: 'mint' },
  { title: '最近更换', value: '2026-08-01', color: '#722ed1', tone: 'lilac' },
];

/** 马卡龙 tone：详情 KPI 四列均分，勿拆 flex 旁路 */
const MacaronToneDemo: React.FC = () => (
  <StatCardList items={ITEMS} inline fontSize={20} gutter={[12, 8]} />
);

export default MacaronToneDemo;
