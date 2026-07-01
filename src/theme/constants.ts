export const DEFAULT_PRIMARY_COLOR = '#1677ff';

/** 基础色板（与 CSS 变量 / tokens.css 一一对应） */
export const PALETTE = {
  primary: DEFAULT_PRIMARY_COLOR,
  success: '#027A48',
  info: '#155ACF',
  error: '#D14343',
  warning: '#F09700',

  textBase: '#222222',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textDisabled: 'rgba(0, 0, 0, 0.25)',

  borderBase: '#cccccc',
  borderLight: '#dddddd',
  borderLighter: '#eeeeee',
  borderSeparator: '#f3f3f3',

  bgWhite: '#ffffff',
  bgGrey: '#fafafa',
  bgGreyLight: '#f8f8f8',
  bgGreyNormal: '#f3f3f3',
  bgGreyDark: '#f1f1f1',
  bgBlueTint: '#fafcff',

  tagDefault: '#666666',
  tagSuccess: '#027A48',
  tagProgress: '#F09700',
  tagDanger: '#D14343',
  tagInfo: '#155ACF',
  tagOther: '#6740C3',

  fileIconWord: '#1677ff',
  fileIconPdf: '#f5222d',
  fileIconExcel: '#00b42a',
  fileIconPpt: '#ff7d00',
  fileIconImage: '#722ed1',
  fileIconMarkdown: '#595959',
  fileIconVisio: '#13c2c2',
  fileIconArchive: '#eb2f96',
  fileIconFolder: '#faad14',
  fileIconOther: '#8c8c8c',

  /** 简单 Tooltip — 白底深字（与 maoyang / assets-system 一致） */
  tooltipBg: '#ffffff',
  tooltipColor: '#222222',
} as const;

/** 布局 / 字号 / 行高默认值（同步到 CSS 变量） */
export const LAYOUT_TOKENS = {
  headerHeight: '56px',
  siderWidth: '220px',
  fontSizeDefault: '14px',
  fontSizeSmall: '12px',
  fontSizeLarge: '16px',
  fontSize18: '18px',
  fontSize24: '24px',
  lineHeightDefault: '1.8',
  lineHeightMiddle: '2',
  lineHeightSmall: '1.5',
  lineHeightLarge: '2.2',
  /** 高于业务浮层（如 QA Agent 面板 z-index: 1100） */
  zIndexPopupBase: 1200,
} as const;
