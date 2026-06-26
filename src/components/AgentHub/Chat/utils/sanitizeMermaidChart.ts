/** Characters inside node labels that require double-quoting in Mermaid. */
const LABEL_NEEDS_QUOTING_RE = /[(),（）:;#]/;

/** Fix AI-generated Mermaid blocks: quote labels, drop prose lines mistakenly inside the chart. */
const MERMAID_LINE_RE =
  /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|mindmap|timeline|gitGraph|C4Context|subgraph|end|style|classDef|class|linkStyle|click|direction|%%)/i;
const MERMAID_EDGE_RE = /(-->|---|-\.->|==>|===|-\.-)/;

/** Remove non-Mermaid prose lines (e.g. 风格说明) that LLMs append inside code blocks. */
export function stripProseFromMermaid(chart: string): string {
  return chart
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return true;
      if (MERMAID_LINE_RE.test(trimmed)) return true;
      if (MERMAID_EDGE_RE.test(trimmed)) return true;
      if (/^[A-Za-z0-9_]+[\[\{(]/.test(trimmed)) return true;
      if (/^[A-Za-z0-9_[\](){}<>"'\\.:;+\-/%&|=\s]+$/.test(trimmed)) return true;
      return false;
    })
    .join('\n')
    .trim();
}

function quoteLabelContent(label: string): string {
  const trimmed = label.trim();
  if (!trimmed || trimmed.startsWith('"') || trimmed.startsWith("'")) {
    return label;
  }
  if (!LABEL_NEEDS_QUOTING_RE.test(trimmed)) {
    return label;
  }
  return `"${trimmed.replace(/"/g, '\\"')}"`;
}

/**
 * Fix common AI-generated Mermaid syntax issues before rendering.
 * e.g. C[梳理(生條)] → C["梳理(生條)"]
 */
export function sanitizeMermaidChart(chart: string): string {
  const stripped = stripProseFromMermaid(chart);
  let result = stripped.replace(/\[([^\]"]+)\]/g, (_match, label: string) => {
    return `[${quoteLabelContent(label)}]`;
  });

  result = result.replace(/\{([^}"]+)\}/g, (_match, label: string) => {
    return `{${quoteLabelContent(label)}}`;
  });

  return result;
}
