import { DrawerContextHolder, ReactModal, useDrawer, useModal } from '@/components';
import { App, Button, Checkbox, Radio, Space, Tag, Typography, message } from 'antd';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import styles from './style.module.scss';

const { Text, Paragraph } = Typography;

const EXPORT_FIELDS = [
  { label: '基本信息', value: 'basic' },
  { label: '维度评分', value: 'scores' },
  { label: '面试记录', value: 'notes' },
  { label: '附件简历', value: 'resume' },
];

const NestProbe: React.FC<{ open: boolean; isDrawer: boolean }> = ({ open, isDrawer }) => {
  const [info, setInfo] = useState<{ hoisted: boolean } | null>(null);

  useEffect(() => {
    if (!open) {
      setInfo(null);
      return;
    }
    const id = window.setTimeout(() => {
      const outerRootClass = isDrawer ? '.ant-drawer-root' : '.ant-modal-root';
      const titleClass = isDrawer ? '.drawer-title' : '.modal-title';
      const titles = Array.from(document.querySelectorAll(`${outerRootClass} ${titleClass}`));
      const outerTitle = titles.find(
        (el) => el.textContent === (isDrawer ? '导出评估报告（侧滑）' : '导出评估报告'),
      );
      const innerTitle = titles.find((el) => el.textContent === '选择导出字段');
      const outerRoot = outerTitle?.closest(outerRootClass.slice(1));
      const innerRoot = innerTitle?.closest('.ant-modal-root');
      const outerBody = outerRoot?.querySelector(isDrawer ? '.ant-drawer-body' : '.ant-modal-body');
      const hoisted = !!(innerRoot && outerBody && !outerBody.contains(innerRoot));
      setInfo({ hoisted });
    }, 50);
    return () => window.clearTimeout(id);
  }, [open, isDrawer]);

  if (!info) {
    return <Text type="secondary">打开内层后显示挂载探针</Text>;
  }

  return (
    <Tag color={info.hoisted ? 'success' : 'error'}>
      内层 Modal {info.hoisted ? '已 hoist 到外层外侧' : '挂载异常'}
    </Tag>
  );
};

const ExportFieldPicker: React.FC<{ isDrawer: boolean }> = ({ isDrawer }) => {
  const [innerOpen, setInnerOpen] = useState(false);
  const [checked, setChecked] = useState<string[]>(['basic', 'scores', 'notes']);

  return (
    <div>
      <Paragraph>
        已选择本批 <Text strong>8</Text> 位候选人。内层始终为声明式 Modal；外层当前为{' '}
        <Text code>{isDrawer ? 'Drawer' : 'Modal'}</Text>。
      </Paragraph>
      <Space>
        <Button type="primary" onClick={() => setInnerOpen(true)}>
          配置导出字段
        </Button>
        <Text type="secondary">已选 {checked.length} 项</Text>
      </Space>
      <div style={{ marginTop: 12 }}>
        <NestProbe open={innerOpen} isDrawer={isDrawer} />
      </div>
      <ReactModal
        title="选择导出字段"
        open={innerOpen}
        size="small"
        onClose={() => setInnerOpen(false)}
        onConfirm={() => {
          message.success(`将导出：${checked.join('、')}`);
          setInnerOpen(false);
        }}
        confirmText="确认字段"
      >
        <Checkbox.Group
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
          options={EXPORT_FIELDS}
          value={checked}
          onChange={(vals) => setChecked(vals as string[])}
        />
      </ReactModal>
    </div>
  );
};

/**
 * 嵌套弹层：外层命令式 + 内层声明式 Modal
 */
const ReactModalNestedDemoInner: React.FC = () => {
  const modal = useModal();
  const drawer = useDrawer();
  const [mode, setMode] = useState<'modal' | 'drawer'>('modal');
  const isDrawer = mode === 'drawer';

  return (
    <div className={classNames('react-modal-nested-demo', styles['react-modal-nested-demo'])}>
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
        <Button
          type="primary"
          onClick={() => {
            const api = isDrawer ? drawer : modal;
            api({
              title: isDrawer ? '导出评估报告（侧滑）' : '导出评估报告',
              size: 'default',
              children: <ExportFieldPicker isDrawer={isDrawer} />,
              onConfirm: () => message.success('报告已进入生成队列'),
              confirmText: '开始导出',
            });
          }}
        >
          导出本批评估（嵌套弹层）
        </Button>
        <Text type="secondary">外层 Modal / Drawer 命令式 + 内层声明式 Modal。</Text>
      </Space>
    </div>
  );
};

const ReactModalNestedDemo: React.FC = () => (
  <App>
    <DrawerContextHolder />
    <ReactModalNestedDemoInner />
  </App>
);

export default ReactModalNestedDemo;
