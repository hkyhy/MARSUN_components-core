import ParseStatusTag from '@/components/AgentHub/KnowledgeBase/Detail/ParseStatusTag';
import { Space } from 'antd';
import React from 'react';

const ParseStatusTagBasicDemo: React.FC = () => (
  <Space wrap>
    <ParseStatusTag status="UNSTART" />
    <ParseStatusTag status="RUNNING" />
    <ParseStatusTag status="DONE" />
    <ParseStatusTag status="FAIL" />
    <ParseStatusTag status="CANCEL" />
  </Space>
);

export default ParseStatusTagBasicDemo;
