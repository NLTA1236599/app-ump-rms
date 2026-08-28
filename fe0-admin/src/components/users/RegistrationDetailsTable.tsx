import { useMemo, useState } from 'react';

import type { AdminUserRow } from '../../types/index.js';
import {
  academicRankLabel,
  displayOrDash,
  requestedRolesLabel,
} from '../../utils/registerFieldLabels.js';

type Props = {
  users: AdminUserRow[];
};

function matchesQuery(user: AdminUserRow, query: string): boolean {
  if (!query) return true;
  const haystack = [
    user.full_name,
    user.email,
    user.staff_id,
    user.phone,
    user.work_unit,
    user.job_title,
    academicRankLabel(user.academic_rank),
    requestedRolesLabel(user.requested_roles),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

export function RegistrationDetailsTable({ users }: Props) {
  const [query, setQuery] = useState('');
  const normalized = query.trim().toLowerCase();
  const rows = useMemo(
    () => users.filter((user) => matchesQuery(user, normalized)),
    [users, normalized],
  );

  return (
    <section className="mt-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Thông tin chi tiết đăng ký</h2>
          <p className="mt-1 text-sm text-gray-500">
            Các trường người dùng khai khi đăng ký trên cổng chính (email, họ tên, mã nhân sự, điện
            thoại, học hàm/học vị, đơn vị, chức vụ, vai trò đăng ký). Tài khoản cũ chưa có dữ liệu
            sẽ hiện —.
          </p>
        </div>
        <label className="block text-sm text-gray-600">
          Tìm kiếm
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tên, email, đơn vị…"
            className="mt-1 block w-64 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Họ và tên</th>
                <th className="px-4 py-3 text-left">Email trường</th>
                <th className="px-4 py-3 text-left">Mã số nhân sự</th>
                <th className="px-4 py-3 text-left">Số điện thoại</th>
                <th className="px-4 py-3 text-left">Học hàm, học vị</th>
                <th className="px-4 py-3 text-left">Đơn vị công tác</th>
                <th className="px-4 py-3 text-left">Chức vụ</th>
                <th className="px-4 py-3 text-left">Vai trò đăng ký</th>
                <th className="px-4 py-3 text-left">Ngày đăng ký</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{displayOrDash(user.full_name)}</td>
                  <td className="px-4 py-3 text-gray-600">{displayOrDash(user.email)}</td>
                  <td className="px-4 py-3 text-gray-600">{displayOrDash(user.staff_id)}</td>
                  <td className="px-4 py-3 text-gray-600">{displayOrDash(user.phone)}</td>
                  <td className="px-4 py-3 text-gray-600">{academicRankLabel(user.academic_rank)}</td>
                  <td className="px-4 py-3 text-gray-600">{displayOrDash(user.work_unit)}</td>
                  <td className="px-4 py-3 text-gray-600">{displayOrDash(user.job_title)}</td>
                  <td className="px-4 py-3 text-gray-600">{requestedRolesLabel(user.requested_roles)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                    {new Date(user.created_at).toLocaleString('vi-VN')}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    {users.length === 0
                      ? 'Chưa có người dùng nào.'
                      : 'Không tìm thấy người dùng khớp từ khóa.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
