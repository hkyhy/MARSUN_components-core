import type { ComponentType, ReactNode } from 'react';
import { Info } from '@/components/Icons';
import { TooltipInfo } from '@/components/TooltipInfo';

/**
 * kne 原生会把字符串 `labelTips` 直接拼进 label 旁正文。
 * core 约定：字符串 / 数字 → Info + TooltipInfo（悬停说明）；
 * 已是 ReactNode / function → 原样透传（业务可自定义）。
 * 必填仍用 `rule="REQ"`，不要把「必填/选填」写进 tip。
 */
export function normalizeLabelTips(labelTips: unknown): ReactNode | undefined {
  if (labelTips == null || labelTips === false) {
    return undefined;
  }
  if (typeof labelTips === 'string' || typeof labelTips === 'number') {
    const text = String(labelTips).trim();
    if (!text) {
      return undefined;
    }
    return (
      <TooltipInfo
        type="note"
        note={{ title: '说明', description: text }}
        minWidth={220}
        maxWidth={360}
      >
        <Info
          size={14}
          aria-label="说明"
          style={{ marginLeft: 4, cursor: 'pointer', verticalAlign: '-2px' }}
        />
      </TooltipInfo>
    );
  }
  return labelTips as ReactNode;
}

type WithLabelTips = { labelTips?: unknown };

/** 包装 kne 字段：拦截 labelTips 字符串并规范化 */
export function withNormalizedLabelTips<P extends WithLabelTips>(
  Comp: ComponentType<P>,
): ComponentType<P> {
  const Wrapped = (props: P) => {
    const { labelTips, ...rest } = props;
    const next = normalizeLabelTips(labelTips);
    return <Comp {...(rest as P)} {...(next !== undefined ? { labelTips: next } : {})} />;
  };
  const name = Comp.displayName || Comp.name || 'Field';
  Wrapped.displayName = `WithNormalizedLabelTips(${name})`;
  return Wrapped;
}
