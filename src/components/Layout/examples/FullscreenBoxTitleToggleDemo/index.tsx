import { useState } from 'react';
import FullscreenBox, { FullscreenToggle } from '../../FullscreenBox';
import styles from './style.module.scss';

/** 标题即开关：对比矩阵等短标题，点标题或图标均可铺满 */
const FullscreenBoxTitleToggleDemo: React.FC = () => {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <FullscreenBox
      className={styles['fullscreen-box-title-demo']}
      fullscreenClassName={styles['fullscreen-box-title-demo--open']}
      fullscreen={fullscreen}
      onFullscreenChange={setFullscreen}
    >
      <FullscreenToggle fullscreen={fullscreen} onToggle={() => setFullscreen((v) => !v)}>
        对比矩阵
      </FullscreenToggle>
      <p className={styles['fullscreen-box-title-demo-sub']}>
        三级表头较宽时铺满视口便于横向浏览。
      </p>
    </FullscreenBox>
  );
};

export default FullscreenBoxTitleToggleDemo;
