import { describe, expect, it } from 'vitest';
import getFilterValue from '../getFilterValue';
import pickSelectValues from '../pickSelectValues';

describe('ReactFilter getFilterValue', () => {
  it('flattens single and multi values', () => {
    expect(
      getFilterValue([
        { name: 'keyword', label: '关键词', value: { label: 'test', value: 'test' } },
        {
          name: 'status',
          label: '状态',
          value: [
            { label: '已完成', value: 'done' },
            { label: '进行中', value: 'doing' },
          ],
        },
      ]),
    ).toEqual({ keyword: 'test', status: ['done', 'doing'] });
  });

  it('pickSelectValues supports value and id shapes', () => {
    expect(pickSelectValues([{ value: 1 }, { id: 2 }, '3'])).toEqual(['1', '2', '3']);
    expect(pickSelectValues({ value: 'open' })).toEqual(['open']);
    expect(pickSelectValues(null)).toEqual([]);
  });
});
