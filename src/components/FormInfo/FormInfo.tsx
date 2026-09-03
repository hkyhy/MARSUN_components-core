// @ts-nocheck
import { FormInfo as FormInfoBase } from '@kne/react-form-plus';
import { useIsMobile } from '@kne/responsive-utils';
import { Col, Row } from 'antd';
import classnames from 'classnames';
import React, { useMemo, type ReactElement, type ReactNode } from 'react';
import InfoPage from '@/components/InfoPage';
import { useFlexBox } from '@/components/FlexBox';
import { isNestBlockType, markNestBlock, NEST_DEPTH_BEYOND } from './nestBlock';
import type { FormInfoProps } from './types';
import style from './style.module.scss';

/** 仅保证嵌套块整行；nestDepth 由 List 在 listRender 里写入，这里不覆盖 */
const ensureNestBlocksFullWidth = (list: ReactNode[]) =>
  (Array.isArray(list) ? list : []).map((item) => {
    if (
      !item ||
      typeof item !== 'object' ||
      !('type' in item) ||
      !isNestBlockType((item as ReactElement).type) ||
      (item as ReactElement).props?.block === true
    ) {
      return item;
    }
    return React.cloneElement(item as ReactElement, { block: true });
  });

/**
 * FormInfo 布局：固定 column 走 Row/Col；column 为断点配置时走本仓 useFlexBox。
 * Ported/adapted from kne-union/form-info FormInfo.js
 */
const FormInfo = (props: FormInfoProps) => {
  const { className, column = 2, list = [], gap, bordered, nestDepth, ...others } = props;
  const isMobile = useIsMobile();
  // 第二级起嵌套块不走 info-page bordered；样式由 SCSS 色条/子项 plain 负责
  const partBordered = typeof nestDepth === 'number' && nestDepth >= 1 ? false : bordered;
  const normalizedList = useMemo(() => ensureNestBlocksFullWidth(list), [list]);
  const isFlexBox = !isMobile && !(Number.isInteger(column) && (column as number) > 0);
  const { ref: flexBoxRef, column: flexBoxColumn } = useFlexBox(
    isFlexBox ? (column as object) : {},
  );
  const rowGap = gap ?? 24;

  const renderInner = (col: number, notLayout?: boolean) => (
    <FormInfoBase
      list={normalizedList as never[]}
      column={col}
      className={classnames({
        [style['marsun-form-info-column-not-layout']]: !!notLayout,
      })}
      itemRender={(children: ReactNode, itemProps: { hidden?: boolean; span?: number }) => {
        if (itemProps.hidden) {
          return <div style={{ display: 'none' }}>{children}</div>;
        }
        const childEl = children as ReactElement | null;
        const nestCol = isNestBlockType(childEl?.type);
        const childNestDepth = childEl?.props?.nestDepth as number | undefined;
        const nestBeyond =
          nestCol && typeof childNestDepth === 'number' && childNestDepth >= NEST_DEPTH_BEYOND;
        return (
          <Col
            span={itemProps.span}
            className={classnames({
              [style['marsun-form-info-nest-block-col']]: nestCol,
              [style['marsun-form-info-nest-block-col-beyond']]: nestBeyond,
            })}
          >
            {children}
          </Col>
        );
      }}
    >
      {(children: ReactNode) => <Row gutter={[rowGap, 0]}>{children}</Row>}
    </FormInfoBase>
  );

  const renderColumn = () => {
    if (isMobile) {
      return renderInner(1);
    }
    if (!isFlexBox) {
      return renderInner(column as number);
    }
    if (flexBoxColumn) {
      return renderInner(flexBoxColumn.col);
    }
    return renderInner(2, true);
  };

  return (
    <InfoPage.Part
      {...others}
      bordered={partBordered}
      className={classnames('marsun-form-info', style['marsun-form-info'], className)}
    >
      <div ref={flexBoxRef} />
      {renderColumn()}
    </InfoPage.Part>
  );
};

export default markNestBlock(FormInfo);
