import type { ThemeConfig } from 'antd';
import { LAYOUT_TOKENS, PALETTE } from './constants';

/**
 * Marsun Components Core - Ant Design 主题配置
 *
 * 分层说明：
 * 1. Design Token（全局层）：颜色、字号、间距、圆角等基础变量
 * 2. Semantic Token（语义层）：别名 token，映射全局 token 的语义用途
 * 3. Component Token（组件层）：按组件定制，替代 global.css 中的 :global 覆盖
 */

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
      // colorTextLightSolid 勿改为 tooltip 深色 — Button primary 文字依赖此 token（须为浅色）

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

      // ====== 弹层 ======
      zIndexPopupBase: LAYOUT_TOKENS.zIndexPopupBase,
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
        primaryColor: PALETTE.bgWhite,
        dangerColor: PALETTE.bgWhite,
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
        colorBgSpotlight: PALETTE.tooltipBg,
        colorTextLightSolid: PALETTE.tooltipColor,
        zIndexPopup: LAYOUT_TOKENS.zIndexPopupBase,
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
      Empty: {},

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
function setColorVariants(root: HTMLElement, prefix: string, hex: string): void {
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

  // @kne/* 兼容别名（form-info 必填星号用 --color-warning，对齐主题红）
  root.style.setProperty('--color-primary', primaryColor);
  root.style.setProperty('--color-success', PALETTE.success);
  root.style.setProperty('--color-info', PALETTE.info);
  root.style.setProperty('--color-error', PALETTE.error);
  root.style.setProperty('--color-warning', PALETTE.error);

  root.style.setProperty('--layout-header-height', LAYOUT_TOKENS.headerHeight);
  root.style.setProperty('--layout-sider-width', LAYOUT_TOKENS.siderWidth);

  root.style.setProperty('--font-size-default', LAYOUT_TOKENS.fontSizeDefault);
  root.style.setProperty('--font-size-small', LAYOUT_TOKENS.fontSizeSmall);
  root.style.setProperty('--font-size-large', LAYOUT_TOKENS.fontSizeLarge);
  root.style.setProperty('--font-size-18', LAYOUT_TOKENS.fontSize18);
  root.style.setProperty('--font-size-24', LAYOUT_TOKENS.fontSize24);

  root.style.setProperty('--line-height-default', LAYOUT_TOKENS.lineHeightDefault);
  root.style.setProperty('--line-height-middle', LAYOUT_TOKENS.lineHeightMiddle);
  root.style.setProperty('--line-height-small', LAYOUT_TOKENS.lineHeightSmall);
  root.style.setProperty('--line-height-large', LAYOUT_TOKENS.lineHeightLarge);

  root.style.setProperty('--font-color', PALETTE.textBase);
  root.style.setProperty('--font-color-disabled', PALETTE.textDisabled);
  root.style.setProperty('--font-color-grey', PALETTE.textSecondary);
  root.style.setProperty('--font-color-grey-1', PALETTE.textTertiary);
  root.style.setProperty('--font-color-grey-2', PALETTE.borderBase);
  root.style.setProperty('--font-color-grey-3', PALETTE.borderLight);
  root.style.setProperty('--font-color-grey-4', PALETTE.borderLighter);

  root.style.setProperty('--bg-color-white', PALETTE.bgWhite);
  root.style.setProperty('--bg-color-grey', PALETTE.bgGrey);
  root.style.setProperty('--bg-color-grey-1', PALETTE.bgGreyLight);
  root.style.setProperty('--bg-color-grey-2', PALETTE.bgGreyNormal);
  root.style.setProperty('--bg-color-grey-3', PALETTE.bgGreyDark);
  root.style.setProperty('--bg-color-grey-4', PALETTE.bgBlueTint);

  root.style.setProperty('--tag-default', PALETTE.tagDefault);
  root.style.setProperty('--tag-success', PALETTE.tagSuccess);
  root.style.setProperty('--tag-progress', PALETTE.tagProgress);
  root.style.setProperty('--tag-danger', PALETTE.tagDanger);
  root.style.setProperty('--tag-info', PALETTE.tagInfo);
  root.style.setProperty('--tag-other', PALETTE.tagOther);

  root.style.setProperty('--file-icon-word', PALETTE.fileIconWord);
  root.style.setProperty('--file-icon-pdf', PALETTE.fileIconPdf);
  root.style.setProperty('--file-icon-excel', PALETTE.fileIconExcel);
  root.style.setProperty('--file-icon-ppt', PALETTE.fileIconPpt);
  root.style.setProperty('--file-icon-image', PALETTE.fileIconImage);
  root.style.setProperty('--file-icon-markdown', PALETTE.fileIconMarkdown);
  root.style.setProperty('--file-icon-visio', PALETTE.fileIconVisio);
  root.style.setProperty('--file-icon-archive', PALETTE.fileIconArchive);
  root.style.setProperty('--file-icon-folder', PALETTE.fileIconFolder);
  root.style.setProperty('--file-icon-other', PALETTE.fileIconOther);

  root.style.setProperty('--tooltip-bg', PALETTE.tooltipBg);
  root.style.setProperty('--tooltip-color', PALETTE.tooltipColor);
  root.style.setProperty('--tooltip-info-bg', PALETTE.bgWhite);
  root.style.setProperty('--tooltip-info-color', PALETTE.textBase);

  setColorVariants(root, 'primary-color', primaryColor);
  setColorVariants(root, 'success-color', PALETTE.success);
  setColorVariants(root, 'info-color', PALETTE.info);
  setColorVariants(root, 'error-color', PALETTE.error);
  setColorVariants(root, 'warning-color', PALETTE.warning);

  // kne form-info：--primary-color-06 / --primary-color-5
  const { r, g, b } = hexToRgb(primaryColor);
  root.style.setProperty('--primary-color-06', `rgba(${r}, ${g}, ${b}, 0.06)`);
  root.style.setProperty('--primary-color-5', `rgba(${r}, ${g}, ${b}, 0.20)`);
}

/** 项目级 CSS 变量覆盖（在 applyThemeToCssVariables 之后调用） */
export function applyCssTokenOverrides(
  overrides: Record<string, string>,
  target: HTMLElement = document.documentElement,
): void {
  Object.entries(overrides).forEach(([key, value]) => {
    const varName = key.startsWith('--') ? key : `--${key}`;
    target.style.setProperty(varName, value);
  });
}
