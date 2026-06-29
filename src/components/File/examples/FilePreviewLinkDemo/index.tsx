import { FilePreviewLink } from '@/components';
import React from 'react';
import { mockFileItems } from '../mock';
import styles from './style.module.scss';
import classNames from 'classnames';

const FilePreviewLinkDemo: React.FC = () => {
  return (
    <div className={classNames('file-preview-link-demo', styles['file-preview-link-demo'])}>
      <h4>点击文件名打开预览弹窗</h4>
      <p className={styles['file-preview-link-demo-hint']}>
        组合 FileLink 样式与 FilePreviewModal，弹窗内支持下载
      </p>
      <div className={styles['file-preview-link-demo-list']}>
        {mockFileItems.slice(0, 4).map((file) => (
          <FilePreviewLink key={file.id} file={file} />
        ))}
      </div>
      <h4 className={styles['file-preview-link-demo-section']}>禁用态</h4>
      <FilePreviewLink file={mockFileItems[0]!} disabled />
    </div>
  );
};

export default FilePreviewLinkDemo;
