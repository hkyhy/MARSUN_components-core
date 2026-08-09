import { Checkbox, Col, Empty, Row, Typography } from 'antd';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { PermissionBindCatalog, PermissionBindItem } from './types';

export type PermissionBindPanelProps = {
  /** 三栏目录；缺省时按 code 前缀扁平分组 */
  catalog?: PermissionBindCatalog | null;
  permissions: PermissionBindItem[];
  /** 已选 permissionId */
  value: string[];
  onChange: (nextIds: string[]) => void;
  /** SYSTEM 入口码；未勾时禁用 requiresSystemEntry 模块 */
  systemEntryCodes?: string[];
  /** 只读预览（如用户有效权限）：勾选态展示、禁止改、左右栏仍受 height 约束 */
  readOnly?: boolean;
  className?: string;
  style?: CSSProperties;
  /** 左右栏最大高度（默认 420） */
  height?: number;
};

type ResolvedLeaf = {
  code: string;
  label: string;
  defaultGranted: boolean;
  perm?: PermissionBindItem;
};

type ResolvedCategory = {
  key: string;
  label: string;
  leaves: ResolvedLeaf[];
};

type ResolvedModule = {
  key: string;
  label: string;
  requiresSystemEntry: boolean;
  categories: ResolvedCategory[];
  perms: PermissionBindItem[];
  lockedPermIds: string[];
};

function buildFromCatalog(
  catalog: PermissionBindCatalog,
  byCode: Map<string, PermissionBindItem>,
): { modules: ResolvedModule[]; usedCodes: Set<string>; lockedIds: string[] } {
  const usedCodes = new Set<string>();
  const lockedIds: string[] = [];
  const modules: ResolvedModule[] = [];

  for (const mod of catalog.modules) {
    const categories: ResolvedCategory[] = [];
    const perms: PermissionBindItem[] = [];
    const modLocked: string[] = [];
    for (const cat of mod.categories) {
      const leaves: ResolvedLeaf[] = [];
      for (const leaf of cat.leaves) {
        usedCodes.add(leaf.code);
        const perm = byCode.get(leaf.code);
        const defaultGranted = Boolean(leaf.defaultGranted);
        leaves.push({
          code: leaf.code,
          label: leaf.label,
          defaultGranted,
          perm,
        });
        if (perm) {
          perms.push(perm);
          if (defaultGranted) {
            lockedIds.push(perm.id);
            modLocked.push(perm.id);
          }
        }
      }
      if (leaves.length) {
        categories.push({ key: cat.key, label: cat.label, leaves });
      }
    }
    if (categories.length) {
      modules.push({
        key: mod.key,
        label: mod.label,
        requiresSystemEntry: Boolean(mod.requiresSystemEntry),
        categories,
        perms,
        lockedPermIds: modLocked,
      });
    }
  }

  return { modules, usedCodes, lockedIds };
}

function buildPrefixFallback(permissions: PermissionBindItem[]): ResolvedModule[] {
  const byPrefix = new Map<string, PermissionBindItem[]>();
  for (const p of permissions) {
    const prefix = p.code.includes(':') ? p.code.split(':')[0]! : '_other';
    const arr = byPrefix.get(prefix) || [];
    arr.push(p);
    byPrefix.set(prefix, arr);
  }
  return [...byPrefix.entries()].map(([key, perms]) => {
    const sorted = [...perms].sort((a, b) => a.code.localeCompare(b.code));
    return {
      key,
      label: key,
      requiresSystemEntry: sorted.every((p) => p.layer === 'BUSINESS'),
      categories: [
        {
          key: 'all',
          label: '功能点',
          leaves: sorted.map((p) => ({
            code: p.code,
            label: p.name || p.code,
            defaultGranted: false,
            perm: p,
          })),
        },
      ],
      perms: sorted,
      lockedPermIds: [],
    };
  });
}

function appendUncategorized(
  modules: ResolvedModule[],
  permissions: PermissionBindItem[],
  usedCodes: Set<string>,
): ResolvedModule[] {
  const orphans = permissions.filter((p) => !usedCodes.has(p.code));
  if (!orphans.length) return modules;
  const sorted = [...orphans].sort((a, b) => a.code.localeCompare(b.code));
  return [
    ...modules,
    {
      key: 'uncategorized',
      label: '未分类',
      requiresSystemEntry: true,
      categories: [
        {
          key: 'orphan',
          label: '未归入目录的权限点',
          leaves: sorted.map((p) => ({
            code: p.code,
            label: p.name || p.code,
            defaultGranted: false,
            perm: p,
          })),
        },
      ],
      perms: sorted,
      lockedPermIds: [],
    },
  ];
}

/**
 * 角色绑权三栏信息架构：左页面模块 · 主区按业务功能点分类分组勾选。
 * defaultGranted 叶子勾选且不可取消。
 */
export default function PermissionBindPanel({
  catalog,
  permissions,
  value,
  onChange,
  systemEntryCodes = [],
  readOnly = false,
  className,
  style,
  height = 420,
}: PermissionBindPanelProps) {
  const bindable = useMemo(() => permissions.filter((p) => p.layer !== 'RESOURCE'), [permissions]);

  const byCode = useMemo(() => {
    const m = new Map<string, PermissionBindItem>();
    for (const p of bindable) m.set(p.code, p);
    return m;
  }, [bindable]);

  const { modules, lockedIds } = useMemo(() => {
    if (catalog?.modules?.length) {
      const built = buildFromCatalog(catalog, byCode);
      return {
        modules: appendUncategorized(built.modules, bindable, built.usedCodes),
        lockedIds: built.lockedIds,
      };
    }
    return { modules: buildPrefixFallback(bindable), lockedIds: [] as string[] };
  }, [catalog, byCode, bindable]);

  const lockedIdSet = useMemo(() => new Set(lockedIds), [lockedIds]);

  const systemEntryOpen = useMemo(() => {
    if (readOnly) return true;
    if (!systemEntryCodes.length) return true;
    const entryIds = bindable.filter((p) => systemEntryCodes.includes(p.code)).map((p) => p.id);
    if (!entryIds.length) return true;
    return entryIds.some((id) => value.includes(id));
  }, [readOnly, systemEntryCodes, bindable, value]);

  /** SYSTEM 入口打开时才强制基线；关掉入口时允许 strip 业务码 */
  const mergeLocked = (ids: string[]) =>
    systemEntryOpen ? [...new Set([...ids, ...lockedIds])] : ids;

  useEffect(() => {
    if (readOnly) return;
    if (!systemEntryOpen || !lockedIds.length) return;
    const missing = lockedIds.filter((id) => !value.includes(id));
    if (missing.length) onChange(mergeLocked(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockedIds.join('|'), systemEntryOpen, readOnly]);

  const [activeModule, setActiveModule] = useState('');

  useEffect(() => {
    if (!modules.length) {
      setActiveModule('');
      return;
    }
    if (!modules.some((m) => m.key === activeModule)) {
      setActiveModule(modules[0]!.key);
    }
  }, [modules, activeModule]);

  const active = modules.find((m) => m.key === activeModule) || modules[0];

  const moduleLocked = (mod: ResolvedModule | undefined) =>
    Boolean(mod?.requiresSystemEntry && !systemEntryOpen);

  const setIds = (next: string[]) => {
    if (readOnly) return;
    onChange(mergeLocked(next));
  };

  const toggleId = (id: string, on: boolean) => {
    if (readOnly) return;
    if (systemEntryOpen && lockedIdSet.has(id)) return;
    if (on) setIds([...value, id]);
    else setIds(value.filter((x) => x !== id));
  };

  const toggleAllInModule = (mod: ResolvedModule, on: boolean) => {
    if (readOnly) return;
    const optionalIds = mod.perms.filter((p) => !lockedIdSet.has(p.id)).map((p) => p.id);
    if (on) setIds([...value, ...optionalIds]);
    else {
      const drop = new Set(optionalIds);
      setIds(value.filter((id) => !drop.has(id)));
    }
  };

  if (!modules.length) {
    return <Empty description="暂无权限点" className={className} style={style} />;
  }

  const locked = moduleLocked(active);

  return (
    <Row
      gutter={0}
      className={className}
      style={{
        border: '1px solid var(--ant-color-border, #d9d9d9)',
        borderRadius: 8,
        minHeight: height,
        overflow: 'hidden',
        ...style,
      }}
    >
      <Col
        span={7}
        style={{
          borderRight: '1px solid var(--ant-color-border, #d9d9d9)',
          background: 'var(--ant-color-fill-quaternary, #fafafa)',
          maxHeight: height,
          overflow: 'auto',
        }}
      >
        {modules.map((m) => {
          const selected = m.perms.filter((p) => value.includes(p.id)).length;
          const total = m.perms.length;
          const isActive = m.key === (active?.key || '');
          return (
            <div
              key={m.key}
              role="button"
              tabIndex={0}
              onClick={() => setActiveModule(m.key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setActiveModule(m.key);
              }}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                background: isActive ? 'var(--ant-color-primary-bg, #e6f4ff)' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                borderLeft: isActive
                  ? '3px solid var(--ant-color-primary, #1677ff)'
                  : '3px solid transparent',
                opacity: moduleLocked(m) && selected === 0 ? 0.75 : 1,
              }}
            >
              <div>{m.label}</div>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {selected}/{total}
              </Typography.Text>
            </div>
          );
        })}
      </Col>
      <Col span={17} style={{ padding: 16, maxHeight: height, overflow: 'auto' }}>
        {active ? (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 12,
                alignItems: 'center',
              }}
            >
              <Typography.Text strong>{active.label}</Typography.Text>
              {readOnly ? null : (
                <Checkbox
                  disabled={locked || active.perms.every((p) => lockedIdSet.has(p.id))}
                  checked={
                    active.perms.length > 0 && active.perms.every((p) => value.includes(p.id))
                  }
                  indeterminate={
                    active.perms.some((p) => value.includes(p.id)) &&
                    !active.perms.every((p) => value.includes(p.id))
                  }
                  onChange={(e) => toggleAllInModule(active, e.target.checked)}
                >
                  全选本模块
                </Checkbox>
              )}
            </div>

            {active.categories.map((cat) => (
              <CategoryBlock
                key={cat.key}
                category={cat}
                value={value}
                moduleDisabled={locked}
                lockedIdSet={lockedIdSet}
                readOnly={readOnly}
                onToggle={toggleId}
              />
            ))}

            {!readOnly && locked ? (
              <Typography.Text type="warning" style={{ display: 'block', marginTop: 12 }}>
                请先勾选 SYSTEM 入口权，再勾选业务权限。基线权限仍保持勾选。
              </Typography.Text>
            ) : null}
          </>
        ) : null}
      </Col>
    </Row>
  );
}

function CategoryBlock({
  category,
  value,
  moduleDisabled,
  lockedIdSet,
  readOnly,
  onToggle,
}: {
  category: ResolvedCategory;
  value: string[];
  moduleDisabled: boolean;
  lockedIdSet: Set<string>;
  readOnly: boolean;
  onToggle: (id: string, on: boolean) => void;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Typography.Text
        type="secondary"
        style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}
      >
        {category.label}
      </Typography.Text>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '8px 16px',
        }}
      >
        {category.leaves.map((leaf) => {
          const perm = leaf.perm;
          if (!perm) {
            return (
              <Checkbox key={leaf.code} disabled>
                {leaf.label}
                <Typography.Text type="secondary" style={{ marginLeft: 6, fontSize: 12 }}>
                  {leaf.code}（未注册）
                </Typography.Text>
              </Checkbox>
            );
          }
          const isBaseline = leaf.defaultGranted || lockedIdSet.has(perm.id);
          return (
            <Checkbox
              key={perm.id}
              disabled={readOnly || isBaseline || moduleDisabled}
              checked={value.includes(perm.id)}
              onChange={(e) => onToggle(perm.id, e.target.checked)}
            >
              {leaf.label || perm.name}
              <Typography.Text type="secondary" style={{ marginLeft: 6, fontSize: 12 }}>
                {perm.code}
                {leaf.defaultGranted ? ' · 基线' : ''}
              </Typography.Text>
            </Checkbox>
          );
        })}
      </div>
    </div>
  );
}
