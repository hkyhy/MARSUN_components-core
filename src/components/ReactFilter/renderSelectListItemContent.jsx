/**
 * SuperSelect 列表项文案：超长省略 + 原生 title hover 看全文。
 * 覆盖 kne 默认（仅 div.select-list-item-label、无 title）。
 */
export function renderSelectListItemContent({ item, props }) {
  const labelKey = props?.labelKey || 'label';
  const label = item?.[labelKey];
  const title = typeof label === 'string' || typeof label === 'number' ? String(label) : undefined;
  const description = item?.description;
  const descriptionTitle =
    typeof description === 'string' || typeof description === 'number'
      ? String(description)
      : undefined;

  return (
    <>
      <div className="select-list-item-label" title={title}>
        {label}
      </div>
      {description ? (
        <div className="select-list-item-description" title={descriptionTitle}>
          {description}
        </div>
      ) : null}
    </>
  );
}
