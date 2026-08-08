// @ts-nocheck — vendor ReactFilter JSX 无完整 Props 类型，demo 对齐上游 playground
import { Card, Flex, Typography } from 'antd';
import React, { useMemo, useState } from 'react';
import Filter, { fields, getFilterValue, useSearchParamsValue, type FilterValue } from '../index';

const { InputFilterItem } = fields;

/**
 * 上游 search-params-value.js：用 mock URLSearchParams 演示 useSearchParamsValue
 */
const SearchParamsValueDemo: React.FC = () => {
  const initialSearch = useMemo(() => {
    const params = new URLSearchParams();
    params.set('userId', 'u-1001');
    params.set('tenantOrgId', 'org-1');
    params.set('tenantOrgName', '技术部');
    return params;
  }, []);

  const [searchParams, setSearchParams] = useState(initialSearch);

  const searchParamsValue = useSearchParamsValue({
    searchParams,
    setSearchParams,
    fields: [
      { name: 'userId', label: '用户Id' },
      { name: 'tenantOrgId', label: '部门', labelKey: 'tenantOrgName' },
    ],
  });

  const [filter, setFilter] = useState<FilterValue>(searchParamsValue);

  return (
    <Flex vertical gap={16}>
      <Card size="small" title="说明">
        <Typography.Paragraph style={{ marginBottom: 8 }}>
          模拟进入页时 URL 为{' '}
          <Typography.Text code>
            ?userId=u-1001&amp;tenantOrgId=org-1&amp;tenantOrgName=技术部
          </Typography.Text>
          。hook 同步解析为 <Typography.Text code>searchParamsValue</Typography.Text>
          ，并用 <Typography.Text code>useState(searchParamsValue)</Typography.Text> seed 到
          Filter。配置了 <Typography.Text code>labelKey</Typography.Text> 的字段会用对应 URL
          参数作为选中值展示文案。
        </Typography.Paragraph>
        <Typography.Text type="secondary">
          传入 <Typography.Text code>setSearchParams</Typography.Text> 后，mount 会以 replace
          清掉已消费 key（含 labelKey，下方 URL 应变空）；之后改 URL
          不会再次解析，需自行重新挂载或业务侧处理。
        </Typography.Text>
      </Card>
      <Card size="small" title="当前 URL search（模拟，strip 后）">
        <Typography.Text code>?{searchParams.toString() || '(已清空已消费参数)'}</Typography.Text>
      </Card>
      <Card size="small" title="searchParamsValue（仅首次解析，用于 seed）">
        <pre style={{ margin: 0, fontSize: 12 }}>{JSON.stringify(searchParamsValue, null, 2)}</pre>
      </Card>
      <Filter
        value={filter}
        onChange={(value) => {
          setFilter(value);
          getFilterValue(value);
        }}
        list={[
          [
            { type: InputFilterItem, props: { name: 'userId', label: '用户Id' } },
            { type: InputFilterItem, props: { name: 'tenantOrgId', label: '部门' } },
            { type: InputFilterItem, props: { name: 'keyword', label: '关键词' } },
          ],
        ]}
        displayLine={1}
      />
    </Flex>
  );
};

export default SearchParamsValueDemo;
