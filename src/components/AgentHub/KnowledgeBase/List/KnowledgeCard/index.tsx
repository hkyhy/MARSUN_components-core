import { SEMANTIC_COLORS, SemanticTag } from '@/components';
import type { Dataset } from '@/components/AgentHub/types';
import { LayoutGrid } from '@/components/Icons';
import ButtonGroup from '@kne/button-group';
import { Progress, Tooltip, Typography } from 'antd';
import React from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

const { Text, Paragraph } = Typography;

export interface KnowledgeCardProps {
  dataset: Dataset;
  onView: (dataset: Dataset) => void;
  onUpload: (dataset: Dataset) => void;
  onEdit: (dataset: Dataset) => void;
  onDelete: (dataset: Dataset) => void;
}

const KnowledgeCard: React.FC<KnowledgeCardProps> = ({
  dataset,
  onView,
  onUpload,
  onEdit,
  onDelete,
}) => {
  const docCount = dataset.document_count ?? 0;
  const chunkCount = dataset.chunk_count ?? 0;
  const tokenNum = dataset.token_num ?? 0;
  const modelShort = dataset.embedding_model?.split('/').pop()?.split('___')[0] ?? '';

  const totalDocs =
    (dataset.done_count ?? 0) +
    (dataset.running_count ?? 0) +
    (dataset.fail_count ?? 0) +
    (dataset.unstart_count ?? 0);
  const doneCount = dataset.done_count ?? 0;
  const parseProgress = totalDocs > 0 ? Math.round((doneCount / totalDocs) * 100) : null;

  return (
    <div
      className={classNames('knowledge-card-wrapper', styles['knowledge-card-wrapper'])}
      onClick={() => onView(dataset)}
    >
      {/* Top primary accent strip */}
      <div className={classNames('bg-primary', classNames('knowledge-card-inner', styles['knowledge-card-inner']))} />

      {/* Card body */}
      <div className={classNames('knowledge-card-header', styles['knowledge-card-header'])}>
        {/* Header: icon + name + model tag */}
        <div className={classNames('knowledge-card-body', styles['knowledge-card-body'])}>
          <div className={classNames('knowledge-card-footer', styles['knowledge-card-footer'])}>
            <LayoutGrid className={classNames('text-primary', classNames('knowledge-card-row', styles['knowledge-card-row']))} />
          </div>
          <div className={classNames('knowledge-card-col', styles['knowledge-card-col'])}>
            <Tooltip title={dataset.name}>
              <Text
                strong
                className={classNames('knowledge-card-wrap', styles['knowledge-card-wrap'])}
                style={{ lineHeight: '1.4' }}
              >
                {dataset.name}
              </Text>
            </Tooltip>
            {modelShort && (
              <SemanticTag color={SEMANTIC_COLORS.INFO} className={classNames('knowledge-card-panel', styles['knowledge-card-panel'])}>
                {modelShort}
              </SemanticTag>
            )}
          </div>
        </div>

        {/* Description */}
        <Paragraph type="secondary" className={classNames('knowledge-card-card', styles['knowledge-card-card'])} ellipsis={{ rows: 2 }}>
          {dataset.description || '暂无描述'}
        </Paragraph>

        {/* Stats pills */}
        <div className={classNames('knowledge-card-item', styles['knowledge-card-item'])}>
          <div className={classNames('knowledge-card-link', styles['knowledge-card-link'])}>
            <Text strong className={classNames('knowledge-card-label', styles['knowledge-card-label'])}>
              {docCount}
            </Text>
            <Text type="secondary" className={classNames('knowledge-card-value', styles['knowledge-card-value'])}>
              文档
            </Text>
          </div>
          <div className={classNames('knowledge-card-link', styles['knowledge-card-link'])}>
            <Text strong className={classNames('knowledge-card-label', styles['knowledge-card-label'])}>
              {chunkCount}
            </Text>
            <Text type="secondary" className={classNames('knowledge-card-value', styles['knowledge-card-value'])}>
              分块
            </Text>
          </div>
          <div className={classNames('knowledge-card-link', styles['knowledge-card-link'])}>
            <Text strong className={classNames('knowledge-card-label', styles['knowledge-card-label'])}>
              {tokenNum > 1000 ? `${(tokenNum / 1000).toFixed(0)}k` : tokenNum}
            </Text>
            <Text type="secondary" className={classNames('knowledge-card-value', styles['knowledge-card-value'])}>
              Tokens
            </Text>
          </div>
        </div>

        {/* Parse progress */}
        {parseProgress !== null && (
          <div className={classNames('knowledge-card-meta', styles['knowledge-card-meta'])}>
            <div className={classNames('knowledge-card-icon', styles['knowledge-card-icon'])}>
              <span>解析进度</span>
              <span>
                {doneCount}/{totalDocs}
              </span>
            </div>
            <Progress
              percent={parseProgress}
              size="small"
              status={
                dataset.fail_count && dataset.fail_count > 0
                  ? 'exception'
                  : parseProgress === 100
                    ? 'success'
                    : 'active'
              }
              strokeColor={parseProgress === 100 ? undefined : 'var(--primary-color)'}
            />
          </div>
        )}
      </div>

      {/* Action footer */}
      <div
        className={classNames('knowledge-card-title', styles['knowledge-card-title'])}
        onClick={(e) => e.stopPropagation()}
      >
        <ButtonGroup
          moreType="link"
          showLength={1}
          list={[
            {
              children: '查看文档',
              onClick: () => onView(dataset),
              type: 'link',
            },
            {
              children: '上传文档',
              onClick: () => onUpload(dataset),
            },
            {
              children: '编辑',
              onClick: () => onEdit(dataset),
            },
            {
              children: '删除',
              danger: true,
              message: `确认删除知识库「${dataset.name}」？删除后无法恢复。`,
              isDelete: true,
              onClick: () => onDelete(dataset),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default KnowledgeCard;
