import { Tags, SEMANTIC_COLORS } from '@/components';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';

type Row = { scene: string; tags: string[] };

const DATA: Row[] = [
  {
    scene: '未超限（短文案）',
    tags: ['系统管理员', '普通员工'],
  },
  {
    scene: '未超限但长文案（ellipsis + hover）',
    tags: ['系统管理员', 'S3 系统管理员 (配置落地)'],
  },
  {
    scene: '超出 showLength=+N',
    tags: ['系统管理员', '普通员工', '共享组审阅', '数据资产管理员'],
  },
];

const columns: ColumnsType<Row> = [
  { title: '场景', dataIndex: 'scene', width: 220 },
  {
    title: '角色（showLength=2）',
    key: 'tags',
    width: 240,
    render: (_, r) => <Tags tags={r.tags} showLength={2} color={SEMANTIC_COLORS.INFO} />,
  },
];

/** Tags：showLength 截断、长文案 ellipsis、hover 全量 */
const TagsShowLengthDemo: React.FC = () => (
  <Table<Row>
    rowKey="scene"
    size="small"
    pagination={false}
    bordered
    dataSource={DATA}
    columns={columns}
  />
);

export default TagsShowLengthDemo;
