import ChatAgentFab from '@/components/AgentHub/Chat/Detail/ChatAgentFab';
import ChatAgentFabLayout from '@/components/AgentHub/Chat/Detail/ChatAgentFabLayout';
import ChatCapabilityStrip, {
  type ChatCapabilityItem,
} from '@/components/AgentHub/Chat/Detail/ChatCapabilityStrip';
import ChatFollowUpSuggestions from '@/components/AgentHub/Chat/Detail/ChatFollowUpSuggestions';
import ChatPanel from '@/components/AgentHub/Chat/Detail/ChatPanel';
import ChatPanelHeaderTools from '@/components/AgentHub/Chat/Detail/ChatPanelHeaderTools';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { mockAssistantMessage, mockUserMessage } from '../mock';
import styles from './style.module.scss';

const DEMO_CAPABILITIES: ReadonlyArray<ChatCapabilityItem> = [
  {
    id: 'indicator',
    label: '指标时序',
    examples: ['七分厂条干CV%近3个月折线', '八分厂毛羽H近7天曲线'],
  },
  {
    id: 'q5_knowledge',
    label: '知识文献',
    examples: ['条干CV%是什么？', '棉结产生的主要原因有哪些'],
  },
];

const ChatPanelComposeDemo: React.FC = () => {
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState('');
  const [contentZoom, setContentZoom] = useState(1);
  const [panelFullscreen, setPanelFullscreen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>('indicator');
  const [messages, setMessages] = useState([mockUserMessage, mockAssistantMessage]);
  const [followUps] = useState(['继续看近30天趋势', '换成柱状图']);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setPanelFullscreen(false);
  };

  const sendText = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `compose-user-${prev.length}`, role: 'user' as const, content: text },
      {
        id: `compose-bot-${prev.length}`,
        role: 'assistant' as const,
        content: `已收到「${text}」。`,
      },
    ]);
  };

  const headerActions = useMemo(
    () => (
      <ChatPanelHeaderTools
        contentZoom={contentZoom}
        onContentZoomChange={setContentZoom}
        fullscreen={panelFullscreen}
        onFullscreenChange={setPanelFullscreen}
        onNewSession={() => {
          setMessages([]);
          setExpandedId('indicator');
        }}
      />
    ),
    [contentZoom, panelFullscreen],
  );

  const capabilityStrip = (
    <ChatCapabilityStrip
      capabilities={DEMO_CAPABILITIES}
      expandedId={expandedId}
      onExpandedChange={setExpandedId}
      onSelectExample={sendText}
    />
  );

  return (
    <div
      className={classNames('chat-panel-compose-demo-root', styles['chat-panel-compose-demo-root'])}
      style={{ ['--demo-chat-zoom' as string]: String(contentZoom) }}
    >
      <ChatAgentFab
        open={open}
        onOpenChange={handleOpenChange}
        panelFullscreen={panelFullscreen}
        closeOnClickOutside={!panelFullscreen}
        panelAriaLabel="能力条组合演示"
      >
        <ChatAgentFabLayout
          main={
            <ChatPanel
              className={styles['chat-panel-compose-demo-panel']}
              title="能力条组合"
              subtitle="headerExtra=Strip · headerActions=Tools · afterMessages=FollowUp"
              showCloseButton
              onClose={() => handleOpenChange(false)}
              headerActions={headerActions}
              headerExtra={capabilityStrip}
              messages={messages}
              afterMessages={
                followUps.length > 0 ? (
                  <ChatFollowUpSuggestions items={followUps} onSelect={sendText} />
                ) : null
              }
              inputValue={input}
              onInputChange={setInput}
              onSend={() => {
                if (!input.trim()) return;
                sendText(input.trim());
                setInput('');
              }}
            />
          }
        />
      </ChatAgentFab>
    </div>
  );
};

export default ChatPanelComposeDemo;
