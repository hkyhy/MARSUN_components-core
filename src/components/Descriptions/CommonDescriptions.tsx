import { Descriptions } from 'antd';
import React from 'react';

export interface DescriptionItem {
  label: string;
  value: React.ReactNode;
  span?: number;
}

export interface CommonDescriptionsProps {
  content: DescriptionItem[];
  column?:
    | number
    | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number; xxl?: number };
  bordered?: boolean;
  size?: 'small' | 'default' | 'middle';
  title?: React.ReactNode;
  extra?: React.ReactNode;
}

const CommonDescriptions: React.FC<CommonDescriptionsProps> = ({
  content,
  column = 2,
  bordered = true,
  size = 'small',
  title,
  extra,
}) => (
  <Descriptions column={column} bordered={bordered} size={size} title={title} extra={extra}>
    {content.map((item, index) => (
      <Descriptions.Item key={index} label={item.label} span={item.span}>
        {item.value}
      </Descriptions.Item>
    ))}
  </Descriptions>
);

export default CommonDescriptions;
