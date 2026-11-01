import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  DatePicker,
  FormInfo,
  Input,
  SuperSelect,
  TextArea,
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
  CreateActionScopeMode,
  CreateActionSelectOption,
  LockedContextField,
} from './types';
import styles from './CreateActionForm.module.scss';

/** 建单品种下拉页大小（服务端分页） */
export const CREATE_ACTION_VARIETY_PAGE_SIZE = 20;
/** 执行人按角色分页页大小 */
export const CREATE_ACTION_ASSIGNEE_PAGE_SIZE = 20;

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
  /**
   * 业务上下文字段模式。有 lockedContext 时强制 locked。
   * 默认 form（S3）；EAM 主动新建传 none。
   */
  scopeMode?: CreateActionScopeMode;
  /** F4：任务标题 placeholder（App 注入；禁写死业务文案） */
  titlePlaceholder?: string;
  /** F4：任务描述 placeholder（App 注入） */
  descriptionPlaceholder?: string;
  /** F4：关联指标 placeholder */
  metricPlaceholder?: string;
  /** scopeMode=none 时展示在截止日期下的短提示（App 注入） */
  noneScopeHint?: string;
  dimensionOptions: CreateActionDimensionOption[];
  loaders: CreateActionLoaders;
  emptyAssigneeHint?: string;
  emptyAllocatorHint?: string;
  allocatorPlaceholder?: string;
  assigneePlaceholder?: string;
  /**
   * 分配人只读。新建/编辑均禁用改派（默认 true）；
   * 值由 pickDefaultAllocatorUserId / 表单初值写入。
   */
  allocatorDisabled?: boolean;
  /** 编辑回填：执行人 userId（级联选项就绪后写入） */
  defaultAssigneeUserId?: string;
  /** 编辑回填：执行人展示名（联动选人时作 options 种子） */
  defaultAssigneeLabel?: string;
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
  scopeMode: scopeModeProp = 'form',
  titlePlaceholder,
  descriptionPlaceholder,
  metricPlaceholder,
  noneScopeHint,
  dimensionOptions,
  loaders,
  emptyAssigneeHint = '暂无执行人',
  emptyAllocatorHint = '暂无分配人',
  allocatorPlaceholder = '先选角色，再选分配人',
  assigneePlaceholder = '先选角色，再选执行人',
  allocatorDisabled = true,
  defaultAssigneeUserId = '',
  defaultAssigneeLabel = '',
  onAssigneeOptionsReady,
  onAllocatorOptionsReady,
}) => {
  const formApi = useFormApi() as { openApi: OpenApiLike };
  const useLinkedAssignee = Boolean(loaders.loadAssigneeRoles && loaders.loadAssigneeUsersPage);
  const [assigneeCascade, setAssigneeCascade] = useState<ActionPersonCascadeOption[]>([]);
  const [assigneeRoleOptions, setAssigneeRoleOptions] = useState<CreateActionSelectOption[]>([]);
  const [assigneeRoleCode, setAssigneeRoleCode] = useState('');
  const [selectedAssigneeOptions, setSelectedAssigneeOptions] = useState<
    CreateActionSelectOption[]
  >(() => {
    const id = String(defaultAssigneeUserId || '').trim();
    if (!id) return [];
    const label = String(defaultAssigneeLabel || id).trim() || id;
    return [{ value: id, label }];
  });
  const assigneeCacheRef = useRef<Map<string, ActionPersonOption>>(new Map());
  const [allocatorCascade, setAllocatorCascade] = useState<ActionPersonCascadeOption[]>([]);
  const [factoryOptions, setFactoryOptions] = useState<CreateActionSelectOption[]>([]);
  const [personLoading, setPersonLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [factoryLoading, setFactoryLoading] = useState(false);
  const [defaultAllocatorUserId, setDefaultAllocatorUserId] = useState('');
  /** 分配人只读展示名（姓名 · 工号）；写死当前登录人，不走级联选人 */
  const [allocatorDisplay, setAllocatorDisplay] = useState('');
  const [factoryKey, setFactoryKey] = useState(() => scopeLock?.factory?.trim() || '');
  const factoryRef = useRef(scopeLock?.factory?.trim() || '');
  const roleRef = useRef('');

  const publishAssigneeOptions = useCallback(() => {
    onAssigneeOptionsReady?.([...assigneeCacheRef.current.values()]);
  }, [onAssigneeOptionsReady]);

  const seedAssigneeOption = useCallback(
    (userId: string, displayName: string) => {
      const id = String(userId || '').trim();
      if (!id) return;
      const name = String(displayName || id).trim() || id;
      assigneeCacheRef.current.set(id, { value: id, displayName: name });
      setSelectedAssigneeOptions((prev) =>
        prev.some((o) => o.value === id) ? prev : [{ value: id, label: name }, ...prev],
      );
      publishAssigneeOptions();
    },
    [publishAssigneeOptions],
  );

  const useLockedContext = Boolean(lockedContext && lockedContext.length > 0);
  const resolvedScopeMode: CreateActionScopeMode = useLockedContext
    ? 'locked'
    : scopeModeProp === 'none'
      ? 'none'
      : 'form';
  const useNoneScope = resolvedScopeMode === 'none';
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

  const assigneeUsersApi = useMemo(() => {
    if (!useLinkedAssignee || !assigneeRoleCode || !loaders.loadAssigneeUsersPage) {
      return undefined;
    }
    const loadPage = loaders.loadAssigneeUsersPage;
    const roleCode = assigneeRoleCode;
    return createPagedSuperSelectApi({
      pageSize: CREATE_ACTION_ASSIGNEE_PAGE_SIZE,
      loadPage: async (query) => {
        const page = await loadPage({
          ...query,
          roleCode,
        });
        for (const row of page.pageData || []) {
          const id = String(row.value || '').trim();
          if (!id) continue;
          assigneeCacheRef.current.set(id, {
            value: id,
            displayName: String(row.label || id),
            employeeId:
              String((row as { employeeId?: string }).employeeId || '').trim() || undefined,
          });
        }
        publishAssigneeOptions();
        return page;
      },
      onError: () => message.error('执行人列表加载失败'),
    });
  }, [useLinkedAssignee, assigneeRoleCode, loaders.loadAssigneeUsersPage, publishAssigneeOptions]);

  const assigneeUsersGetSearchProps = useMemo(
    () => pagedSuperSelectGetSearchProps(CREATE_ACTION_ASSIGNEE_PAGE_SIZE),
    [],
  );

  const assigneeUsersPagination = useMemo(
    () => pagedSuperSelectPagination(CREATE_ACTION_ASSIGNEE_PAGE_SIZE),
    [],
  );

  const handleFormSync = useCallback(
    (data: Record<string, unknown>) => {
      if (useLinkedAssignee) {
        const nextRole = asFactoryValue(data.assigneeRoleCode);
        if (nextRole !== roleRef.current) {
          const prevRole = roleRef.current;
          roleRef.current = nextRole;
          setAssigneeRoleCode(nextRole);
          if (prevRole && nextRole !== prevRole) {
            queueMicrotask(() => {
              formApi.openApi.setFieldValue({ name: 'assigneeUserId' }, '', {
                runValidate: false,
              });
            });
          }
        }
        const uid = asFactoryValue(data.assigneeUserId);
        if (uid) {
          const hit = selectedAssigneeOptions.find((o) => o.value === uid);
          if (hit) seedAssigneeOption(uid, String(hit.label || uid));
        }
      }
      if (useLockedContext || useNoneScope) return;
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
    [
      formApi.openApi,
      hasVarietyPage,
      lockVariety,
      useLockedContext,
      useNoneScope,
      useLinkedAssignee,
      selectedAssigneeOptions,
      seedAssigneeOption,
    ],
  );

  useEffect(() => {
    const locked = scopeLock?.factory?.trim() || '';
    if (!locked) return;
    factoryRef.current = locked;
    setFactoryKey(locked);
  }, [scopeLock?.factory]);

  /** 分配人：本地登录态；执行人联动模式只拉角色，禁一次性 candidates */
  useEffect(() => {
    let cancelled = false;
    setPersonLoading(true);
    const assigneePromise = useLinkedAssignee
      ? Promise.resolve({
          status: 'fulfilled' as const,
          value: {
            cascadeOptions: [] as ActionPersonCascadeOption[],
            options: [] as ActionPersonOption[],
          },
        })
      : settleWithTimeout(loaders.loadAssigneeCatalog(), CATALOG_LOAD_TIMEOUT_MS);

    Promise.all([
      assigneePromise,
      settleWithTimeout(loaders.loadAllocatorCatalog(), CATALOG_LOAD_TIMEOUT_MS),
    ])
      .then(([usersRes, allocRes]) => {
        if (cancelled) return;
        if (!useLinkedAssignee) {
          if (usersRes.status === 'fulfilled') {
            setAssigneeCascade(usersRes.value.cascadeOptions);
            onAssigneeOptionsReady?.(usersRes.value.options);
          } else {
            message.error('执行人列表加载失败');
            setAssigneeCascade([]);
            onAssigneeOptionsReady?.([]);
          }
        }
        if (allocRes.status === 'fulfilled') {
          setAllocatorCascade(allocRes.value.cascadeOptions);
          onAllocatorOptionsReady?.(allocRes.value.options);
          const pick = loaders.pickDefaultAllocatorUserId;
          const pickedId = pick ? pick(allocRes.value.options) : '';
          setDefaultAllocatorUserId(pickedId);
          const opt = allocRes.value.options.find((o) => o.value === pickedId);
          const name = String(opt?.displayName || '').trim();
          const emp = String(opt?.employeeId || '').trim();
          setAllocatorDisplay(name && emp ? `${name} · ${emp}` : name || emp || emptyAllocatorHint);
        } else {
          message.error('分配人列表加载失败');
          setAllocatorCascade([]);
          onAllocatorOptionsReady?.([]);
          setAllocatorDisplay(emptyAllocatorHint);
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

  useEffect(() => {
    if (!useLinkedAssignee || !loaders.loadAssigneeRoles) return;
    let cancelled = false;
    setRolesLoading(true);
    settleWithTimeout(loaders.loadAssigneeRoles(), CATALOG_LOAD_TIMEOUT_MS)
      .then((res) => {
        if (cancelled) return;
        if (res.status === 'fulfilled') {
          setAssigneeRoleOptions(res.value);
        } else {
          message.error('执行人角色加载失败');
          setAssigneeRoleOptions([]);
        }
      })
      .finally(() => {
        if (!cancelled) setRolesLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only
  }, []);

  useEffect(() => {
    const id = String(defaultAssigneeUserId || '').trim();
    if (!id) return;
    seedAssigneeOption(id, String(defaultAssigneeLabel || id));
  }, [defaultAssigneeUserId, defaultAssigneeLabel, seedAssigneeOption]);

  /** 分厂：与人员并行、互不阻塞（对齐 EAM CycleForm 静态 options） */
  useEffect(() => {
    if (useLockedContext || useNoneScope || !loaders.loadFactoryOptions) return;
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

  const scopeFields: ReactNode[] = useLockedContext
    ? (lockedContext || []).map((field, idx) => (
        <Input
          key={`locked-${idx}-${field.label}`}
          name={`lockedContext_${idx}`}
          label={field.label}
          disabled
        />
      ))
    : useNoneScope
      ? []
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

  const assigneeDefault = String(defaultAssigneeUserId || '').trim();

  return (
    <div className={classNames('create-action-form', styles['create-action-form'])}>
      <FormDataSync onChange={handleFormSync} />
      <SetFormFields
        patch={{
          allocatorUserId: defaultAllocatorUserId,
          allocatorDisplay,
          ...(assigneeDefault ? { assigneeUserId: assigneeDefault } : {}),
        }}
      />
      <FormInfo
        column={1}
        list={[
          <Input
            key="title"
            name="title"
            label="任务标题"
            rule="REQ"
            placeholder={titlePlaceholder || '请输入任务标题'}
            maxLength={120}
          />,
          <TextArea
            key="description"
            name="description"
            label="任务描述"
            labelTips="可选"
            rows={5}
            block
            maxLength={2000}
            placeholder={
              descriptionPlaceholder || '说明目前情况、问题与需改进点，便于执行人理解背景'
            }
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
          allocatorDisabled ? (
            <Input
              key="allocatorDisplay"
              name="allocatorDisplay"
              label="分配人"
              disabled
              placeholder={personLoading ? '加载中…' : emptyAllocatorHint}
            />
          ) : (
            <PersonRoleCascaderField
              key="allocatorUserId"
              name="allocatorUserId"
              label="分配人"
              cascadeOptions={allocatorCascade}
              loading={personLoading}
              disabled={allocatorDisabled}
              emptyHint={emptyAllocatorHint}
              placeholder={allocatorPlaceholder}
              defaultUserId={defaultAllocatorUserId}
            />
          ),
          useLinkedAssignee ? (
            <SuperSelect
              key="assigneeRoleCode"
              name="assigneeRoleCode"
              label="执行人角色"
              rule="REQ"
              single
              options={assigneeRoleOptions}
              placeholder={rolesLoading ? '加载角色…' : '先选择角色'}
              disabled={rolesLoading || !assigneeRoleOptions.length}
              allowClear
              searchPlaceholder="搜索角色"
            />
          ) : null,
          useLinkedAssignee ? (
            <SuperSelect
              key={`assigneeUserId-${assigneeRoleCode || 'none'}`}
              name="assigneeUserId"
              label="执行人"
              rule="REQ"
              single
              api={assigneeUsersApi}
              options={selectedAssigneeOptions}
              getSearchProps={assigneeUsersGetSearchProps}
              pagination={assigneeUsersPagination}
              placeholder={
                !assigneeRoleCode
                  ? '请先选择角色'
                  : assigneePlaceholder || '搜索姓名/工号选择执行人'
              }
              disabled={!assigneeRoleCode || !assigneeUsersApi}
              allowClear
              searchPlaceholder="搜索姓名/工号"
              overlayStyle={{ zIndex: 2000 }}
            />
          ) : (
            <PersonRoleCascaderField
              key="assigneeUserId"
              name="assigneeUserId"
              label="执行人"
              cascadeOptions={assigneeCascade}
              loading={personLoading}
              emptyHint={emptyAssigneeHint}
              placeholder={assigneePlaceholder}
              defaultUserId={assigneeDefault}
            />
          ),
          <DatePicker
            key="dueDate"
            name="dueDate"
            label="截止日期"
            labelTips="可选"
            format="YYYY-MM-DD"
            placeholder="选择截止日期"
            allowClear
          />,
          ...scopeFields,
        ]}
      />
      {useNoneScope && noneScopeHint ? (
        <p className={classNames('create-action-none-hint', styles['create-action-none-hint'])}>
          {noneScopeHint}
        </p>
      ) : null}
    </div>
  );
};

export default CreateActionForm;
