// @ts-nocheck
import { FieldList, SubList, TableList as TableListBase } from '@kne/react-form-plus';
import { useIsMobile } from '@kne/responsive-utils';
import TableView, { isRenderMobileActive, resolveRenderMobile } from '@kne/table-view';
import { Button, Col, Row } from 'antd';
import classnames from 'classnames';
import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Empty } from '@/components/Empty';
import { Plus, Trash2 } from '@/components/Icons';
import InfoPage from '@/components/InfoPage';
import { markNestBlock } from './nestBlock';
import type { TableListProps } from './types';
import withLocale, { useFormInfoLocale } from './withLocale';
import style from './style.module.scss';
import '@kne/table-view/dist/index.css';

const isHorizontallyOverflowing = (el: HTMLElement | null) =>
  !!(el && el.scrollWidth - el.clientWidth > 8);

const buildColumns = (list: ReactNode[], { removeText }: { removeText?: ReactNode }) => {
  const fieldList = Array.isArray(list) ? list : [];
  return [
    ...fieldList
      .filter((item) => {
        if (!item || typeof item !== 'object' || !('props' in item)) return false;
        const props = (item as React.ReactElement).props as {
          display?: boolean;
          hidden?: boolean;
        };
        return props?.display !== false && !props?.hidden;
      })
      .map((item) => {
        const el = item as React.ReactElement;
        return {
          name: el.props.name,
          title: el.props.label,
          render: (value: unknown) => value,
        };
      }),
    {
      name: '__options__',
      type: 'options',
      title: removeText || '',
      width: 100,
      render: (value: unknown) => value,
    },
  ];
};

const TableList = withLocale((p: TableListProps) => {
  const { formatMessage } = useFormInfoLocale();
  const {
    className,
    addIcon,
    addText,
    removeIcon,
    removeText,
    title,
    bordered,
    renderMobile = true,
    list,
    styles: partStyles,
    style: partStyle,
    ...others
  } = Object.assign(
    {
      empty: (
        <Empty
          iconType="simple"
          description={false}
          className={style['marsun-form-info-table-list-empty']}
        />
      ),
      addIcon: <Plus size={14} />,
      addText: formatMessage({ id: 'addText' }),
      removeIcon: <Trash2 size={14} />,
      removeText: formatMessage({ id: 'deleteText' }),
    },
    p,
  );

  const isMobile = useIsMobile();
  const useMobileRender = isRenderMobileActive(renderMobile, isMobile);
  const resolvedRenderMobile = useMemo(() => resolveRenderMobile(renderMobile), [renderMobile]);
  const columns = useMemo(
    () => buildColumns((list || []) as ReactNode[], { removeText }),
    [list, removeText],
  );
  const fieldCount = useMemo(
    () =>
      (Array.isArray(list) ? list : []).filter((item) => {
        if (!item || typeof item !== 'object' || !('props' in item)) return false;
        const props = (item as React.ReactElement).props as {
          display?: boolean;
          hidden?: boolean;
        };
        return props?.display !== false && !props?.hidden;
      }).length,
    [list],
  );
  const innerRef = useRef<HTMLDivElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);

  useLayoutEffect(() => {
    if (useMobileRender) {
      setIsOverflow(false);
      return;
    }
    const el = innerRef.current;
    if (!el) return;
    const update = () => setIsOverflow(isHorizontallyOverflowing(el));
    update();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(el);
    const mo = typeof MutationObserver !== 'undefined' ? new MutationObserver(update) : null;
    mo?.observe(el, { childList: true, subtree: true, characterData: true });
    window.addEventListener('resize', update);
    return () => {
      ro?.disconnect();
      mo?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [useMobileRender, list, columns]);

  const renderPart = (
    children: ReactNode,
    { onAdd, allowAdd }: { onAdd: () => void; allowAdd: boolean },
    extraClassName?: string,
  ) => (
    <InfoPage.Part
      title={title}
      className={classnames(className, style['marsun-form-info-table-list'], extraClassName)}
      bordered={bordered}
      styles={partStyles as never}
      style={partStyle as never}
      extra={
        <div className={style['marsun-form-info-extra-container']}>
          {allowAdd && (
            <Button className={style['marsun-form-info-extra-btn']} icon={addIcon} onClick={onAdd}>
              {addText}
            </Button>
          )}
        </div>
      }
    >
      {children}
    </InfoPage.Part>
  );

  const renderDesktop = () => (
    <TableListBase
      {...others}
      list={list as never}
      headerRender={(children: ReactNode) => (
        <Row className={style['marsun-form-info-table-list-header']} wrap={false}>
          {children}
          <Col
            className={classnames(
              style['marsun-form-info-table-options'],
              style['marsun-form-info-table-options-header'],
            )}
          />
        </Row>
      )}
      headerItemRender={(children: ReactNode, { id, isReq }: { id: string; isReq?: boolean }) => (
        <Col
          className={classnames({
            [style['marsun-form-info-is-req']]: isReq,
          })}
          key={id}
        >
          {children}
        </Col>
      )}
      itemRender={(children: ReactNode) => (
        <Col className={style['marsun-form-info-table-list-field']}>{children}</Col>
      )}
      listRender={(
        children: ReactNode,
        { id, onRemove, allowRemove }: { id: string; onRemove: () => void; allowRemove: boolean },
      ) => (
        <Row key={id} wrap={false} align="top">
          {children}
          <Col className={style['marsun-form-info-table-options']}>
            <Button type="link" onClick={onRemove} danger disabled={!allowRemove} icon={removeIcon}>
              {removeText}
            </Button>
          </Col>
        </Row>
      )}
    >
      {(children: ReactNode, controls: { onAdd: () => void; allowAdd: boolean }) =>
        renderPart(
          <div
            ref={innerRef}
            className={classnames(style['marsun-form-info-table-list-inner'], {
              [style['marsun-form-info-is-overflow']]: isOverflow,
            })}
            style={
              {
                '--table-list-field-count': Math.max(fieldCount, 1),
              } as React.CSSProperties
            }
          >
            {children}
          </div>,
          controls,
        )
      }
    </TableListBase>
  );

  const renderMobileList = () => (
    <SubList
      {...others}
      list={list as never}
      listRender={({
        id,
        list: rowList,
        groupArgs,
        onRemove,
        allowRemove,
      }: {
        id: string;
        list?: ReactNode[];
        groupArgs?: unknown[];
        onRemove: () => void;
        allowRemove: boolean;
      }) => (
        <div
          key={id}
          className={classnames(
            style['marsun-form-info-table-list-mobile-card'],
            'info-page-table-mobile-card',
          )}
        >
          <div className={style['marsun-form-info-table-list-mobile-card-body']}>
            <FieldList
              list={rowList as never}
              groupArgs={groupArgs}
              itemRender={(children: ReactNode, targetProps: { hidden?: boolean }) => {
                if (targetProps.hidden) {
                  return <div style={{ display: 'none' }}>{children}</div>;
                }
                return (
                  <div className={style['marsun-form-info-table-list-mobile-field']}>
                    {children}
                  </div>
                );
              }}
            />
          </div>
          <div className={style['marsun-form-info-table-list-mobile-actions']}>
            <Button type="link" onClick={onRemove} danger disabled={!allowRemove} icon={removeIcon}>
              {removeText}
            </Button>
          </div>
        </div>
      )}
    >
      {(children: ReactNode, controls: { onAdd: () => void; allowAdd: boolean }) =>
        renderPart(
          <div
            className={classnames(
              style['marsun-form-info-table-list-mobile-list'],
              'info-page-table-mobile-card-list',
            )}
          >
            {children}
          </div>,
          controls,
          style['marsun-form-info-is-mobile'],
        )
      }
    </SubList>
  );

  const tableViewRenderMobile =
    renderMobile === false
      ? false
      : typeof resolvedRenderMobile === 'function'
        ? resolvedRenderMobile
        : renderMobile === true || resolvedRenderMobile === true
          ? () => renderMobileList()
          : false;

  return (
    <TableView
      columns={columns}
      dataSource={[]}
      empty={null}
      className={style['marsun-form-info-table-list-view']}
      renderMobile={tableViewRenderMobile}
      render={() => renderDesktop()}
    />
  );
});

export default markNestBlock(TableList);
