import { Col, Row, Typography } from 'antd';
import classNames from 'classnames';
import React from 'react';
import {
  Form as LegacyForm,
  FormInfo as LegacyFormInfo,
  Input as LegacyInput,
} from '@/components/Form';
import { Form, FormInfo, Input } from '@/form-info';
import styles from './style.module.scss';

const data = { name: '对照', dept: '平台' };

const NewFormInfoCompareDemo: React.FC = () => (
  <div className={classNames('new-form-info-compare-demo', styles['new-form-info-compare-demo'])}>
    <Row gutter={24}>
      <Col span={12}>
        <Typography.Title level={5}>新栈 ./form-info</Typography.Title>
        <Form data={data} onSubmit={() => undefined}>
          <FormInfo
            title="新栈"
            column={1}
            list={[
              <Input key="name" name="name" label="姓名" />,
              <Input key="dept" name="dept" label="部门" />,
            ]}
          />
        </Form>
      </Col>
      <Col span={12}>
        <Typography.Title level={5}>存量包根 FormInfo</Typography.Title>
        <LegacyForm data={data} onSubmit={() => undefined}>
          <LegacyFormInfo
            title="存量"
            column={1}
            list={[
              <LegacyInput key="name" name="name" label="姓名" />,
              <LegacyInput key="dept" name="dept" label="部门" />,
            ]}
          />
        </LegacyForm>
      </Col>
    </Row>
  </div>
);
export default NewFormInfoCompareDemo;
