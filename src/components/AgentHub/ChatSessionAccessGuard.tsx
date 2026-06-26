import React from 'react';
import { Navigate } from 'react-router-dom';

export interface AgentHubSessionAccessGuardProps {
  hasAccess?: boolean;
  redirectTo?: string;
  children: React.ReactNode;
}

const AgentHubSessionAccessGuard: React.FC<AgentHubSessionAccessGuardProps> = ({
  hasAccess = true,
  redirectTo = '/agent-hub/chat',
  children,
}) => {
  if (!hasAccess) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
};

export default AgentHubSessionAccessGuard;
