import {
  listFixtureCatalog,
  resetMsgCenterFixture,
} from '@/components/Tools/MessageCenter/doc/msgCenter.fixture';
import { Space, Table, Typography } from 'antd';
import React, { useMemo } from 'react';

resetMsgCenterFixture();

/** 1. 事件目录 + catalog 变量 SSOT */
const EventCatalogDemo: React.FC = () => {
  const catalog = useMemo(() => listFixtureCatalog(), []);
  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
      <Table
        rowKey="eventKey"
        size="small"
        pagination={false}
        dataSource={catalog.events}
        columns={[
          { title: 'eventKey', dataIndex: 'eventKey' },
          { title: '名称', dataIndex: 'label' },
          { title: '默认 href', dataIndex: 'defaultHref' },
        ]}
      />
      <div>
        <Typography.Text type="secondary">variables（catalog SSOT）</Typography.Text>
        <Table
          rowKey="key"
          size="small"
          pagination={false}
          style={{ marginTop: 8 }}
          dataSource={catalog.variables}
          columns={[
            { title: 'key', dataIndex: 'key' },
            { title: 'label', dataIndex: 'label' },
            { title: 'type', dataIndex: 'type' },
          ]}
        />
      </div>
    </Space>
  );
};

export default EventCatalogDemo;
