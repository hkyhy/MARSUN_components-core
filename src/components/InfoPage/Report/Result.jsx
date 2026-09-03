// @ts-nocheck
// Ported from https://github.com/kne-union/info-page/blob/master/src/Report/Result.js
import classnames from 'classnames';
import get from 'lodash/get';
import React from 'react';
import style from './style.module.scss';

const Result = ({ className, report }) => {
  const totalScore = get(report, 'total.score');
  const totalLabel = get(report, 'total.label');
  const list = get(report, 'list', []);
  return (
    <div className={classnames('result-view', style['result-view'], className)}>
      <div className={classnames('result-total-col', style['result-total-col'])}>
        <div className={classnames('result-total', style['result-total'])}>
          <div className={classnames('result-total-score', style['result-total-score'])}>
            {totalScore}
          </div>
          <div className={classnames('result-total-label', style['result-total-label'])}>
            {totalLabel}
          </div>
        </div>
      </div>
      <div className={classnames('result-list-col', style['result-list-col'])}>
        <div className={classnames('result-list', style['result-list'])}>
          {list.map(({ label, content, score }, index) => {
            return (
              <div className={classnames('result-item', style['result-item'])} key={index}>
                <div className={classnames('result-item-label', style['result-item-label'])}>
                  {label}：
                  <span className={classnames('result-item-score', style['result-item-score'])}>
                    {score}
                  </span>
                </div>
                <div className={classnames('result-item-content', style['result-item-content'])}>
                  {content}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Result;
