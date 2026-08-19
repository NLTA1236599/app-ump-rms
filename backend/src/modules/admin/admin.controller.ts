import type { NextFunction, Request, Response } from 'express';
import { asPathParam } from '../../utils/pathParams.js';
import { AdminUserRepository } from './admin-user.repository.js';
import { isCatalogFeature } from './featureCatalog.js';
import { PermissionRepository } from './permission.repository.js';

const ALLOWED_ROLES = ['admin', 'user', 'specialist', 'leader'] as const;

const userRepo = new AdminUserRepository();
const permissionRepo = new PermissionRepository();

function usernameToEmail(username: string): string {
  return username.includes('@') ? username : `${username}@ump.edu.vn`;
}

export async function getAllUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await userRepo.findAll();
    res.json({
      users: rows.map((row) => ({
        id: row.id,
        email: usernameToEmail(row.username),
        full_name: row.display_name ?? row.username,
        role: row.role,
        allowed_units: row.allowed_units,
        email_verified: row.email_verified,
        created_at: row.created_at,
      })),
    });
  } catch (e) {
    next(e);
  }
}

export async function updateUserRole(req: Request, res: Response, next: NextFunction) {
  try {
    const id = asPathParam(req.params.id);
    const { role } = req.body ?? {};

    if (!role || !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const ok = await userRepo.updateRole(id, role);
    if (!ok) return res.status(404).json({ error: 'Không tìm thấy người dùng' });

    res.json({ message: 'Role updated' });
  } catch (e) {
    next(e);
  }
}

export async function updateUserAllowedUnits(req: Request, res: Response, next: NextFunction) {
  try {
    const id = asPathParam(req.params.id);
    const { allowed_units } = req.body ?? {};

    if (!Array.isArray(allowed_units)) {
      return res.status(400).json({ error: 'allowed_units phải là mảng' });
    }

    const units = allowed_units.map((unit) => String(unit).trim()).filter(Boolean);
    const ok = await userRepo.updateAllowedUnits(id, units);
    if (!ok) return res.status(404).json({ error: 'Không tìm thấy người dùng' });

    res.json({ message: 'Allowed units updated', allowed_units: units });
  } catch (e) {
    next(e);
  }
}

export async function grantUserAccess(req: Request, res: Response, next: NextFunction) {
  try {
    const id = asPathParam(req.params.id);
    const result = await userRepo.grantAccess(id);
    if (result === 'missing') {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }
    res.json({
      message: result === 'already' ? 'Tài khoản đã được cấp quyền' : 'Đã cấp quyền truy cập',
      email_verified: true,
    });
  } catch (e) {
    next(e);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const id = asPathParam(req.params.id);
    const ok = await userRepo.deleteById(id);
    if (!ok) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    res.json({ message: 'User deleted' });
  } catch (e) {
    next(e);
  }
}

export async function getPermissions(_req: Request, res: Response, next: NextFunction) {
  try {
    const permissions = await permissionRepo.findAll();
    res.json({ permissions });
  } catch (e) {
    next(e);
  }
}

export async function updatePermission(req: Request, res: Response, next: NextFunction) {
  try {
    const feature = asPathParam(req.params.feature);
    if (!isCatalogFeature(feature)) {
      return res.status(400).json({ error: 'Tính năng không hợp lệ' });
    }
    const { allowed_roles } = req.body ?? {};

    if (!Array.isArray(allowed_roles)) {
      return res.status(400).json({ error: 'allowed_roles phải là mảng' });
    }

    const roles = allowed_roles.map(String);
    const invalid = roles.some((role) => !ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number]));
    if (invalid) {
      return res.status(400).json({ error: 'Invalid role in allowed_roles' });
    }

    const permission = await permissionRepo.upsert(feature, roles);
    res.json({ message: 'Permission updated', permission });
  } catch (e) {
    next(e);
  }
}
