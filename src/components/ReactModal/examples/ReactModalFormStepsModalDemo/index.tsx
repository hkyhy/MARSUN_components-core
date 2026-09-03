import {
  createDrawerRender,
  createModalRender,
  DrawerContextHolder,
  modalClassNames,
} from '@/components';
import { FormInfo, FormStepsModal, Input, List, TextArea } from '@/form-info';
import { App, Button, Flex, message, Radio, Space, Typography } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import styles from './style.module.scss';

const { Text } = Typography;

const STEP_DATA = {
  name: '李四',
  employeeNo: 'E20240023',
  department: '产品部',
  position: '高级产品经理',
  summary: '产品规划清晰，跨团队推进能力强。',
  workExperience: [{ companyName: '某互联网公司', role: '产品经理', years: '3年' }],
  objectives: '1. 独立负责核心模块\n2. 推动跨部门协作',
  risks: '对行业业务理解仍需加深',
};

/**
 * 对齐 react-modal README「FormStepsModal + renderModal」
 */
const ReactModalFormStepsModalDemoInner: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'modal' | 'drawer'>('modal');
  const isDrawer = mode === 'drawer';

  useEffect(() => {
    setOpen(false);
  }, [mode]);

  const RenderHost = isDrawer
    ? createDrawerRender({
        placement: 'right',
        footerButtons: [],
        bodyScroll: true,
        size: 'default',
        className: modalClassNames.stepsForm,
      })
    : createModalRender({
        footerButtons: [],
        bodyScroll: true,
        size: 'default',
        className: modalClassNames.stepsForm,
      });

  const renderModal = (hostProps: Record<string, unknown>) => <RenderHost {...hostProps} />;

  return (
    <div
      className={classNames(
        'react-modal-form-steps-modal-demo',
        styles['react-modal-form-steps-modal-demo'],
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
        <Button type="primary" onClick={() => setOpen(true)}>
          打开分步评估（FormStepsModal）
        </Button>
        <Text type="secondary">三步完成候选人评估；切换 Modal / Drawer 对比分步表单高度链。</Text>

        <FormStepsModal
          autoStep
          completeText="提交评估"
          nextText="下一步"
          onComplete={async (allData) => {
            await new Promise((resolve) => setTimeout(resolve, 400));
            message.success(`已提交 ${Array.isArray(allData) ? allData.length : 0} 步数据`);
          }}
          modalProps={{
            open,
            title: isDrawer ? '候选人评估（侧滑分步）' : '候选人评估（分步）',
            width: 900,
            onCancel: () => setOpen(false),
            renderModal,
          }}
          items={[
            {
              title: '基本信息',
              formProps: { data: STEP_DATA },
              children: (
                <Flex vertical gap={16}>
                  <FormInfo
                    bordered
                    title="候选人信息"
                    column={2}
                    gap={20}
                    list={[
                      <Input key="name" name="name" label="姓名" rule="REQ" />,
                      <Input key="employeeNo" name="employeeNo" label="工号" rule="REQ" />,
                      <Input key="department" name="department" label="部门" rule="REQ" />,
                      <Input key="position" name="position" label="职位" rule="REQ" />,
                    ]}
                  />
                </Flex>
              ),
            },
            {
              title: '面试评分',
              formProps: { data: STEP_DATA },
              children: (
                <Flex vertical gap={16}>
                  <FormInfo
                    bordered
                    title="评语"
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
                    ]}
                  />
                </Flex>
              ),
            },
            {
              title: '经历与结论',
              formProps: { data: STEP_DATA },
              children: (
                <Flex vertical gap={16}>
                  <List
                    title="工作经历"
                    name="workExperience"
                    bordered
                    important
                    maxLength={5}
                    addText="添加经历"
                    itemTitle={({ index }) => `经历 ${index + 1}`}
                    list={[
                      <Input key="companyName" name="companyName" label="公司" rule="REQ" />,
                      <Input key="role" name="role" label="职位" rule="REQ" />,
                      <Input key="years" name="years" label="年限" />,
                    ]}
                  />
                  <FormInfo
                    bordered
                    title="目标与风险"
                    column={1}
                    gap={20}
                    list={[
                      <TextArea
                        key="objectives"
                        name="objectives"
                        label="培养目标"
                        rule="REQ"
                        block
                        rows={3}
                      />,
                      <TextArea key="risks" name="risks" label="风险与跟进" block rows={3} />,
                    ]}
                  />
                </Flex>
              ),
            },
          ]}
        />
      </Space>
    </div>
  );
};

const ReactModalFormStepsModalDemo: React.FC = () => (
  <App>
    <DrawerContextHolder />
    <ReactModalFormStepsModalDemoInner />
  </App>
);

export default ReactModalFormStepsModalDemo;
