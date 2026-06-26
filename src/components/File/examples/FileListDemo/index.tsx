import { FileItemView, FileLink, SEMANTIC_COLORS, SemanticTag } from '@/components';
import { message } from 'antd';
import React from 'react';
import { mockFileItems } from '../mock';
import styles from './style.module.scss';
import classNames from 'classnames';

/** 多文件项组合展示（core 不含 FileList 容器，由消费方组合 FileItemView / FileLink） */
const FileListDemo: React.FC = () => {
  return (
    <div className={classNames('file-list-demo-banner', styles['file-list-demo-banner'])}>
      <h4 className={classNames('file-list-demo-scroll', styles['file-list-demo-scroll'])}>FileItemView 列表</h4>
      <div>
        {mockFileItems.slice(0, 3).map((file) => (
          <FileItemView
            key={file.id}
            file={file}
            status={<SemanticTag color={SEMANTIC_COLORS.INFO}>示例</SemanticTag>}
            showDelete
            onDelete={(f) => message.info(`删除: ${f.name}`)}
          />
        ))}
      </div>

      <h4 className={classNames('file-list-demo-viewport', styles['file-list-demo-viewport'])}>FileLink 列表</h4>
      <div>
        {mockFileItems.map((file) => (
          <FileLink key={file.id} file={file} onClick={(f) => message.info(`点击: ${f.name}`)} />
        ))}
      </div>

      <h4 className={classNames('file-list-demo-viewport', styles['file-list-demo-viewport'])}>混合展示</h4>
      <div>
        {mockFileItems.slice(0, 2).map((file) => (
          <FileItemView key={file.id} file={file} />
        ))}
        <div style={{ marginTop: 8 }}>
          附件：
          {mockFileItems.slice(2, 4).map((file) => (
            <FileLink key={file.id} file={file} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileListDemo;
