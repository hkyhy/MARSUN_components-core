import { Info } from '@/components/Icons';
import { Popover } from 'antd';
import React from 'react';
import type { PersonOption } from '../../Filter/types';
import styles from './style.module.scss';
import classNames from 'classnames';

export interface PersonOptionRowProps {
  option: Pick<PersonOption, 'label' | 'departmentName' | 'email' | 'phone' | 'employeeId'>;
  className?: string;
}

/** 人员选项行：姓名 + 部门 + 右侧 info 图标，hover 展示联系方式 */
const PersonOptionRow: React.FC<PersonOptionRowProps> = ({ option, className }) => {
  const { label, departmentName, email, phone, employeeId } = option;

  const infoContent = (
    <div className={classNames('person-option-row-root', styles['person-option-row-root'])}>
      {employeeId ? <div>工号：{employeeId}</div> : null}
      <div>邮箱：{email || '-'}</div>
      <div>电话：{phone || '-'}</div>
    </div>
  );

  return (
    <div className={classNames('person-option-row-person-row', styles['person-option-row-person-row'], className)}>
      <span className={classNames('person-option-row-container', styles['person-option-row-container'])}>{label}</span>
      {departmentName ? (
        <span className={classNames('person-option-row-wrapper', styles['person-option-row-wrapper'])}>{departmentName}</span>
      ) : null}
      <Popover content={infoContent} title={label} trigger="hover" placement="right">
        <Info
          className={classNames('person-option-row-inner', styles['person-option-row-inner'])}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        />
      </Popover>
    </div>
  );
};

export default PersonOptionRow;
