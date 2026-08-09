import { Pencil, Plus, Trash2 } from '../Icons';
import { Button, Popconfirm, Space, Spin, Tooltip, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import classNames from 'classnames';
import React, { useEffect, useMemo, useState, type Key, type ReactNode } from 'react';
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

function collectAllKeys(nodes: OrgTreeNode[]): string[] {
  const keys: string[] = [];
  for (const n of nodes) {
    keys.push(n.id);
    if (n.children?.length) keys.push(...collectAllKeys(n.children));
  }
  return keys;
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
 * 组织树（对齐 Assets 组织架构行为）：默认展开、节点 hover 增删改。
 * 纯 UI，无业务 API。
 */
const OrgTree: React.FC<OrgTreeProps> = ({
  nodes,
  loading = false,
  editable = false,
  className,
  selectedKeys,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  deleteConfirmTitle = '确认删除该节点？',
  deleteOkText = '删除',
  deleteOkType = 'danger',
}) => {
  const allKeys = useMemo(() => collectAllKeys(nodes), [nodes]);
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);

  useEffect(() => {
    setExpandedKeys(allKeys);
  }, [allKeys]);

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
              {onAdd ? (
                <Button
                  type="text"
                  size="small"
                  aria-label="添加子节点"
                  icon={<Plus size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdd(node.id);
                  }}
                />
              ) : null}
              {onEdit ? (
                <Button
                  type="text"
                  size="small"
                  aria-label="编辑"
                  icon={<Pencil size={14} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit({
                      id: node.id,
                      name: node.name,
                      parentId: node.parentId ?? null,
                    });
                  }}
                />
              ) : null}
              {onDelete ? (
                <Popconfirm
                  title={deleteConfirmTitle}
                  okText={deleteOkText}
                  okType={deleteOkType}
                  cancelText="取消"
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    return onDelete({ id: node.id, name: node.name });
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

  const treeData = buildTreeNodes(nodes);

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
      />
    </Spin>
  );
};

export default OrgTree;
