import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import OrgTree from '../OrgTree';

describe('OrgTree', () => {
  it('renders node names', () => {
    render(
      <OrgTree
        nodes={[
          {
            id: '1',
            name: '根组织',
            children: [{ id: '2', name: '子组织', parentId: '1' }],
          },
        ]}
      />,
    );
    expect(screen.getByText('根组织')).toBeInTheDocument();
    expect(screen.getByText('子组织')).toBeInTheDocument();
  });
});
