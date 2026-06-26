declare module '*.module.scss' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.mock.json' {
  const value: unknown;
  export default value;
}

declare module '@kne/button-group' {
  import type { FC, ReactNode } from 'react';

  export interface ButtonGroupItem {
    key?: string;
    label?: ReactNode;
    onClick?: () => void;
    hidden?: boolean;
    disabled?: boolean;
    [key: string]: unknown;
  }

  export interface ButtonGroupProps {
    listArray?: ButtonGroupItem[];
    children?: ReactNode;
    [key: string]: unknown;
  }

  const ButtonGroup: FC<ButtonGroupProps>;
  export default ButtonGroup;
}
