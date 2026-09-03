import { Report } from '@/components';
import { Space } from 'antd';
import classNames from 'classnames';
import styles from './style.module.scss';

/**
 * 报告页面：Report + List / Result 组合
 */
const InfoPageReportPageDemo: React.FC = () => {
  return (
    <div className={classNames('info-page-report-page-demo', styles['info-page-report-page-demo'])}>
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <Report title="报告概述">
          <Report.List
            report={{
              list: [
                {
                  label: '目的',
                  content:
                    '本报告旨在评估招聘顾问使用 AI 工具进行候选人初次沟通的能力，特别是在理解候选人需求、传达职位信息以及建立初步信任关系的效果。',
                },
                { label: '测评对象', content: '姓名：张伟' },
                {
                  label: '测评工具',
                  content:
                    'AI 模拟系统：提供基于语音和文本的交互模拟环境。\n评分标准：沟通技巧、信息传达清晰度、候选人反馈、建立关系的能力。',
                },
                {
                  label: '任务目标',
                  content: (
                    <ul className={styles.list}>
                      <li>完整呈现初次沟通话术，展现关键动作和沟通顺序。</li>
                      <li>收集候选人信息：工作背景、技术能力与薪资要求。</li>
                      <li>挖掘需求并有效推荐职位优势。</li>
                      <li>建立信任关系，态度诚恳。</li>
                    </ul>
                  ),
                },
              ],
            }}
          />
        </Report>

        <Report title="测评结果">
          <Report.Result
            report={{
              total: { score: '86', label: '综合得分' },
              list: [
                {
                  label: '沟通技巧',
                  score: '90',
                  content: '表达清晰，能有效引导对话并确认候选人理解。',
                },
                {
                  label: '信息传达',
                  score: '85',
                  content: '职位亮点覆盖较全，部分福利细节可再补充。',
                },
                {
                  label: '关系建立',
                  score: '82',
                  content: '态度友好，共情回应及时，信任感建立较好。',
                },
              ],
            }}
          />
        </Report>
      </Space>
    </div>
  );
};

export default InfoPageReportPageDemo;
