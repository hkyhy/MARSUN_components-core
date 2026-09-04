import type { PermissionBindCatalog, PermissionBindItem } from '@/components/PermissionBindPanel';

/** 按 code 去重；同一权限码可挂在多个菜单模块下展示。 */
export function catalogToItems(catalog: PermissionBindCatalog): PermissionBindItem[] {
  const seen = new Set<string>();
  const items: PermissionBindItem[] = [];
  for (const mod of catalog.modules) {
    for (const cat of mod.categories) {
      for (const leaf of cat.leaves) {
        if (seen.has(leaf.code)) continue;
        seen.add(leaf.code);
        items.push({
          id: leaf.code,
          code: leaf.code,
          name: leaf.label,
          layer: mod.key === 'entry' ? 'SYSTEM' : 'BUSINESS',
        });
      }
    }
  }
  return items;
}
