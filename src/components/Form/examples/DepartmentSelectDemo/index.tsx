import { DepartmentSelect, UploaderSelect } from '@/components';
import React, { useState } from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

const FormSelectsDemo: React.FC = () => {
  const [dept, setDept] = useState<string | undefined>();
  const [uploader, setUploader] = useState<string | undefined>();

  return (
    <div className={classNames('department-select-demo-header', styles['department-select-demo-header'])}>
      <div>
        <label className={classNames('department-select-demo-body', styles['department-select-demo-body'])}>部门选择</label>
        <DepartmentSelect
          value={dept}
          onChange={(v) => setDept(v as string | undefined)}
          style={{ width: 240 }}
        />
      </div>
      <div>
        <label className={classNames('department-select-demo-body', styles['department-select-demo-body'])}>上传者选择</label>
        <UploaderSelect
          value={uploader}
          onChange={(v) => setUploader(v as string | undefined)}
          style={{ width: 240 }}
        />
      </div>
    </div>
  );
};

export default FormSelectsDemo;
