// @ts-nocheck
/**
 * Vendor port of `@kne/react-modal`。
 * 公开名：ReactModal / ReactDrawer（禁止 export as Modal，避免覆盖 Marsun Modal）。
 * Ported from https://github.com/kne-union/react-modal/blob/master/src/index.js
 */
import './layouts.module.scss';

export { default as ReactModal, useModal } from './Modal';
export { default as ReactDrawer } from './Drawer';
export { DrawerContextHolder, useDrawer } from './useDrawer';
export { useConfirmModal } from './useConfirmModal';
export { default as ScrollRegion } from './ScrollRegion';
export { default as TabsLayout } from './TabsLayout';
export { default as ColumnsLayout } from './ColumnsLayout';
export { default as createModalRender } from './createModalRender';
export { default as createDrawerRender } from './createDrawerRender';
export { modalClassNames } from './modalClassNames';
