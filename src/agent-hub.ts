/**
 * L2 产品域入口：`@hkyhy/marsun-components-core/agent-hub`
 * 新代码须从此子路径 import；包根 re-export 为迁移期 @deprecated。
 */
export { default as AgentHubAccessGuard } from './components/AgentHub/AgentHubAccessGuard';
export { default as AgentHubIndexRedirect } from './components/AgentHub/AgentHubIndexRedirect';
export { default as AgentHubSessionAccessGuard } from './components/AgentHub/ChatSessionAccessGuard';
export type * from './components/AgentHub/types';
export * from './components/AgentHub/Chat';
export * from './components/AgentHub/KnowledgeBase';
export * from './components/AgentHub/Report';
