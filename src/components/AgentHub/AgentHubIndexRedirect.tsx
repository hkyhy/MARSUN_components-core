import React from 'react';
import { Navigate } from 'react-router-dom';

export interface AgentHubIndexRedirectProps {
  isAdmin?: boolean;
  adminPath?: string;
  userPath?: string;
}

const AgentHubIndexRedirect: React.FC<AgentHubIndexRedirectProps> = ({
  isAdmin = false,
  adminPath = '/agent-hub/chat',
  userPath = '/agent-hub/chat',
}) => <Navigate to={isAdmin ? adminPath : userPath} replace />;

export default AgentHubIndexRedirect;
