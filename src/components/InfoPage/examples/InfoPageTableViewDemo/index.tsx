import { TableView } from '@/components';
import { Badge, Flex } from 'antd';
import classNames from 'classnames';
import styles from './style.module.scss';

const dataSource = [
  {
    id: 'ORD20240115001',
    customerName: '深圳市腾讯计算机系统有限公司',
    contact: '张三',
    phone: '13800138000',
    amount: 42500,
    status: '已完成',
    orderDate: '2024-01-15',
    deliveryDate: '2024-01-17',
  },
  {
    id: 'ORD20240115002',
    customerName: '华为技术有限公司',
    contact: '李四',
    phone: '13900149000',
    amount: 85000,
    status: '处理中',
    orderDate: '2024-01-15',
    deliveryDate: '2024-01-20',
  },
  {
    id: 'ORD20240115003',
    customerName: '阿里巴巴集团控股有限公司',
    contact: '王五',
    phone: '13700157000',
    amount: 120000,
    status: '待发货',
    orderDate: '2024-01-14',
    deliveryDate: '2024-01-22',
  },
  {
    id: 'ORD20240115004',
    customerName: '北京字节跳动科技有限公司',
    contact: '赵六',
    phone: '13600166000',
    amount: 65000,
    status: '已完成',
    orderDate: '2024-01-13',
    deliveryDate: '2024-01-16',
  },
  {
    id: 'ORD20240115005',
    customerName: '百度在线网络技术（北京）有限公司',
    contact: '钱七',
    phone: '13500175000',
    amount: 95000,
    status: '已取消',
    orderDate: '2024-01-12',
    deliveryDate: '',
  },
];

const columns = [
  { name: 'id', title: '订单编号' },
  { name: 'customerName', title: '客户名称', span: 4 },
  { name: 'contact', title: '联系人' },
  {
    name: 'phone',
    title: '联系电话',
    render: (value: string) => value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3'),
  },
  {
    name: 'amount',
    title: '订单金额(元)',
    render: (value: number) => (
      <strong style={{ color: '#f5222d' }}>¥{value.toLocaleString()}</strong>
    ),
  },
  { name: 'orderDate', title: '下单日期', format: 'date' },
  { name: 'deliveryDate', title: '预计送达', format: 'date' },
  {
    name: 'status',
    title: '订单状态',
    render: (value: string) => {
      const config: Record<
        string,
        { color: 'success' | 'processing' | 'warning' | 'default'; text: string }
      > = {
        已完成: { color: 'success', text: '已完成' },
        处理中: { color: 'processing', text: '处理中' },
        待发货: { color: 'warning', text: '待发货' },
        已取消: { color: 'default', text: '已取消' },
      };
      const { color, text } = config[value] || { color: 'default' as const, text: value };
      return <Badge status={color} text={text} />;
    },
  },
];

/**
 * 表格视图：TableView 基础列表与 sticky 表头
 */
const InfoPageTableViewDemo: React.FC = () => {
  return (
    <div className={classNames('info-page-table-view-demo', styles['info-page-table-view-demo'])}>
      <Flex vertical gap={16}>
        <div className={styles.panel}>
          订单列表 - 共 <strong>{dataSource.length}</strong> 个订单
        </div>
        <TableView dataSource={dataSource} columns={columns} rowKey="id" />
        <div className={styles.stickyWrap}>
          <TableView dataSource={dataSource} columns={columns} rowKey="id" sticky />
        </div>
      </Flex>
    </div>
  );
};

export default InfoPageTableViewDemo;
