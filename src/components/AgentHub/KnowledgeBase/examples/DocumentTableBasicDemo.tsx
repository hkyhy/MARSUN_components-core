import DocumentTable from '@/components/AgentHub/KnowledgeBase/Detail/DocumentTable';
import { message } from 'antd';
import React, { useState } from 'react';
import { mockDocuments } from './mock';

const DocumentTableBasicDemo: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  return (
    <DocumentTable
      datasetId="kb-1"
      data={mockDocuments}
      loading={false}
      total={mockDocuments.length}
      page={page}
      pageSize={pageSize}
      onPageChange={(p, ps) => {
        setPage(p);
        setPageSize(ps);
      }}
      onParse={(doc) => message.info(`开始解析：${doc.name}`)}
      onStopParse={(doc) => message.warning(`停止解析：${doc.name}`)}
      onDelete={(doc) => message.success(`已删除：${doc.name}`)}
    />
  );
};

export default DocumentTableBasicDemo;
