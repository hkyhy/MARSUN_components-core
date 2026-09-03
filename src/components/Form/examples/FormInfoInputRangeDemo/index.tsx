import { message, Space } from 'antd';
import React, { useState } from 'react';
import {
  Form,
  FormInfo,
  InputRange,
  ResetButton,
  SubmitButton,
  inputRangeRules,
} from '@/components';
import styles from './style.module.scss';
import classNames from 'classnames';

/** FormInfo · InputRange（纱支/数字区间）场景 Demo；含 RANGE_ASC 有序校验 */
const FormInfoInputRangeDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);

  return (
    <div className={classNames('form-info-input-range-demo', styles['form-info-input-range-demo'])}>
      <Form
        data={{ yarnBand: [50, 70] as [number, number], optionalBand: null, orderedBand: [10, 5] }}
        rules={{ ...inputRangeRules }}
        onSubmit={async (data: Record<string, unknown>) => {
          setLoading(true);
          try {
            await new Promise((r) => setTimeout(r, 300));
            message.success(`提交：${JSON.stringify(data)}`);
          } finally {
            setLoading(false);
          }
        }}
      >
        <FormInfo
          title="纱支分档"
          column={2}
          list={[
            <InputRange
              key="yarnBand"
              name="yarnBand"
              label="纱支分档"
              rule="REQ RANGE_ASC"
              unit="Ne"
              min={0}
              precision={0}
              minPlaceholder="下限"
              maxPlaceholder="上限"
              labelTips="值形如 [minNe, maxNe]；必填用 REQ；双侧有值时须上限≥下限（RANGE_ASC）"
            />,
            <InputRange
              key="optionalBand"
              name="optionalBand"
              label="可选区间"
              rule="RANGE_ASC"
              unit="Ne"
              min={0}
              precision={0}
              placeholder="可选"
            />,
            <InputRange
              key="orderedBand"
              name="orderedBand"
              label="故意倒置（提交应拦）"
              rule="RANGE_ASC"
              unit="Ne"
              min={0}
              precision={0}
              minPlaceholder="下限"
              maxPlaceholder="上限"
              labelTips="初值 [10,5]；提交应提示上限不可小于下限"
            />,
          ]}
        />
        <Space>
          <SubmitButton loading={loading}>提交</SubmitButton>
          <ResetButton>重置</ResetButton>
        </Space>
      </Form>
    </div>
  );
};

export default FormInfoInputRangeDemo;
