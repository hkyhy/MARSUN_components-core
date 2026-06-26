import { describe, expect, it } from 'vitest';
import { sanitizeMermaidChart } from '../sanitizeMermaidChart';

describe('sanitizeMermaidChart', () => {
  it('quotes square-bracket labels containing parentheses', () => {
    const input = 'B --> C[梳理(生條)]';
    expect(sanitizeMermaidChart(input)).toBe('B --> C["梳理(生條)"]');
  });

  it('quotes labels with fullwidth parentheses', () => {
    const input = 'A[并条机（预并）]';
    expect(sanitizeMermaidChart(input)).toBe('A["并条机（预并）"]');
  });

  it('quotes diamond node labels with special characters', () => {
    const input = 'E{选择(A)}';
    expect(sanitizeMermaidChart(input)).toBe('E{"选择(A)"}');
  });

  it('leaves simple labels unchanged', () => {
    const input = 'A[原綿] --> B[開清綿]';
    expect(sanitizeMermaidChart(input)).toBe(input);
  });

  it('does not double-quote already quoted labels', () => {
    const input = 'E -- "一般產品" --> F[條捲機]';
    expect(sanitizeMermaidChart(input)).toBe(input);
  });

  it('sanitizes the full combed-cotton flowchart from chat', () => {
    const input = `graph TD;
    A[原綿] --> B[開清綿];
    B --> C[梳理(生條)];
    D --> E{選擇準備方式};`;

    const result = sanitizeMermaidChart(input);
    expect(result).toContain('C["梳理(生條)"]');
    expect(result).toContain('A[原綿]');
    expect(result).toContain('E{選擇準備方式}');
  });

  it('strips prose lines accidentally included in mermaid blocks', () => {
    const input = `graph TD
A[开松] --> B[梳理]
风格说明：
使用圆角矩形表示设备节点，
虚线连接质量指标与后续步骤。`;

    const result = sanitizeMermaidChart(input);
    expect(result).toContain('A[开松] --> B[梳理]');
    expect(result).not.toContain('风格说明');
    expect(result).not.toContain('虚线连接');
  });
});
