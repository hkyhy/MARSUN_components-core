import { TableView } from '@/components';
import { Flex, Radio, Tag } from 'antd';
import classNames from 'classnames';
import { useState } from 'react';
import styles from './style.module.scss';

const dataSource = [
  {
    id: 'C20240115001',
    name: '张三',
    company: '腾讯科技',
    contact: '138-0013-8000',
    amount: 50000,
    status: '已签约',
  },
  {
    id: 'C20240115002',
    name: '李四',
    company: '华为技术',
    contact: '139-0014-9000',
    amount: 85000,
    status: '跟进中',
  },
  {
    id: 'C20240115003',
    name: '王五',
    company: '阿里巴巴',
    contact: '137-0015-7000',
    amount: 120000,
    status: '已签约',
  },
  {
    id: 'C20240115004',
    name: '赵六',
    company: '字节跳动',
    contact: '136-0016-6000',
    amount: 65000,
    status: '待跟进',
  },
  {
    id: 'C20240115005',
    name: '钱七',
    company: '百度在线',
    contact: '135-0017-5000',
    amount: 95000,
    status: '已签约',
  },
];

const columns = [
  { name: 'id', title: '客户编号' },
  { name: 'name', title: '联系人' },
  { name: 'company', title: '所属公司' },
  { name: 'contact', title: '联系电话' },
  {
    name: 'amount',
    title: '意向金额',
    render: (value: number) => <strong>¥{value.toLocaleString()}</strong>,
  },
  {
    name: 'status',
    title: '状态',
    render: (value: string) => {
      const color = value === '已签约' ? 'success' : value === '跟进中' ? 'processing' : 'default';
      return <Tag color={color}>{value}</Tag>;
    },
  },
];

type SelectionType = 'none' | 'checkbox' | 'radio';

/**
 * 表格选择：TableView 复选 / 单选
 */
const InfoPageTableSelectDemo: React.FC = () => {
  const [selectionType, setSelectionType] = useState<SelectionType>('checkbox');
  const [selectKeys, setSelectKeys] = useState<string[]>([]);

  const totalAmount = selectKeys.reduce(
    (sum, id) => sum + (dataSource.find((d) => d.id === id)?.amount || 0),
    0,
  );

  return (
    <div
      className={classNames('info-page-table-select-demo', styles['info-page-table-select-demo'])}
    >
      <Flex vertical gap={16}>
        <div className={styles.panel}>
          <span className={styles.label}>选择模式：</span>
          <Radio.Group
            optionType="button"
            value={selectionType}
            onChange={(e) => {
              setSelectionType(e.target.value);
              setSelectKeys([]);
            }}
            options={[
              { label: '无选择', value: 'none' },
              { label: '复选框', value: 'checkbox' },
              { label: '单选框', value: 'radio' },
            ]}
          />
        </div>

        {selectionType !== 'none' ? (
          <Flex justify="space-between" align="center">
            <span>
              已选 <strong>{selectKeys.length}</strong> 项
              {selectionType === 'checkbox' ? (
                <>
                  ，总金额{' '}
                  <strong style={{ color: '#52c41a' }}>¥{totalAmount.toLocaleString()}</strong>
                </>
              ) : null}
            </span>
          </Flex>
        ) : null}

        <TableView
          dataSource={dataSource}
          columns={columns}
          rowKey="id"
          rowSelection={
            selectionType === 'none'
              ? undefined
              : {
                  type: selectionType,
                  selectedRowKeys: selectKeys,
                  onChange: (keys: string[]) => setSelectKeys(keys),
                }
          }
        />
      </Flex>
    </div>
  );
};

export default InfoPageTableSelectDemo;
