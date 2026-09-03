import { InfoPageContent } from '@/components';
import { Avatar, Flex, Radio, Space, Tag } from 'antd';
import classNames from 'classnames';
import { useState } from 'react';
import styles from './style.module.scss';

type ListProps = {
  col: number;
  size?: 'small';
  labelAlign: 'left' | 'right' | 'auto';
  gutter: number;
};

/**
 * 内容展示：Content 配置（列数 / 对齐 / display 显隐）
 */
const InfoPageContentDemo: React.FC = () => {
  const [listProps, setListProps] = useState<ListProps>({
    col: 2,
    labelAlign: 'auto',
    gutter: 16,
  });
  const [showDisabled, setShowDisabled] = useState(false);

  const dataList = [
    {
      label: '客户姓名',
      content: (
        <Flex align="center" gap={8}>
          <Avatar size="small">张</Avatar>张三
        </Flex>
      ),
      block: true,
    },
    { label: '客户编号', content: 'C20240115001' },
    { label: '联系电话', content: '138-0013-8000' },
    { label: '电子邮箱', content: 'zhangsan@example.com' },
    { label: '客户类型', content: <Tag color="blue">VIP客户</Tag> },
    { label: '信用等级', content: <Tag color="green">A级</Tag> },
    { label: '所属公司', content: '深圳市腾讯计算机系统有限公司', block: true },
    { label: '所在部门', content: '技术部', display: !showDisabled },
    { label: '职位', content: '高级前端工程师', display: !showDisabled },
    { label: '注册时间', content: '2020-03-15' },
    { label: '最后登录', content: '2024-01-15 10:30:00' },
    { label: '账户状态', content: <Tag color="success">正常</Tag> },
    {
      label: '备注信息',
      content: '该客户为公司长期合作伙伴，合作期间表现优秀。',
      block: true,
    },
  ];

  return (
    <div className={classNames('info-page-content-demo', styles['info-page-content-demo'])}>
      <Flex vertical gap={16}>
        <Space direction="vertical" size={12} className={styles.panel}>
          <div>
            <span className={styles.label}>列数：</span>
            <Radio.Group
              optionType="button"
              value={listProps.col}
              onChange={(e) => setListProps((s) => ({ ...s, col: e.target.value }))}
              options={[
                { label: '单列', value: 1 },
                { label: '两列', value: 2 },
                { label: '三列', value: 3 },
                { label: '四列', value: 4 },
              ]}
            />
          </div>
          <div>
            <span className={styles.label}>标签对齐：</span>
            <Radio.Group
              optionType="button"
              value={listProps.labelAlign}
              onChange={(e) => setListProps((s) => ({ ...s, labelAlign: e.target.value }))}
              options={[
                { label: '左对齐', value: 'left' },
                { label: '右对齐', value: 'right' },
                { label: '自适应', value: 'auto' },
              ]}
            />
          </div>
          <div>
            <span className={styles.label}>尺寸：</span>
            <Radio.Group
              optionType="button"
              value={listProps.size ?? 'default'}
              onChange={(e) =>
                setListProps((s) => ({
                  ...s,
                  size: e.target.value === 'small' ? 'small' : undefined,
                }))
              }
              options={[
                { label: '默认', value: 'default' },
                { label: '小尺寸', value: 'small' },
              ]}
            />
          </div>
          <div>
            <span className={styles.label}>显示隐藏：</span>
            <Radio.Group
              optionType="button"
              value={showDisabled}
              onChange={(e) => setShowDisabled(e.target.value)}
              options={[
                { label: '显示全部', value: false },
                { label: '隐藏部分', value: true },
              ]}
            />
          </div>
        </Space>

        <InfoPageContent {...listProps} list={dataList} />
      </Flex>
    </div>
  );
};

export default InfoPageContentDemo;
