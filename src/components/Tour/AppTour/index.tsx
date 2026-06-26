import { CircleHelp } from '@/components/Icons';
import type { TourProps } from 'antd';
import { Button, Tour } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import styles from './style.module.scss';

export interface AppTourStep {
  title: string;
  description: React.ReactNode;
  target?: () => HTMLElement;
  placement?: TourProps['steps'] extends (infer S)[] | undefined ? S extends { placement?: infer P } ? P : never : never;
}

export interface AppTourProps {
  steps: AppTourStep[];
  /** localStorage key，用于记录是否已完成导览 */
  storageKey?: string;
  /** 是否自动打开（首次） */
  autoOpen?: boolean;
}

const AppTour: React.FC<AppTourProps> = ({ steps, storageKey, autoOpen = true }) => {
  const [open, setOpen] = useState(false);

  React.useEffect(() => {
    if (!autoOpen || !storageKey) return;
    const completed = localStorage.getItem(storageKey);
    if (!completed) {
      const timer = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, [autoOpen, storageKey]);

  const handleClose = () => {
    setOpen(false);
    if (storageKey) localStorage.setItem(storageKey, 'true');
  };

  if (!steps.length) return null;

  return (
    <>
      <Button type="text" icon={<CircleHelp />} onClick={() => setOpen(true)} title="导览" />
      <Tour
        open={open}
        onClose={handleClose}
        onFinish={handleClose}
        steps={steps}
        indicatorsRender={(current, total) => (
          <span className={classNames('app-tour-root', styles['app-tour-root'])}>
            {current + 1} / {total}
          </span>
        )}
      />
    </>
  );
};

export default AppTour;
