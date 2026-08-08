import { describe, expect, it } from 'vitest';
import flattenSelectTreeOptions from '../flattenSelectTreeOptions';

describe('flattenSelectTreeOptions', () => {
  it('returns flat parentId lists unchanged', () => {
    const flat = [
      { id: 'a', name: 'A', parentId: null },
      { id: 'a1', name: 'A1', parentId: 'a' },
    ];
    expect(flattenSelectTreeOptions(flat)).toEqual(flat);
  });

  it('flattens nested children for SelectTree parseTreeData', () => {
    const nested = [
      {
        id: 'word',
        name: 'Word文档',
        parentId: null,
        children: [
          { id: '.docx', name: '.docx', parentId: 'word' },
          { id: '.doc', name: '.doc', parentId: 'word' },
        ],
      },
      {
        id: 'pdf',
        name: 'PDF文档',
        parentId: null,
        children: [{ id: '.pdf', name: '.pdf', parentId: 'pdf' }],
      },
    ];

    expect(flattenSelectTreeOptions(nested)).toEqual([
      { id: 'word', name: 'Word文档', parentId: null },
      { id: '.docx', name: '.docx', parentId: 'word' },
      { id: '.doc', name: '.doc', parentId: 'word' },
      { id: 'pdf', name: 'PDF文档', parentId: null },
      { id: '.pdf', name: '.pdf', parentId: 'pdf' },
    ]);
  });
});
