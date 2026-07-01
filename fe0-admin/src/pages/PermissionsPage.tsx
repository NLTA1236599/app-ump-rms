import { useCallback, useEffect, useState } from 'react';

import { getPermissions, updatePermission } from '../api/permissionService.js';
import type { FeaturePermission, UserRole } from '../types/index.js';

const ALL_ROLES: UserRole[] = ['admin', 'leader', 'specialist', 'user'];

export function PermissionsPage() {
  const [permissions, setPermissions] = useState<FeaturePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedFeature, setSavedFeature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    setError(null);
    try {
      setPermissions(await getPermissions());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được phân quyền');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPermissions();
  }, [fetchPermissions]);

  const toggleRole = (feature: string, role: string) => {
    setPermissions((prev) =>
      prev.map((permission) => {
        if (permission.feature !== feature) return permission;
        const hasRole = permission.allowed_roles.includes(role);
        return {
          ...permission,
          allowed_roles: hasRole
            ? permission.allowed_roles.filter((r) => r !== role)
            : [...permission.allowed_roles, role],
        };
      }),
    );
  };

  const handleSave = async (feature: string, allowedRoles: string[]) => {
    try {
      await updatePermission(feature, allowedRoles);
      setSavedFeature(feature);
      window.setTimeout(() => setSavedFeature(null), 2000);
    } catch {
      setError('Không thể lưu phân quyền.');
    }
  };

  if (loading) return <p className="text-gray-500">Đang tải…</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Phân quyền tính năng</h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-6 py-3 text-left">Tính năng</th>
              {ALL_ROLES.map((role) => (
                <th key={role} className="px-4 py-3 text-center">
                  {role}
                </th>
              ))}
              <th className="px-6 py-3 text-left">Lưu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {permissions.map((permission) => (
              <tr key={permission.feature} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-gray-700">{permission.feature}</td>
                {ALL_ROLES.map((role) => (
                  <td key={role} className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={permission.allowed_roles.includes(role)}
                      onChange={() => toggleRole(permission.feature, role)}
                      className="h-4 w-4 accent-blue-600"
                    />
                  </td>
                ))}
                <td className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => void handleSave(permission.feature, permission.allowed_roles)}
                    className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-700"
                  >
                    {savedFeature === permission.feature ? '✓ Đã lưu' : 'Lưu'}
                  </button>
                </td>
              </tr>
            ))}
            {permissions.length === 0 && (
              <tr>
                <td colSpan={ALL_ROLES.length + 2} className="px-6 py-8 text-center text-gray-500">
                  Chưa có cấu hình phân quyền.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
