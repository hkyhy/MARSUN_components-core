// @ts-nocheck — vendor ReactFilter JSX 无完整 Props 类型，demo 对齐上游 playground
import { Flex, Input, InputNumber, Select, Space } from 'antd';
import React, { useState } from 'react';
import { PopoverItem } from '../index';
import ReactFilterLayoutPreview from './ReactFilterLayoutPreview';

type PopoverValue = { label: string; value: unknown } | null;

/**
 * 上游 popover-item.js：PopoverItem 多种交互形态
 */
const PopoverItemDemo: React.FC = () => {
  const [inputValue, setInputValue] = useState<PopoverValue>(null);
  const [numberValue, setNumberValue] = useState<PopoverValue>(null);
  const [selectValue, setSelectValue] = useState<PopoverValue>(null);
  const [rangeValue, setRangeValue] = useState<PopoverValue>(null);

  return (
    <ReactFilterLayoutPreview>
      <Flex vertical gap={24}>
        <h4>弹出层筛选组件示例</h4>
        <Flex wrap gap={16}>
          <PopoverItem label="文本输入" value={inputValue} onChange={setInputValue}>
            {({ value, onChange }) => (
              <Input
                style={{ width: 240 }}
                placeholder="请输入文本"
                value={(value?.value as string) || ''}
                onChange={(e) =>
                  onChange(e.target.value ? { label: e.target.value, value: e.target.value } : null)
                }
              />
            )}
          </PopoverItem>

          <PopoverItem
            label="数字输入"
            value={numberValue}
            onChange={setNumberValue}
            onValidate={(val: PopoverValue) => val?.value !== undefined}
          >
            {({ value, onChange }) => (
              <InputNumber
                style={{ width: 240 }}
                placeholder="请输入数字"
                value={value?.value as number | null | undefined}
                onChange={(val) =>
                  onChange(val !== null ? { label: String(val), value: val } : null)
                }
              />
            )}
          </PopoverItem>

          <PopoverItem label="状态选择" value={selectValue} onChange={setSelectValue}>
            {({ value, onChange }) => (
              <Select
                style={{ width: 240 }}
                placeholder="请选择状态"
                value={value?.value as string | undefined}
                onChange={(val, option) => {
                  const opt = option as { label?: string } | undefined;
                  onChange({
                    value: val,
                    label: opt?.label || val,
                  });
                }}
                options={[
                  { value: 'active', label: '激活' },
                  { value: 'inactive', label: '未激活' },
                  { value: 'pending', label: '待处理' },
                ]}
              />
            )}
          </PopoverItem>

          <PopoverItem
            label="数值范围"
            value={rangeValue}
            onChange={setRangeValue}
            onValidate={(val: PopoverValue) => {
              const range = val?.value as [number | undefined, number | undefined] | undefined;
              return !(
                range &&
                range[0] !== undefined &&
                range[1] !== undefined &&
                range[1] < range[0]
              );
            }}
          >
            {({ value, onChange }) => {
              const range = value?.value as [number | undefined, number | undefined] | undefined;
              return (
                <Space.Compact>
                  <InputNumber
                    style={{ width: 100 }}
                    placeholder="最小值"
                    value={range?.[0]}
                    onChange={(val) =>
                      onChange({
                        label: `${val ?? '?'}-${range?.[1] ?? '?'}`,
                        value: [val, range?.[1]],
                      })
                    }
                  />
                  <Input
                    style={{
                      width: 30,
                      textAlign: 'center',
                      borderLeft: 0,
                      borderRight: 0,
                    }}
                    placeholder="~"
                    disabled
                  />
                  <InputNumber
                    style={{ width: 100 }}
                    placeholder="最大值"
                    value={range?.[1]}
                    onChange={(val) =>
                      onChange({
                        label: `${range?.[0] ?? '?'}-${val ?? '?'}`,
                        value: [range?.[0], val],
                      })
                    }
                  />
                </Space.Compact>
              );
            }}
          </PopoverItem>
        </Flex>

        <Flex vertical gap={8}>
          <h5>当前值:</h5>
          <pre style={{ margin: 0, background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
            {JSON.stringify(
              {
                文本输入: inputValue,
                数字输入: numberValue,
                状态选择: selectValue,
                数值范围: rangeValue,
              },
              null,
              2,
            )}
          </pre>
        </Flex>
      </Flex>
    </ReactFilterLayoutPreview>
  );
};

export default PopoverItemDemo;
