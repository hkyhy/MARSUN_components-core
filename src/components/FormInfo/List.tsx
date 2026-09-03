// @ts-nocheck
import { SubList } from '@kne/react-form-plus';
import { Button, Divider, Tag } from 'antd';
import classnames from 'classnames';
import { useState, type ReactNode } from 'react';
import { Empty } from '@/components/Empty';
import { Plus, Trash2 } from '@/components/Icons';
import InfoPage from '@/components/InfoPage';
import FormInfo from './FormInfo';
import { decorateNestBlocks, isNestBlockType, markNestBlock, NEST_DEPTH_BEYOND } from './nestBlock';
import type { ListProps } from './types';
import withLocale, { useFormInfoLocale } from './withLocale';
import style from './style.module.scss';

const List = withLocale((p: ListProps) => {
  const { formatMessage } = useFormInfoLocale();
  const {
    className,
    itemClassName,
    removeIcon,
    removeText,
    addText,
    addIcon,
    important,
    title,
    bordered,
    nestDepth: nestDepthProp,
    nestParentTitles: _unusedNestParentTitles,
    styles: partStyles,
    style: partStyle,
    ...others
  } = Object.assign(
    {
      addText: formatMessage({ id: 'addText' }),
      addIcon: <Plus size={14} />,
      removeText: formatMessage({ id: 'deleteText' }),
      removeIcon: <Trash2 size={14} />,
      empty: <Empty iconType="simple" description={false} />,
    },
    p,
  );

  const nestDepth = typeof nestDepthProp === 'number' ? nestDepthProp : 0;
  const showBorder = !!bordered;
  const isRootList = nestDepth === 0;
  const showOuterBorder = isRootList && showBorder;
  const isNestBeyond = nestDepth >= NEST_DEPTH_BEYOND;
  const showNestRail = nestDepth === NEST_DEPTH_BEYOND;
  const nestLevel = nestDepth + 1;
  const [nestExpanded, setNestExpanded] = useState(true);
  const isCardModeItem = isRootList && showBorder;

  const toggleNestExpanded = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNestExpanded((v) => !v);
  };

  const partTitle = isNestBeyond ? (
    <span className={style['marsun-form-info-nest-beyond-title']}>
      <span
        className={style['marsun-form-info-nest-level-toggle']}
        role="button"
        tabIndex={0}
        aria-expanded={nestExpanded}
        aria-label={formatMessage(
          { id: nestExpanded ? 'nestCollapse' : 'nestExpand' },
          { level: nestLevel },
        )}
        onClick={toggleNestExpanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            toggleNestExpanded(e);
          }
        }}
      >
        <Tag className={style['marsun-form-info-nest-parent-tag']}>
          {formatMessage({ id: 'nestLevel' }, { level: nestLevel })}
        </Tag>
        {nestExpanded ? '▾' : '▸'}
      </span>
      <span className={style['marsun-form-info-nest-beyond-title-text']}>{title}</span>
    </span>
  ) : (
    title
  );

  return (
    <SubList
      {...others}
      listRender={({
        id,
        allowRemove,
        onRemove,
        index,
        list: itemList,
        title: itemTitle,
        ...props
      }: {
        id: string;
        allowRemove: boolean;
        onRemove: () => void;
        index: number;
        list?: ReactNode[];
        title?: ReactNode;
        [key: string]: unknown;
      }) => {
        const hasItemTitle = itemTitle != null && itemTitle !== '';
        const titleNode = hasItemTitle ? (
          itemTitle
        ) : (
          <span
            className={style['marsun-form-info-list-item-title-placeholder']}
            aria-hidden="true"
          />
        );
        const nestedList = decorateNestBlocks(
          (itemList || []) as React.ReactElement[],
          nestDepth + 1,
        );
        const itemWrapsNestBeyond = nestedList.some(
          (el) =>
            el &&
            typeof el === 'object' &&
            'type' in el &&
            isNestBlockType(el.type) &&
            typeof (el as React.ReactElement).props?.nestDepth === 'number' &&
            (el as React.ReactElement).props.nestDepth >= NEST_DEPTH_BEYOND,
        );

        return (
          <div
            key={id}
            className={classnames(style['marsun-form-info-list-item'], {
              [style['marsun-form-info-is-important']]: important,
            })}
          >
            <FormInfo
              {...props}
              list={nestedList}
              title={titleNode}
              bordered={false}
              className={classnames(style['marsun-form-info-list-item-part'], {
                [style['marsun-form-info-list-item-part-no-title']]: !hasItemTitle,
                [style['marsun-form-info-list-item-part-in-bordered']]:
                  !isNestBeyond && isCardModeItem,
                [style['marsun-form-info-list-item-part-plain']]: !isNestBeyond && !isCardModeItem,
                [style['marsun-form-info-list-item-part-beyond']]: isNestBeyond,
                [style['marsun-form-info-list-item-part-wraps-nest-beyond']]: itemWrapsNestBeyond,
              })}
              styles={{
                header: {
                  borderBottom: 'none',
                  borderRadius: isCardModeItem
                    ? 'var(--radius-default, 8px)'
                    : 'var(--radius-default, 8px) var(--radius-default, 8px) 0 0',
                },
              }}
              style={{
                borderRadius: 'var(--radius-default, 8px)',
                overflow: isNestBeyond ? 'visible' : 'hidden',
                padding: 0,
              }}
              gap={isNestBeyond ? 0 : 16}
              extra={
                <Button
                  type="link"
                  danger
                  className="btn-no-padding"
                  icon={removeIcon}
                  disabled={!allowRemove}
                  onClick={onRemove}
                >
                  {removeText}
                </Button>
              }
            />
            <Divider />
          </div>
        );
      }}
    >
      {(children: ReactNode, { allowAdd, onAdd }: { allowAdd: boolean; onAdd: () => void }) => (
        <InfoPage.Part
          className={classnames(className, itemClassName, style['marsun-form-info-list-part'], {
            [style['marsun-form-info-nest-beyond']]: isNestBeyond,
            [style['marsun-form-info-nest-beyond-rail']]: showNestRail,
            [style['marsun-form-info-nest-beyond-collapsed']]: isNestBeyond && !nestExpanded,
          })}
          title={partTitle}
          bordered={showOuterBorder}
          styles={partStyles as never}
          style={partStyle as never}
          data-nest-beyond={isNestBeyond ? 'true' : undefined}
          data-nest-rail={showNestRail ? 'true' : undefined}
          data-nest-depth={String(nestDepth)}
          data-nest-collapsed={isNestBeyond && !nestExpanded ? 'true' : undefined}
          extra={
            <div className={style['marsun-form-info-extra-container']}>
              {allowAdd && (
                <Button
                  className={style['marsun-form-info-extra-btn']}
                  icon={addIcon}
                  onClick={onAdd}
                >
                  {addText}
                </Button>
              )}
            </div>
          }
        >
          {children}
        </InfoPage.Part>
      )}
    </SubList>
  );
});

export default markNestBlock(List);
