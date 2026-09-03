import { DrawerContextHolder, ReactDrawer, ReactModal } from '@/components';
import { App, Button, Radio, Space, Tag, Typography, message } from 'antd';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import styles from './style.module.scss';

const { Text, Title, Paragraph } = Typography;

/**
 * footerButtons 与尺寸：size / footerButtons / 左侧 footer / noPadding
 */
const ReactModalFooterSizeDemoInner: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<'small' | 'default' | 'large'>('default');
  const [noPadding, setNoPadding] = useState(false);
  const [mode, setMode] = useState<'modal' | 'drawer'>('modal');
  const isDrawer = mode === 'drawer';

  useEffect(() => {
    setOpen(false);
  }, [mode]);

  const overlayProps = {
    title: '确认发布岗位',
    size,
    noPadding,
    open,
    onClose: () => setOpen(false),
    footer: <Text type="secondary">发布后将同步至招聘官网与内推渠道</Text>,
    footerButtons: [
      {
        children: '存草稿',
        onClick: () => message.info('已保存草稿'),
      },
      {
        children: '预览',
        display: () => size !== 'small',
        onClick: () => message.info('打开预览页'),
      },
      {
        type: 'primary',
        children: '立即发布',
        onClick: async () => {
          await new Promise((resolve) => setTimeout(resolve, 600));
          message.success('岗位已发布');
          setOpen(false);
        },
      },
    ],
  };

  const content = (
    <div className={styles.jobPreview}>
      <Title level={5} style={{ margin: 0 }}>
        高级前端工程师
      </Title>
      <Space size={8} style={{ marginTop: 8 }}>
        <Tag color="blue">上海</Tag>
        <Tag>25K–40K · 15 薪</Tag>
        <Tag color="green">急招</Tag>
      </Space>
      <Paragraph style={{ marginTop: 12, marginBottom: 0 }}>
        负责招聘中台、候选人评估等 B 端产品的前端交付。
        {noPadding ? ' noPadding=true：预览贴齐内容区边缘。' : ' noPadding=false：保留默认内边距。'}
      </Paragraph>
    </div>
  );

  return (
    <div
      className={classNames('react-modal-footer-size-demo', styles['react-modal-footer-size-demo'])}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
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
        <Radio.Group
          value={size}
          optionType="button"
          options={[
            { label: '小号', value: 'small' },
            { label: '默认', value: 'default' },
            { label: '大号', value: 'large' },
          ]}
          onChange={(e) => setSize(e.target.value)}
        />
        <Space wrap>
          <Button type="primary" onClick={() => setOpen(true)}>
            发布岗位确认
          </Button>
          <Button type={noPadding ? 'primary' : 'default'} onClick={() => setNoPadding((v) => !v)}>
            noPadding={String(noPadding)}
          </Button>
        </Space>
        {isDrawer ? (
          <ReactDrawer {...overlayProps}>{content}</ReactDrawer>
        ) : (
          <ReactModal {...overlayProps}>{content}</ReactModal>
        )}
      </Space>
    </div>
  );
};

const ReactModalFooterSizeDemo: React.FC = () => (
  <App>
    <DrawerContextHolder />
    <ReactModalFooterSizeDemoInner />
  </App>
);

export default ReactModalFooterSizeDemo;
