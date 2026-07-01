import { useEffect, useState } from 'react';

import { getPermissions } from '../api/permissionService.js';
import { getUsers } from '../api/userService.js';

export function DashboardPage() {
  const [userCount, setUserCount] = useState(0);
  const [permissionCount, setPermissionCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getUsers(), getPermissions()])
      .then(([users, permissions]) => {
        if (!cancelled) {
          setUserCount(users.length);
          setPermissionCount(permissions.length);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-gray-500">Đang tải…</p>;
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-800">Dashboard</h1>
      <p className="mb-6 text-sm text-gray-500">Tổng quan quản trị hệ thống RMS</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">Tổng người dùng</p>
          <p className="mt-2 text-3xl font-bold text-blue-700">{userCount}</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">Tính năng phân quyền</p>
          <p className="mt-2 text-3xl font-bold text-blue-700">{permissionCount}</p>
        </div>
      </div>
    </div>
  );
}
