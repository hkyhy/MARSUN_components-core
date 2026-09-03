import { DrawerContextHolder, ReactDrawer, ReactModal } from '@/components';
import { App, Button, Descriptions, Radio, Space, Switch, Typography } from 'antd';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import styles from './style.module.scss';

const { Text } = Typography;

const readCssVar = (el: Element | null, name: string) => {
  if (!el) return '-';
  return getComputedStyle(el).getPropertyValue(name).trim() || '-';
};

/**
 * 高度 CSS 变量：色块绑定 content-height，探针显示变量
 */
const ReactModalCssVarsDemoInner: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [customVars, setCustomVars] = useState(false);
  const [mode, setMode] = useState<'modal' | 'drawer'>('modal');
  const [metrics, setMetrics] = useState<Record<string, string> | null>(null);
  const isDrawer = mode === 'drawer';

  useEffect(() => {
    setOpen(false);
  }, [mode]);

  useEffect(() => {
    if (!open) {
      setMetrics(null);
      return undefined;
    }
    const timer = setTimeout(() => {
      const testId = isDrawer ? 'react-drawer' : 'react-modal';
      const outer = document.querySelector(`[data-testid="${testId}"]`);
      const prefix = isDrawer ? '--kne-drawer' : '--kne-modal';
      const contentVar = `${prefix}-content-height`;
      const bodyVar = `${prefix}-body-height`;
      const inner = outer?.querySelector(isDrawer ? '.drawer-body-inner' : '.modal-body-inner');
      setMetrics({
        contentHeight: readCssVar(outer, contentVar),
        bodyHeight: readCssVar(outer, bodyVar),
        clientHeight: inner ? `${(inner as HTMLElement).clientHeight}px` : '-',
      });
    }, 80);
    return () => clearTimeout(timer);
  }, [open, customVars, isDrawer]);

  const Overlay = isDrawer ? ReactDrawer : ReactModal;
  const contentHeightVar = isDrawer ? '--kne-drawer-content-height' : '--kne-modal-content-height';

  return (
    <div className={classNames('react-modal-css-vars-demo', styles['react-modal-css-vars-demo'])}>
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
        <Space align="center">
          <Text type="secondary">自定义高度变量</Text>
          <Switch checked={customVars} onChange={setCustomVars} />
        </Space>
        <Button type="primary" onClick={() => setOpen(true)}>
          打开高度探针
        </Button>
        <Overlay
          title="高度 CSS 变量"
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
          style={
            customVars
              ? ({
                  [isDrawer ? '--kne-drawer-viewport-gutter' : '--kne-modal-viewport-gutter']:
                    '200px',
                } as React.CSSProperties)
              : undefined
          }
        >
          <div
            className={styles.probeBlock}
            style={{ height: `var(${contentHeightVar})`, minHeight: 120 }}
          >
            <Text>色块高度 = {contentHeightVar}</Text>
          </div>
          {metrics ? (
            <Descriptions size="small" column={1} style={{ marginTop: 12 }} bordered>
              <Descriptions.Item label="content-height">{metrics.contentHeight}</Descriptions.Item>
              <Descriptions.Item label="body-height">{metrics.bodyHeight}</Descriptions.Item>
              <Descriptions.Item label="inner clientHeight">
                {metrics.clientHeight}
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Text type="secondary">打开后读取 CSS 变量…</Text>
          )}
        </Overlay>
      </Space>
    </div>
  );
};

const ReactModalCssVarsDemo: React.FC = () => (
  <App>
    <DrawerContextHolder />
    <ReactModalCssVarsDemoInner />
  </App>
);

export default ReactModalCssVarsDemo;
