import { InfoPage } from '@/components';
import { Button, Flex, Space, Tag } from 'antd';
import classNames from 'classnames';
import styles from './style.module.scss';

/**
 * 基础布局：InfoPage 容器 + Part 区块 + Collapse
 */
const InfoPageBasicDemo: React.FC = () => {
  return (
    <div className={classNames('info-page-basic-demo', styles['info-page-basic-demo'])}>
      <Flex vertical gap={24}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <InfoPage.Part title="个人信息" subtitle="展示基础 Part 用法">
            <Space direction="vertical" size={8}>
              <div>
                <strong>姓名：</strong>张三
              </div>
              <div>
                <strong>性别：</strong>男
              </div>
              <div>
                <strong>年龄：</strong>28岁
              </div>
            </Space>
          </InfoPage.Part>

          <InfoPage.Part
            title="联系方式"
            subtitle="展示标题和额外操作区"
            extra={
              <Button type="primary" size="small">
                编辑
              </Button>
            }
          >
            <Space direction="vertical" size={8}>
              <div>
                <strong>手机：</strong>138-0013-8000
              </div>
              <div>
                <strong>邮箱：</strong>zhangsan@example.com
              </div>
              <div>
                <strong>地址：</strong>深圳市南山区科技园
              </div>
            </Space>
          </InfoPage.Part>

          <InfoPage.Part title="工作经历">
            <p>以下展示了 Part 的嵌套使用：</p>
            <InfoPage.Part subtitle="现任职位" style={{ background: '#f5f5f5', padding: 12 }}>
              <Space direction="vertical" size={8}>
                <div>
                  <strong>公司：</strong>腾讯科技
                </div>
                <div>
                  <strong>职位：</strong>高级前端工程师
                </div>
                <div>
                  <strong>入职时间：</strong>2020年3月
                </div>
              </Space>
            </InfoPage.Part>
          </InfoPage.Part>

          <InfoPage.Part title="项目经验" bordered>
            <Space direction="vertical" size={8}>
              <div>
                <strong>项目名称：</strong>企业级管理系统
              </div>
              <div>
                <strong>技术栈：</strong>React、TypeScript、Ant Design
              </div>
              <div>
                <strong>职责：</strong>负责前端架构设计与核心功能开发
              </div>
            </Space>
          </InfoPage.Part>

          <InfoPage.Collapse
            items={[
              {
                key: '1',
                label: '教育背景',
                children: (
                  <Space direction="vertical" size={8}>
                    <div>
                      <strong>学校：</strong>深圳大学
                    </div>
                    <div>
                      <strong>专业：</strong>计算机科学与技术
                    </div>
                    <div>
                      <strong>学历：</strong>本科
                    </div>
                  </Space>
                ),
              },
              {
                key: '2',
                label: '技能证书',
                children: (
                  <Space wrap>
                    <Tag color="blue">PMP项目管理</Tag>
                    <Tag color="green">阿里云ACP认证</Tag>
                    <Tag color="purple">AWS解决方案架构师</Tag>
                  </Space>
                ),
              },
            ]}
          />

          <InfoPage.Part>
            <div style={{ color: '#666', padding: 12, background: '#fafafa' }}>
              <strong>备注：</strong>以上信息仅供示例展示，不代表真实数据
            </div>
          </InfoPage.Part>
        </Space>
      </Flex>
    </div>
  );
};

export default InfoPageBasicDemo;
