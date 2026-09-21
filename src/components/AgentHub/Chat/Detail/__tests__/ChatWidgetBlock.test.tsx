import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ChatWidgetBlock from '../ChatWidgetBlock';

describe('ChatWidgetBlock table normalize', () => {
  it('keeps legal {key,label} columns and object rows', () => {
    render(
      <ChatWidgetBlock
        widgets={[
          {
            type: 'table',
            title: '合法表',
            columns: [
              { key: 'name', label: '名称' },
              { key: 'value', label: '数值', width: 80 },
            ],
            rows: [{ name: 'A', value: 1 }],
          },
        ]}
      />,
    );

    expect(screen.getByText('名称')).toBeInTheDocument();
    expect(screen.getByText('数值')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders string[] columns and array rows without crashing', () => {
    render(
      <ChatWidgetBlock
        widgets={[
          {
            type: 'table',
            title: '容错表',
            // 运行时脏数据：契约外形态
            columns: ['机台', '单耗'] as unknown as { key: string; label: string }[],
            rows: [
              ['细纱1', 12.3],
              ['细纱2', 11.8],
            ] as unknown as Record<string, unknown>[],
          },
        ]}
      />,
    );

    expect(screen.getByText('机台')).toBeInTheDocument();
    expect(screen.getByText('单耗')).toBeInTheDocument();
    expect(screen.getByText('细纱1')).toBeInTheDocument();
    expect(screen.getByText('12.3')).toBeInTheDocument();
  });
});
