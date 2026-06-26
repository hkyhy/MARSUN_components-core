import { FileItemView, SEMANTIC_COLORS, SemanticTag } from '@/components';
import type { FileItemAction } from '@/components/File/FileItem';
import { message } from 'antd';
import React from 'react';
import { mockFileItems, mockUrlOnlyFileItems } from '../mock';
import styles from './style.module.scss';
import classNames from 'classnames';

const customActions: FileItemAction[] = [
  {
    key: 'share',
    icon: <span className={classNames('file-item-basic-demo-value', styles['file-item-basic-demo-value'])}>📤</span>,
    tooltip: '分享',
    onClick: (file) => message.info(`分享: ${file.name}`),
  },
];

const FileItemBasicDemo: React.FC = () => {
  return (
    <div className={classNames('file-item-basic-demo-preview', styles['file-item-basic-demo-preview'])}>
      <h4 className={classNames('file-item-basic-demo-scroll', styles['file-item-basic-demo-scroll'])}>基础用法（图标 + 文件名 + 操作）</h4>
      {mockFileItems.slice(0, 3).map((file) => (
        <FileItemView key={file.id} file={file} />
      ))}

      <h4 className={classNames('file-item-basic-demo-viewport', styles['file-item-basic-demo-viewport'])}>带状态标签（slot）</h4>
      {mockFileItems.slice(0, 3).map((file, i) => (
        <FileItemView
          key={file.id}
          file={file}
          status={
            <SemanticTag color={i === 0 ? SEMANTIC_COLORS.SUCCESS : i === 1 ? SEMANTIC_COLORS.WARNING : SEMANTIC_COLORS.INFO}>
              {i === 0 ? '已完成' : i === 1 ? '处理中' : '待处理'}
            </SemanticTag>
          }
        />
      ))}

      <h4 className={classNames('file-item-basic-demo-viewport', styles['file-item-basic-demo-viewport'])}>仅 URL（自动解析文件名）</h4>
      {mockUrlOnlyFileItems.map((file) => (
        <FileItemView key={file.id} file={file} />
      ))}

      <h4 className={classNames('file-item-basic-demo-viewport', styles['file-item-basic-demo-viewport'])}>带删除和自定义操作</h4>
      {mockFileItems.slice(0, 2).map((file) => (
        <FileItemView
          key={file.id}
          file={file}
          showDelete
          actions={customActions}
          onDelete={(f) => message.info(`删除: ${f.name}`)}
        />
      ))}
    </div>
  );
};

export default FileItemBasicDemo;
