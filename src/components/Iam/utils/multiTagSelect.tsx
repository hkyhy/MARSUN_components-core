import { SEMANTIC_COLORS, SemanticTag } from '@/components/Tag';
import type { ReactNode } from 'react';

/** 与 Assets 文件标签一致：最多展示 2 个，超出 +N */
export const MULTI_TAG_SHOW_LENGTH = 2;

type TagRenderProps = {
  label: ReactNode;
  closable: boolean;
  onClose: () => void;
};

/** Form/antd Select 多选：SemanticTag + maxTagCount 防重叠 */
export const multiTagSelectProps = {
  maxTagCount: MULTI_TAG_SHOW_LENGTH,
  maxTagPlaceholder: (omitted: unknown[]) => `+${omitted.length}`,
  tagRender: ({ label, closable, onClose }: TagRenderProps) => (
    <SemanticTag
      color={SEMANTIC_COLORS.INFO}
      closable={closable}
      onClose={onClose}
      style={{ marginInlineEnd: 4 }}
    >
      {label}
    </SemanticTag>
  ),
};
