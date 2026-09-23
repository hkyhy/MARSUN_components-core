import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  FormInfo,
  Input,
  SuperSelect,
  createPagedSuperSelectApi,
  pagedSuperSelectGetSearchProps,
  pagedSuperSelectPagination,
} from '../../../FormInfo';
import FormDataSync from '../../../Form/FormDataSync';
import { useFormApi } from '../../../Form';
import { message } from 'antd';
import classNames from 'classnames';
import PersonRoleCascaderField from './PersonRoleCascaderField';
import { SetFormFields } from './SetFormFields';
import type {
  ActionPersonCascadeOption,
  ActionPersonOption,
  CreateActionDimensionOption,
  CreateActionLoaders,
  CreateActionScopeLock,
  CreateActionSelectOption,
  LockedContextField,
} from './types';
import styles from './CreateActionForm.module.scss';

/** 建单品种下拉页大小（服务端分页） */
export const CREATE_ACTION_VARIETY_PAGE_SIZE = 20;

const CATALOG_LOAD_TIMEOUT_MS = 15_000;

function settleWithTimeout<T>(promise: Promise<T>, ms: number): Promise<PromiseSettledResult<T>> {
  return Promise.race([
    promise.then(
      (value) => ({ status: 'fulfilled' as const, value }),
      (reason) => ({ status: 'rejected' as const, reason }),
    ),
    new Promise<PromiseSettledResult<T>>((resolve) => {
      setTimeout(() => resolve({ status: 'rejected', reason: new Error('timeout') }), ms);
    }),
  ]);
}

function asFactoryValue(raw: unknown): string {
  if (raw == null || raw === '') return '';
  if (Array.isArray(raw)) return String(raw[0] ?? '').trim();
  if (typeof raw === 'object') {
    const o = raw as { value?: unknown };
    return String(o.value ?? '').trim();
  }
  return String(raw).trim();
}

export type CreateActionFormProps = {
  scopeLock?: CreateActionScopeLock;
  varietyLabel?: string;
  lockedContext?: LockedContextField[];
  /** F4：任务标题 placeholder（App 注入；禁写死业务文案） */
  titlePlaceholder?: string;
  /** F4：关联指标 placeholder */
  metricPlaceholder?: string;
  dimensionOptions: CreateActionDimensionOption[];
  loaders: CreateActionLoaders;
  emptyAssigneeHint?: string;
  emptyAllocatorHint?: string;
  allocatorPlaceholder?: string;
  assigneePlaceholder?: string;
  onAssigneeOptionsReady?: (options: ActionPersonOption[]) => void;
  onAllocatorOptionsReady?: (options: ActionPersonOption[]) => void;
};

export function renderPersonOptionLabel(name: string, org: string): ReactNode {
  if (!org) return name;
  return (
    <span className={styles['assignee-option']}>
      <span className={styles['assignee-option-name']}>{name}</span>
      <span className={styles['assignee-option-org']}>{org}</span>
    </span>
  );
}

type OpenApiLike = {
  setFieldValue: (
    token: { name: string },
    value: unknown,
    options?: { runValidate?: boolean },
  ) => void;
};

/** 新建跟踪任务 / 下发任务字段（FormModal + FormInfo）；数据经 loaders 注入 */
const CreateActionForm: React.FC<CreateActionFormProps> = ({
  scopeLock,
  varietyLabel,
  lockedContext,
  titlePlaceholder,
  metricPlaceholder,
  dimensionOptions,
  loaders,
  emptyAssigneeHint = '暂无执行人',
  emptyAllocatorHint = '暂无分配人',
  allocatorPlaceholder = '先选角色，再选分配人',
  assigneePlaceholder = '先选角色，再选执行人',
  onAssigneeOptionsReady,
  onAllocatorOptionsReady,
}) => {
  const formApi = useFormApi() as { openApi: OpenApiLike };
  const [assigneeCascade, setAssigneeCascade] = useState<ActionPersonCascadeOption[]>([]);
  const [allocatorCascade, setAllocatorCascade] = useState<ActionPersonCascadeOption[]>([]);
  const [factoryOptions, setFactoryOptions] = useState<CreateActionSelectOption[]>([]);
  const [personLoading, setPersonLoading] = useState(true);
  const [factoryLoading, setFactoryLoading] = useState(false);
  const [defaultAllocatorUserId, setDefaultAllocatorUserId] = useState('');
  const [factoryKey, setFactoryKey] = useState(() => scopeLock?.factory?.trim() || '');
  const factoryRef = useRef(scopeLock?.factory?.trim() || '');

  const useLockedContext = Boolean(lockedContext && lockedContext.length > 0);
  const lockFactory = Boolean(scopeLock?.factory?.trim());
  const lockVariety = Boolean(scopeLock?.variety?.trim());
  const lockMetric = Boolean(scopeLock?.metric?.trim());
  const hasVarietyPage = typeof loaders.loadVarietyPage === 'function';
  const canLoadVariety = Boolean(factoryKey) || lockVariety;

  const factorySelectOptions = useMemo(() => {
    const locked = scopeLock?.factory?.trim();
    if (!locked) return factoryOptions;
    if (factoryOptions.some((o) => o.value === locked)) return factoryOptions;
    return [{ value: locked, label: locked }, ...factoryOptions];
  }, [factoryOptions, scopeLock?.factory]);

  const varietySelectApi = useMemo(() => {
    if (!hasVarietyPage || !loaders.loadVarietyPage) return undefined;
    const loadPage = loaders.loadVarietyPage;
    return createPagedSuperSelectApi({
      pageSize: CREATE_ACTION_VARIETY_PAGE_SIZE,
      loadPage: (query) =>
        loadPage({
          ...query,
          factory: factoryRef.current,
        }),
      onError: () => message.error('品种列表加载失败'),
    });
  }, [hasVarietyPage, loaders.loadVarietyPage]);

  const varietyGetSearchProps = useMemo(
    () => pagedSuperSelectGetSearchProps(CREATE_ACTION_VARIETY_PAGE_SIZE),
    [],
  );

  const varietyPagination = useMemo(
    () => pagedSuperSelectPagination(CREATE_ACTION_VARIETY_PAGE_SIZE),
    [],
  );

  const handleFormSync = useCallback(
    (data: Record<string, unknown>) => {
      if (useLockedContext) return;
      const next = asFactoryValue(data.factory);
      if (next === factoryRef.current) return;
      const prev = factoryRef.current;
      factoryRef.current = next;
      setFactoryKey(next);
      if (prev && next !== prev && hasVarietyPage && !lockVariety) {
        queueMicrotask(() => {
          formApi.openApi.setFieldValue({ name: 'variety' }, '', { runValidate: false });
        });
      }
    },
    [formApi.openApi, hasVarietyPage, lockVariety, useLockedContext],
  );

  useEffect(() => {
    const locked = scopeLock?.factory?.trim() || '';
    if (!locked) return;
    factoryRef.current = locked;
    setFactoryKey(locked);
  }, [scopeLock?.factory]);

  /** 人员目录：独立加载 + 超时，避免拖死分厂 */
  useEffect(() => {
    let cancelled = false;
    setPersonLoading(true);
    Promise.all([
      settleWithTimeout(loaders.loadAssigneeCatalog(), CATALOG_LOAD_TIMEOUT_MS),
      settleWithTimeout(loaders.loadAllocatorCatalog(), CATALOG_LOAD_TIMEOUT_MS),
    ])
      .then(([usersRes, allocRes]) => {
        if (cancelled) return;
        if (usersRes.status === 'fulfilled') {
          setAssigneeCascade(usersRes.value.cascadeOptions);
          onAssigneeOptionsReady?.(usersRes.value.options);
        } else {
          message.error('执行人列表加载失败');
          setAssigneeCascade([]);
          onAssigneeOptionsReady?.([]);
        }
        if (allocRes.status === 'fulfilled') {
          setAllocatorCascade(allocRes.value.cascadeOptions);
          onAllocatorOptionsReady?.(allocRes.value.options);
          const pick = loaders.pickDefaultAllocatorUserId;
          setDefaultAllocatorUserId(pick ? pick(allocRes.value.options) : '');
        } else {
          message.error('分配人列表加载失败');
          setAllocatorCascade([]);
          onAllocatorOptionsReady?.([]);
        }
      })
      .finally(() => {
        if (!cancelled) setPersonLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only load
  }, []);

  /** 分厂：与人员并行、互不阻塞（对齐 EAM CycleForm 静态 options） */
  useEffect(() => {
    if (useLockedContext || !loaders.loadFactoryOptions) return;
    let cancelled = false;
    setFactoryLoading(true);
    settleWithTimeout(loaders.loadFactoryOptions(), CATALOG_LOAD_TIMEOUT_MS)
      .then((factoriesRes) => {
        if (cancelled) return;
        if (factoriesRes.status === 'fulfilled') {
          setFactoryOptions(factoriesRes.value);
        } else {
          message.error('分厂列表加载失败');
          setFactoryOptions([]);
        }
      })
      .finally(() => {
        if (!cancelled) setFactoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only load
  }, []);

  const lockedList = useLockedContext
    ? (lockedContext || []).map((field, idx) => (
        <Input
          key={`locked-${idx}-${field.label}`}
          name={`lockedContext_${idx}`}
          label={field.label}
          disabled
        />
      ))
    : [
        <SuperSelect
          key="factory"
          name="factory"
          label="分厂"
          single
          options={factorySelectOptions}
          placeholder={factoryLoading ? '加载分厂…' : '选择分厂'}
          disabled={factoryLoading || lockFactory}
          allowClear={!lockFactory}
        />,
        hasVarietyPage && varietySelectApi ? (
          <SuperSelect
            key={`variety-${factoryKey || 'none'}`}
            name="variety"
            label={varietyLabel || '品种'}
            single
            api={varietySelectApi}
            getSearchProps={varietyGetSearchProps}
            pagination={varietyPagination}
            placeholder={canLoadVariety ? '选择品种' : '请先选择分厂'}
            disabled={lockVariety || !canLoadVariety}
            allowClear={!lockVariety}
            searchPlaceholder="搜索品种"
          />
        ) : (
          <SuperSelect
            key="variety"
            name="variety"
            label={varietyLabel || '品种'}
            single
            options={[]}
            placeholder="App 未注入 loadVarietyPage"
            disabled
          />
        ),
        <Input
          key="metric"
          name="metric"
          label="关联指标"
          placeholder={metricPlaceholder || '可选'}
          maxLength={40}
          disabled={lockMetric}
        />,
      ];

  return (
    <div className={classNames('create-action-form', styles['create-action-form'])}>
      <FormDataSync onChange={handleFormSync} />
      <SetFormFields patch={{ allocatorUserId: defaultAllocatorUserId }} />
      <FormInfo
        column={1}
        gap={0}
        list={[
          <Input
            key="title"
            name="title"
            label="任务标题"
            rule="REQ"
            placeholder={titlePlaceholder || '请输入任务标题'}
            maxLength={120}
          />,
          <SuperSelect
            key="dimension"
            name="dimension"
            label="任务类型"
            rule="REQ"
            single
            options={dimensionOptions}
            placeholder="选择任务类型"
          />,
        ]}
      />
      <PersonRoleCascaderField
        name="allocatorUserId"
        label="分配人"
        cascadeOptions={allocatorCascade}
        loading={personLoading}
        emptyHint={emptyAllocatorHint}
        placeholder={allocatorPlaceholder}
        defaultUserId={defaultAllocatorUserId}
      />
      <PersonRoleCascaderField
        name="assigneeUserId"
        label="执行人"
        cascadeOptions={assigneeCascade}
        loading={personLoading}
        emptyHint={emptyAssigneeHint}
        placeholder={assigneePlaceholder}
      />
      <FormInfo
        column={1}
        gap={0}
        list={[
          <Input key="dueDate" name="dueDate" label="截止日期（可选）" type="date" />,
          ...lockedList,
        ]}
      />
    </div>
  );
};

export default CreateActionForm;
