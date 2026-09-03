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
});
