import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import InfoPage, {
  Content,
  InfoList,
  Descriptions,
  DetailList,
  CentralContent,
  FieldView,
  SplitLine,
  Flow,
  Report,
  Score,
  formatView,
  computeColumnsValue,
  TableView,
} from '../index';
import { buildStackFlexColumns } from '../Content/index.jsx';

describe('InfoPage smoke', () => {
  it('exports key members', () => {
    expect(InfoPage).toBeTypeOf('function');
    expect(InfoPage.Part).toBeTypeOf('function');
    expect(InfoPage.Collapse).toBeTypeOf('function');
    expect(Content).toBeTypeOf('function');
    expect(InfoList).toBe(Content);
    expect(Descriptions).toBeTypeOf('function');
    expect(DetailList).toBe(Descriptions);
    expect(CentralContent).toBeTypeOf('function');
    expect(FieldView).toBe(CentralContent);
    expect(SplitLine).toBeTypeOf('function');
    expect(Flow).toBeTypeOf('function');
    expect(Report).toBeTruthy();
    expect(Score).toBeTypeOf('function');
    expect(formatView).toBeTypeOf('function');
    expect(computeColumnsValue).toBeTypeOf('function');
    expect(TableView).toBeTruthy();
  });

  it('mounts Part + Content without throwing', () => {
    render(
      <InfoPage>
        <InfoPage.Part title="基本信息">
          <Content list={[{ label: '名称', content: '测试设备' }]} col={1} />
        </InfoPage.Part>
      </InfoPage>,
    );
    expect(screen.getByText('基本信息')).toBeInTheDocument();
    expect(screen.getByText('测试设备')).toBeInTheDocument();
  });

  it('buildStackFlexColumns prefers one row when wide enough', () => {
    const cols = buildStackFlexColumns(5, 140);
    expect(cols).toHaveLength(5);
    expect(cols[0]).toEqual({ width: 140, col: 1 });
    expect(cols[4]).toEqual({ width: 700, col: 5 });
  });

  it('renders stack layout wrapper for FlexBox', () => {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get() {
        return 900;
      },
    });
    const { container } = render(
      <Content
        layout="stack"
        gutter={[16, 10]}
        list={[
          { label: '窗内超期次数', content: '0' },
          { label: '最近保养类型', content: '保养' },
          { label: '上次保养日', content: '2026-09-12' },
          { label: '当前周期（天）', content: '30' },
          { label: '当前超期（天）', content: '—' },
        ]}
      />,
    );
    const root = container.querySelector('[data-layout="stack"]');
    expect(root).not.toBeNull();
    expect(root?.className).toMatch(/layout-stack/);
  });
});
