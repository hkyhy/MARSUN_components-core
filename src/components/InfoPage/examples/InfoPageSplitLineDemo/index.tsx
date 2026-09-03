import { SplitLine } from '@/components';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  MailOutlined,
  MobileOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Avatar, Flex, Tag } from 'antd';
import classNames from 'classnames';
import styles from './style.module.scss';

/**
 * 分割线展示：SplitLine 水平 / 垂直布局
 */
const InfoPageSplitLineDemo: React.FC = () => {
  return (
    <div className={classNames('info-page-split-line-demo', styles['info-page-split-line-demo'])}>
      <Flex vertical gap={20}>
        <div>
          <h4 className={styles.sectionTitle}>员工卡片</h4>
          <SplitLine
            dataSource={{
              name: '张三',
              position: '高级前端工程师',
              department: '技术研发部',
              phone: '13800138000',
              email: 'zhangsan@example.com',
              workYears: 4,
              status: '在职',
            }}
            columns={
              [
                {
                  name: 'name',
                  title: '姓名',
                  render: (value: string) => (
                    <Flex align="center" gap={8}>
                      <Avatar style={{ backgroundColor: '#1890ff' }}>{value[0]}</Avatar>
                      <strong>{value}</strong>
                    </Flex>
                  ),
                },
                {
                  name: 'position',
                  title: '职位',
                  render: (value: string) => <Tag color="blue">{value}</Tag>,
                },
                {
                  name: 'department',
                  title: '部门',
                  render: (value: string) => <Tag color="cyan">{value}</Tag>,
                },
                {
                  name: 'phone',
                  title: '联系电话',
                  icon: <MobileOutlined />,
                  render: (value: string) => value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3'),
                },
                { name: 'email', title: '电子邮箱', icon: <MailOutlined /> },
                {
                  name: 'workYears',
                  title: '工作年限',
                  icon: <CalendarOutlined />,
                  render: (value: number) => `${value}年`,
                },
                {
                  name: 'status',
                  title: '状态',
                  render: (value: string) => <Tag color="success">{value}</Tag>,
                },
              ] as any
            }
          />
        </div>

        <div>
          <h4 className={styles.sectionTitle}>公司信息（垂直标签）</h4>
          <SplitLine
            labelMode="vertical"
            dataSource={{
              companyName: '深圳市腾讯计算机系统有限公司',
              creditCode: '914403007109410773',
              legalPerson: '马化腾',
              registerDate: '1998-11-11',
              address: '深圳市南山区高新科技园科技中一路腾讯大厦',
            }}
            columns={
              [
                { name: 'companyName', title: '企业名称' },
                { name: 'creditCode', title: '统一社会信用代码', icon: <TeamOutlined /> },
                { name: 'legalPerson', title: '法定代表人' },
                { name: 'registerDate', title: '成立日期', icon: <CalendarOutlined /> },
                { name: 'address', title: '注册地址', icon: <EnvironmentOutlined /> },
              ] as any
            }
          />
        </div>
      </Flex>
    </div>
  );
};

export default InfoPageSplitLineDemo;
