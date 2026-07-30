export type ModalSize = 'S' | 'M' | 'L';

export const MODAL_SIZE_WIDTH: Record<ModalSize, number> = {
  S: 480,
  M: 720,
  L: 960,
};

/** 固定 body 可视高度（外壳不随内容无限长高） */
export const MODAL_SIZE_BODY_HEIGHT: Record<ModalSize, string> = {
  S: 'min(420px, 60vh)',
  M: 'min(560px, 70vh)',
  L: 'min(720px, 80vh)',
};

const VIEWPORT_GUTTER = 64;

export type ResolveModalWidthOptions = {
  size?: ModalSize;
  width?: number;
  /** 未传时读 window.innerWidth；SSR 默认 1200 */
  viewportWidth?: number;
};

/**
 * 解析 Modal 有效宽度：只可缩小不可放大。
 * - 有 width / size：以之为锚点，再与 viewport-64 取 min
 * - 皆无：按视口自动选 S→M→L，再 cap
 */
export function resolveModalWidth(options: ResolveModalWidthOptions = {}): number {
  const vw = options.viewportWidth ?? (typeof window !== 'undefined' ? window.innerWidth : 1200);
  const cap = Math.max(280, vw - VIEWPORT_GUTTER);

  let preferred: number;
  if (options.width != null && Number.isFinite(options.width)) {
    preferred = options.width;
  } else if (options.size) {
    preferred = MODAL_SIZE_WIDTH[options.size];
  } else if (vw < 768) {
    preferred = MODAL_SIZE_WIDTH.S;
  } else if (vw < 1200) {
    preferred = MODAL_SIZE_WIDTH.M;
  } else {
    preferred = MODAL_SIZE_WIDTH.L;
  }

  return Math.min(preferred, cap);
}

/** 解析用于高度锚点的 size（与宽度锚点一致，不受 cap 影响） */
export function resolveModalSizeAnchor(options: {
  size?: ModalSize;
  width?: number;
  viewportWidth?: number;
}): ModalSize {
  if (options.size) return options.size;
  if (options.width != null) {
    if (options.width <= MODAL_SIZE_WIDTH.S) return 'S';
    if (options.width <= MODAL_SIZE_WIDTH.M) return 'M';
    return 'L';
  }
  const vw = options.viewportWidth ?? (typeof window !== 'undefined' ? window.innerWidth : 1200);
  if (vw < 768) return 'S';
  if (vw < 1200) return 'M';
  return 'L';
}
