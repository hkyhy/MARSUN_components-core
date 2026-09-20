import ChatPanelHeaderTools from '@/components/AgentHub/Chat/Detail/ChatPanelHeaderTools';
import classNames from 'classnames';
import { useState } from 'react';
import styles from './style.module.scss';

const ChatPanelHeaderToolsBasicDemo: React.FC = () => {
  const [contentZoom, setContentZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [sessionTick, setSessionTick] = useState(0);

  return (
    <div
      className={classNames(
        'chat-panel-header-tools-basic-demo-root',
        styles['chat-panel-header-tools-basic-demo-root'],
      )}
    >
      <ChatPanelHeaderTools
        contentZoom={contentZoom}
        onContentZoomChange={setContentZoom}
        fullscreen={fullscreen}
        onFullscreenChange={setFullscreen}
        onNewSession={() => setSessionTick((n) => n + 1)}
      />
      <p className={styles['chat-panel-header-tools-basic-demo-status']}>
        缩放 {Math.round(contentZoom * 100)}% · {fullscreen ? '全屏' : '窗口'} · 新建次数{' '}
        {sessionTick}
      </p>
    </div>
  );
};

export default ChatPanelHeaderToolsBasicDemo;
