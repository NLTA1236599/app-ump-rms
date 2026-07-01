import type { AdminUserRow } from '../types/index.js';
import { httpClient } from './httpClient.js';

export async function getUsers(): Promise<AdminUserRow[]> {
  const { data } = await httpClient.get<{ users: AdminUserRow[] }>('/admin/users');
  return data.users;
}

export async function updateRole(id: string, role: string): Promise<void> {
  await httpClient.patch(`/admin/users/${id}/role`, { role });
}

export async function deleteUser(id: string): Promise<void> {
  await httpClient.delete(`/admin/users/${id}`);
}
