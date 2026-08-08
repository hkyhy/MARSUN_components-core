import { createTreeUtils } from '@kne/super-select';
import { describe, expect, it } from 'vitest';
import buildSelectTreeMapping from '../buildSelectTreeMapping';

describe('buildSelectTreeMapping', () => {
  const flat = [
    { id: 'word', name: 'Word文档', parentId: null },
    { id: '.docx', name: '.docx', parentId: 'word' },
    { id: '.doc', name: '.doc', parentId: 'word' },
    { id: 'pdf', name: 'PDF文档', parentId: null },
    { id: '.pdf', name: '.pdf', parentId: 'pdf' },
  ];

  it('attaches children for createTreeUtils', () => {
    const mapping = buildSelectTreeMapping(flat);
    expect(
      mapping
        .get('word')
        ?.children.map((c: { id: string }) => c.id)
        .sort(),
    ).toEqual(['.doc', '.docx']);
    expect(mapping.get('pdf')?.children.map((c: { id: string }) => c.id)).toEqual(['.pdf']);
  });

  it('parent check marks descendants checked via computedCheckboxStatus', () => {
    const treeUtils = createTreeUtils(buildSelectTreeMapping(flat));
    const next = treeUtils.setNodeChecked('pdf', []);
    expect(next).toEqual(['pdf']);
    expect(treeUtils.computedCheckboxStatus('.pdf', next)).toEqual({
      checked: true,
      indeterminate: false,
    });
    expect(treeUtils.computedCheckboxStatus('pdf', next)).toEqual({
      checked: true,
      indeterminate: false,
    });
  });
});
