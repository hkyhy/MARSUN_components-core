import type { ThemeConfig } from 'antd';

/**
 * Marsun Components Core - Ant Design 主题配置
 *
 * 分层说明：
 * 1. Design Token（全局层）：颜色、字号、间距、圆角等基础变量
 * 2. Semantic Token（语义层）：别名 token，映射全局 token 的语义用途
 * 3. Component Token（组件层）：按组件定制，替代 global.css 中的 :global 覆盖
 */

/** ========== 基础色板（与 CSS 变量一一对应） ========== */
const PALETTE = {
  /** 主色 */
  primary: '#1677ff',
  /** 成功色 */
  success: '#027A48',
  /** 信息色 */
  info: '#155ACF',
  /** 错误/危险色 */
  error: '#D14343',
  /** 警告色 */
  warning: '#F09700',

  /** 字体色 */
  textBase: '#222222',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textDisabled: 'rgba(0, 0, 0, 0.25)',

  /** 边框色 */
  borderBase: '#cccccc',
  borderLight: '#dddddd',
  borderLighter: '#eeeeee',
  borderSeparator: '#f3f3f3',

  /** 背景色 */
  bgWhite: '#ffffff',
  bgGrey: '#fafafa',
  bgGreyLight: '#f8f8f8',
  bgGreyNormal: '#f3f3f3',
  bgGreyDark: '#f1f1f1',
  bgBlueTint: '#fafcff',
} as const;

/**
 * 根据主色生成完整的 Ant Design 主题配置
 * @param primaryColor - 主题主色，来自系统设置
 */
export function generateTheme(primaryColor: string): ThemeConfig {
  return {
    token: {
      // ====== 颜色 ======
      colorPrimary: primaryColor,
      colorSuccess: PALETTE.success,
      colorWarning: PALETTE.warning,
      colorError: PALETTE.error,
      colorInfo: PALETTE.info,
      colorLink: primaryColor,
      colorTextBase: PALETTE.textBase,

      // 文字
      colorText: PALETTE.textBase,
      colorTextSecondary: PALETTE.textSecondary,
      colorTextTertiary: PALETTE.textTertiary,
      colorTextDisabled: PALETTE.textDisabled,

      // 背景
      colorBgContainer: PALETTE.bgWhite,
      colorBgLayout: PALETTE.bgGrey,
      colorBgElevated: PALETTE.bgWhite,
      colorBgSpotlight: PALETTE.bgGreyDark,

      // 边框
      colorBorder: PALETTE.borderSeparator,
      colorBorderSecondary: PALETTE.borderSeparator,
      colorSplit: PALETTE.borderSeparator,

      // 填充
      colorFill: PALETTE.bgGreyDark,
      colorFillSecondary: PALETTE.bgGreyNormal,
      colorFillTertiary: PALETTE.bgGreyLight,
      colorFillQuaternary: PALETTE.bgGrey,

      // ====== 字体 ======
      fontSize: 14,
      fontSizeSM: 12,
      fontSizeLG: 16,
      fontSizeXL: 20,
      fontSizeHeading1: 38,
      fontSizeHeading2: 30,
      fontSizeHeading3: 24,
      fontSizeHeading4: 20,
      fontSizeHeading5: 16,
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'",
      lineHeight: 1.8,
      lineHeightSM: 1.5,
      lineHeightLG: 2.2,

      // ====== 圆角 ======
      borderRadius: 4,
      borderRadiusSM: 2,
      borderRadiusLG: 8,

      // ====== 间距 ======
      padding: 16,
      paddingSM: 12,
      paddingLG: 24,
      paddingXL: 32,
      paddingXS: 8,
      margin: 16,
      marginSM: 12,
      marginLG: 24,
      marginXL: 32,
      marginXS: 8,

      // ====== 阴影 ======
      boxShadow:
        '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
      boxShadowSecondary:
        '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',

      // ====== 动画 ======
      motionDurationSlow: '0.3s',
      motionDurationMid: '0.2s',
      motionDurationFast: '0.1s',

      // ====== 控件 ======
      controlHeight: 32,
      controlHeightSM: 24,
      controlHeightLG: 40,
      controlHeightXS: 16,
    },

    components: {
      // ====== Button ======
      Button: {
        contentFontSizeSM: 12,
        contentFontSizeLG: 16,
        contentLineHeightSM: 1.5,
        paddingInlineSM: 8,
        paddingInline: 12,
        paddingInlineLG: 16,
        defaultShadow: 'none',
        primaryShadow: 'none',
        dangerShadow: 'none',
        borderRadius: 4,
        borderRadiusSM: 4,
        borderRadiusLG: 4,
      },

      // ====== Table ======
      Table: {
        headerBg: PALETTE.bgBlueTint,
        headerColor: PALETTE.textBase,
        headerBorderRadius: 4,
        headerSortActiveBg: PALETTE.bgGreyNormal,
        headerSortHoverBg: PALETTE.bgGreyNormal,
        headerFilterHoverBg: PALETTE.bgGreyNormal,
        rowHoverBg: PALETTE.bgGrey,
        // rowHoverColor: PALETTE.textBase,
        rowSelectedBg: `${primaryColor}10`,
        rowSelectedHoverBg: `${primaryColor}20`,
        borderColor: PALETTE.borderSeparator,
        // headerCellSplitColor: 'transparent',
        cellPaddingBlock: 8,
        cellPaddingInline: 24,
        cellPaddingBlockMD: 6,
        cellPaddingInlineMD: 24,
        cellPaddingBlockSM: 6,
        cellPaddingInlineSM: 8,
        fontSize: 14,
        fontSizeSM: 12,
      },

      // ====== Pagination ======
      Pagination: {
        fontSize: 12,
        itemSize: 24,
        itemSizeSM: 20,
        itemActiveBg: primaryColor,
        itemActiveColor: PALETTE.bgWhite,
        itemInputBg: PALETTE.bgWhite,
        // itemBorderColor: PALETTE.borderLight,
        // itemBorderRadiusSM: 2,
      },

      // ====== Modal ======
      Modal: {
        contentBg: PALETTE.bgWhite,
        headerBg: PALETTE.bgWhite,
        footerBg: PALETTE.bgWhite,
        titleFontSize: 16,
        titleLineHeight: 1.5,
      },

      // ====== Menu ======
      Menu: {
        itemBorderRadius: 4,
        itemMarginBlock: 4,
        itemMarginInline: 8,
        itemHeight: 40,
        itemColor: PALETTE.textBase,
        itemHoverColor: primaryColor,
        itemSelectedColor: primaryColor,
        itemSelectedBg: `${primaryColor}10`,
        subMenuItemBorderRadius: 4,
        collapsedIconSize: 16,
        iconMarginInlineEnd: 10,
      },

      // ====== Select ======
      Select: {
        optionSelectedBg: `${primaryColor}10`,
        optionSelectedColor: primaryColor,
        optionFontSize: 14,
        optionLineHeight: 1.8,
        optionPadding: '5px 12px',
        selectorBg: PALETTE.bgWhite,
        singleItemHeightLG: 40,
      },

      // ====== Input ======
      Input: {
        colorTextDisabled: PALETTE.textDisabled,
        colorBgContainerDisabled: PALETTE.bgGreyNormal,
      },

      // ====== Tooltip ======
      Tooltip: {
        colorBgSpotlight: PALETTE.bgWhite,
        colorTextLightSolid: PALETTE.textBase,
      },

      // ====== Popover ======
      Popover: {
        borderRadiusLG: 4,
      },

      // ====== Alert ======
      Alert: {
        withDescriptionIconSize: 14,
        // defaultBg: `${PALETTE.primary}10`,
        // infoBg: `${PALETTE.info}10`,
        // successBg: `${PALETTE.success}10`,
        // warningBg: `${PALETTE.warning}10`,
        // errorBg: `${PALETTE.error}10`,
      },

      // ====== Tag ======
      Tag: {
        borderRadiusSM: 4,
        defaultBg: 'rgba(102, 102, 102, 0.06)',
        defaultColor: PALETTE.textSecondary,
      },

      // ====== Card ======
      Card: {
        borderRadiusLG: 4,
      },

      // ====== Descriptions ======
      Descriptions: {
        labelBg: PALETTE.bgGrey,
        labelColor: PALETTE.textSecondary,
        contentColor: PALETTE.textBase,
      },

      // ====== Dropdown ======
      Dropdown: {
        borderRadiusLG: 4,
        paddingBlock: 4,
      },

      // ====== Checkbox ======
      Checkbox: {
        // marginInlineEnd: 8,
      },

      // ====== Segmented ======
      Segmented: {
        itemSelectedBg: PALETTE.bgWhite,
        itemColor: PALETTE.textSecondary,
        itemSelectedColor: PALETTE.textBase,
        // containerBg: PALETTE.bgGreyNormal,
      },

      // ====== Tabs ======
      Tabs: {
        itemSelectedColor: primaryColor,
        itemHoverColor: primaryColor,
        inkBarColor: primaryColor,
      },

      // ====== Form ======
      Form: {
        labelColor: PALETTE.textBase,
        labelFontSize: 14,
        verticalLabelPadding: '0 0 4px',
      },

      // ====== Timeline ======
      Timeline: {
        dotBg: 'transparent',
        itemPaddingBottom: 20,
      },

      // ====== Empty ======
      Empty: {
        // descriptionColor: PALETTE.textTertiary,
      },

      // ====== Spin ======
      Spin: {
        colorPrimary: primaryColor,
      },

      // ====== Upload ======
      Upload: {
        colorPrimary: primaryColor,
        colorPrimaryHover: primaryColor,
      },
    },
  };
}

/**
 * 将 hex 颜色解析为 RGB 分量
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

/**
 * 批量设置某颜色的透明度系列 CSS 变量
 */
function setColorVariants(
  root: HTMLElement,
  prefix: string,
  hex: string,
): void {
  const { r, g, b } = hexToRgb(hex);
  root.style.setProperty(`--${prefix}-bg`, `rgba(${r}, ${g}, ${b}, 0.06)`);
  root.style.setProperty(`--${prefix}-bg-hover`, `rgba(${r}, ${g}, ${b}, 0.10)`);
  root.style.setProperty(`--${prefix}-bg-active`, `rgba(${r}, ${g}, ${b}, 0.16)`);
  root.style.setProperty(`--${prefix}-border`, `rgba(${r}, ${g}, ${b}, 0.20)`);
  root.style.setProperty(`--${prefix}-fill`, `rgba(${r}, ${g}, ${b}, 0.10)`);
}

/**
 * 将 antd 主题色同步到 CSS 变量
 * 用于 SCSS 和非 antd 组件的样式引用
 */
export function applyThemeToCssVariables(primaryColor: string): void {
  const root = document.documentElement;

  root.style.setProperty('--primary-color', primaryColor);
  root.style.setProperty('--success-color', PALETTE.success);
  root.style.setProperty('--info-color', PALETTE.info);
  root.style.setProperty('--error-color', PALETTE.error);
  root.style.setProperty('--warning-color', PALETTE.warning);

  // 各颜色透明度系列
  setColorVariants(root, 'primary-color', primaryColor);
  setColorVariants(root, 'success-color', PALETTE.success);
  setColorVariants(root, 'info-color', PALETTE.info);
  setColorVariants(root, 'error-color', PALETTE.error);
  setColorVariants(root, 'warning-color', PALETTE.warning);
}
