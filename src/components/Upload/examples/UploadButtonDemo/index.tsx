import { CommonUpload } from '@/components';
import React from 'react';
import { UPLOAD_CONFIG } from '../mock';
import styles from './style.module.scss';
import classNames from 'classnames';

/** 按钮模式 — 按钮触发文件选择 */
const UploadButtonDemo: React.FC = () => (
  <div className={classNames('upload-button-demo-root', styles['upload-button-demo-root'])}>
    <p className={classNames('upload-button-demo-container', styles['upload-button-demo-container'])}>
      variant=&quot;button&quot;(默认) — 通过按钮触发文件选择。
    </p>
    <CommonUpload
      variant="button"
      accept={UPLOAD_CONFIG.accept}
      maxLength={UPLOAD_CONFIG.maxCount}
      fileSize={UPLOAD_CONFIG.maxSize}
    >
      <span className={classNames('upload-button-demo-wrapper', styles['upload-button-demo-wrapper'])}>
        选择文件上传
      </span>
    </CommonUpload>
  </div>
);

export default UploadButtonDemo;
