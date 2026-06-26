import { Typography } from 'antd';
import React from 'react';
import { MOCK_FILE_LIST, UPLOAD_CONFIG } from '../mock';
import styles from './style.module.scss';
import classNames from 'classnames';

const { Text } = Typography;

const UploadDemo: React.FC = () => (
  <div className={classNames('upload-demo-inner', styles['upload-demo-inner'])}>
    <p className={classNames('upload-demo-header', styles['upload-demo-header'])}>
      CommonUpload 是通用文件上传组件，基于 antd Upload 封装。
    </p>
    <div className={classNames('upload-demo-body', styles['upload-demo-body'])}>
      <h4 className={classNames('upload-demo-footer', styles['upload-demo-footer'])}>上传配置</h4>
      <div className={classNames('upload-demo-row', styles['upload-demo-row'])}>
        <div>
          <Text type="secondary">最大文件数：</Text>
          {UPLOAD_CONFIG.maxCount}
        </div>
        <div>
          <Text type="secondary">最大文件大小：</Text>
          {UPLOAD_CONFIG.maxSize / 1024 / 1024}MB
        </div>
        <div>
          <Text type="secondary">允许类型：</Text>
          {UPLOAD_CONFIG.acceptText}
        </div>
        <div>
          <Text type="secondary">扩展名：</Text>
          {UPLOAD_CONFIG.accept}
        </div>
      </div>
    </div>
    <div className={classNames('upload-demo-body', styles['upload-demo-body'])}>
      <h4 className={classNames('upload-demo-footer', styles['upload-demo-footer'])}>已上传文件（Mock）</h4>
      {MOCK_FILE_LIST.map((f) => (
        <div key={f.uid} className={classNames('upload-demo-col', styles['upload-demo-col'])}>
          <span className={classNames('upload-demo-wrap', styles['upload-demo-wrap'])}>✓</span>
          <span>{f.name}</span>
          <Text type="secondary" className={classNames('upload-demo-panel', styles['upload-demo-panel'])}>
            已上传
          </Text>
        </div>
      ))}
    </div>
    <pre className={classNames('upload-demo-card', styles['upload-demo-card'])}>
      {`import { CommonUpload } from '@/components';
<CommonUpload
  maxCount={${UPLOAD_CONFIG.maxCount}}
  maxSize={${UPLOAD_CONFIG.maxSize}}
  accept="${UPLOAD_CONFIG.accept}"
  onSuccess={(fileList) => console.log(fileList)}
/>`}
    </pre>
  </div>
);

export default UploadDemo;
