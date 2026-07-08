import ChatWidgetBlock from '@/components/AgentHub/Chat/Detail/ChatWidgetBlock';
import { mockAssistantWidgetMessage } from '../mock';
import styles from './style.module.scss';

const ChatWidgetBlockBasicDemo: React.FC = () => (
  <div className={styles['chat-widget-block-basic-demo']}>
    <ChatWidgetBlock widgets={mockAssistantWidgetMessage.widgets} />
  </div>
);

export default ChatWidgetBlockBasicDemo;
