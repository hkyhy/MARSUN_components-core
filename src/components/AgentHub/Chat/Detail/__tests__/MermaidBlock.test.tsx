import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MermaidBlock from '../MermaidBlock';

const mockRender = vi.fn();

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: (...args: unknown[]) => mockRender(...args),
  },
}));

describe('MermaidBlock', () => {
  beforeEach(() => {
    mockRender.mockReset();
    mockRender.mockResolvedValue({ svg: '<svg data-testid="mermaid-svg"></svg>' });
  });

  it('renders raw mermaid source when enabled is false', () => {
    render(<MermaidBlock chart="graph LR\n  A --> B" enabled={false} />);

    expect(screen.getByText(/graph LR/)).toBeInTheDocument();
    expect(screen.getByText(/A --> B/)).toBeInTheDocument();
    expect(mockRender).not.toHaveBeenCalled();
  });

  it('calls mermaid.render and shows svg when enabled', async () => {
    const chart = `graph LR
  A --> B`;
    render(<MermaidBlock chart={chart} enabled />);

    await waitFor(() => {
      expect(mockRender).toHaveBeenCalledTimes(1);
    });

    expect(mockRender.mock.calls[0]?.[1]).toBe(chart);
    expect(screen.getByTestId('mermaid-svg')).toBeInTheDocument();
  });

  it('falls back to source when mermaid.render fails', async () => {
    mockRender.mockRejectedValueOnce(new Error('parse error'));

    render(<MermaidBlock chart="graph LR\n  A --> B" enabled />);

    await waitFor(() => {
      expect(screen.getByText('图表语法有误，无法渲染')).toBeInTheDocument();
    });

    expect(screen.getByText(/graph LR/)).toBeInTheDocument();
  });
});
