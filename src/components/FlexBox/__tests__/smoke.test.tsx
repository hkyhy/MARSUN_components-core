import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FlexBox, FlexBoxFetch, useFlexBox } from '../index.js';

describe('FlexBox', () => {
  it('exports FlexBox, FlexBoxFetch and useFlexBox', () => {
    expect(FlexBox).toBeTruthy();
    expect(FlexBoxFetch).toBeTruthy();
    expect(typeof useFlexBox).toBe('function');
    expect(FlexBox.Item).toBeTruthy();
    expect(FlexBoxFetch.Item).toBeTruthy();
  });

  it('mounts FlexBox with dataSource without throw', () => {
    render(
      <FlexBox
        dataSource={[{ title: 'A' }]}
        renderItem={(item: { title: string }) => <FlexBox.Item>{item.title}</FlexBox.Item>}
      />,
    );
    expect(document.body).toBeTruthy();
  });
});
