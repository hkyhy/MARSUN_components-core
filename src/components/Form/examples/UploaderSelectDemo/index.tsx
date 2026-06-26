import { UploaderSelect } from '@/components';
import React, { useState } from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

/** UploaderSelect 基础用法 */
const UploaderSelectDemo: React.FC = () => {
  const [uploader, setUploader] = useState<string | undefined>();

  return (
    <div className={classNames('uploader-select-demo-header', styles['uploader-select-demo-header'])}>
      <div>
        <label className={classNames('uploader-select-demo-col', styles['uploader-select-demo-col'])}>上传者选择</label>
        <UploaderSelect
          value={uploader}
          onChange={(v) => setUploader(v as string | undefined)}
          placeholder="请选择上传者"
          style={{ width: 280 }}
        />
        <p className={classNames('uploader-select-demo-wrap', styles['uploader-select-demo-wrap'])}>当前选中：{uploader ?? '-'}</p>
      </div>
    </div>
  );
};

export default UploaderSelectDemo;
