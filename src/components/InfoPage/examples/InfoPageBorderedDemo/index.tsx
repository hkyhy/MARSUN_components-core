import { CentralContent, InfoPage } from '@/components';
import { Avatar, Space, Tag } from 'antd';
import classNames from 'classnames';
import styles from './style.module.scss';

/**
 * 边框区块：Part bordered + CentralContent
 */
const InfoPageBorderedDemo: React.FC = () => {
  return (
    <div className={classNames('info-page-bordered-demo', styles['info-page-bordered-demo'])}>
      <InfoPage>
        <InfoPage.Part bordered title="员工档案" subtitle="基本信息">
          <CentralContent
            dataSource={{
              id: 'RC20240115001',
              name: '张三',
              gender: '男',
              birthday: '1992-03-15',
              phone: '138-0013-8000',
              email: 'zhangsan@example.com',
              address: '广东省深圳市南山区科技园',
            }}
            col={3}
            columns={[
              { name: 'id', title: '员工编号', span: 24 },
              {
                name: 'name',
                title: '姓名',
                render: (value: string) => (
                  <Space align="center">
                    <Avatar style={{ backgroundColor: '#1890ff' }}>{value[0]}</Avatar>
                    <strong>{value}</strong>
                  </Space>
                ),
                span: 10,
              },
              { name: 'gender', title: '性别' },
              { name: 'birthday', title: '出生日期', format: 'date' },
              {
                name: 'phone',
                title: '联系电话',
                render: (value: string) => value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3'),
              },
              { name: 'email', title: '电子邮箱' },
              { name: 'address', title: '家庭住址', span: 24 },
            ]}
          />
        </InfoPage.Part>

        <InfoPage.Part bordered title="工作信息" subtitle="部门与职位">
          <CentralContent
            dataSource={{
              department: '技术研发部',
              position: '高级前端工程师',
              level: 'T4-2',
              supervisor: '王总监',
              workStatus: '在职',
              contractType: '正式员工',
            }}
            col={2}
            columns={[
              { name: 'department', title: '所属部门', span: 12 },
              { name: 'position', title: '职位', span: 12 },
              { name: 'level', title: '职级' },
              { name: 'supervisor', title: '直属主管' },
              {
                name: 'workStatus',
                title: '工作状态',
                render: (value: string) => <Tag color="success">{value}</Tag>,
              },
              { name: 'contractType', title: '合同类型' },
            ]}
          />
        </InfoPage.Part>

        <InfoPage.Part bordered title="福利待遇" subtitle="薪资与福利">
          <CentralContent
            dataSource={{
              baseSalary: 30000,
              performanceBonus: 5000,
              annualBonus: 50000,
              socialInsurance: '已缴纳（五险一金）',
              otherBenefits: '年度体检、节日礼品、团建活动',
            }}
            col={2}
            columns={[
              {
                name: 'baseSalary',
                title: '基本月薪',
                format: 'number-useGrouping:true-suffix:元',
                span: 12,
              },
              {
                name: 'performanceBonus',
                title: '绩效奖金',
                format: 'number-useGrouping:true-suffix:元/月',
                span: 12,
              },
              {
                name: 'annualBonus',
                title: '年终奖金',
                format: 'number-useGrouping:true-suffix:元',
                span: 24,
              },
              {
                name: 'socialInsurance',
                title: '社会保险',
                render: (value: string) => <Tag color="success">{value}</Tag>,
              },
              { name: 'otherBenefits', title: '其他福利', span: 24 },
            ]}
          />
        </InfoPage.Part>
      </InfoPage>
    </div>
  );
};

export default InfoPageBorderedDemo;
