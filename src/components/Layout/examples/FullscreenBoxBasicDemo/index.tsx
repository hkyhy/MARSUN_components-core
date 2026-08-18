import { useState } from 'react';
import FullscreenBox, { FullscreenToggle } from '../../FullscreenBox';
import styles from './style.module.scss';

/** 图标按钮：预警详情等标题较长时，全屏放在操作区 */
const FullscreenBoxBasicDemo: React.FC = () => {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <FullscreenBox
      className={styles['fullscreen-box-basic-demo']}
      fullscreen={fullscreen}
      onFullscreenChange={setFullscreen}
    >
      <header className={styles['fullscreen-box-basic-demo-header']}>
        <div>
          <span className={styles['fullscreen-box-basic-demo-eyebrow']}>预警详情</span>
          <p className={styles['fullscreen-box-basic-demo-title']}>分厂 · 品种 · 指标</p>
        </div>
        <FullscreenToggle fullscreen={fullscreen} onToggle={() => setFullscreen((v) => !v)} />
      </header>
      <p className={styles['fullscreen-box-basic-demo-body']}>
        铺满视口后便于查看长趋势与滑块；Esc 退出。
      </p>
    </FullscreenBox>
  );
};

export default FullscreenBoxBasicDemo;
