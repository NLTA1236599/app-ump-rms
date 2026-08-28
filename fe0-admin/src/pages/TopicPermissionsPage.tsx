import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getUsers, updateAllowedProjectTypes, updateAllowedUnits } from '../api/userService.js';
import { PermissionCheckbox } from '../components/topic-permissions/PermissionCheckbox.js';
import { RoleColumnHeader } from '../components/topic-permissions/RoleColumnHeader.js';
import { SaveStatusCell } from '../components/topic-permissions/SaveStatusCell.js';
import { SectionHeaderRow } from '../components/topic-permissions/SectionHeaderRow.js';
import { UserColumnHeader } from '../components/topic-permissions/UserColumnHeader.js';
import { ALL_ORG_UNITS, ORG_UNIT_GROUPS, PROJECT_TYPE_TAGS, UNIT_MEMBERS, type UnitMember } from '../data/unitMembers.js';
import type { AdminUserRow } from '../types/index.js';

type MemberRow = Omit<UnitMember, 'role'> & {
  userId: string | null;
  role: string;
  allowedProjectTypes: string[];
};

type AccessSnapshot = {
  allowedUnits: string[];
  allowedProjectTypes: string[];
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
const ROLE_COLUMN_NAMES = new Set(['quan tri vien', 'admin']);

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

function isRoleColumn(member: MemberRow): boolean {
  const name = normalizePersonName(member.fullName);
  if (ROLE_COLUMN_NAMES.has(name)) return true;
  if (!name && (member.role === 'Quản trị viên' || member.role.trim().toLowerCase() === 'admin')) {
    return true;
  }
  return false;
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
      allowedProjectTypes: linked ? linked.allowed_project_types : [],
    };
  });

  for (const user of users) {
    if (claimedIds.has(user.id)) continue;
    const extra: MemberRow = {
      id: `user-${user.id}`,
      fullName: user.full_name,
      role: roleLabel(user.role),
      email: user.email,
      homeUnit: 'Chưa xác định',
      allowedUnits: user.allowed_units,
      allowedProjectTypes: user.allowed_project_types ?? [],
      userId: user.id,
    };
    if (isRoleColumn(extra)) continue;
    rows.push(extra);
  }

  return rows;
}

function seesAllUnits(member: MemberRow): boolean {
  return member.allowedUnits.length === 0;
}

function unitChecked(member: MemberRow, unit: string): boolean {
  return seesAllUnits(member) || member.allowedUnits.includes(unit);
}

function nextAllowedAfterToggleUnit(member: MemberRow, unit: string): string[] {
  const current = member.allowedUnits.length === 0 ? ALL_ORG_UNITS : member.allowedUnits;
  const next = current.includes(unit)
    ? current.filter((item) => item !== unit)
    : [...current, unit];
  return next.length === ALL_ORG_UNITS.length ? [] : next;
}

function nextAllowedAfterToggleAll(member: MemberRow): string[] {
  return member.allowedUnits.length === 0 ? [member.homeUnit] : [];
}

function seesAllTypes(member: MemberRow): boolean {
  return member.allowedProjectTypes.length === 0;
}

function typeChecked(member: MemberRow, type: string): boolean {
  return seesAllTypes(member) || member.allowedProjectTypes.includes(type);
}

function nextAllowedAfterToggleType(member: MemberRow, type: string): string[] {
  const current = member.allowedProjectTypes.length === 0 ? [...PROJECT_TYPE_TAGS] : member.allowedProjectTypes;
  const next = current.includes(type)
    ? current.filter((item) => item !== type)
    : [...current, type];
  return next.length === PROJECT_TYPE_TAGS.length ? [] : next;
}

function checkboxTooltip(member: MemberRow, unit?: string): string | undefined {
  if (isRoleColumn(member)) {
    return 'Quyền này được kế thừa từ vai trò hệ thống';
  }
  if (!member.userId) {
    return 'Chưa liên kết tài khoản hệ thống';
  }
  if (unit && unit === member.homeUnit) {
    return `${member.fullName} (đơn vị công tác)`;
  }
  return undefined;
}

function GroupIcon({ kind }: { kind: string }) {
  const className = 'h-3.5 w-3.5';
  if (kind.includes('Loại')) {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
      </svg>
    );
  }
  if (kind.includes('Khoa') || kind.includes('Trường')) {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18"
        />
      </svg>
    );
  }
  if (kind.includes('Phòng')) {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
        />
      </svg>
    );
  }
  if (kind.includes('Trung tâm')) {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.3 24.3 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 18a9.065 9.065 0 0 1-6.23-2.308L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.131 3.611A19.35 19.35 0 0 1 12 21c-2.47 0-4.862-.46-7.071-1.287-1.782-.293-2.363-2.379-1.13-3.61L5 14.5"
        />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m6 0h.008v.008H21V3Z"
      />
    </svg>
  );
}

export function TopicPermissionsPage() {
  const [members, setMembers] = useState<MemberRow[]>(() =>
    UNIT_MEMBERS.map((member) => ({ ...member, userId: null, allowedProjectTypes: [] })),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [hoveredColIndex, setHoveredColIndex] = useState<number | null>(null);

  const membersRef = useRef(members);
  membersRef.current = members;
  const debounceTimers = useRef<Map<string, number>>(new Map());
  const savedClearTimers = useRef<Map<string, number>>(new Map());
  const rollbackAccess = useRef<Map<string, AccessSnapshot>>(new Map());
  const pendingUnitKeys = useRef<Map<string, string>>(new Map());

  const refreshMembers = useCallback(async () => {
    setError(null);
    try {
      const users = await getUsers();
      setMembers(mergeMembers(UNIT_MEMBERS, users));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được danh sách người dùng');
      setMembers(UNIT_MEMBERS.map((member) => ({ ...member, userId: null, allowedProjectTypes: [] })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshMembers();
  }, [refreshMembers]);

  useEffect(() => {
    return () => {
      debounceTimers.current.forEach((timer) => window.clearTimeout(timer));
      savedClearTimers.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const columns = useMemo(() => {
    const users = members.filter((member) => !isRoleColumn(member));
    const roles = members.filter((member) => isRoleColumn(member));
    return { users, roles, all: [...users, ...roles] };
  }, [members]);

  const dividerCount = columns.roles.length > 0 ? 1 : 0;
  const colSpan = columns.all.length + 2 + dividerCount;

  const markSaved = (unitKey: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.add(unitKey);
      return next;
    });
    const existing = savedClearTimers.current.get(unitKey);
    if (existing) window.clearTimeout(existing);
    const timer = window.setTimeout(() => {
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(unitKey);
        return next;
      });
      savedClearTimers.current.delete(unitKey);
    }, 2000);
    savedClearTimers.current.set(unitKey, timer);
  };

  const scheduleSave = (memberId: string, unitKey: string) => {
    pendingUnitKeys.current.set(memberId, unitKey);
    const existing = debounceTimers.current.get(memberId);
    if (existing) window.clearTimeout(existing);

    const timer = window.setTimeout(() => {
      void (async () => {
        const latest = membersRef.current.find((member) => member.id === memberId);
        const rowKey = pendingUnitKeys.current.get(memberId) ?? unitKey;
        if (!latest?.userId) return;

        setSavingIds((prev) => {
          const next = new Set(prev);
          next.add(rowKey);
          return next;
        });
        setError(null);

        try {
          await Promise.all([
            updateAllowedUnits(latest.userId, latest.allowedUnits),
            updateAllowedProjectTypes(latest.userId, latest.allowedProjectTypes),
          ]);
          rollbackAccess.current.delete(memberId);
          markSaved(rowKey);
        } catch {
          const snapshot = rollbackAccess.current.get(memberId);
          if (snapshot) {
            const restored = membersRef.current.map((member) =>
              member.id === memberId
                ? {
                    ...member,
                    allowedUnits: snapshot.allowedUnits,
                    allowedProjectTypes: snapshot.allowedProjectTypes,
                  }
                : member,
            );
            membersRef.current = restored;
            setMembers(restored);
            rollbackAccess.current.delete(memberId);
          }
          setError(`Không thể lưu phân quyền. Kiểm tra kết nối và thử lại.`);
        } finally {
          setSavingIds((prev) => {
            const next = new Set(prev);
            next.delete(rowKey);
            return next;
          });
          debounceTimers.current.delete(memberId);
          pendingUnitKeys.current.delete(memberId);
        }
      })();
    }, 800);

    debounceTimers.current.set(memberId, timer);
  };

  const rememberSnapshot = (current: MemberRow) => {
    if (!rollbackAccess.current.has(current.id)) {
      rollbackAccess.current.set(current.id, {
        allowedUnits: current.allowedUnits,
        allowedProjectTypes: current.allowedProjectTypes,
      });
    }
  };

  const applyMemberUnits = (
    memberId: string,
    computeNext: (member: MemberRow) => string[],
    unitKey: string,
  ) => {
    const current = membersRef.current.find((item) => item.id === memberId);
    if (!current?.userId || isRoleColumn(current)) return;
    rememberSnapshot(current);
    const nextUnits = computeNext(current);
    const nextMembers = membersRef.current.map((item) =>
      item.id === memberId ? { ...item, allowedUnits: nextUnits } : item,
    );
    membersRef.current = nextMembers;
    setMembers(nextMembers);
    scheduleSave(memberId, unitKey);
  };

  const applyMemberTypes = (
    memberId: string,
    computeNext: (member: MemberRow) => string[],
    typeKey: string,
  ) => {
    const current = membersRef.current.find((item) => item.id === memberId);
    if (!current?.userId || isRoleColumn(current)) return;
    rememberSnapshot(current);
    const nextTypes = computeNext(current);
    const nextMembers = membersRef.current.map((item) =>
      item.id === memberId ? { ...item, allowedProjectTypes: nextTypes } : item,
    );
    membersRef.current = nextMembers;
    setMembers(nextMembers);
    scheduleSave(memberId, typeKey);
  };

  const handleToggleUnit = (member: MemberRow, unit: string) => {
    applyMemberUnits(member.id, (current) => nextAllowedAfterToggleUnit(current, unit), unit);
  };

  const handleToggleAll = (member: MemberRow) => {
    applyMemberUnits(member.id, nextAllowedAfterToggleAll, '__all__');
  };

  const handleToggleType = (member: MemberRow, type: string) => {
    applyMemberTypes(member.id, (current) => nextAllowedAfterToggleType(current, type), type);
  };

  const cellHighlight = (colIndex: number) =>
    hoveredColIndex === colIndex ? 'bg-blue-50/60' : '';

  if (loading) return <p className="text-gray-500">Đang tải…</p>;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-gray-800">Phân quyền theo đơn vị</h1>
      <p className="mb-6 text-sm text-slate-500">
        Phân quyền xem đề tài theo đơn vị và theo loại đề tài. Thay đổi được lưu tự động sau khi bạn
        chọn quyền.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div
        className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm"
        onMouseLeave={() => setHoveredColIndex(null)}
      >
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="sticky left-0 z-20 min-w-[200px] border-r border-slate-200 bg-white px-4 py-4 text-left text-xs font-black uppercase tracking-widest text-slate-500">
                Đơn vị
              </th>
              {columns.users.map((member, colIndex) => (
                <th
                  key={member.id}
                  className="w-[68px] min-w-[68px] bg-white px-1 py-3 text-center"
                  onMouseEnter={() => setHoveredColIndex(colIndex)}
                >
                  <UserColumnHeader name={member.fullName} role={member.role} colorIndex={colIndex} />
                </th>
              ))}
              {columns.roles.length > 0 ? <th className="w-px bg-slate-200 px-0 py-0" aria-hidden /> : null}
              {columns.roles.map((member, roleIndex) => (
                <th
                  key={member.id}
                  className="w-[68px] min-w-[68px] bg-slate-50 px-1 py-3 text-center"
                  onMouseEnter={() => setHoveredColIndex(columns.users.length + roleIndex)}
                >
                  <RoleColumnHeader
                    roleName={member.fullName || 'Quản trị viên'}
                    description="Có toàn quyền trên tất cả đơn vị"
                  />
                </th>
              ))}
              <th className="sticky right-0 z-20 min-w-[88px] border-l border-slate-200 bg-white px-4 py-4 text-center text-xs font-black uppercase tracking-widest text-slate-500">
                Lưu
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="group border-b border-slate-100 transition-colors hover:bg-blue-50/40">
              <td className="sticky left-0 z-10 border-r border-slate-100 bg-white px-4 py-3 font-semibold text-slate-700 shadow-[1px_0_0_#e2e8f0] transition-colors group-hover:bg-blue-50/40">
                Tất cả
              </td>
              {columns.users.map((member, colIndex) => (
                <td
                  key={`${member.id}-all`}
                  className={`px-2 py-3 text-center transition-colors ${cellHighlight(colIndex)}`}
                  onMouseEnter={() => setHoveredColIndex(colIndex)}
                >
                  <PermissionCheckbox
                    checked={seesAllUnits(member)}
                    editable={Boolean(member.userId)}
                    onChange={() => handleToggleAll(member)}
                    tooltip={checkboxTooltip(member)}
                    ariaLabel={`${member.fullName}: xem đề tài của tất cả đơn vị`}
                  />
                </td>
              ))}
              {columns.roles.length > 0 ? <td className="w-px bg-slate-200 px-0 py-0" aria-hidden /> : null}
              {columns.roles.map((member, roleIndex) => {
                const colIndex = columns.users.length + roleIndex;
                return (
                  <td
                    key={`${member.id}-all`}
                    className={`bg-slate-50/80 px-2 py-3 text-center transition-colors ${cellHighlight(colIndex)}`}
                    onMouseEnter={() => setHoveredColIndex(colIndex)}
                  >
                    <PermissionCheckbox
                      checked={seesAllUnits(member)}
                      editable={false}
                      onChange={() => undefined}
                      tooltip={checkboxTooltip(member)}
                      ariaLabel={`${member.fullName}: quyền kế thừa từ vai trò`}
                    />
                  </td>
                );
              })}
              <SaveStatusCell unitId="__all__" savingIds={savingIds} savedIds={savedIds} />
            </tr>

            <SectionHeaderRow
              label="Loại đề tài"
              icon={<GroupIcon kind="Loại đề tài" />}
              colSpan={colSpan}
            />
            {PROJECT_TYPE_TAGS.map((type) => (
              <tr
                key={type}
                className="group border-b border-slate-100 transition-colors hover:bg-blue-50/40"
              >
                <td className="sticky left-0 z-10 border-r border-slate-100 bg-white px-4 py-3 font-semibold text-slate-700 shadow-[1px_0_0_#e2e8f0] transition-colors group-hover:bg-blue-50/40">
                  {type}
                </td>
                {columns.users.map((member, colIndex) => (
                  <td
                    key={`${member.id}-${type}`}
                    className={`px-2 py-3 text-center transition-colors ${cellHighlight(colIndex)}`}
                    onMouseEnter={() => setHoveredColIndex(colIndex)}
                  >
                    <PermissionCheckbox
                      checked={typeChecked(member, type)}
                      editable={Boolean(member.userId)}
                      onChange={() => handleToggleType(member, type)}
                      tooltip={checkboxTooltip(member)}
                      ariaLabel={`${member.fullName}: ${type}`}
                    />
                  </td>
                ))}
                {columns.roles.length > 0 ? <td className="w-px bg-slate-200 px-0 py-0" aria-hidden /> : null}
                {columns.roles.map((member, roleIndex) => {
                  const colIndex = columns.users.length + roleIndex;
                  return (
                    <td
                      key={`${member.id}-${type}`}
                      className={`bg-slate-50/80 px-2 py-3 text-center transition-colors ${cellHighlight(colIndex)}`}
                      onMouseEnter={() => setHoveredColIndex(colIndex)}
                    >
                      <PermissionCheckbox
                        checked={typeChecked(member, type)}
                        editable={false}
                        onChange={() => undefined}
                        tooltip={checkboxTooltip(member)}
                        ariaLabel={`${member.fullName}: ${type}`}
                      />
                    </td>
                  );
                })}
                <SaveStatusCell unitId={type} savingIds={savingIds} savedIds={savedIds} />
              </tr>
            ))}

            {ORG_UNIT_GROUPS.map((group) => (
              <Fragment key={group.label}>
                <SectionHeaderRow
                  label={group.label}
                  icon={<GroupIcon kind={group.label} />}
                  colSpan={colSpan}
                />
                {group.units.map((unit) => (
                  <tr
                    key={unit}
                    className="group border-b border-slate-100 transition-colors hover:bg-blue-50/40"
                  >
                    <td className="sticky left-0 z-10 border-r border-slate-100 bg-white px-4 py-3 font-semibold text-slate-700 shadow-[1px_0_0_#e2e8f0] transition-colors group-hover:bg-blue-50/40">
                      {unit}
                    </td>
                    {columns.users.map((member, colIndex) => (
                      <td
                        key={`${member.id}-${unit}`}
                        className={`px-2 py-3 text-center transition-colors ${cellHighlight(colIndex)}`}
                        onMouseEnter={() => setHoveredColIndex(colIndex)}
                      >
                        <PermissionCheckbox
                          checked={unitChecked(member, unit)}
                          editable={Boolean(member.userId)}
                          onChange={() => handleToggleUnit(member, unit)}
                          tooltip={checkboxTooltip(member, unit)}
                          ariaLabel={`${member.fullName}: ${unit}`}
                        />
                      </td>
                    ))}
                    {columns.roles.length > 0 ? <td className="w-px bg-slate-200 px-0 py-0" aria-hidden /> : null}
                    {columns.roles.map((member, roleIndex) => {
                      const colIndex = columns.users.length + roleIndex;
                      return (
                        <td
                          key={`${member.id}-${unit}`}
                          className={`bg-slate-50/80 px-2 py-3 text-center transition-colors ${cellHighlight(colIndex)}`}
                          onMouseEnter={() => setHoveredColIndex(colIndex)}
                        >
                          <PermissionCheckbox
                            checked={unitChecked(member, unit)}
                            editable={false}
                            onChange={() => undefined}
                            tooltip={checkboxTooltip(member, unit)}
                            ariaLabel={`${member.fullName}: ${unit}`}
                          />
                        </td>
                      );
                    })}
                    <SaveStatusCell unitId={unit} savingIds={savingIds} savedIds={savedIds} />
                  </tr>
                ))}
              </Fragment>
            ))}

            {columns.all.length === 0 && (
              <tr>
                <td colSpan={colSpan} className="px-6 py-8 text-center text-gray-500">
                  Chưa có thành viên để phân quyền.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
