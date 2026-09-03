// @ts-nocheck
// Ported from https://github.com/kne-union/react-modal/blob/master/src/TabsLayout.js
import { Tabs } from 'antd';
import classnames from 'classnames';
import styles from './layouts.module.scss';

const TabsLayout = ({ className, destroyOnHidden = true, ...props }) => (
  <Tabs
    className={classnames(styles['modal-tabs-layout'], className)}
    destroyOnHidden={destroyOnHidden}
    {...props}
  />
);

export default TabsLayout;
