import { Flow } from '@/components';
import { Flex, Space, Tag } from 'antd';
import classNames from 'classnames';
import styles from './style.module.scss';

/**
 * 流程步骤：Flow 基础 / columns 自定义 / progressDot
 */
const InfoPageFlowDemo: React.FC = () => {
  return (
    <div className={classNames('info-page-flow-demo', styles['info-page-flow-demo'])}>
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <div>
          <h4 className={styles.sectionTitle}>请假审批流程</h4>
          <Flow
            current={1}
            dataSource={[
              {
                title: '提交申请',
                description: '2024-01-15 09:00 张三提交请假申请',
                status: 'finish',
              },
              { title: '部门审批', description: '等待李经理审批', status: 'process' },
              { title: '人事审核', description: '待人事部审核', status: 'wait' },
              { title: '流程结束', description: '审批流程完成', status: 'wait' },
            ]}
          />
        </div>

        <div>
          <h4 className={styles.sectionTitle}>订单处理流程</h4>
          <Flow
            current={2}
            dataSource={[
              { title: '创建订单', subTitle: '2024-01-15 09:30', status: 'finish' },
              { title: '支付成功', subTitle: '2024-01-15 10:15', status: 'finish' },
              { title: '仓库发货', subTitle: '2024-01-15 14:00', status: 'finish' },
              { title: '配送中', subTitle: '2024-01-16 08:30', status: 'process' },
              { title: '已签收', subTitle: '待确认', status: 'wait' },
            ]}
          />
        </div>

        <div>
          <h4 className={styles.sectionTitle}>项目审批（columns + actionList）</h4>
          <Flow
            dataSource={[
              {
                title: '需求评审',
                description: '通过',
                time: '2024-01-15 09:00',
                logs: [
                  {
                    name: '张产品',
                    action: '提交需求文档',
                    time: '2024-01-15 09:00',
                    content: '含功能列表与技术方案',
                  },
                  {
                    name: '李技术',
                    action: '技术评审通过',
                    time: '2024-01-15 11:00',
                    content: '方案可行',
                  },
                ],
              },
              {
                title: '开发实施',
                description: '进行中',
                time: '2024-01-16 09:00',
                logs: [
                  {
                    name: '王开发',
                    action: '开始开发',
                    time: '2024-01-16 09:00',
                    content: '前后端并行',
                  },
                ],
              },
              {
                title: '测试验收',
                description: '待处理',
                time: '2024-01-20 00:00',
                logs: [],
              },
            ]}
            columns={
              [
                { name: 'title' },
                {
                  name: 'description',
                  render: (value: string) => (
                    <Tag
                      color={
                        value === '通过' ? 'success' : value === '进行中' ? 'processing' : 'default'
                      }
                    >
                      {value}
                    </Tag>
                  ),
                },
                { type: 'subTitle', name: 'time', format: 'datetime' },
                {
                  type: 'actionList',
                  name: 'logs',
                  children: [
                    { name: 'name' },
                    { name: 'action' },
                    { type: 'options', name: 'time', format: 'datetime' },
                    { name: 'content' },
                  ],
                },
              ] as any
            }
          />
        </div>

        <div>
          <h4 className={styles.sectionTitle}>项目里程碑（progressDot）</h4>
          <Flex gap={16}>
            <div style={{ flex: 1 }}>
              <p className={styles.caption}>垂直时间轴</p>
              <Flow
                direction="vertical"
                progressDot
                dataSource={[
                  { title: '项目启动', description: '2024-01-01', status: 'finish' },
                  { title: '需求分析', description: '2024-01-15', status: 'finish' },
                  { title: '系统设计', description: '2024-02-01', status: 'process' },
                  { title: '开发实施', description: '2024-03-01', status: 'wait' },
                ]}
              />
            </div>
            <div style={{ flex: 1 }}>
              <p className={styles.caption}>水平进度条</p>
              <Flow
                direction="horizontal"
                progressDot
                dataSource={[
                  { title: '注册', description: '完成', status: 'finish' },
                  { title: '验证', description: '完成', status: 'finish' },
                  { title: '审核', description: '进行中', status: 'process' },
                  { title: '通过', description: '待办', status: 'wait' },
                ]}
              />
            </div>
          </Flex>
        </div>
      </Space>
    </div>
  );
};

export default InfoPageFlowDemo;
