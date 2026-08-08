// @ts-nocheck
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useScrollElement } from '@kne/responsive-utils';
import useFilterPopupContainer from './hooks/useFilterPopupContainer';
import { Button, Col, Dropdown, Row } from 'antd';
import FilterItem from './FilterItem';
import classnames from 'classnames';
import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';
import style from './style.module.scss';
import useResponsiveScrollListener from './hooks/useResponsiveScrollListener';
import { getMobilePopupMetrics } from './utils/getMobilePopupMetrics';
import { MOBILE_MASK_Z_INDEX, MOBILE_POPUP_Z_INDEX } from './constants/mobilePopup';

const isNotEmpty = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
};

const MASK_ANIMATION_DURATION = 180;
const MOBILE_POPUP_OFFSET = 4;

const PopoverItem = withLocale(
  ({
    value,
    label,
    onValidate,
    overlayClassName,
    placement = 'bottomLeft',
    onOpenChange,
    onChange,
    getPopupContainer: customGetPopupContainer,
    children,
  }) => {
    const [state, setState] = useState(value);
    const [open, setOpen] = useState(false);
    const {
      isMobile,
      useBoundaryMount,
      fixedModeClass,
      getMountNode,
      getPopupContainer,
      anchorRef,
    } = useFilterPopupContainer();
    const getScrollElement = useScrollElement();
    const resolveGetPopupContainer = useCallback(
      (triggerNode) => {
        if (typeof customGetPopupContainer === 'function') {
          const customContainer = customGetPopupContainer(triggerNode);
          if (customContainer) {
            return customContainer;
          }
        }
        return getPopupContainer(triggerNode);
      },
      [customGetPopupContainer, getPopupContainer],
    );
    const [renderMask, setRenderMask] = useState(false);
    const [maskClosing, setMaskClosing] = useState(false);
    const [popupMetrics, setPopupMetrics] = useState({ top: 0, pageTop: 0, height: 0 });
    const triggerRef = useRef(null);
    const setTriggerRef = useCallback(
      (node) => {
        triggerRef.current = node;
        anchorRef(node);
      },
      [anchorRef],
    );
    const popupMountNode = typeof document !== 'undefined' ? getMountNode() || document.body : null;
    const disabled = useMemo(() => {
      return onValidate && !onValidate(state);
    }, [onValidate, state]);

    const { formatMessage } = useIntl({ moduleName: 'Filter' });

    const updatePopupMetrics = useCallback(() => {
      if (typeof window === 'undefined' || !triggerRef.current) return;
      const metrics = getMobilePopupMetrics(triggerRef.current, {
        scrollEl: getScrollElement(),
        boundaryEl: getMountNode(),
        useBoundaryMount,
        offset: MOBILE_POPUP_OFFSET,
      });
      setPopupMetrics(metrics);
    }, [getMountNode, getScrollElement, useBoundaryMount]);

    useResponsiveScrollListener(updatePopupMetrics, open && isMobile);

    useEffect(() => {
      if (open && isMobile) {
        setRenderMask(true);
        setMaskClosing(false);
        return;
      }

      if (!renderMask) return;
      setMaskClosing(true);
      const timer = setTimeout(() => {
        setRenderMask(false);
        setMaskClosing(false);
      }, MASK_ANIMATION_DURATION);
      return () => {
        clearTimeout(timer);
      };
    }, [isMobile, open, renderMask]);

    const closeDropdown = useCallback(() => {
      setOpen(false);
      onOpenChange && onOpenChange(false);
    }, [onOpenChange]);

    const handleOpenChange = useCallback(
      (open) => {
        if (open && isMobile) {
          updatePopupMetrics();
        }
        setOpen(open);
        setState(value);
        onOpenChange && onOpenChange(open);
      },
      [isMobile, onOpenChange, updatePopupMetrics, value],
    );

    const mobileOverlayStyle = isMobile
      ? {
          '--react-filter-popover-mobile-height': `${popupMetrics.height}px`,
          top: popupMetrics.top,
          left: popupMetrics.left ?? 0,
          // boundary 下宽度跟挂载容器走；viewport 下用测量宽度兜底，避免 CSS 变量未写入时落到 100vw
          ...(popupMetrics.width ? { width: popupMetrics.width } : null),
          zIndex: MOBILE_POPUP_Z_INDEX,
        }
      : undefined;

    const overlayContent = (
      <div
        className={style['pop-util-body']}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className={style['pop-util-content']}>
          {children({ value: state, onChange: setState })}
        </div>
        <Row className={style['pop-util-footer']} justify="end" gutter={8}>
          <Col>
            <Button size={isMobile ? undefined : 'small'} onClick={closeDropdown}>
              {formatMessage({ id: 'cancelText' })}
            </Button>
          </Col>
          <Col>
            <Button
              size={isMobile ? undefined : 'small'}
              type="primary"
              disabled={disabled}
              onClick={() => {
                closeDropdown();
                onChange && onChange(state);
              }}
            >
              {formatMessage({ id: 'determineText' })}
            </Button>
          </Col>
        </Row>
      </div>
    );

    // 宽度由外层 FilterItem label（max-content）锁定；Dropdown 只在绝对定位 field 内承接点击，
    // 避免作为 filter-line flex 子项时 Trigger 首帧宽为 0。
    return (
      <>
        {renderMask &&
          popupMountNode &&
          createPortal(
            <div
              className={classnames(
                style['pop-util-mask'],
                maskClosing && style['pop-util-mask-leave'],
                fixedModeClass,
              )}
              style={{
                top: popupMetrics.top,
                height: popupMetrics.height,
                zIndex: MOBILE_MASK_Z_INDEX,
              }}
              onClick={closeDropdown}
              onTouchMove={(e) => {
                e.preventDefault();
              }}
            />,
            popupMountNode,
          )}
        <span ref={setTriggerRef} className={style['popover-item-trigger']}>
          <FilterItem open={open} active={isNotEmpty(value)} label={label}>
            <Dropdown
              open={open}
              trigger={['click']}
              placement={isMobile ? 'bottomLeft' : placement}
              autoAdjustOverflow={!isMobile}
              align={isMobile ? { offset: [0, 0] } : undefined}
              getPopupContainer={resolveGetPopupContainer}
              zIndex={isMobile ? MOBILE_POPUP_Z_INDEX : undefined}
              overlayClassName={classnames(
                style['pop-util-overlay'],
                overlayClassName,
                isMobile && fixedModeClass,
              )}
              overlayStyle={mobileOverlayStyle}
              onOpenChange={handleOpenChange}
              menu={{ items: [{ key: 'content', label: null }] }}
              dropdownRender={() => overlayContent}
            >
              <span className={style['popover-item-hit']} role="button" tabIndex={0} />
            </Dropdown>
          </FilterItem>
        </span>
      </>
    );
  },
);

export default PopoverItem;
