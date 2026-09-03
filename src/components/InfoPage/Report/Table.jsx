// @ts-nocheck
// Ported from https://github.com/kne-union/info-page/blob/master/src/Report/Table.js
import { useIsMobile } from '@kne/responsive-utils';
import { Col, Divider, Flex, Row, Space } from 'antd';
import classnames from 'classnames';
import groupBy from 'lodash/groupBy';
import React, { useMemo } from 'react';
import style from './style.module.scss';

const Table = ({ className, report }) => {
  const isMobile = useIsMobile();
  const { columns, list, group, groupName, footer } = Object.assign(
    {},
    {
      columns: [],
      group: [],
      groupName: 'group',
      list: [],
    },
    report,
  );

  const { groupList, groupColumn, otherColumns } = useMemo(() => {
    const groupList = groupBy(list, groupName);
    const groupIndex = columns.findIndex((item) => item.name === groupName);
    const otherColumns = columns.slice(0);
    const groupColumn = columns[groupIndex];
    if (groupIndex > -1) {
      otherColumns.splice(groupIndex, 1);
    }
    return {
      groupList,
      groupColumn,
      otherColumns: new Map(otherColumns.map((item) => [item.name, item])),
    };
  }, [columns, list, groupName]);

  const groupMap = useMemo(() => {
    return new Map(group.map((item) => [item.name, item]));
  }, [group]);

  const columnEntries = Array.from(otherColumns.values());

  const renderCellValue = (currentColumn, item) => {
    if (currentColumn.hasOwnProperty('valueOf') && typeof currentColumn.valueOf === 'function') {
      return currentColumn.valueOf(item[currentColumn.name], item);
    }
    return item[currentColumn.name];
  };

  return (
    <Flex
      vertical
      gap={groupColumn?.isSubTitle ? 10 : isMobile ? 20 : 32}
      className={classnames('table-view', className, style['table-view'])}
    >
      {!isMobile && (
        <Row wrap={false} className={classnames('table-header', style['table-header'])} gutter={16}>
          {groupColumn?.isSubTitle || !groupColumn ? null : (
            <Col span={groupColumn?.span}>
              <div className={classnames('table-header-col-item', style['table-header-col-item'])}>
                {groupColumn?.title}-
              </div>
            </Col>
          )}
          <Col span={groupColumn?.isSubTitle || !groupColumn ? 24 : 24 - groupColumn?.span}>
            <Row wrap={false} gutter={16}>
              {columnEntries.map(({ title, name, span }) => {
                return (
                  <Col span={span} key={name}>
                    <div
                      className={classnames(
                        'table-header-col-item',
                        style['table-header-col-item'],
                      )}
                    >
                      {title}
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Col>
        </Row>
      )}
      <Space direction="vertical" size={isMobile ? 12 : undefined} style={{ width: '100%' }}>
        {Object.keys(groupList).map((groupName, groupIndex) => {
          const list = groupList[groupName];
          const currentGroup = groupMap.get(groupName);
          const otherSpan = groupColumn?.isSubTitle || !groupColumn ? 24 : 24 - groupColumn.span;

          const startIndex = Object.values(groupList)
            .slice(0, groupIndex)
            .reduce((a, b) => {
              return a + b.length;
            }, 0);

          return (
            <div key={groupName}>
              {groupColumn?.isSubTitle && currentGroup ? (
                <Divider>{currentGroup.label}</Divider>
              ) : null}
              {isMobile ? (
                <Flex vertical gap={12}>
                  {list.map((item, index) => {
                    return (
                      <div className={classnames(style['table-card'], 'table-card')} key={index}>
                        {columnEntries.map((currentColumn) => {
                          return (
                            <div
                              className={classnames(style['table-card-row'], 'table-card-row')}
                              key={currentColumn.name}
                            >
                              <div
                                className={classnames(
                                  style['table-card-label'],
                                  'table-card-label',
                                )}
                              >
                                {currentColumn.title}
                              </div>
                              <div
                                className={classnames(
                                  style['table-card-value'],
                                  'table-card-value',
                                  {
                                    [style['table-col-item-description']]:
                                      currentColumn.name === 'description',
                                  },
                                )}
                              >
                                {renderCellValue(currentColumn, item)}
                              </div>
                            </div>
                          );
                        })}
                        {footer &&
                          (typeof footer === 'function'
                            ? footer(item, startIndex + index)
                            : footer)}
                      </div>
                    );
                  })}
                </Flex>
              ) : (
                <Row wrap={false}>
                  <Col span={otherSpan}>
                    {list.map((item, index) => {
                      return (
                        <Flex vertical gap={8} key={index}>
                          <Row
                            wrap={false}
                            gutter={16}
                            className={classnames('table-row-item', {
                              [style['table-row-item']]: index !== list?.length - 1,
                            })}
                          >
                            {columnEntries.map(({ name }) => {
                              const currentColumn = otherColumns.get(name);
                              return (
                                <Col span={currentColumn.span} key={name}>
                                  <div
                                    className={classnames(
                                      'table-col-item',
                                      style['table-col-item'],
                                      {
                                        [style['table-col-item-description']]:
                                          name === 'description',
                                      },
                                    )}
                                  >
                                    {renderCellValue(currentColumn, item)}
                                  </div>
                                </Col>
                              );
                            })}
                          </Row>
                          {footer &&
                            (typeof footer === 'function'
                              ? footer(item, startIndex + index)
                              : footer)}
                        </Flex>
                      );
                    })}
                  </Col>
                </Row>
              )}
            </div>
          );
        })}
      </Space>
    </Flex>
  );
};

export default Table;
