import ButtonGroup from '@kne/button-group';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import type { DescriptionItem } from '../Descriptions/CommonDescriptions';
import { Info } from '../Icons';
import { SemanticTag } from '../Tag';
import { TooltipInfo } from '../TooltipInfo';
import styles from './style.module.scss';

export type InteractiveBlockTag = {
  label: string;
  color: string;
};

export type InteractiveBlockAction = {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  hidden?: boolean;
};

export type InteractiveBlockTagsPlacement = 'inline' | 'below';

export type InteractiveBlockSurface = 'plain' | 'inset';

export type InteractiveBlockProps = {
  title: ReactNode;
  info?: DescriptionItem[];
  subtitle?: ReactNode;
  description?: ReactNode;
  tags?: InteractiveBlockTag[];
  tagsPlacement?: InteractiveBlockTagsPlacement;
  actions?: InteractiveBlockAction[];
  /** 列表表面：inset 对齐归档检索灰底项 */
  surface?: InteractiveBlockSurface;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
};

/**
 * 带操作性的展示块：title → Info+TooltipInfo → actions；tags 紧贴 subtitle。
 */
const InteractiveBlock: React.FC<InteractiveBlockProps> = ({
  title,
  info,
  subtitle,
  description,
  tags,
  tagsPlacement = 'inline',
  actions,
  surface = 'plain',
  selected,
  onClick,
  className,
}) => {
  const visibleActions = (actions ?? []).filter((a) => !a.hidden);
  const hasMeta = Boolean(subtitle || tags?.length);

  const actionList = visibleActions.map((action) => ({
    type: 'link' as const,
    key: action.key,
    icon: action.icon,
    children: action.label,
    onClick: action.onClick,
  }));

  const tagsNode = tags?.length ? (
    <div
      className={classNames(
        'marsun-interactive-block-tags',
        styles['marsun-interactive-block-tags'],
      )}
    >
      {tags.map((tag) => (
        <SemanticTag key={tag.label} color={tag.color}>
          {tag.label}
        </SemanticTag>
      ))}
    </div>
  ) : null;

  const body = (
    <>
      <div
        className={classNames(
          'marsun-interactive-block-header',
          styles['marsun-interactive-block-header'],
        )}
      >
        <div
          className={classNames(
            'marsun-interactive-block-title-group',
            styles['marsun-interactive-block-title-group'],
          )}
        >
          <p
            className={classNames(
              'marsun-interactive-block-title',
              styles['marsun-interactive-block-title'],
            )}
          >
            {title}
          </p>
          {info?.length ? (
            <TooltipInfo
              content={info}
              placement="topLeft"
              overlayStyle={{ minWidth: 220, maxWidth: 360 }}
              overlayClassName="marsun-interactive-block-info-tooltip"
            >
              <span
                className={classNames(
                  'marsun-interactive-block-info-trigger',
                  styles['marsun-interactive-block-info-trigger'],
                )}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <Info size={16} aria-hidden />
              </span>
            </TooltipInfo>
          ) : null}
        </div>
        {visibleActions.length ? (
          <div
            className={classNames(
              'marsun-interactive-block-actions',
              styles['marsun-interactive-block-actions'],
            )}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
          >
            <ButtonGroup moreType="link" list={actionList} />
          </div>
        ) : null}
      </div>
      {hasMeta ? (
        <div
          className={classNames(
            'marsun-interactive-block-meta',
            styles['marsun-interactive-block-meta'],
            tagsPlacement === 'below' && styles['marsun-interactive-block-meta--below'],
          )}
        >
          {subtitle ? (
            <p
              className={classNames(
                'marsun-interactive-block-subtitle',
                styles['marsun-interactive-block-subtitle'],
              )}
            >
              {subtitle}
            </p>
          ) : null}
          {tagsNode}
        </div>
      ) : null}
      {description ? (
        <p
          className={classNames(
            'marsun-interactive-block-description',
            styles['marsun-interactive-block-description'],
          )}
        >
          {description}
        </p>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <div
        role="button"
        tabIndex={0}
        className={classNames(
          'marsun-interactive-block',
          styles['marsun-interactive-block'],
          styles['marsun-interactive-block--clickable'],
          surface === 'inset' && styles['marsun-interactive-block--inset'],
          selected && styles['marsun-interactive-block--selected'],
          className,
        )}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {body}
      </div>
    );
  }

  return (
    <div
      className={classNames(
        'marsun-interactive-block',
        styles['marsun-interactive-block'],
        surface === 'inset' && styles['marsun-interactive-block--inset'],
        selected && styles['marsun-interactive-block--selected'],
        className,
      )}
    >
      {body}
    </div>
  );
};

export default InteractiveBlock;
