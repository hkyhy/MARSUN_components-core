import type { KBDocument } from '@/components/AgentHub/types';
import ButtonGroup from '@kne/button-group';
import { CirclePlay, Square } from '@/components/Icons';
import { Empty, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';
import ParseStatusTag from '../ParseStatusTag';
import styles from './style.module.scss';
import classNames from 'classnames';

const { Text } = Typography;

const formatSize = (bytes?: number) => {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const formatTime = (ts?: string | number) => {
  if (!ts) return '-';
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

export interface DocumentTableProps {
  datasetId: string;
  data: KBDocument[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  onParse: (doc: KBDocument) => void;
  onStopParse: (doc: KBDocument) => void;
  onDelete: (doc: KBDocument) => void;
}

const DocumentTable: React.FC<DocumentTableProps> = ({
  data,
  loading,
  total,
  page,
  pageSize,
  onPageChange,
  onParse,
  onStopParse,
  onDelete,
}) => {
  const columns: ColumnsType<KBDocument> = [
    {
      title: '文档名称',
      dataIndex: 'name',
      ellipsis: true,
      render: (name: string) => (
        <Text className={classNames('document-table-root', styles['document-table-root'])} ellipsis={{ tooltip: name }}>
          {name}
        </Text>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 80,
      render: (type?: string) => <Text type="secondary">{type ?? '-'}</Text>,
    },
    {
      title: '大小',
      dataIndex: 'size',
      width: 100,
      render: (size?: number) => <Text type="secondary">{formatSize(size)}</Text>,
    },
    {
      title: '解析状态',
      dataIndex: 'run',
      width: 110,
      render: (run?: string) => <ParseStatusTag status={run} />,
    },
    {
      title: '分块数',
      dataIndex: 'chunk_count',
      width: 80,
      render: (count?: number) => <Text type="secondary">{count ?? 0}</Text>,
    },
    {
      title: '上传时间',
      dataIndex: 'create_time',
      width: 120,
      render: (t?: string | number) => <Text type="secondary">{formatTime(t)}</Text>,
    },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <ButtonGroup
          moreType="link"
          list={[
            {
              children: '解析',
              icon: <CirclePlay />,
              hidden: record.run === 'RUNNING',
              onClick: () => onParse(record),
            },
            {
              children: '停止',
              icon: <Square />,
              hidden: record.run !== 'RUNNING',
              onClick: () => onStopParse(record),
            },
            {
              children: '删除',
              danger: true,
              message: `确认删除文档「${record.name}」？`,
              isDelete: true,
              onClick: () => onDelete(record),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <Table<KBDocument>
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      scroll={{ x: 'max-content' }}
      locale={{ emptyText: <Empty description="暂无文档" /> }}
      pagination={{
        current: page,
        pageSize,
        total,
        showSizeChanger: true,
        showTotal: (t) => `共 ${t} 篇文档`,
        onChange: onPageChange,
      }}
    />
  );
};

export default DocumentTable;
