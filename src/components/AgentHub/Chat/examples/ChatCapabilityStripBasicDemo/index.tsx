import ChatCapabilityStrip, {
  type ChatCapabilityItem,
} from '@/components/AgentHub/Chat/Detail/ChatCapabilityStrip';
import classNames from 'classnames';
import { useState } from 'react';
import styles from './style.module.scss';

const DEMO_CAPABILITIES: ReadonlyArray<ChatCapabilityItem> = [
  {
    id: 'indicator',
    label: '指标时序',
    examples: ['七分厂 JCF5.9KD 条干CV% 近3个月折线', '八分厂 MCFS9.8KD 毛羽H近7天曲线'],
  },
  {
    id: 'process_params',
    label: '工艺变更',
    examples: ['查询当前近7天的工艺变更记录', '查一分厂近30天工艺变更'],
  },
  {
    id: 'alert_records',
    label: '预警落库',
    examples: ['查询当前近7天的预警记录', '一分厂今天有哪些预警'],
  },
];

const ChatCapabilityStripBasicDemo: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>('indicator');
  const [lastSelected, setLastSelected] = useState('');

  return (
    <div
      className={classNames(
        'chat-capability-strip-basic-demo-root',
        styles['chat-capability-strip-basic-demo-root'],
      )}
    >
      <ChatCapabilityStrip
        capabilities={DEMO_CAPABILITIES}
        expandedId={expandedId}
        onExpandedChange={setExpandedId}
        onSelectExample={setLastSelected}
      />
      {lastSelected ? (
        <p className={styles['chat-capability-strip-basic-demo-selected']}>
          已选样例：{lastSelected}
        </p>
      ) : null}
    </div>
  );
};

export default ChatCapabilityStripBasicDemo;
