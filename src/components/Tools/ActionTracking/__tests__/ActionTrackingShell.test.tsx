import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageShellProvider } from '../../../Layout/PageShell';
import ActionTrackingShell from '../ActionTrackingShell';

describe('ActionTrackingShell', () => {
  it('renders filter / list / modal slots', () => {
    render(
      <PageShellProvider>
        <ActionTrackingShell
          title="行动跟踪"
          filterSlot={<div>筛选区</div>}
          listSlot={<div>列表区</div>}
          modalSlot={<div>弹层区</div>}
        />
      </PageShellProvider>,
    );
    expect(screen.getByText('筛选区')).toBeTruthy();
    expect(screen.getByText('列表区')).toBeTruthy();
    expect(screen.getByText('弹层区')).toBeTruthy();
  });
});
