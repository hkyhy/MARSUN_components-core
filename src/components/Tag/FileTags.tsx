import React from 'react';
import { SEMANTIC_COLORS } from './SemanticTag';
import Tags, { type TagsProps } from './Tags';

export type FileTagsProps = Omit<TagsProps, 'color'>;

/** 文件标签统一样式（Tags + INFO 色） */
const FileTags: React.FC<FileTagsProps> = (props) => (
  <Tags color={SEMANTIC_COLORS.INFO} {...props} />
);

export default FileTags;
