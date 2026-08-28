import { Fragment, useCallback, useEffect, useState } from 'react';

import { getUsers, updateAllowedUnits } from '../api/userService.js';
import { ALL_ORG_UNITS, ORG_UNIT_GROUPS, UNIT_MEMBERS, type UnitMember } from '../data/unitMembers.js';
import type { AdminUserRow } from '../types/index.js';

type MemberRow = Omit<UnitMember, 'role'> & {
  userId: string | null;
  role: string;
};

function normalizeEmail(email: string | null | undefined): string {
  return (email ?? '').trim().toLowerCase();
}

function normalizePersonName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const GENERIC_ROSTER_NAMES = new Set(['lanh dao', 'quan tri vien', 'admin']);

function roleLabel(role: string): string {
  const normalized = role.trim().toLowerCase();
  if (normalized === 'specialist') return 'Chuyên viên';
  if (normalized === 'leader') return 'Trưởng phòng';
  if (normalized === 'admin') return 'Quản trị viên';
  return role;
}

function emailsMatch(memberEmail: string, userEmail: string): boolean {
  if (memberEmail === userEmail) return true;
  const local = memberEmail.split('@')[0] ?? '';
  if (!local) return false;
  return userEmail === local || userEmail.startsWith(`${local}@`);
}

function findLinkedUser(
  member: UnitMember,
  users: AdminUserRow[],
  claimedIds: Set<string>,
): AdminUserRow | undefined {
  const available = users.filter((user) => !claimedIds.has(user.id));
  const memberEmail = normalizeEmail(member.email);

  if (memberEmail) {
    const byEmail = available.find((user) => emailsMatch(memberEmail, normalizeEmail(user.email)));
    if (byEmail) return byEmail;
  }

  const memberName = normalizePersonName(member.fullName);
  if (!memberName || GENERIC_ROSTER_NAMES.has(memberName)) return undefined;

  return available.find((user) => normalizePersonName(user.full_name) === memberName);
}

function mergeMembers(seed: UnitMember[], users: AdminUserRow[]): MemberRow[] {
  const claimedIds = new Set<string>();
  const rows: MemberRow[] = seed.map((member) => {
    const linked = findLinkedUser(member, users, claimedIds);
    if (linked) claimedIds.add(linked.id);
    return {
      ...member,
      userId: linked?.id ?? null,
      email: linked?.email ?? member.email,
      fullName: linked?.full_name || member.fullName,
      allowedUnits: linked ? linked.allowed_units : member.allowedUnits,
    };
  });

  for (const user of users) {
    if (claimedIds.has(user.id)) continue;
    rows.push({
      id: `user-${user.id}`,
      fullName: user.full_name,
      role: roleLabel(user.role),
      email: user.email,
      homeUnit: 'Chưa xác định',
      allowedUnits: user.allowed_units,
      userId: user.id,
    });
  }

  return rows;
}

function seesAllUnits(member: MemberRow): boolean {
  return member.allowedUnits.length === 0;
}

function unitChecked(member: MemberRow, unit: string): boolean {
  return seesAllUnits(member) || member.allowedUnits.includes(unit);
}

export function TopicPermissionsPage() {
  const [members, setMembers] = useState<MemberRow[]>(() =>
    UNIT_MEMBERS.map((member) => ({ ...member, userId: null })),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const refreshMembers = useCallback(async () => {
    setError(null);
    try {
      const users = await getUsers();
      setMembers(mergeMembers(UNIT_MEMBERS, users));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được danh sách người dùng');
      setMembers(UNIT_MEMBERS.map((member) => ({ ...member, userId: null })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshMembers();
  }, [refreshMembers]);

  const markSaved = (id: string) => {
    setSavedId(id);
    window.setTimeout(() => setSavedId((current) => (current === id ? null : current)), 2000);
  };

  const toggleUnit = (memberId: string, unit: string) => {
    setMembers((prev) =>
      prev.map((member) => {
        if (member.id !== memberId) return member;
        const current = member.allowedUnits.length === 0 ? ALL_ORG_UNITS : member.allowedUnits;
        const next = current.includes(unit)
          ? current.filter((item) => item !== unit)
          : [...current, unit];
        return {
          ...member,
          allowedUnits: next.length === ALL_ORG_UNITS.length ? [] : next,
        };
      }),
    );
  };

  const toggleAllUnits = (memberId: string) => {
    setMembers((prev) =>
      prev.map((member) => {
        if (member.id !== memberId) return member;
        return {
          ...member,
          allowedUnits: member.allowedUnits.length === 0 ? [member.homeUnit] : [],
        };
      }),
    );
  };

  const handleSaveRow = async (rowId: string) => {
    const linked = members.filter((member) => member.userId);
    if (linked.length === 0) {
      setError(
        'Chưa có thành viên liên kết tài khoản hệ thống. Liên kết tài khoản ở tab Quản lý người dùng trước.',
      );
      return;
    }

    setError(null);
    setSavingId(rowId);
    try {
      for (const member of linked) {
        await updateAllowedUnits(member.userId as string, member.allowedUnits);
      }
      const users = await getUsers();
      setMembers(mergeMembers(UNIT_MEMBERS, users));
      markSaved(rowId);
    } catch {
      setError('Không thể lưu phân quyền đơn vị vào hệ thống. Kiểm tra lại và thử Lưu lần nữa.');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <p className="text-gray-500">Đang tải…</p>;

  const colCount = members.length + 2;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Phân quyền theo đơn vị</h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="sticky left-0 z-20 bg-gray-50 px-6 py-3 text-left shadow-[1px_0_0_#e5e7eb]">
                  Đơn vị
                </th>
                {members.map((member) => (
                  <th
                    key={member.id}
                    title={member.fullName}
                    className="w-10 px-0 py-3 align-bottom text-[10px] font-medium normal-case text-gray-600"
                  >
                    <span className="inline-block h-36 overflow-hidden whitespace-nowrap px-1 [writing-mode:vertical-rl] rotate-180">
                      {member.fullName}
                    </span>
                  </th>
                ))}
                <th className="px-6 py-3 text-left">Lưu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50">
                <td className="sticky left-0 z-10 bg-white px-6 py-4 font-medium text-gray-800 shadow-[1px_0_0_#e5e7eb]">
                  Tất cả
                </td>
                {members.map((member) => (
                  <td key={`${member.id}-all`} className="px-2 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={seesAllUnits(member)}
                      disabled={!member.userId}
                      onChange={() => toggleAllUnits(member.id)}
                      className="h-4 w-4 accent-blue-600 disabled:opacity-40"
                      title={`${member.fullName}: xem đề tài của tất cả đơn vị`}
                    />
                  </td>
                ))}
                <td className="px-6 py-4">
                  <button
                    type="button"
                    disabled={savingId === '__all__'}
                    onClick={() => void handleSaveRow('__all__')}
                    className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    {savingId === '__all__'
                      ? 'Đang lưu…'
                      : savedId === '__all__'
                        ? '✓ Đã lưu'
                        : 'Lưu'}
                  </button>
                </td>
              </tr>

              {ORG_UNIT_GROUPS.map((group) => (
                <Fragment key={group.label}>
                  <tr className="bg-gray-50">
                    <td
                      colSpan={colCount}
                      className="sticky left-0 px-6 py-2 text-[10px] font-semibold uppercase tracking-wide text-gray-500"
                    >
                      {group.label}
                    </td>
                  </tr>
                  {group.units.map((unit) => {
                    const saving = savingId === unit;
                    const saved = savedId === unit;
                    return (
                      <tr key={unit} className="hover:bg-gray-50">
                        <td className="sticky left-0 z-10 bg-white px-6 py-4 font-medium text-gray-800 shadow-[1px_0_0_#e5e7eb]">
                          {unit}
                        </td>
                        {members.map((member) => (
                          <td key={`${member.id}-${unit}`} className="px-2 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={unitChecked(member, unit)}
                              disabled={!member.userId}
                              onChange={() => toggleUnit(member.id, unit)}
                              className="h-4 w-4 accent-blue-600 disabled:opacity-40"
                              title={
                                unit === member.homeUnit
                                  ? `${member.fullName} (đơn vị công tác)`
                                  : member.fullName
                              }
                            />
                          </td>
                        ))}
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => void handleSaveRow(unit)}
                            className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
                          >
                            {saving ? 'Đang lưu…' : saved ? '✓ Đã lưu' : 'Lưu'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </Fragment>
              ))}

              {members.length === 0 && (
                <tr>
                  <td colSpan={colCount} className="px-6 py-8 text-center text-gray-500">
                    Chưa có thành viên để phân quyền.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
