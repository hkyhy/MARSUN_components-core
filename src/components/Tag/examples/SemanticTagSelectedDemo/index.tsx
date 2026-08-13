import { SEMANTIC_COLORS, SemanticTag } from '@/components';
import React, { useState } from 'react';
import classNames from 'classnames';
import styles from './style.module.scss';

const OPTIONS: Array<{ key: string; color: string; label: string }> = [
  { key: 'cv', color: SEMANTIC_COLORS.DANGER, label: '条干CV%' },
  { key: 'nep', color: SEMANTIC_COLORS.PROCESSING, label: '千米棉结+200%' },
  { key: 'hairiness', color: SEMANTIC_COLORS.WARNING, label: '毛羽H' },
  { key: 'a1', color: SEMANTIC_COLORS.DANGER, label: 'A1纱疵' },
  { key: 'h01', color: SEMANTIC_COLORS.PROCESSING, label: 'H01纱疵' },
];

/** 选中态：点击切换，强化同色背景 + 同色描边 + 加粗，24px 高度不变 */
const SemanticTagSelectedDemo: React.FC = () => {
  const [activeKey, setActiveKey] = useState<string>('cv');

  return (
    <div
      className={classNames(
        'semantic-tag-selected-demo-root',
        styles['semantic-tag-selected-demo-root'],
      )}
    >
      <div className={styles.row}>
        {OPTIONS.map((opt) => (
          <SemanticTag
            key={opt.key}
            color={opt.color}
            selected={activeKey === opt.key}
            onClick={() => setActiveKey(opt.key)}
            style={{ cursor: 'pointer' }}
          >
            {opt.label}
          </SemanticTag>
        ))}
      </div>
      <p className={styles.hint}>
        当前选中：<strong>{OPTIONS.find((o) => o.key === activeKey)?.label}</strong>
        {' · '}选中态反白：实色背景 + 白字 + 加粗，24px 高度不变。
      </p>
    </div>
  );
};

export default SemanticTagSelectedDemo;
