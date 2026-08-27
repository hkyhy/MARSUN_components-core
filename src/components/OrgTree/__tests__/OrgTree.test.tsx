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

  it('does not expand grandchildren by default (depth=1)', () => {
    render(
      <OrgTree
        nodes={[
          {
            id: '1',
            name: '根',
            children: [
              {
                id: '2',
                name: '子',
                parentId: '1',
                children: [{ id: '3', name: '孙', parentId: '2' }],
              },
            ],
          },
        ]}
      />,
    );
    expect(screen.getByText('根')).toBeInTheDocument();
    expect(screen.getByText('子')).toBeInTheDocument();
    expect(screen.queryByText('孙')).not.toBeInTheDocument();
  });
});
