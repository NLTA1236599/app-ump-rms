import type { AdminUserRow } from '../types/index.js';
import { httpClient } from './httpClient.js';

export async function getUsers(): Promise<AdminUserRow[]> {
  const { data } = await httpClient.get<{ users: AdminUserRow[] }>('/admin/users');
  return data.users.map((user) => ({
    ...user,
    allowed_units: Array.isArray(user.allowed_units) ? user.allowed_units : [],
    email_verified: Boolean(user.email_verified),
  }));
}

export async function updateRole(id: string, role: string): Promise<void> {
  await httpClient.patch(`/admin/users/${id}/role`, { role });
}

export async function updateAllowedUnits(id: string, allowedUnits: string[]): Promise<void> {
  await httpClient.patch(`/admin/users/${id}/allowed-units`, {
    allowed_units: allowedUnits,
  });
}

export async function grantAccess(id: string): Promise<void> {
  await httpClient.patch(`/admin/users/${id}/grant-access`);
}

export async function deleteUser(id: string): Promise<void> {
  await httpClient.delete(`/admin/users/${id}`);
}
