import { InfoPageContent } from '@/components';
import { Radio, Space, Tag } from 'antd';
import classNames from 'classnames';
import { useState } from 'react';
import styles from './style.module.scss';

type ListProps = {
  col: number;
  size?: 'small';
  labelAlign: 'left' | 'right' | 'auto';
};

/**
 * 内容列表：多列布局与标签对齐
 */
const InfoPageContentListDemo: React.FC = () => {
  const [listProps, setListProps] = useState<ListProps>({
    col: 2,
    labelAlign: 'left',
  });

  return (
    <div
      className={classNames('info-page-content-list-demo', styles['info-page-content-list-demo'])}
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <div className={styles.panel}>
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
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
          </Space>
        </div>

        <InfoPageContent
          {...listProps}
          list={[
            { label: '客户名称', content: '深圳市腾讯计算机系统有限公司' },
            { label: '统一社会信用代码', content: '914403007109410773' },
            { label: '法定代表人', content: '马化腾' },
            { label: '企业类型', content: <Tag color="blue">有限责任公司</Tag> },
            { label: '成立日期', content: '1998-11-11' },
            { label: '注册资本', content: '500万美元' },
            { label: '经营状态', content: <Tag color="success">存续</Tag> },
            { label: '注册地址', content: '深圳市南山区高新科技园科技中一路腾讯大厦' },
            {
              label: '经营范围',
              content:
                '计算机软硬件的技术开发、销售；计算机网络工程；系统集成；软件开发及技术服务。',
              block: true,
            },
          ]}
        />
      </Space>
    </div>
  );
};

export default InfoPageContentListDemo;
