import KBFilterBar from '@/components/AgentHub/KnowledgeBase/List/FilterBar';
import React, { useState } from 'react';

const KnowledgeBaseFilterDemo: React.FC = () => {
  const [keyword, setKeyword] = useState('企业制度');

  return <KBFilterBar keyword={keyword} onKeywordChange={setKeyword} />;
};

export default KnowledgeBaseFilterDemo;
