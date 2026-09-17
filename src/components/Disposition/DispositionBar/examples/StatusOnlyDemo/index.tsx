import { DispositionBar } from '@/components';
import React from 'react';

/** 仅状态区：无 actions（如已关闭） */
const StatusOnlyDemo: React.FC = () => <DispositionBar statusBadge="已关闭" />;

export default StatusOnlyDemo;
