// @ts-nocheck
// Ported from https://github.com/kne-union/info-page/blob/master/src/Flow/index.js
import React, { useMemo } from 'react';
import { Col, Empty, Space, Steps } from 'antd';
import classnames from 'classnames';
import transform from 'lodash/transform';
import style from './style.module.scss';
import get from 'lodash/get';
import formatView from '../formatView';
import { isEmpty } from '@kne/is-empty';

export const ActionList = ({ name, action, options, content }) => {
  return (
    <div className={classnames('step-content-wrap', style['step-content-wrap'])}>
      <Space align="center">
        <Col className={classnames('step-left', style['step-left'])}>
          <span className={classnames('step-name', style['step-name'])}>{name}</span>
          <span className={classnames('step-action', style['step-action'])}>{action}</span>
        </Col>
        <Col className={classnames('step-action-time', style['step-action-time'])}>{options}</Col>
      </Space>
      <div className={classnames('step-content', style['step-content'])}>{content}</div>
    </div>
  );
};

const Flow = (p) => {
  const {
    className,
    dataSource,
    size,
    columns,
    empty,
    valueIsEmpty,
    placeholder,
    emptyIsPlaceholder,
    ...props
  } = Object.assign(
    {},
    {
      size: 'small',
      progressDot: false,
      labelPlacement: 'vertical',
      direction: 'vertical',
      dataSource: [],
      columns: [],
      empty: <Empty />,
      valueIsEmpty: isEmpty,
      placeholder: '-',
      emptyIsPlaceholder: false,
    },
    p,
  );

  const columnsMap = useMemo(() => {
    const core = (columns) => {
      return new Map(
        columns.map((item) => {
          const name = item.type || item.name;
          return [
            name,
            Array.isArray(item.children) && item.children.length > 0
              ? Object.assign({}, item, { children: core(item.children) })
              : item,
          ];
        }),
      );
    };
    return core(columns);
  }, [columns]);

  if (!(dataSource && dataSource.length > 0)) {
    return empty;
  }

  return (
    <Steps
      {...props}
      items={dataSource.map((dataItem, index) => {
        const computedDisplayValue = (target, dataItem, context) => {
          const itemValue =
            typeof target.getValueOf === 'function'
              ? target.getValueOf(
                  dataItem,
                  Object.assign({}, context, {
                    dataSource,
                    column: target,
                  }),
                )
              : get(dataItem, target.name);

          const displayValue = ((value) => {
            if (typeof target.format === 'function') {
              return target.format(
                value,
                Object.assign({}, context, {
                  dataSource,
                  column: target,
                  target: dataItem,
                }),
              );
            }
            if (typeof target.format === 'string') {
              const formatValue = formatView(
                value,
                target.format,
                Object.assign({}, context, {
                  dataSource,
                  column: target,
                  target: dataItem,
                }),
              );
              if (formatValue) {
                return formatValue;
              }
            }
            return value;
          })(itemValue);

          const itemIsEmpty = (target.valueIsEmpty || valueIsEmpty)(itemValue, context);

          if (
            target.display === false ||
            (typeof target.display === 'function' &&
              target.display(
                itemValue,
                Object.assign({}, context, {
                  dataSource,
                  column: target,
                  target: dataItem,
                }),
              ) === false)
          ) {
            return null;
          }

          if (
            !(target.hasOwnProperty('emptyIsPlaceholder')
              ? target.emptyIsPlaceholder
              : emptyIsPlaceholder) &&
            itemIsEmpty
          ) {
            return null;
          }

          if (itemIsEmpty) {
            return typeof target.renderPlaceholder === 'function'
              ? target.renderPlaceholder(
                  Object.assign({}, context, {
                    column: target,
                    dataSource,
                    placeholder,
                  }),
                )
              : target.placeholder || placeholder;
          }

          if (typeof target.render === 'function') {
            return target.render(
              displayValue,
              Object.assign({}, context, {
                column: target,
                dataSource,
                target: dataItem,
              }),
            );
          }

          return displayValue;
        };
        const { actionList, ...renderData } = transform(
          ['title', 'subTitle', 'description', 'status', 'content', 'actionList'],
          (result, name) => {
            const target = columnsMap.get(name) || { name };
            if (target.children instanceof Map && name !== 'actionList') {
              console.warn('只有actionList允许包含children');
              return;
            }
            if (target.children instanceof Map && name === 'actionList') {
              const targetValue = computedDisplayValue(target, dataItem, { index });
              if (!(Array.isArray(targetValue) && targetValue.length > 0)) {
                return targetValue;
              }
              result[name] = targetValue.map((dataItem, itemIndex) => {
                return transform(
                  ['name', 'action', 'options', 'content'],
                  (result, name) => {
                    const childrenTarget = target.children.get(name) || { name };
                    result[name] = computedDisplayValue(childrenTarget, dataItem, {
                      parent: targetValue,
                      targetIndex: itemIndex,
                      index,
                    });
                  },
                  {},
                );
              });
              return;
            }
            result[name] = computedDisplayValue(target, dataItem, { index });
          },
          {},
        );

        if (actionList && actionList.length > 0) {
          return Object.assign({}, renderData, {
            description: (
              <>
                {renderData.description}
                {actionList.map((item, index) => (
                  <ActionList {...Object.assign({}, item)} key={index} />
                ))}
              </>
            ),
          });
        }

        if (renderData.content) {
          return Object.assign({}, renderData, {
            description: (
              <>
                {renderData.description}
                <div className={classnames('step-content-wrap', style['step-content-wrap'])}>
                  <div className={classnames('step-content', style['step-content'])}>
                    {renderData.content}
                  </div>
                </div>
              </>
            ),
          });
        }

        return renderData;
      })}
      className={classnames(className, style['steps'], style[`steps-${size}`], {
        'steps-dot': props.progressDot,
        [style['steps-dot']]: props.progressDot,
      })}
    />
  );
};

export default Flow;
