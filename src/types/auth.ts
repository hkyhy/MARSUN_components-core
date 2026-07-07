export interface UserRolePermissions {
  key: string;
  name: string;
  permissions: string[];
  permCount: number;
}

export interface PermissionDefinition {
  key: string;
  name: string;
  category: string;
  categoryLabel?: string;
  description?: string;
}

export interface PermissionDefinitionsResponse {
  permissions: PermissionDefinition[];
  categories: Record<string, string>;
  permissionMap: Record<string, string>;
}
