// @ts-nocheck
import { FormAntd as ReactForm } from '@kne/react-form-antd';
import classnames from 'classnames';
import { forwardRef } from 'react';
import InfoPage from '@/components/InfoPage';
import type { FormProps } from './types';
import style from './style.module.scss';

/**
 * 新栈 Form：FormAntd + type=inner；外层 InfoPage.Part（扁平少 border）。
 * Ported/adapted from kne-union/form-info Form.js（计划要求 Part 而非整页 InfoPage）。
 */
const Form = forwardRef<unknown, FormProps>((props, ref) => {
  const { className, children, ...others } = Object.assign({ type: 'inner' }, props);
  return (
    <ReactForm
      {...others}
      ref={ref}
      className={classnames('marsun-form-info-outer', style['marsun-form-info-outer'], className)}
    >
      <InfoPage.Part bordered={false}>{children}</InfoPage.Part>
    </ReactForm>
  );
});

Form.displayName = 'Form';

export default Form;
