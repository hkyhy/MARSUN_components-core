import { CommonDescriptions } from '@/components';
import React from 'react';
import { MOCK_ASSET_ITEMS, MOCK_BASIC_ITEMS } from '../mock';
import styles from './style.module.scss';
import classNames from 'classnames';

const CommonDescriptionsDemo: React.FC = () => (
  <div className={classNames('common-descriptions-demo-root', styles['common-descriptions-demo-root'])}>
    <CommonDescriptions content={MOCK_BASIC_ITEMS} />
    <CommonDescriptions content={MOCK_ASSET_ITEMS} column={3} title="资产详情" />
  </div>
);

export default CommonDescriptionsDemo;
