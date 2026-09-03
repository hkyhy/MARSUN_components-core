// @ts-nocheck
import React from 'react';

/** 标记为「占满整行」的嵌套模块（List / TableList / FormInfo / Steps） */
export const FORM_INFO_NEST_BLOCK = '__marsunFormInfoNestBlock';

/**
 * 嵌套深度：根 List = 第 1 级 = depth 0。
 * 第 5 级起（depth >= 4）走 nest-beyond；仅第 5 级画左侧色条。
 */
export const NEST_DEPTH_BEYOND = 4;

export const markNestBlock = <T>(Component: T): T => {
  if (Component && typeof Component === 'object') {
    (Component as Record<string, unknown>)[FORM_INFO_NEST_BLOCK] = true;
  } else if (typeof Component === 'function') {
    (Component as unknown as Record<string, unknown>)[FORM_INFO_NEST_BLOCK] = true;
  }
  return Component;
};

export const isNestBlockType = (type: unknown): boolean => {
  if (!type || (typeof type !== 'object' && typeof type !== 'function')) {
    return false;
  }
  const t = type as Record<string, unknown> & {
    type?: Record<string, unknown>;
    render?: Record<string, unknown>;
  };
  if (t[FORM_INFO_NEST_BLOCK]) {
    return true;
  }
  if (t.type?.[FORM_INFO_NEST_BLOCK] || t.render?.[FORM_INFO_NEST_BLOCK]) {
    return true;
  }
  return false;
};

export const isNestBlockElement = (element: unknown): boolean => {
  if (!element || typeof element !== 'object' || !('type' in element)) {
    return false;
  }
  return isNestBlockType((element as { type: unknown }).type);
};

/**
 * 给 list 内嵌套模块打上 block + nestDepth（只靠 props）
 */
export const decorateNestBlocks = (list: React.ReactNode[], nestDepth: number) =>
  (Array.isArray(list) ? list : []).map((item) => {
    if (!item || typeof item !== 'object' || !('type' in item) || !isNestBlockType(item.type)) {
      return item;
    }
    return React.cloneElement(item as React.ReactElement, {
      block: true,
      nestDepth,
    });
  });
