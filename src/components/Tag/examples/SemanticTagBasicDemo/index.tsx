import { SEMANTIC_COLORS, SemanticTag } from '@/components';
import React from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

/** 基础用法：展示所有预定义语义颜色 */
const SemanticTagBasicDemo: React.FC = () => (
  <div className={classNames('semantic-tag-basic-demo-root', styles['semantic-tag-basic-demo-root'])}>
    <SemanticTag color={SEMANTIC_COLORS.DEFAULT}>Default 默认</SemanticTag>
    <SemanticTag color={SEMANTIC_COLORS.INFO}>Info 信息</SemanticTag>
    <SemanticTag color={SEMANTIC_COLORS.PROCESSING}>Processing 进行中</SemanticTag>
    <SemanticTag color={SEMANTIC_COLORS.SUCCESS}>Success 成功</SemanticTag>
    <SemanticTag color={SEMANTIC_COLORS.WARNING}>Warning 警告</SemanticTag>
    <SemanticTag color={SEMANTIC_COLORS.DANGER}>Danger 危险</SemanticTag>
    <SemanticTag color={SEMANTIC_COLORS.OTHER}>Other 其他</SemanticTag>
    <SemanticTag color={SEMANTIC_COLORS.VOLCANO}>Volcano 火山</SemanticTag>
    <SemanticTag color={SEMANTIC_COLORS.CYAN}>Cyan 青色</SemanticTag>
    <SemanticTag color={SEMANTIC_COLORS.GOLD}>Gold 金色</SemanticTag>
    <SemanticTag color={SEMANTIC_COLORS.LIME}>Lime 石灰</SemanticTag>
  </div>
);

export default SemanticTagBasicDemo;
