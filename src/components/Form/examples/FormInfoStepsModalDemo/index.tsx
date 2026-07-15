import { Button, Divider, message } from 'antd';
import React, { useState } from 'react';
import { FormInfo, FormStepsModal, Input, List, TextArea } from '@/components';

const projectData = {
  projectName: '智能客服系统',
  department: '技术研发中心',
  priority: '高',
  background: '现有客服系统效率低下，需要引入 AI 技术提升服务质量',
  teamMembers: [
    {
      name: '张三',
      role: '技术负责人',
      email: 'zhangsan@company.com',
    },
  ],
  objectives: '1. 响应时间缩短 50%\n2. 客户满意度提升 30%',
  deliverables: '智能客服系统一套',
};

const FormInfoStepsModalDemo: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      message.success('项目申请提交成功');
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button type="primary" onClick={() => setOpen(true)} loading={loading}>
        新建项目申请
      </Button>
      <FormStepsModal
        modalProps={{
          open,
          title: '项目立项申请',
          onCancel: () => setOpen(false),
          width: 800,
          destroyOnClose: true,
        }}
        autoStep
        completeText="提交申请"
        nextText="下一步"
        onComplete={handleComplete}
        items={[
          {
            title: '基本信息',
            formProps: { data: projectData },
            children: (
              <>
                <FormInfo
                  title="项目基本信息"
                  column={2}
                  list={[
                    <Input key="projectName" name="projectName" label="项目名称" rule="REQ" />,
                    <Input key="department" name="department" label="所属部门" rule="REQ" />,
                    <Input key="priority" name="priority" label="优先级" rule="REQ" />,
                    <Input key="budget" name="budget" label="预算金额" placeholder="元" />,
                  ]}
                />
                <Divider />
                <FormInfo
                  title="项目背景"
                  column={1}
                  list={[
                    <TextArea
                      key="background"
                      name="background"
                      label="项目背景"
                      rule="REQ"
                      block
                      rows={3}
                    />,
                  ]}
                />
              </>
            ),
          },
          {
            title: '团队配置',
            formProps: { data: projectData },
            children: (
              <List
                title="项目团队成员"
                name="teamMembers"
                important
                maxLength={8}
                addText="添加团队成员"
                itemTitle={({ index, data }) =>
                  (data?.name as string | undefined) || `成员 ${index + 1}`
                }
                list={[
                  <Input key="name" name="name" label="姓名" rule="REQ" />,
                  <Input key="role" name="role" label="角色" rule="REQ" />,
                  <Input key="email" name="email" label="邮箱" rule="EMAIL" />,
                  <Input key="phone" name="phone" label="手机号" rule="TEL" />,
                ]}
              />
            ),
          },
          {
            title: '项目详情',
            formProps: { data: projectData },
            children: (
              <FormInfo
                title="目标与交付物"
                column={1}
                list={[
                  <TextArea
                    key="objectives"
                    name="objectives"
                    label="项目目标"
                    rule="REQ"
                    block
                    rows={3}
                  />,
                  <TextArea
                    key="deliverables"
                    name="deliverables"
                    label="交付物清单"
                    rule="REQ"
                    block
                    rows={2}
                  />,
                ]}
              />
            ),
          },
        ]}
      />
    </div>
  );
};

export default FormInfoStepsModalDemo;
