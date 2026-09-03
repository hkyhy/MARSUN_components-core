import { DrawerContextHolder, ReactDrawer, ReactModal } from '@/components';
import { App, Button, Radio, Space, Typography, message } from 'antd';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import styles from './style.module.scss';

const { Text, Paragraph } = Typography;

/**
 * 基础弹层：Modal / Drawer 切换，受控打开与异步 onConfirm
 */
const ReactModalBasicDemoInner: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'modal' | 'drawer'>('modal');
  const isDrawer = mode === 'drawer';

  useEffect(() => {
    setOpen(false);
  }, [mode]);

  const overlayProps = {
    title: '保存评估备注',
    open,
    onClose: () => setOpen(false),
    onConfirm: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      message.success('备注已保存至候选人档案');
      setOpen(false);
    },
    confirmText: '保存',
  };

  const content = (
    <>
      <Paragraph style={{ marginBottom: 8 }}>
        将把当前页面的筛选条件与评估摘要一并写入 <Text strong>陈思远</Text> 的档案备注。
      </Paragraph>
      <Paragraph type="secondary" style={{ marginBottom: 0 }}>
        保存后可在「候选人详情 → 操作记录」中查看历史版本。
      </Paragraph>
    </>
  );

  return (
    <div className={classNames('react-modal-basic-demo', styles['react-modal-basic-demo'])}>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
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
        <Button type="primary" onClick={() => setOpen(true)}>
          保存评估备注
        </Button>
        <Text type="secondary">最简受控弹层：切换 Modal / Drawer；异步 onConfirm 带 loading。</Text>
        {isDrawer ? (
          <ReactDrawer {...overlayProps} size="default">
            {content}
          </ReactDrawer>
        ) : (
          <ReactModal {...overlayProps}>{content}</ReactModal>
        )}
      </Space>
    </div>
  );
};

const ReactModalBasicDemo: React.FC = () => (
  <App>
    <DrawerContextHolder />
    <ReactModalBasicDemoInner />
  </App>
);

export default ReactModalBasicDemo;
