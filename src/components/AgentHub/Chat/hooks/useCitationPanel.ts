import type { Citation } from '@/components/AgentHub/types';
import { useCallback, useState } from 'react';

export interface UseCitationPanelResult {
  citationOpen: boolean;
  panelCitations: Citation[];
  highlightedCitationIndex: number | undefined;
  handleCitationClick: (items: Citation[], index?: number) => void;
  closeCitationPanel: () => void;
  resetCitationState: () => void;
}

/** FAB / 会话布局：点击消息角标打开 CitationPanel 的受控状态 */
export function useCitationPanel(): UseCitationPanelResult {
  const [citationOpen, setCitationOpen] = useState(false);
  const [panelCitations, setPanelCitations] = useState<Citation[]>([]);
  const [highlightedCitationIndex, setHighlightedCitationIndex] = useState<number | undefined>();

  const resetCitationState = useCallback(() => {
    setCitationOpen(false);
    setPanelCitations([]);
    setHighlightedCitationIndex(undefined);
  }, []);

  const handleCitationClick = useCallback((items: Citation[], index?: number) => {
    setPanelCitations(items);
    setHighlightedCitationIndex(index);
    setCitationOpen(true);
  }, []);

  const closeCitationPanel = useCallback(() => {
    setCitationOpen(false);
  }, []);

  return {
    citationOpen,
    panelCitations,
    highlightedCitationIndex,
    handleCitationClick,
    closeCitationPanel,
    resetCitationState,
  };
}
