import { DrawerContextHolder, ReactModal, useModal } from '@/components';
import { App, Button, Radio, Space, Typography } from 'antd';
import classNames from 'classnames';
import { useState } from 'react';
import styles from './style.module.scss';

const { Text, Paragraph } = Typography;

const fillLines = Array.from(
  { length: 20 },
  (_, i) => `填充行 ${i + 1} · 用于观察高度受限时 body 内滚动`,
);

/**
 * 高度受限 · 居中弹窗：height-limited 压低 body；声明式 / useModal
 */
const ReactModalHeightLimitedDemoInner: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'declarative' | 'imperative'>('declarative');
  const modal = useModal();

  const content = (
    <div className={styles.panel}>
      <p className={styles.panelTitle}>高度受限弹窗</p>
      <Paragraph type="secondary" style={{ marginBottom: 12 }}>
        通过 className 挂载组件内置高度受限样式，body 约压到 420px，长内容在 SimpleBar 内滚动。
      </Paragraph>
      {fillLines.map((text) => (
        <p key={text} className={styles.line}>
          {text}
        </p>
      ))}
    </div>
  );

  const overlayProps = {
    title: '高度受限 · 居中弹窗',
    className: 'kne-modal-height-limited',
    onClose: () => setOpen(false),
    onConfirm: () => setOpen(false),
    confirmText: '知道了',
  };

  return (
    <div
      className={classNames(
        'react-modal-height-limited-demo',
        styles['react-modal-height-limited-demo'],
      )}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Space align="center" wrap>
          <Text type="secondary">打开方式</Text>
          <Radio.Group
            value={mode}
            optionType="button"
            size="small"
            options={[
              { label: '声明式 Modal', value: 'declarative' },
              { label: 'useModal', value: 'imperative' },
            ]}
            onChange={(e) => setMode(e.target.value)}
          />
        </Space>
        <Button
          type="primary"
          onClick={() => {
            if (mode === 'imperative') {
              modal({
                ...overlayProps,
                children: content,
              });
              return;
            }
            setOpen(true);
          }}
        >
          打开高度受限弹窗
        </Button>
        <Text type="secondary">声明式与 useModal 对比居中与 body 滚动表现。</Text>
        {mode === 'declarative' ? (
          <ReactModal {...overlayProps} open={open}>
            {content}
          </ReactModal>
        ) : null}
      </Space>
    </div>
  );
};

const ReactModalHeightLimitedDemo: React.FC = () => (
  <App>
    <DrawerContextHolder />
    <ReactModalHeightLimitedDemoInner />
  </App>
);

export default ReactModalHeightLimitedDemo;
