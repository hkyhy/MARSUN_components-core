import { InteractiveBlock, SEMANTIC_COLORS } from '@/components';
import { useState } from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

/**
 * InteractiveBlock inset 列表表面
 */
const InteractiveBlockInsetDemo: React.FC = () => {
  const [selected, setSelected] = useState('a');

  return (
    <ul
      className={classNames(
        'marsun-interactive-block-inset-demo',
        styles['marsun-interactive-block-inset-demo'],
      )}
    >
      {[
        { id: 'a', title: '千米棉结+200% · 八分厂' },
        { id: 'b', title: '强力 CV · 一分厂' },
      ].map((item) => (
        <li key={item.id}>
          <InteractiveBlock
            surface="inset"
            selected={selected === item.id}
            title={item.title}
            subtitle="品种 · 月份"
            tags={[{ label: '预警入口', color: SEMANTIC_COLORS.PROCESSING }]}
            actions={[{ key: 'export', label: '导出', onClick: () => undefined }]}
            onClick={() => setSelected(item.id)}
          />
        </li>
      ))}
    </ul>
  );
};

export default InteractiveBlockInsetDemo;
