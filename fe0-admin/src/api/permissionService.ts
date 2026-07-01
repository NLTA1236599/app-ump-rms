import type { FeaturePermission } from '../types/index.js';
import { httpClient } from './httpClient.js';

export async function getPermissions(): Promise<FeaturePermission[]> {
  const { data } = await httpClient.get<{ permissions: FeaturePermission[] }>('/admin/permissions');
  return data.permissions;
}

export async function updatePermission(feature: string, allowedRoles: string[]): Promise<void> {
  await httpClient.put(`/admin/permissions/${encodeURIComponent(feature)}`, {
    allowed_roles: allowedRoles,
  });
}
