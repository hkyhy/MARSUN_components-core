import { SEMANTIC_COLORS, SemanticTag } from '@/components';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

/** 标签行数据 */
interface TagRowData {
  scenario: string;
  label: string;
  status: string;
  tagElement: React.ReactNode;
  code: string;
}

/** 审核状态场景 — 参考 antd 文档图片风格 */
const REVIEW_ROWS: TagRowData[] = [
  {
    scenario: '使用规则',
    label: '待XX，暂停',
    status: '示例',
    tagElement: <SemanticTag color={SEMANTIC_COLORS.INFO}>待提交</SemanticTag>,
    code: '<SemanticTag color={SEMANTIC_COLORS.INFO}>待提交</SemanticTag>',
  },
  {
    scenario: '使用规则',
    label: 'XX中，正在XX中',
    status: '示例',
    tagElement: <SemanticTag color={SEMANTIC_COLORS.WARNING}>审核中</SemanticTag>,
    code: '<SemanticTag color={SEMANTIC_COLORS.WARNING}>审核中</SemanticTag>',
  },
  {
    scenario: '使用规则',
    label: '通过，成功，完成',
    status: '示例',
    tagElement: <SemanticTag color={SEMANTIC_COLORS.SUCCESS}>标签内容</SemanticTag>,
    code: '<SemanticTag color={SEMANTIC_COLORS.SUCCESS}>标签内容</SemanticTag>',
  },
  {
    scenario: '使用规则',
    label: '不通过，失败，淘汰，缺席，拒绝',
    status: '示例',
    tagElement: <SemanticTag color={SEMANTIC_COLORS.DANGER}>已拒绝</SemanticTag>,
    code: '<SemanticTag color={SEMANTIC_COLORS.DANGER}>已拒绝</SemanticTag>',
  },
  {
    scenario: '使用规则',
    label: '取消，撤销，停止',
    status: '示例',
    tagElement: <SemanticTag color={SEMANTIC_COLORS.DEFAULT}>撤销审核</SemanticTag>,
    code: '<SemanticTag color={SEMANTIC_COLORS.DEFAULT}>撤销审核</SemanticTag>',
  },
  {
    scenario: '使用规则',
    label: '(暂时还未用到)',
    status: '示例',
    tagElement: <SemanticTag color={SEMANTIC_COLORS.OTHER}>标签内容</SemanticTag>,
    code: '<SemanticTag color={SEMANTIC_COLORS.INFO}>标签内容</SemanticTag>',
  },
];

/** 多标签组合场景 */
const MULTI_ROWS: TagRowData[] = [
  {
    scenario: '使用规则',
    label: '待XX，暂停',
    status: '示例',
    tagElement: (
      <>
        <SemanticTag color={SEMANTIC_COLORS.SUCCESS}>已推荐</SemanticTag>{' '}
        <SemanticTag color={SEMANTIC_COLORS.DEFAULT}>已退票</SemanticTag>
      </>
    ),
    code: '<SemanticTag color={SEMANTIC_COLORS.SUCCESS}>已推荐</SemanticTag> <SemanticTag color={SEMANTIC_COLORS.DEFAULT}>已退票</SemanticTag>',
  },
  {
    scenario: '使用规则',
    label: '已XX待XX',
    status: '示例',
    tagElement: (
      <>
        <SemanticTag color={SEMANTIC_COLORS.CYAN}>已开票待寄出</SemanticTag>{' '}
        <SemanticTag color={SEMANTIC_COLORS.WARNING}>已等待收款</SemanticTag>
      </>
    ),
    code: '<SemanticTag color={SEMANTIC_COLORS.CYAN}>已开票待寄出</SemanticTag> <SemanticTag color={SEMANTIC_COLORS.WARNING}>已等待收款</SemanticTag>',
  },
  {
    scenario: '使用规则',
    label: '已XX+词语：根据后面的词语语义进行判断',
    status: '示例',
    tagElement: (
      <>
        <SemanticTag color={SEMANTIC_COLORS.SUCCESS}>已成功</SemanticTag>{' '}
        <SemanticTag color={SEMANTIC_COLORS.DEFAULT}>已取消</SemanticTag>{' '}
        <SemanticTag color={SEMANTIC_COLORS.DANGER}>已失败</SemanticTag>{' '}
        <SemanticTag color={SEMANTIC_COLORS.WARNING}>已暂停</SemanticTag>
      </>
    ),
    code: '<SemanticTag color={SEMANTIC_COLORS.SUCCESS}>已成功</SemanticTag> <SemanticTag color={SEMANTIC_COLORS.DEFAULT}>已取消</SemanticTag> <SemanticTag color={SEMANTIC_COLORS.DANGER}>已失败</SemanticTag> <SemanticTag color={SEMANTIC_COLORS.WARNING}>已暂停</SemanticTag>',
  },
  {
    scenario: '使用规则',
    label: '完全根据语义语境判断',
    status: '示例',
    tagElement: (
      <>
        <SemanticTag color={SEMANTIC_COLORS.SUCCESS}>全部</SemanticTag>{' '}
        <SemanticTag color={SEMANTIC_COLORS.CYAN}>部分</SemanticTag>{' '}
        <SemanticTag color={SEMANTIC_COLORS.GOLD}>亮点</SemanticTag>{' '}
        <SemanticTag color={SEMANTIC_COLORS.DANGER}>风险点</SemanticTag>
      </>
    ),
    code: '<SemanticTag color={SEMANTIC_COLORS.SUCCESS}>全部</SemanticTag> <SemanticTag color={SEMANTIC_COLORS.CYAN}>部分</SemanticTag> <SemanticTag color={SEMANTIC_COLORS.GOLD}>亮点</SemanticTag> <SemanticTag color={SEMANTIC_COLORS.DANGER}>风险点</SemanticTag>',
  },
];

const columns: ColumnsType<TagRowData> = [
  { dataIndex: 'scenario', title: '', width: 100 },
  { dataIndex: 'label', title: '', width: 300, render: (text) => <span>{text}</span> },
  {
    dataIndex: 'status',
    title: '',
    width: 80,
    render: (text) => <span className={classNames('semantic-tag-review-demo-header', styles['semantic-tag-review-demo-header'])}>{text}</span>,
  },
  {
    dataIndex: 'tagElement',
    title: '',
    render: (_, record) => <div className={classNames('semantic-tag-review-demo-wrapper', styles['semantic-tag-review-demo-wrapper'])}>{record.tagElement}</div>,
  },
];

/** 审核状态场景：Table 展示 */
const SemanticTagReviewDemo: React.FC = () => (
  <div className={classNames('semantic-tag-review-demo-body', styles['semantic-tag-review-demo-body'])}>
    <div>
      <p className={classNames('semantic-tag-review-demo-footer', styles['semantic-tag-review-demo-footer'])}>使用场景：列表页 Table、简历详情页</p>
      <Table
        dataSource={REVIEW_ROWS}
        columns={columns}
        pagination={false}
        size="middle"
        bordered
        rowKey={(_, i) => String(i)}
      />
    </div>

    <div>
      <p className={classNames('semantic-tag-review-demo-footer', styles['semantic-tag-review-demo-footer'])}>个别特殊场景（需要单独询问 UI）：</p>
      <Table
        dataSource={MULTI_ROWS}
        columns={columns}
        pagination={false}
        size="middle"
        bordered
        rowKey={(_, i) => `multi-${i}`}
      />
    </div>
  </div>
);

export default SemanticTagReviewDemo;
