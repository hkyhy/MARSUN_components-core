import { CommonUpload } from '@/components';
import React from 'react';
import { UPLOAD_CONFIG } from '../mock';
import styles from './style.module.scss';
import classNames from 'classnames';

/** 面板模式 — 拖拽上传区域 */
const UploadPanelDemo: React.FC = () => (
  <div className={classNames('upload-panel-demo-root', styles['upload-panel-demo-root'])}>
    <p className={classNames('upload-panel-demo-container', styles['upload-panel-demo-container'])}>
      variant=&quot;panel&quot; — 显示拖拽面板，支持拖拽或点击选择文件。
    </p>
    <CommonUpload
      variant="panel"
      accept={UPLOAD_CONFIG.accept}
      maxLength={UPLOAD_CONFIG.maxCount}
      fileSize={UPLOAD_CONFIG.maxSize}
    />
  </div>
);

export default UploadPanelDemo;
