import type { AdminUserRow } from '../types/index.js';
import { httpClient } from './httpClient.js';

export async function getUsers(): Promise<AdminUserRow[]> {
  const { data } = await httpClient.get<{ users: AdminUserRow[] }>('/admin/users');
  return data.users.map((user) => ({
    ...user,
    allowed_units: Array.isArray(user.allowed_units) ? user.allowed_units : [],
    allowed_project_types: Array.isArray(user.allowed_project_types) ? user.allowed_project_types : [],
    requested_roles: Array.isArray(user.requested_roles) ? user.requested_roles : [],
    staff_id: user.staff_id ?? null,
    phone: user.phone ?? null,
    academic_rank: user.academic_rank ?? null,
    work_unit: user.work_unit ?? null,
    job_title: user.job_title ?? null,
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

export async function updateAllowedProjectTypes(
  id: string,
  allowedProjectTypes: string[],
): Promise<void> {
  await httpClient.patch(`/admin/users/${id}/allowed-project-types`, {
    allowed_project_types: allowedProjectTypes,
  });
}

export async function grantAccess(id: string): Promise<void> {
  await httpClient.patch(`/admin/users/${id}/grant-access`);
}

export async function deleteUser(id: string): Promise<void> {
  await httpClient.delete(`/admin/users/${id}`);
}
