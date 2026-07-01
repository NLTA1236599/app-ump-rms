import { useCallback, useEffect, useState } from 'react';

import { deleteUser, getUsers, updateRole } from '../api/userService.js';
import type { AdminUserRow, UserRole } from '../types/index.js';

const ROLES: UserRole[] = ['admin', 'leader', 'specialist', 'user'];

export function UsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setError(null);
    try {
      setUsers(await getUsers());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await updateRole(id, role);
      setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, role } : user)));
    } catch {
      setError('Không thể cập nhật vai trò.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xác nhận xoá người dùng này?')) return;

    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch {
      setError('Không thể xoá người dùng. Có thể còn dữ liệu liên kết.');
    }
  };

  if (loading) return <p className="text-gray-500">Đang tải…</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Quản lý người dùng</h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-6 py-3 text-left">Họ tên</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Vai trò</th>
              <th className="px-6 py-3 text-left">Ngày tạo</th>
              <th className="px-6 py-3 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">{user.full_name}</td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => void handleRoleChange(user.id, e.target.value)}
                    className="rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(user.created_at).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => void handleDelete(user.id)}
                    className="text-sm font-medium text-red-500 hover:text-red-700"
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Chưa có người dùng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
