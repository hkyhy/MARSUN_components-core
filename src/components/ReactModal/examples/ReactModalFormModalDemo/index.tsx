import { createDrawerRender, createModalRender, DrawerContextHolder } from '@/components';
import { FormInfo, FormModal, Input, TextArea } from '@/form-info';
import { App, Button, Flex, message, Radio, Space, Switch, Typography } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import styles from './style.module.scss';

const { Text } = Typography;

/**
 * 对齐 react-modal README「FormModal + renderModal」：
 * createModalRender / createDrawerRender + FormInfo 新栈 FormModal
 */
const ReactModalFormModalDemoInner: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [bodyScroll, setBodyScroll] = useState(true);
  const [mode, setMode] = useState<'modal' | 'drawer'>('modal');
  const isDrawer = mode === 'drawer';
  const initialData = useMemo(
    () => ({
      name: '张三',
      department: '研发中心',
      summary: '沟通清晰，项目推进稳定。用于验证 FormModal + renderModal 宿主切换。',
    }),
    [],
  );

  useEffect(() => {
    setOpen(false);
  }, [mode]);

  const RenderHost = isDrawer
    ? createDrawerRender({
        placement: 'right',
        footerButtons: [],
        bodyScroll: true,
        size: 'large',
      })
    : createModalRender({ footerButtons: [], bodyScroll: true, size: 'large' });

  const renderModal = (hostProps: Record<string, unknown>) => (
    <RenderHost {...hostProps} bodyScroll={bodyScroll} />
  );

  return (
    <div
      className={classNames('react-modal-form-modal-demo', styles['react-modal-form-modal-demo'])}
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
        <Space wrap>
          <Button type="primary" onClick={() => setOpen(true)}>
            打开深度评估表单（FormModal）
          </Button>
          <Space>
            <Text type="secondary">bodyScroll</Text>
            <Switch
              checked={bodyScroll}
              onChange={setBodyScroll}
              checkedChildren="开"
              unCheckedChildren="关"
            />
          </Space>
        </Space>
        <Text type="secondary">
          createModalRender / createDrawerRender 注入默认 props；切换 Modal / Drawer 对比 form-info
          宿主集成。
        </Text>

        <FormModal
          title={isDrawer ? '候选人深度评估（侧滑）' : '候选人深度评估'}
          open={open}
          onCancel={() => setOpen(false)}
          renderModal={renderModal}
          okText="保存评估"
          cancelText="取消"
          width={1000}
          formProps={{
            data: initialData,
            onSubmit: async (data: Record<string, unknown>) => {
              await new Promise((resolve) => setTimeout(resolve, 400));
              message.success(
                `已保存：${String(data.name ?? '')}（共 ${Object.keys(data).length} 个字段）`,
              );
            },
          }}
        >
          <Flex vertical gap={16}>
            <FormInfo
              bordered
              title="基本信息"
              column={2}
              gap={20}
              list={[
                <Input key="name" name="name" label="姓名" rule="REQ" />,
                <Input key="department" name="department" label="部门" rule="REQ" />,
                <Input key="position" name="position" label="职位" />,
                <Input key="city" name="city" label="工作城市" />,
              ]}
            />
            <FormInfo
              bordered
              title="评估摘要"
              column={1}
              gap={20}
              list={[
                <TextArea
                  key="summary"
                  name="summary"
                  label="综合评语"
                  rule="REQ"
                  block
                  rows={4}
                />,
                <TextArea key="risk" name="risk" label="风险与待跟进" block rows={3} />,
              ]}
            />
          </Flex>
        </FormModal>
      </Space>
    </div>
  );
};

const ReactModalFormModalDemo: React.FC = () => (
  <App>
    <DrawerContextHolder />
    <ReactModalFormModalDemoInner />
  </App>
);

export default ReactModalFormModalDemo;
