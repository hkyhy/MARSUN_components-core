import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StepModal from '../StepModal';
import type { StepItem } from '../StepModalTypes';

const mockSteps: StepItem[] = [
  {
    key: 'step1',
    title: '第一步',
    content: <div>步骤1内容</div>,
  },
  {
    key: 'step2',
    title: '第二步',
    content: () => <div>步骤2内容</div>,
  },
  {
    key: 'step3',
    title: '第三步',
    content: <div>步骤3内容</div>,
  },
];

describe('StepModal', () => {
  it('renders with first step content', () => {
    render(
      <StepModal
        open
        current="step1"
        onCancel={() => {}}
        steps={mockSteps}
      />,
    );
    expect(screen.getByText('步骤1内容')).toBeInTheDocument();
    expect(screen.getAllByText('第一步').length).toBeGreaterThan(0);
  });

  it('renders function content correctly', () => {
    render(
      <StepModal
        open
        current="step2"
        onCancel={() => {}}
        steps={mockSteps}
      />,
    );
    expect(screen.getByText('步骤2内容')).toBeInTheDocument();
  });

  it('shows default footer with cancel and next buttons', () => {
    render(
      <StepModal
        open
        current="step1"
        onCancel={() => {}}
        steps={mockSteps}
      />,
    );
    expect(screen.getByRole('button', { name: /取\s*消/ })).toBeInTheDocument();
    expect(screen.getByText('下一步')).toBeInTheDocument();
  });

  it('shows back button on non-first step', () => {
    render(
      <StepModal
        open
        current="step2"
        onCancel={() => {}}
        steps={mockSteps}
      />,
    );
    expect(screen.getByText('上一步')).toBeInTheDocument();
  });

  it('hides next button on last step', () => {
    render(
      <StepModal
        open
        current="step3"
        onCancel={() => {}}
        steps={mockSteps}
      />,
    );
    expect(screen.queryByText('下一步')).not.toBeInTheDocument();
  });

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = vi.fn();
    render(
      <StepModal
        open
        current="step1"
        onCancel={onCancel}
        steps={mockSteps}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /取\s*消/ }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('calls onStepChange when next button clicked', () => {
    const onStepChange = vi.fn();
    render(
      <StepModal
        open
        current="step1"
        onCancel={() => {}}
        onStepChange={onStepChange}
        steps={mockSteps}
      />,
    );
    fireEvent.click(screen.getByText('下一步'));
    expect(onStepChange).toHaveBeenCalledWith('step2');
  });

  it('calls onStepChange when back button clicked', () => {
    const onStepChange = vi.fn();
    render(
      <StepModal
        open
        current="step2"
        onCancel={() => {}}
        onStepChange={onStepChange}
        steps={mockSteps}
      />,
    );
    fireEvent.click(screen.getByText('上一步'));
    expect(onStepChange).toHaveBeenCalledWith('step1');
  });

  it('respects custom footer', () => {
    const customSteps: StepItem[] = [
      {
        key: 'step1',
        title: '第一步',
        content: <div>内容</div>,
        footer: <button type="button">自定义按钮</button>,
      },
    ];
    render(
      <StepModal
        open
        current="step1"
        onCancel={() => {}}
        steps={customSteps}
      />,
    );
    expect(screen.getByText('自定义按钮')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /取\s*消/ })).not.toBeInTheDocument();
  });

  it('respects allowBack=false', () => {
    const noBackSteps: StepItem[] = [
      { key: 'step1', title: '第一步', content: <div>1</div> },
      { key: 'step2', title: '第二步', content: <div>2</div>, allowBack: false },
    ];
    render(
      <StepModal
        open
        current="step2"
        onCancel={() => {}}
        steps={noBackSteps}
      />,
    );
    expect(screen.queryByText('上一步')).not.toBeInTheDocument();
  });

  it('does not render Steps navigation when showSteps=false', () => {
    const { container } = render(
      <StepModal
        open
        current="step1"
        onCancel={() => {}}
        steps={mockSteps}
        showSteps={false}
      />,
    );
    expect(container.querySelector('.ant-steps')).not.toBeInTheDocument();
  });

  it('uses custom title over step title', () => {
    render(
      <StepModal
        open
        current="step1"
        onCancel={() => {}}
        steps={mockSteps}
        title="自定义标题"
      />,
    );
    expect(screen.getByText('自定义标题')).toBeInTheDocument();
  });
});
