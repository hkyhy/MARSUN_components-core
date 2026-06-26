import { FileLink } from '@/components';
import { message } from 'antd';
import React from 'react';
import { mockFileItems } from '../mock';
import styles from './style.module.scss';
import classNames from 'classnames';

const FileLinkDemo: React.FC = () => {
  return (
    <div className={classNames('file-link-demo-preview', styles['file-link-demo-preview'])}>
      <h4 className={classNames('file-link-demo-scroll', styles['file-link-demo-scroll'])}>文件链接列表</h4>
      <div className={classNames('file-link-demo-thumb', styles['file-link-demo-thumb'])}>
        {mockFileItems.map((file) => (
          <FileLink
            key={file.id}
            file={file}
            onClick={(f) => message.info(`点击文件: ${f.name}`)}
          />
        ))}
      </div>

      <h4 className={classNames('file-link-demo-viewport', styles['file-link-demo-viewport'])}>内联展示</h4>
      <div className={classNames('file-link-demo-track', styles['file-link-demo-track'])}>
        附件：
        {mockFileItems.slice(0, 3).map((file) => (
          <FileLink key={file.id} file={file} />
        ))}
      </div>
    </div>
  );
};

export default FileLinkDemo;
