import { useCallback, useMemo, useRef, useState } from 'react';
import { FormModal } from '../../../FormInfo';
import { message } from 'antd';
import classNames from 'classnames';
import CreateActionForm from './CreateActionForm';
import {
  addDaysYmd,
  createActionPersonWarnMessage,
  personDisplayName,
  validateCreateActionPersons,
} from './submitHelpers';
import type {
  ActionPersonOption,
  CreateActionDimensionOption,
  CreateActionLoaders,
  CreateActionPrefill,
  CreateActionSubmitPayload,
  LockedContextField,
} from './types';
import styles from './CreateActionModal.module.scss';

export type CreateActionModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (actionId?: string) => void;
  variant?: 'create' | 'dispatch';
  prefill?: CreateActionPrefill;
  lockPrefill?: boolean;
  lockedContext?: LockedContextField[];
  /** @deprecated 有 lockedContext 时忽略 */
  varietyLabel?: string;
  /** F4：任务标题 placeholder */
  titlePlaceholder?: string;
  /** F4：关联指标 placeholder */
  metricPlaceholder?: string;
  /** 弹窗标题；默认按 variant */
  title?: string;
  /** 主按钮文案；默认 下发/创建 */
  okText?: string;
  dimensionOptions: CreateActionDimensionOption[];
  loaders: CreateActionLoaders;
  emptyAssigneeHint?: string;
  emptyAllocatorHint?: string;
  /**
   * App 注入提交（对齐 EAM：校验通过后写 API / domainSubmit）。
   * 返回新建 actionId（可选）。
   */
  onSubmit: (payload: CreateActionSubmitPayload) => Promise<string | undefined>;
  /** 分配人确认后回调（App 可写 localStorage） */
  onAllocatorConfirmed?: (allocatorUserId: string) => void;
  defaultStatus?: string;
  defaultDueDays?: number;
  width?: number;
  zIndex?: number;
};

/**
 * 主动新建 / 预警下发任务 · FormModal + FormInfo。
 *
 * ## App 注入契约（W1）
 * - `loaders`：人员级联 + 分厂选项（禁 DEMO / 禁 core 直连业务 API）
 * - `dimensionOptions`：任务类型码表（展示名取自 App 数据）
 * - `titlePlaceholder` / `metricPlaceholder`：F4，由 App 注入业务文案
 * - `onSubmit`：对齐 EAM 提交面；actor / analysisId / eventSource / REST 由 App 补齐
 * - EP 门禁：由 App 决定是否打开本 Modal（禁 DEMO 恒真）
 */
const CreateActionModal: React.FC<CreateActionModalProps> = ({
  open,
  onClose,
  onCreated,
  variant = 'create',
  prefill,
  lockPrefill = false,
  lockedContext,
  varietyLabel,
  titlePlaceholder,
  metricPlaceholder,
  title: titleProp,
  okText: okTextProp,
  dimensionOptions,
  loaders,
  emptyAssigneeHint,
  emptyAllocatorHint,
  onSubmit,
  onAllocatorConfirmed,
  defaultStatus = 'approved',
  defaultDueDays = 7,
  width = 560,
  zIndex = 1300,
}) => {
  const [saving, setSaving] = useState(false);
  const assigneeOptsRef = useRef<ActionPersonOption[]>([]);
  const allocatorOptsRef = useRef<ActionPersonOption[]>([]);
  const onAssigneeOptionsReady = useCallback((opts: ActionPersonOption[]) => {
    assigneeOptsRef.current = opts;
  }, []);
  const onAllocatorOptionsReady = useCallback((opts: ActionPersonOption[]) => {
    allocatorOptsRef.current = opts;
  }, []);

  const isDispatch = variant === 'dispatch';
  const useLocked = Boolean(lockedContext && lockedContext.length > 0);
  const scopeFactory = prefill?.factory?.trim() || '';
  const scopeVariety = prefill?.variety?.trim() || '';
  const scopeMetric = prefill?.metric?.trim() || '';
  const lockScope =
    !useLocked &&
    (isDispatch || lockPrefill) &&
    Boolean(scopeFactory || scopeVariety || scopeMetric);

  const modalTitle = titleProp || (isDispatch ? '下发任务' : '新建跟踪任务');
  const okText = okTextProp || (isDispatch ? '下发' : '创建');

  const formInitialData = useMemo(() => {
    const lockedFields: Record<string, string> = {};
    (lockedContext || []).forEach((field, idx) => {
      lockedFields[`lockedContext_${idx}`] = field.value;
    });
    return {
      title: prefill?.title?.trim() || '',
      dimension: prefill?.dimension?.trim() || dimensionOptions[0]?.value || '',
      status: defaultStatus,
      allocatorUserId: '',
      assigneeUserId: '',
      dueDate: addDaysYmd(defaultDueDays),
      factory: scopeFactory,
      variety: useLocked ? '' : scopeVariety,
      metric: useLocked ? '' : scopeMetric,
      ...lockedFields,
    };
  }, [
    lockedContext,
    scopeFactory,
    scopeVariety,
    scopeMetric,
    useLocked,
    prefill?.title,
    prefill?.dimension,
    dimensionOptions,
    defaultStatus,
    defaultDueDays,
  ]);

  const handleSubmit = async (formData: Record<string, unknown>) => {
    const checked = validateCreateActionPersons(
      String(formData.allocatorUserId || ''),
      String(formData.assigneeUserId || ''),
      allocatorOptsRef.current,
      assigneeOptsRef.current,
    );
    if (!checked.ok) {
      message.warning(createActionPersonWarnMessage(checked.code));
      throw new Error(checked.code);
    }

    const { allocator: allocatorOpt, assignee: fromOptions } = checked;
    const allocatorUserId = allocatorOpt.value;
    const assigneeUserId = fromOptions.value;
    onAllocatorConfirmed?.(allocatorUserId);

    setSaving(true);
    try {
      const due = String(formData.dueDate ?? '').trim();
      const assignee = personDisplayName(fromOptions, assigneeUserId);
      const allocator = personDisplayName(allocatorOpt, allocatorUserId);
      const factory = useLocked ? scopeFactory : String(formData.factory || '').trim();
      const variety = useLocked ? '' : String(formData.variety || '').trim();
      const metric = useLocked ? '' : String(formData.metric || '').trim();
      const title = String(formData.title || '').trim();
      const dimension =
        String(formData.dimension || '').trim() ||
        String(prefill?.dimension || '').trim() ||
        dimensionOptions[0]?.value ||
        '';
      const eventLabel = useLocked
        ? (lockedContext || [])
            .map((f) => f.value)
            .filter(Boolean)
            .join(' · ')
        : [factory, variety, metric].filter(Boolean).join(' · ');

      const payload: CreateActionSubmitPayload = {
        title,
        dimension,
        status: String(formData.status || defaultStatus),
        assignee,
        assigneeUserId,
        allocator,
        allocatorUserId,
        owner: assignee,
        dueDate: due || undefined,
        factory,
        variety,
        metric,
        factoryCode: prefill?.factoryCode || undefined,
        factoryName: factory || undefined,
        verifyMetric: metric || undefined,
        eventLabel,
      };

      const actionId = await onSubmit(payload);
      message.success(isDispatch ? '已下发任务' : '已创建跟踪任务');
      onCreated(actionId);
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      if (
        code === 'missing_allocator' ||
        code === 'invalid_allocator' ||
        code === 'missing_assignee' ||
        code === 'invalid_assignee'
      ) {
        throw err;
      }
      message.error(err instanceof Error ? err.message : '创建失败');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal
      className={classNames('create-action-modal', styles['create-action-modal'])}
      title={modalTitle}
      open={open}
      onCancel={onClose}
      autoClose
      okText={okText}
      width={width}
      zIndex={zIndex}
      destroyOnHidden
      okButtonProps={{ loading: saving }}
      formProps={{
        data: formInitialData,
        onSubmit: handleSubmit,
      }}
    >
      <CreateActionForm
        onAssigneeOptionsReady={onAssigneeOptionsReady}
        onAllocatorOptionsReady={onAllocatorOptionsReady}
        lockedContext={useLocked ? lockedContext : undefined}
        varietyLabel={useLocked ? undefined : varietyLabel}
        titlePlaceholder={titlePlaceholder}
        metricPlaceholder={metricPlaceholder}
        dimensionOptions={dimensionOptions}
        loaders={loaders}
        emptyAssigneeHint={emptyAssigneeHint}
        emptyAllocatorHint={emptyAllocatorHint}
        scopeLock={
          lockScope
            ? {
                factory: scopeFactory || undefined,
                variety: scopeVariety || undefined,
                metric: scopeMetric || undefined,
              }
            : undefined
        }
      />
    </FormModal>
  );
};

export default CreateActionModal;
