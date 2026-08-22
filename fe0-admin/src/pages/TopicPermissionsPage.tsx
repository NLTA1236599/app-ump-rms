import { useCallback, useEffect, useMemo, useState } from 'react';

import { getUsers, updateAllowedUnits } from '../api/userService.js';
import { ALL_ORG_UNITS, ORG_UNIT_GROUPS, UNIT_MEMBERS, type UnitMember } from '../data/unitMembers.js';
import type { AdminUserRow } from '../types/index.js';

type PanelMode = 'grant' | 'units';

type MemberRow = UnitMember & {
  userId: string | null;
};

function isInstitutionalEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return normalized.endsWith('@ump.edu.vn') || normalized.endsWith('@umc.edu.vn');
}

function normalizeEmail(email: string | null | undefined): string {
  return (email ?? '').trim().toLowerCase();
}

function accessSummary(member: MemberRow): string {
  if (member.allowedUnits.length === 0) return 'tất cả đơn vị';
  if (member.allowedUnits.length === 1) return member.allowedUnits[0]!;
  return `${member.allowedUnits.length} đơn vị`;
}

function findLinkedUser(member: UnitMember, users: AdminUserRow[]): AdminUserRow | undefined {
  const memberEmail = normalizeEmail(member.email);
  if (!memberEmail) return undefined;

  const exact = users.find((user) => normalizeEmail(user.email) === memberEmail);
  if (exact) return exact;

  const local = memberEmail.split('@')[0] ?? '';
  return users.find((user) => {
    const email = normalizeEmail(user.email);
    return email === local || email.startsWith(`${local}@`);
  });
}

function mergeMembers(seed: UnitMember[], users: AdminUserRow[]): MemberRow[] {
  return seed.map((member) => {
    const linked = findLinkedUser(member, users);
    return {
      ...member,
      userId: linked?.id ?? null,
      email: linked?.email ?? member.email,
      fullName: linked?.full_name || member.fullName,
      // API is source of truth once the account is linked.
      allowedUnits: linked ? linked.allowed_units : member.allowedUnits,
    };
  });
}

export function TopicPermissionsPage() {
  const [members, setMembers] = useState<MemberRow[]>(() =>
    UNIT_MEMBERS.map((member) => ({ ...member, userId: null })),
  );
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>('grant');
  const [emailDraft, setEmailDraft] = useState('');
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const accountCount = useMemo(
    () => members.filter((member) => Boolean(member.email)).length,
    [members],
  );

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

  const closePanel = () => {
    setExpandedId(null);
    setError(null);
  };

  const openGrant = (member: MemberRow) => {
    if (expandedId === member.id && panelMode === 'grant') {
      closePanel();
      return;
    }
    setExpandedId(member.id);
    setPanelMode('grant');
    setEmailDraft('');
    setError(null);
    setSuccessMessage(null);
  };

  const openUnits = (member: MemberRow) => {
    if (expandedId === member.id && panelMode === 'units') {
      closePanel();
      return;
    }
    setExpandedId(member.id);
    setPanelMode('units');
    setSelectedUnits(member.allowedUnits);
    setError(null);
    setSuccessMessage(null);
  };

  const seesAllUnits = selectedUnits.length === 0;

  const toggleUnit = (unit: string) => {
    setSelectedUnits((prev) => {
      // Empty list means every unit is allowed — unchecking one leaves the rest.
      const current = prev.length === 0 ? ALL_ORG_UNITS : prev;
      const next = current.includes(unit)
        ? current.filter((item) => item !== unit)
        : [...current, unit];
      return next.length === ALL_ORG_UNITS.length ? [] : next;
    });
  };

  const selectHomeOnly = (member: MemberRow) => {
    setSelectedUnits([member.homeUnit]);
  };

  const selectAllUnits = () => {
    setSelectedUnits([]);
  };

  const handleGrant = async (member: MemberRow) => {
    if (!isInstitutionalEmail(emailDraft)) {
      setError('Email phải thuộc miền @ump.edu.vn hoặc @umc.edu.vn.');
      return;
    }

    setError(null);
    setSavingId(member.id);
    const email = emailDraft.trim().toLowerCase();

    try {
      const users = await getUsers();
      const linked = users.find((user) => normalizeEmail(user.email) === email);
      if (!linked) {
        setError(
          'Chưa tìm thấy tài khoản đã đăng ký với email này. Thành viên cần tự đăng ký (OTP) trước.',
        );
        return;
      }

      const nextUnits =
        linked.allowed_units.length > 0 ? linked.allowed_units : [member.homeUnit];
      await updateAllowedUnits(linked.id, nextUnits);

      setMembers((prev) =>
        prev.map((row) =>
          row.id === member.id
            ? {
                ...row,
                email: linked.email,
                userId: linked.id,
                fullName: linked.full_name || row.fullName,
                allowedUnits: nextUnits,
              }
            : row,
        ),
      );
      setSuccessMessage(`Đã cấp quyền cho ${member.fullName}.`);
      setExpandedId(null);
      window.setTimeout(() => setSuccessMessage(null), 2500);
    } catch {
      setError('Không thể cấp quyền. Thử lại sau.');
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveUnits = async (member: MemberRow) => {
    if (!member.userId) {
      setError(
        'Thành viên chưa liên kết tài khoản hệ thống. Cấp quyền bằng email đã đăng ký trước.',
      );
      return;
    }

    setError(null);
    setSavingId(member.id);
    try {
      await updateAllowedUnits(member.userId, selectedUnits);
      // Re-read from API so UI matches what the data portal will enforce.
      const users = await getUsers();
      const linked = users.find((user) => user.id === member.userId);
      const savedUnits = linked?.allowed_units ?? selectedUnits;
      setMembers(mergeMembers(UNIT_MEMBERS, users));
      setSuccessMessage(
        savedUnits.length === 0
          ? `${member.fullName}: đã lưu — xem đề tài của tất cả đơn vị.`
          : `${member.fullName}: đã lưu ${savedUnits.length} đơn vị vào hệ thống.`,
      );
      setExpandedId(null);
      window.setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setError('Không thể lưu phân quyền đơn vị vào hệ thống. Kiểm tra lại và thử Lưu lần nữa.');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <p className="text-gray-500">Đang tải…</p>;

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Phân quyền đề tài</h1>
        <button
          type="button"
          className="rounded-full p-2 text-gray-400 transition hover:bg-white hover:text-gray-600"
          aria-label="Thông báo"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
        </button>
      </header>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="space-y-3 border-b border-gray-100 px-6 py-5">
          <p className="text-sm leading-relaxed text-gray-500">
            Danh sách thành viên đơn vị. Thành viên chưa có tài khoản: nhập email ump.edu.vn đã đăng
            ký để cấp quyền (người dùng tự đăng ký trước — không tạo mật khẩu ở đây). Sau khi có tài
            khoản, quản trị viên chọn đơn vị / trung tâm / khoa mà thành viên được xem đề tài (bỏ
            trống = thấy đề tài của tất cả đơn vị). Phân quyền được lưu vào hệ thống và áp dụng khi
            đăng nhập cổng dữ liệu đề tài.
          </p>
          <p className="text-sm text-gray-600">
            {members.length} thành viên · {accountCount} đã có tài khoản
          </p>
        </div>

        <ul className="divide-y divide-gray-100">
          {members.map((member) => {
            const hasAccount = Boolean(member.email);
            const isExpanded = expandedId === member.id;
            const statusText = hasAccount ? member.email : 'chưa có tài khoản';

            return (
              <li key={member.id} className="px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-gray-900">{member.fullName}</p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {member.role} · {statusText}
                    </p>
                    {hasAccount && (
                      <p className="mt-0.5 text-xs text-gray-400">
                        Đơn vị công tác: {member.homeUnit} · Quyền xem đề tài: {accessSummary(member)}
                        {!member.userId && ' · chưa liên kết tài khoản hệ thống'}
                      </p>
                    )}
                  </div>

                  {hasAccount ? (
                    <button
                      type="button"
                      onClick={() => openUnits(member)}
                      className={[
                        'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition',
                        isExpanded && panelMode === 'units'
                          ? 'border-gray-300 bg-gray-50 text-gray-800'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
                      ].join(' ')}
                    >
                      Phân quyền đơn vị
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openGrant(member)}
                      className={[
                        'shrink-0 rounded-full px-5 py-2 text-sm font-medium text-white transition',
                        isExpanded && panelMode === 'grant'
                          ? 'bg-blue-700 hover:bg-blue-800'
                          : 'bg-blue-600 hover:bg-blue-700',
                      ].join(' ')}
                    >
                      Cấp quyền
                    </button>
                  )}
                </div>

                {isExpanded && panelMode === 'grant' && (
                  <div className="mt-4 space-y-3 border-t border-gray-50 pt-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <label
                        htmlFor={`topic-email-${member.id}`}
                        className="shrink-0 text-sm text-gray-600 sm:max-w-[280px]"
                      >
                        Email ump.edu.vn (đã đăng ký) của {member.fullName}
                      </label>
                      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                          id={`topic-email-${member.id}`}
                          type="email"
                          value={emailDraft}
                          onChange={(e) => setEmailDraft(e.target.value)}
                          placeholder="vd: hoten@ump.edu.vn"
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                        <button
                          type="button"
                          disabled={savingId === member.id}
                          onClick={() => void handleGrant(member)}
                          className="shrink-0 rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingId === member.id ? 'Đang lưu…' : 'Cấp quyền'}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-400">
                      Thành viên cần tự đăng ký tài khoản ump.edu.vn (xác thực OTP) trước; tại đây
                      quản trị viên chỉ xác nhận cấp quyền xem đề tài theo đơn vị / trung tâm / khoa
                      được chọn.
                    </p>
                  </div>
                )}

                {isExpanded && panelMode === 'units' && (
                  <div className="mt-4 space-y-4 border-t border-gray-50 pt-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-gray-600">
                        Chọn đơn vị / trung tâm / khoa {member.fullName} được xem đề tài (bỏ trống =
                        thấy tất cả).
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => selectHomeOnly(member)}
                          className={[
                            'rounded-full border px-3 py-1 text-xs font-medium transition',
                            selectedUnits.length === 1 && selectedUnits[0] === member.homeUnit
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                          ].join(' ')}
                        >
                          Chỉ đơn vị công tác
                        </button>
                        <button
                          type="button"
                          onClick={selectAllUnits}
                          className={[
                            'rounded-full border px-3 py-1 text-xs font-medium transition',
                            seesAllUnits
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                          ].join(' ')}
                        >
                          Tất cả đơn vị
                        </button>
                      </div>
                    </div>

                    <div className="max-h-80 space-y-4 overflow-y-auto pr-1">
                      {ORG_UNIT_GROUPS.map((group) => (
                        <div key={group.label}>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                            {group.label}
                          </p>
                          <div className="grid gap-1 sm:grid-cols-2">
                            {group.units.map((unit) => {
                              const checked = seesAllUnits || selectedUnits.includes(unit);
                              const isHome = unit === member.homeUnit;
                              return (
                                <label
                                  key={unit}
                                  className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleUnit(unit)}
                                    className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600"
                                  />
                                  <span>
                                    {unit}
                                    {isHome && (
                                      <span className="ml-1 text-xs text-blue-600">(công tác)</span>
                                    )}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-gray-400">
                        Đang chọn:{' '}
                        {selectedUnits.length === 0 ? 'tất cả đơn vị' : `${selectedUnits.length} đơn vị`}
                      </p>
                      <button
                        type="button"
                        disabled={savingId === member.id}
                        onClick={() => void handleSaveUnits(member)}
                        className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingId === member.id ? 'Đang lưu…' : 'Lưu phân quyền'}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
