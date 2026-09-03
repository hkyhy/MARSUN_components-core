import { DrawerContextHolder, useDrawer, useModal } from '@/components';
import { App, Button, Descriptions, Radio, Space, Tag, Typography, message } from 'antd';
import classNames from 'classnames';
import { useState } from 'react';
import styles from './style.module.scss';

const { Text, Paragraph } = Typography;

/**
 * 命令式打开：useModal / useDrawer
 */
const ReactModalImperativeDemoInner: React.FC = () => {
  const modal = useModal();
  const drawer = useDrawer();
  const [mode, setMode] = useState<'modal' | 'drawer'>('modal');
  const isDrawer = mode === 'drawer';

  const openDetail = () => {
    const api = isDrawer ? drawer : modal;
    api({
      title: isDrawer ? '候选人快览（侧滑）' : '候选人快览',
      size: 'small',
      confirmText: '加入待评估',
      children: ({ close }: { close: () => void }) => (
        <div>
          <Descriptions column={1} size="small" bordered style={{ marginBottom: 12 }}>
            <Descriptions.Item label="姓名">李雨桐</Descriptions.Item>
            <Descriptions.Item label="岗位">前端工程师 · 4 年</Descriptions.Item>
            <Descriptions.Item label="来源">内推 · 张三</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color="processing">简历通过</Tag>
            </Descriptions.Item>
          </Descriptions>
          <Paragraph type="secondary" style={{ marginBottom: 12 }}>
            命令式 {isDrawer ? 'Drawer' : 'Modal'} 适用于列表「快速查看」；children 为函数时可调用{' '}
            <Text code>close()</Text> 主动关闭。
          </Paragraph>
          <Button size="small" onClick={() => close()}>
            关闭
          </Button>
        </div>
      ),
      onConfirm: () => {
        message.success('已加入待评估队列');
      },
    });
  };

  return (
    <div
      className={classNames('react-modal-imperative-demo', styles['react-modal-imperative-demo'])}
    >
      <Space direction="vertical">
        <Space align="center" wrap>
          <Text type="secondary">打开方式</Text>
          <Radio.Group
            value={mode}
            optionType="button"
            size="small"
            options={[
              { label: 'Modal', value: 'modal' },
              { label: 'Drawer', value: 'drawer' },
            ]}
            onChange={(e) => setMode(e.target.value)}
          />
        </Space>
        <Button type="primary" onClick={openDetail}>
          从列表打开候选人快览
        </Button>
        <Text type="secondary">Drawer 模式需挂载 DrawerContextHolder。</Text>
      </Space>
    </div>
  );
};

const ReactModalImperativeDemo: React.FC = () => (
  <App>
    <DrawerContextHolder />
    <ReactModalImperativeDemoInner />
  </App>
);

export default ReactModalImperativeDemo;
