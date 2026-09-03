import { Report, Score } from '@/components';
import { Flex, Radio, Space } from 'antd';
import classNames from 'classnames';
import { useState } from 'react';
import styles from './style.module.scss';

type PartKey = 'list' | 'result' | 'table' | 'part';

/**
 * 报告组件：Report 子组件 List / Result / Table / Part 切换
 */
const InfoPageReportPartsDemo: React.FC = () => {
  const [part, setPart] = useState<PartKey>('result');

  const listReport = {
    list: [
      { label: '评估对象', content: '王明远' },
      { label: '所属部门', content: '技术研发中心 - 前端架构组' },
      { label: '职级职位', content: '资深前端工程师（P6+）' },
      { label: '评估周期', content: '2024年度' },
      { label: '评估人', content: '技术总监 - 陈思远' },
    ],
  };

  const resultReport = {
    total: { score: '88.5', label: '综合评分' },
    list: [
      {
        label: '代码质量',
        score: '95',
        content: '代码风格规范，注释清晰，组件拆分合理，单元测试覆盖率达到 85%。',
      },
      {
        label: '技术深度',
        score: '90',
        content: '深入理解 React 原理，熟悉 Hooks 与性能优化，有 SSR 实践经验。',
      },
      {
        label: '团队协作',
        score: '85',
        content: '积极参与代码评审，沟通顺畅，能准确理解需求并给出技术建议。',
      },
    ],
  };

  const tableReport = {
    columns: [
      { title: '评估维度', name: 'group', isSubTitle: true, span: 24 },
      { title: '评估项', name: 'item', span: 12 },
      { title: '得分', name: 'score', span: 4 },
      { title: '说明', name: 'description', span: 8 },
    ],
    group: [
      { name: 'group1', label: '核心技术能力' },
      { name: 'group2', label: '工作业绩' },
    ],
    list: [
      {
        group: 'group1',
        item: '前端框架',
        score: <Score value={5} total={5} />,
        description: 'React/Vue 熟练掌握',
      },
      {
        group: 'group1',
        item: 'TypeScript',
        score: <Score value={5} total={5} />,
        description: '类型定义规范完整',
      },
      {
        group: 'group1',
        item: '性能优化',
        score: <Score value={4} total={5} />,
        description: 'SSR 首屏优化显著',
      },
      {
        group: 'group2',
        item: '需求交付',
        score: <Score value={5} total={5} />,
        description: '按时交付率 98%',
      },
      {
        group: 'group2',
        item: '质量保障',
        score: <Score value={4} total={5} />,
        description: '线上故障率低',
      },
    ],
  };

  const partReport = {
    list: [
      {
        label: '核心优势',
        hasBgColor: true,
        content: '技术视野开阔，学习能力强，代码质量意识强，工作积极主动，多次解决关键技术难题。',
      },
      {
        label: '成长空间',
        content: '技术管理与跨部门商业思维有待提升；技术成果可视化展示可进一步加强。',
      },
    ],
  };

  return (
    <div
      className={classNames('info-page-report-parts-demo', styles['info-page-report-parts-demo'])}
    >
      <Flex vertical gap={16}>
        <Radio.Group
          optionType="button"
          value={part}
          onChange={(e) => setPart(e.target.value)}
          options={[
            { label: 'List', value: 'list' },
            { label: 'Result', value: 'result' },
            { label: 'Table', value: 'table' },
            { label: 'Part', value: 'part' },
          ]}
        />

        <Space direction="vertical" style={{ width: '100%' }}>
          {part === 'list' ? (
            <Report title="评估基本信息">
              <Report.List report={listReport} />
            </Report>
          ) : null}
          {part === 'result' ? (
            <Report title="综合结果">
              <Report.Result report={resultReport} />
            </Report>
          ) : null}
          {part === 'table' ? (
            <Report title="分项评分表">
              <Report.Table report={tableReport} />
            </Report>
          ) : null}
          {part === 'part' ? (
            <Report title="文字评语">
              <Report.Part report={partReport} />
            </Report>
          ) : null}
        </Space>
      </Flex>
    </div>
  );
};

export default InfoPageReportPartsDemo;
