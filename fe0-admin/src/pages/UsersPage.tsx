import { useCallback, useEffect, useState } from 'react';

import { deleteUser, getUsers, grantAccess, updateRole } from '../api/userService.js';
import type { AdminUserRow, UserRole } from '../types/index.js';

const ROLES: UserRole[] = ['admin', 'leader', 'specialist', 'user'];

export function UsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grantingId, setGrantingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const handleGrantAccess = async (user: AdminUserRow) => {
    if (
      !window.confirm(
        `Cấp quyền truy cập cho ${user.full_name} (${user.email})? Tài khoản sẽ đăng nhập được mà không cần mã OTP.`,
      )
    ) {
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setGrantingId(user.id);
    try {
      await grantAccess(user.id);
      setUsers((prev) =>
        prev.map((row) => (row.id === user.id ? { ...row, email_verified: true } : row)),
      );
      setSuccessMessage(`Đã cấp quyền truy cập cho ${user.email}.`);
    } catch {
      setError('Không thể cấp quyền truy cập.');
    } finally {
      setGrantingId(null);
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

  const pendingCount = users.filter((user) => !user.email_verified).length;

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
      <p className="mb-6 text-sm text-gray-500">
        Cột <strong>Email</strong> của tài khoản vai trò <strong>specialist</strong> là địa chỉ gửi
        mail nhắc cho các đề tài thuộc đơn vị được phân quyền (tab Phân quyền đề tài). Tài khoản mới
        đăng ký chờ OTP: dùng <strong>Cấp quyền truy cập</strong> để cho phép đăng nhập ngay, không
        cần đợi mã OTP tới email.
        {pendingCount > 0 ? ` Đang có ${pendingCount} tài khoản chờ cấp quyền.` : ''}
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-6 py-3 text-left">Họ tên</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Vai trò</th>
              <th className="px-6 py-3 text-left">Trạng thái</th>
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
                <td className="px-6 py-4">
                  {user.email_verified ? (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      Đã cấp quyền
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                      Chờ OTP
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(user.created_at).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap items-center gap-3">
                    {!user.email_verified && (
                      <button
                        type="button"
                        disabled={grantingId === user.id}
                        onClick={() => void handleGrantAccess(user)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      >
                        {grantingId === user.id ? 'Đang cấp…' : 'Cấp quyền truy cập'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void handleDelete(user.id)}
                      className="text-sm font-medium text-red-500 hover:text-red-700"
                    >
                      Xoá
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
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
