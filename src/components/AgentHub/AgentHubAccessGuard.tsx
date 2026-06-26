import React from 'react';
import { Navigate } from 'react-router-dom';

export interface AgentHubAccessGuardProps {
  mode: 'admin-only' | 'chat-manage';
  /** 是否管理员 */
  isAdmin?: boolean;
  /** 无权限时重定向路径 */
  redirectTo?: string;
  children: React.ReactNode;
}

const AgentHubAccessGuard: React.FC<AgentHubAccessGuardProps> = ({
  mode,
  isAdmin = false,
  redirectTo = '/',
  children,
}) => {
  if (isAdmin) return <>{children}</>;
  if (mode === 'admin-only' || mode === 'chat-manage') {
    return <Navigate to={redirectTo} replace />;
  }
  return <>{children}</>;
};

export default AgentHubAccessGuard;
