/* Ambient types for ReactModal vendor port (@kne/react-modal). */
import type { ComponentType, FC, ReactNode } from 'react';

export interface ReactModalProps {
  open?: boolean;
  title?: ReactNode | ((opts: any) => ReactNode);
  children?: ReactNode | ((opts: any) => ReactNode);
  size?: 'small' | 'default' | 'large' | string;
  onClose?: () => void;
  onConfirm?: (...args: any[]) => any;
  onCancel?: (...args: any[]) => any;
  confirmText?: ReactNode;
  cancelText?: ReactNode;
  footer?: ReactNode | null | ((opts: any) => ReactNode);
  footerButtons?: any[] | ((opts: any) => any[]);
  closable?: boolean;
  noPadding?: boolean;
  bodyScroll?: boolean;
  mobileFullscreen?: boolean;
  getContainer?: any;
  className?: string;
  wrapClassName?: string;
  width?: number | string;
  [key: string]: any;
}

export interface ReactDrawerProps extends ReactModalProps {
  placement?: 'left' | 'right' | 'top' | 'bottom';
}

export type ConfirmModalOptions = {
  type?: string;
  title?: ReactNode;
  message?: ReactNode;
  danger?: boolean;
  icon?: ReactNode | false | null;
  confirmType?: string;
  onConfirm?: (...args: any[]) => any;
  onOk?: (...args: any[]) => any;
  onCancel?: (...args: any[]) => any;
  confirmText?: ReactNode;
  cancelText?: ReactNode;
  [key: string]: any;
};

export declare const ReactModal: FC<ReactModalProps>;
export declare const ReactDrawer: FC<ReactDrawerProps>;
export declare function useModal(): (props: ReactModalProps) => { close: () => void };
export declare function useDrawer(): (props: ReactDrawerProps) => { close: () => void };
export declare function useConfirmModal(): (opts: ConfirmModalOptions) => { close: () => void };
export declare const DrawerContextHolder: ComponentType<any>;
export declare const ScrollRegion: ComponentType<any>;
export declare const TabsLayout: ComponentType<any>;
export declare const ColumnsLayout: ComponentType<any>;
export declare function createModalRender(defaults?: Partial<ReactModalProps>): ComponentType<any>;
export declare function createDrawerRender(
  defaults?: Partial<ReactDrawerProps>,
): ComponentType<any>;
export declare const modalClassNames: Record<string, string>;
