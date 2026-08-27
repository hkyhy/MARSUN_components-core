import { Pencil, Plus, Trash2 } from '../Icons';
import { Button, Popconfirm, Space, Spin, Tooltip, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import classNames from 'classnames';
import React, { useEffect, useMemo, useRef, useState, type Key, type ReactNode } from 'react';
import styles from './style.module.scss';

export type OrgTreeNode = {
  id: string;
  name: string;
  parentId?: string | null;
  children?: OrgTreeNode[];
  /** 名称旁附加文案（如 mapped） */
  nameExtra?: ReactNode;
};

export type OrgTreeProps = {
  nodes: OrgTreeNode[];
  loading?: boolean;
  /** 展示节点内增删改操作 */
  editable?: boolean;
  className?: string;
  /**
   * 初始展开深度：0=全部折叠；1=展开根（露出一级子，默认）；
   * 传很大的数或 Infinity ≈ 全展开（仅小树建议）。
   */
  defaultExpandDepth?: number;
  /** 虚拟列表可视高度（px）；节点多时默认开启 */
  virtualHeight?: number | false;
  /** 受控选中（点选节点，如右侧岗位面板） */
  selectedKeys?: Key[];
  onSelect?: (node: { id: string; name: string; parentId: string | null } | null) => void;
  onAdd?: (parentId: string) => void;
  onEdit?: (node: { id: string; name: string; parentId: string | null }) => void;
  /** 确认删除后回调；由业务执行 API */
  onDelete?: (node: { id: string; name: string }) => void | Promise<void>;
  /** 删除确认文案 */
  deleteConfirmTitle?: string;
  /** 确认钮文案（软禁用场景可传「禁用」） */
  deleteOkText?: string;
  deleteOkType?: 'primary' | 'danger';
};

/** 收集需展开的 key：depth=1 只展开根，露出一级子节点 */
function collectExpandedKeys(nodes: OrgTreeNode[], depth: number): string[] {
  if (depth <= 0 || !nodes.length) return [];
  const keys: string[] = [];
  for (const n of nodes) {
    if (n.children?.length) {
      keys.push(n.id);
      if (depth > 1) {
        keys.push(...collectExpandedKeys(n.children, depth - 1));
      }
    }
  }
  return keys;
}

function countNodes(nodes: OrgTreeNode[]): number {
  let n = 0;
  for (const node of nodes) {
    n += 1;
    if (node.children?.length) n += countNodes(node.children);
  }
  return n;
}

function findOrgNode(
  list: OrgTreeNode[],
  id: string,
): { id: string; name: string; parentId: string | null } | null {
  for (const n of list) {
    if (n.id === id) {
      return { id: n.id, name: n.name, parentId: n.parentId ?? null };
    }
    if (n.children?.length) {
      const hit = findOrgNode(n.children, id);
      if (hit) return hit;
    }
  }
  return null;
}

/**
 * 组织树（对齐 Assets 组织架构行为）：可配置展开深度、节点 hover 增删改。
 * 纯 UI，无业务 API。大树勿默认全展开（会卡死 DOM）。
 */
const OrgTree: React.FC<OrgTreeProps> = ({
  nodes,
  loading = false,
  editable = false,
  className,
  defaultExpandDepth = 1,
  virtualHeight,
  selectedKeys,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  deleteConfirmTitle = '确认删除该节点？',
  deleteOkText = '删除',
  deleteOkType = 'danger',
}) => {
  const nodeCount = useMemo(() => countNodes(nodes), [nodes]);
  /** 树结构指纹：仅 id 拓扑变化时重置展开，避免父组件重渲染把滚动/展开打回默认 */
  const nodesStructureKey = useMemo(() => {
    const walk = (list: OrgTreeNode[]): string =>
      list.map((n) => `${n.id}:${n.children?.length ? walk(n.children) : ''}`).join('|');
    return walk(nodes);
  }, [nodes]);
  const initialExpanded = useMemo(
    () => collectExpandedKeys(nodes, defaultExpandDepth),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 故意跟 structureKey，不跟 nodes 引用
    [nodesStructureKey, defaultExpandDepth],
  );
  const [expandedKeys, setExpandedKeys] = useState<Key[]>(initialExpanded);

  useEffect(() => {
    setExpandedKeys(initialExpanded);
  }, [initialExpanded]);

  /** 回调走 ref，避免树 title 重建触发 antd virtual Tree 滚回顶部 */
  const actionRefs = useRef({ onAdd, onEdit, onDelete });
  actionRefs.current = { onAdd, onEdit, onDelete };
  const hasAdd = Boolean(onAdd);
  const hasEdit = Boolean(onEdit);
  const hasDelete = Boolean(onDelete);

  const treeData = useMemo(() => {
    const buildTreeNodes = (list: OrgTreeNode[]): DataNode[] =>
      list.map((node) => ({
        key: node.id,
        title: (
          <div className={classNames('marsun-org-tree-row', styles['marsun-org-tree-row'])}>
            <Tooltip
              title={
                node.nameExtra ? (
                  <>
                    {node.name}
                    {node.nameExtra}
                  </>
                ) : (
                  node.name
                )
              }
            >
              <span className={classNames('marsun-org-tree-name', styles['marsun-org-tree-name'])}>
                {node.name}
                {node.nameExtra ? (
                  <span
                    className={classNames('marsun-org-tree-extra', styles['marsun-org-tree-extra'])}
                  >
                    {node.nameExtra}
                  </span>
                ) : null}
              </span>
            </Tooltip>
            {editable ? (
              <Space
                size={0}
                className={classNames('marsun-org-tree-actions', styles['marsun-org-tree-actions'])}
              >
                {hasAdd ? (
                  <Button
                    type="text"
                    size="small"
                    aria-label="添加子节点"
                    icon={<Plus size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      actionRefs.current.onAdd?.(node.id);
                    }}
                  />
                ) : null}
                {hasEdit ? (
                  <Button
                    type="text"
                    size="small"
                    aria-label="编辑"
                    icon={<Pencil size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      actionRefs.current.onEdit?.({
                        id: node.id,
                        name: node.name,
                        parentId: node.parentId ?? null,
                      });
                    }}
                  />
                ) : null}
                {hasDelete ? (
                  <Popconfirm
                    title={deleteConfirmTitle}
                    okText={deleteOkText}
                    okType={deleteOkType}
                    cancelText="取消"
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      return actionRefs.current.onDelete?.({ id: node.id, name: node.name });
                    }}
                    onCancel={(e) => e?.stopPropagation()}
                  >
                    <Button
                      type="text"
                      size="small"
                      danger
                      aria-label={deleteOkText}
                      icon={<Trash2 size={14} />}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Popconfirm>
                ) : null}
              </Space>
            ) : null}
          </div>
        ),
        children: node.children?.length ? buildTreeNodes(node.children) : undefined,
      }));
    return buildTreeNodes(nodes);
  }, [nodes, editable, hasAdd, hasEdit, hasDelete, deleteConfirmTitle, deleteOkText, deleteOkType]);

  const resolvedVirtualHeight =
    virtualHeight === false ? undefined : (virtualHeight ?? (nodeCount > 80 ? 520 : undefined));

  return (
    <Spin spinning={loading}>
      <Tree
        className={classNames('marsun-org-tree', styles['marsun-org-tree'], className)}
        treeData={treeData}
        expandedKeys={expandedKeys}
        onExpand={(keys) => setExpandedKeys(keys)}
        selectedKeys={selectedKeys}
        onSelect={(keys) => {
          if (!onSelect) return;
          const id = keys[0] != null ? String(keys[0]) : '';
          onSelect(id ? findOrgNode(nodes, id) : null);
        }}
        showLine
        blockNode
        {...(resolvedVirtualHeight ? { virtual: true, height: resolvedVirtualHeight } : {})}
      />
    </Spin>
  );
};

export default OrgTree;
