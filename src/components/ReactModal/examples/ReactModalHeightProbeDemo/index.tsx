import { DrawerContextHolder, ReactDrawer, ReactModal } from '@/components';
import { App, Button, Checkbox, Descriptions, Radio, Space, Typography } from 'antd';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import styles from './style.module.scss';

const { Text } = Typography;

type ChromeOpts = {
  hasTitle: boolean;
  hasFooter: boolean;
  noPadding: boolean;
  bodyScroll: boolean;
};

/**
 * title / footer / noPadding 高度探针：组合实测高度变量
 */
const ReactModalHeightProbeDemoInner: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'modal' | 'drawer'>('modal');
  const [opts, setOpts] = useState<ChromeOpts>({
    hasTitle: true,
    hasFooter: true,
    noPadding: false,
    bodyScroll: true,
  });
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
      if (!outer) return;
      const prefix = isDrawer ? '--kne-drawer' : '--kne-modal';
      const read = (name: string) => getComputedStyle(outer).getPropertyValue(name).trim() || '-';
      setMetrics({
        titleHeight: read(`${prefix}-title-height`),
        footerHeight: read(`${prefix}-footer-height`),
        bodyHeight: read(`${prefix}-body-height`),
        contentHeight: read(`${prefix}-content-height`),
        paddingVertical: read(`${prefix}-body-padding-vertical`),
      });
    }, 80);
    return () => clearTimeout(timer);
  }, [open, opts, isDrawer]);

  const Overlay = isDrawer ? ReactDrawer : ReactModal;

  return (
    <div
      className={classNames(
        'react-modal-height-probe-demo',
        styles['react-modal-height-probe-demo'],
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
              { label: 'Modal', value: 'modal' },
              { label: 'Drawer', value: 'drawer' },
            ]}
            onChange={(e) => setMode(e.target.value)}
          />
        </Space>
        <Checkbox.Group
          value={Object.entries(opts)
            .filter(([, v]) => v)
            .map(([k]) => k)}
          onChange={(keys) => {
            const set = new Set(keys as string[]);
            setOpts({
              hasTitle: set.has('hasTitle'),
              hasFooter: set.has('hasFooter'),
              noPadding: set.has('noPadding'),
              bodyScroll: set.has('bodyScroll'),
            });
          }}
          options={[
            { label: 'title', value: 'hasTitle' },
            { label: 'footer', value: 'hasFooter' },
            { label: 'noPadding', value: 'noPadding' },
            { label: 'bodyScroll', value: 'bodyScroll' },
          ]}
        />
        <Button type="primary" onClick={() => setOpen(true)}>
          打开高度探针
        </Button>
        <Overlay
          title={opts.hasTitle ? '高度探针' : undefined}
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={opts.hasFooter ? () => setOpen(false) : undefined}
          footer={opts.hasFooter ? undefined : null}
          noPadding={opts.noPadding}
          bodyScroll={opts.bodyScroll}
        >
          <div className={styles.fill}>
            <Text>调整 title / footer / noPadding / bodyScroll，观察高度变量变化。</Text>
            {metrics ? (
              <Descriptions size="small" column={1} bordered style={{ marginTop: 12 }}>
                {Object.entries(metrics).map(([k, v]) => (
                  <Descriptions.Item key={k} label={k}>
                    {v}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            ) : null}
            {Array.from({ length: 8 }, (_, i) => (
              <p key={i} className={styles.line}>
                填充行 {i + 1}
              </p>
            ))}
          </div>
        </Overlay>
      </Space>
    </div>
  );
};

const ReactModalHeightProbeDemo: React.FC = () => (
  <App>
    <DrawerContextHolder />
    <ReactModalHeightProbeDemoInner />
  </App>
);

export default ReactModalHeightProbeDemo;
