import {
  listFixtureEvents,
  resetMsgCenterFixture,
} from '@/components/Tools/MessageCenter/doc/msgCenter.fixture';
import { Table } from 'antd';
import React, { useMemo } from 'react';

resetMsgCenterFixture();

/** 1. 事件目录 */
const EventCatalogDemo: React.FC = () => {
  const data = useMemo(() => listFixtureEvents(), []);
  return (
    <Table
      rowKey="eventKey"
      size="small"
      pagination={false}
      dataSource={data}
      columns={[
        { title: 'eventKey', dataIndex: 'eventKey' },
        { title: '名称', dataIndex: 'label' },
        { title: '默认 href', dataIndex: 'defaultHref' },
      ]}
    />
  );
};

export default EventCatalogDemo;
