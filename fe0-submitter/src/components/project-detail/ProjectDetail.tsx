import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  ProgressStatus,
  type ProjectDiscussionNote,
  type ResearchProject,
} from '../../types/researchProject.js';

import {
  formatSupervisorLabel,
  useSupervisorAccounts,
} from '../data-entry/useSupervisorAccounts.js';
import { useAuthStore } from '../../store/authStore.js';
import type { AuthUser } from '../../types/index.js';
import { useAssignableUsers } from '../../hooks/useAssignableUsers.js';
import { useNotification } from '../../hooks/useNotification.js';
import { researchProjectService } from '../../api/researchProjectService.js';
import { userDirectory } from '../../api/userDirectory.js';
import {
  buildKnownUsernames,
  CommentMentionInput,
  extractMentionedUserIds,
  MentionContent,
  useMentionCandidates,
} from '../mentions/index.js';
import { Toast } from '../ui/Toast.js';

import { WORKFLOW_STEPS } from './constants.js';
import { formatDisplayDate } from './formatDisplayDate.js';
import { BackArrowIcon } from './icons.js';
import { InfoSections, type DetailSectionId } from './InfoSections.js';
import {
  appendProjectNote,
  buildDiscussionFeed,
  countUnreadNoteNotifications,
  deleteProjectNote,
  editProjectNote,
  getNoteReplies,
  isNoteOwner,
  markNoteNotificationsRead,
  mergeProjectNotes,
  toggleNoteLike,
  type FeedItem,
} from './projectDiscussion.js';
import type { ProjectDetailProps } from './types.js';

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

type DetailTabId =
  | 'thong-tin-chung'
  | 'hop-dong'
  | 'kinh-phi'
  | 'thoi-gian'
  | 'nghiem-thu'
  | 'nhiem-vu'
  | 'trao-doi';

type TabDef = {
  id: DetailTabId;
  label: string;
  section?: DetailSectionId;
};

const DETAIL_TABS: TabDef[] = [
  { id: 'thong-tin-chung', label: 'Thông tin chung', section: 'general' },
  { id: 'hop-dong', label: 'Hợp đồng', section: 'contract' },
  { id: 'kinh-phi', label: 'Kinh phí', section: 'budget' },
  { id: 'thoi-gian', label: 'Thời gian', section: 'timeline' },
  { id: 'nghiem-thu', label: 'Nghiệm thu', section: 'acceptance' },
  { id: 'nhiem-vu', label: 'Tiến độ' },
  { id: 'trao-doi', label: 'Trao đổi' },
];

const PROGRESS_OPTIONS = [ProgressStatus.ON_TIME, ProgressStatus.OVERDUE, ProgressStatus.EXTENDED];

const PROGRESS_PILL_CLASS: Record<string, string> = {
  [ProgressStatus.ON_TIME]: 'bg-emerald-500 text-white',
  [ProgressStatus.OVERDUE]: 'bg-red-500 text-white',
  [ProgressStatus.EXTENDED]: 'bg-amber-500 text-white',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatVND(value?: number): string {
  if (value == null || Number.isNaN(value) || value === 0) return '';
  return `${value.toLocaleString('vi-VN')} VNĐ`;
}

function parseMembers(raw?: string): string[] {
  return (raw ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function avatarColor(name: string): string {
  const palette = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-violet-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-indigo-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

function categoryLabel(categories?: string[] | string): string {
  if (!categories) return '';
  return Array.isArray(categories) ? categories.join(', ') : String(categories);
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

// ---------------------------------------------------------------------------
// Icons (inline SVG — CRM action & tab icons)
// ---------------------------------------------------------------------------

function SvgIcon({ d, className }: { d: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />
    </svg>
  );
}

const IconPaths = {
  beaker:
    'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.611L5 14.5',
  pencil: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z',
  calendar:
    'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  link: 'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244',
  trash:
    'M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0',
  tag: 'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z',
  document:
    'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  user: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
  building:
    'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M9.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21',
  currency:
    'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  chat: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z',
  clipboard:
    'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z',
  search: 'm21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
  paperclip:
    'm18.375 12.739-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13',
  at: 'M16.712 4.33a9.027 9.027 0 011.3 4.706c0 4.982-4.03 9-9 9-1.015 0-1.99-.168-2.9-.472M6.75 6.75h.008v.008H6.75V6.75zm0 3h.008v.008H6.75V9.75zm0 3h.008v.008H6.75v-.008zM9 12.75h.008v.008H9V12.75zm0 3h.008v.008H9v-.008zM12 9.75h.008v.008H12V9.75zm0 3h.008v.008H12v-.008z',
  refresh:
    'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182',
  heart:
    'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Avatar({ name, size = 'md', className = '' }: { name: string; size?: 'sm' | 'md'; className?: string }) {
  const dim = size === 'sm' ? 'h-8 w-8 text-[10px]' : 'h-9 w-9 text-xs';
  return (
    <div
      title={name}
      className={`flex flex-shrink-0 items-center justify-center rounded-full font-bold text-white
                  ${dim} ${avatarColor(name)} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}

function IconButton({
  iconPath,
  title,
  onClick,
  variant = 'default',
}: {
  iconPath: string;
  title: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}) {
  const styles =
    variant === 'danger'
      ? 'bg-red-50 text-red-500 hover:bg-red-100'
      : 'bg-slate-100 text-slate-600 hover:bg-slate-200';

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`rounded-lg p-2 transition-colors ${styles}`}
    >
      <SvgIcon d={iconPath} className="h-4 w-4" />
    </button>
  );
}

function QuickInfoRow({
  iconPath,
  iconColor,
  label,
  value,
  asBadge = false,
  emptyLabel = 'Chưa có dữ liệu',
}: {
  iconPath: string;
  iconColor: string;
  label: string;
  value?: string;
  asBadge?: boolean;
  emptyLabel?: string;
}) {
  const isEmpty = !value;

  return (
    <div className="flex items-start gap-2">
      <SvgIcon d={iconPath} className={`mt-0.5 h-4 w-4 flex-shrink-0 ${iconColor}`} />
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase text-slate-400">{label}</p>
        {isEmpty ? (
          <p className="text-sm italic text-slate-400">{emptyLabel}</p>
        ) : asBadge ? (
          <span
            className="mt-0.5 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs
                       font-semibold text-emerald-700"
          >
            {value}
          </span>
        ) : (
          <p className="break-words text-sm font-semibold text-slate-700">{value}</p>
        )}
      </div>
    </div>
  );
}

function ProgressStatusSelect({
  value,
  onChange,
  disabled = false,
}: {
  value?: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}) {
  const pillClass = PROGRESS_PILL_CLASS[value ?? ''] ?? 'bg-slate-400 text-white';

  if (disabled) {
    return (
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${pillClass}`}
      >
        {value || 'Chưa có'}
      </span>
    );
  }

  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className={`cursor-pointer rounded-full border-0 py-0.5 pl-2 pr-6 text-[10px] font-bold
                  focus:ring-2 focus:ring-blue-400 ${pillClass}`}
    >
      <option value="" className="bg-white text-slate-700">
        Chưa có
      </option>
      {PROGRESS_OPTIONS.map((opt) => (
        <option key={opt} value={opt} className="bg-white text-slate-700">
          {opt}
        </option>
      ))}
    </select>
  );
}

function DetailTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex h-14 flex-shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-6">
      <button
        type="button"
        onClick={onBack}
        className="rounded-full p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        aria-label="Quay lại"
      >
        <BackArrowIcon className="h-5 w-5" />
      </button>
      <nav className="flex items-center gap-1.5 text-sm">
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer text-slate-500 hover:text-blue-600"
        >
          Đề tài KHCN
        </button>
        <span className="text-slate-300">›</span>
        <span className="font-medium text-blue-600">Thông tin chi tiết đề tài</span>
      </nav>
    </div>
  );
}

function LeftPanel({
  project,
  completionPct,
  members,
  category,
  onEdit,
  onDelete,
  onScheduleTab,
  onProgressStatusChange,
  canEdit = true,
  canDelete = true,
  canEditProgress = true,
}: {
  project: ResearchProject;
  completionPct: number;
  members: string[];
  category: string;
  onEdit: () => void;
  onDelete?: () => void;
  onScheduleTab: () => void;
  onProgressStatusChange: (status: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canEditProgress?: boolean;
}) {
  const supervisors = useSupervisorAccounts();
  const supervisorLabel = useMemo(() => {
    if (!project.supervisorId) return null;
    const match = supervisors.find((u) => u.id === project.supervisorId);
    return match ? formatSupervisorLabel(match) : null;
  }, [project.supervisorId, supervisors]);

  const handleShare = () => {
    const url = window.location.href;
    void navigator.clipboard?.writeText(url).then(() => {
      window.alert('Đã sao chép liên kết đề tài.');
    });
  };

  return (
    <aside
      className="flex w-[340px] flex-shrink-0 flex-col overflow-y-auto border-r border-slate-200
                 bg-white"
    >
      <div className="border-b border-slate-100 p-4">
        <div className="flex items-start gap-3">
          <div
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full
                        bg-blue-100"
          >
            <SvgIcon d={IconPaths.beaker} className="h-7 w-7 text-blue-600" />
          </div>
          <h2 className="text-base font-bold leading-snug text-slate-800">{project.title || '—'}</h2>
        </div>
        <p className="mt-2 flex flex-wrap items-center gap-1 text-xs text-slate-400">
          {project.projectCode ? <span>{project.projectCode}</span> : null}
          {project.projectCode && project.leadAuthor ? (
            <span className="text-slate-300">•</span>
          ) : null}
          {project.leadAuthor ? <span>{project.leadAuthor}</span> : null}
          {project.contractId ? (
            <>
              <span className="text-slate-300">•</span>
              <span>{project.contractId}</span>
            </>
          ) : null}
        </p>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
        {canEdit ? (
          <IconButton iconPath={IconPaths.pencil} title="Chỉnh sửa thông tin" onClick={onEdit} />
        ) : null}
        <IconButton iconPath={IconPaths.calendar} title="Lịch trình" onClick={onScheduleTab} />
        <IconButton iconPath={IconPaths.link} title="Chia sẻ" onClick={handleShare} />
        {canDelete && onDelete ? (
          <IconButton
            iconPath={IconPaths.trash}
            title="Xóa đề tài"
            onClick={onDelete}
            variant="danger"
          />
        ) : null}
      </div>

      <div className="border-b border-slate-100 px-4 py-3">
        <p className="mb-1.5 text-xs text-slate-500">Tiến độ quy trình</p>
        <div className="relative h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <span
          className="mt-1.5 inline-block rounded-full bg-emerald-500 px-2 py-0.5 text-[10px]
                     font-bold text-white"
        >
          {completionPct}%
        </span>
      </div>

      <div className="px-4 py-3">
        <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
          <QuickInfoRow
            iconPath={IconPaths.tag}
            iconColor="text-violet-500"
            label="Mã đề tài"
            value={project.projectCode}
          />
          <QuickInfoRow
            iconPath={IconPaths.document}
            iconColor="text-blue-500"
            label="Số hợp đồng"
            value={project.contractId}
          />
          <QuickInfoRow
            iconPath={IconPaths.document}
            iconColor="text-blue-500"
            label="Phụ lục hợp đồng"
            value={project.contractAppendix}
          />
          <QuickInfoRow
            iconPath={IconPaths.user}
            iconColor="text-blue-500"
            label="Chủ nhiệm"
            value={project.leadAuthor}
          />
          <QuickInfoRow
            iconPath={IconPaths.building}
            iconColor="text-indigo-500"
            label="Khoa/Đơn vị"
            value={project.department}
          />
          <QuickInfoRow
            iconPath={IconPaths.tag}
            iconColor="text-emerald-500"
            label="Loại đề tài"
            value={category}
            asBadge
          />
          <QuickInfoRow
            iconPath={IconPaths.currency}
            iconColor="text-amber-500"
            label="Tổng kinh phí"
            value={formatVND(project.budget)}
          />
        </div>
      </div>

      <div className="space-y-2 border-t border-slate-100 px-4 py-3">
        <div
          className="flex items-center justify-between rounded-lg border border-slate-200 px-3
                      py-2"
        >
          <span className="text-xs text-slate-500">Tiến độ thực hiện</span>
          <ProgressStatusSelect
            value={project.progressStatus}
            onChange={onProgressStatusChange}
            disabled={!canEditProgress}
          />
        </div>
        <div
          className="flex items-center justify-between rounded-lg border border-slate-200 px-3
                      py-2"
        >
          <span className="text-xs text-slate-500">Chuyên viên phụ trách</span>
          {supervisorLabel ? (
            <span
              className="max-w-[160px] truncate rounded-full bg-blue-500 px-2 py-0.5 text-[10px]
                         font-bold text-white"
              title={supervisorLabel}
            >
              {supervisorLabel}
            </span>
          ) : (
            <span
              className="rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-bold text-white"
            >
              Chuyên viên phụ trách
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Chủ nhiệm đề tài</span>
          <div className="flex items-center gap-2">
            {project.leadAuthor ? <Avatar name={project.leadAuthor} size="sm" /> : null}
            <span className="max-w-[140px] truncate text-sm font-semibold text-slate-700">
              {project.leadAuthor || '—'}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 px-4 py-3">
        <p className="mb-2 text-xs text-slate-500">Thành viên nghiên cứu</p>
        {members.length === 0 ? (
          <p className="text-sm italic text-slate-400">Chưa có dữ liệu</p>
        ) : (
          <div className="flex items-center">
            {members.slice(0, 3).map((member) => (
              <Avatar
                key={member}
                name={member}
                size="sm"
                className="-ml-2 border-2 border-white first:ml-0"
              />
            ))}
            {members.length > 3 ? (
              <div
                className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full border-2
                           border-white bg-slate-100 text-[10px] font-bold text-slate-500"
              >
                +{members.length - 3}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </aside>
  );
}

function DetailTabBar({
  activeTab,
  onTabChange,
  onEdit,
  unreadDiscussionCount,
  canEdit = true,
}: {
  activeTab: DetailTabId;
  onTabChange: (tab: DetailTabId) => void;
  onEdit: () => void;
  unreadDiscussionCount: number;
  canEdit?: boolean;
}) {
  return (
    <div
      className="sticky top-0 z-10 flex flex-shrink-0 items-center justify-between border-b
                 border-slate-200 bg-white px-4"
    >
      <div className="flex items-center gap-1 overflow-x-auto">
        {DETAIL_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-sm
                        transition-colors ${
                          activeTab === tab.id
                            ? 'border-blue-600 font-semibold text-slate-800'
                            : 'border-transparent font-normal text-slate-500 hover:border-slate-200 hover:text-slate-700'
                        }`}
          >
            {tab.label}
            {tab.id === 'trao-doi' && unreadDiscussionCount > 0 ? (
              <span
                className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white"
              >
                {unreadDiscussionCount}
              </span>
            ) : null}
          </button>
        ))}
      </div>
      {canEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className="ml-4 flex-shrink-0 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold
                     text-blue-600 hover:bg-blue-100"
        >
          Chỉnh sửa thông tin
        </button>
      ) : null}
    </div>
  );
}

function WorkflowStepsPanel({ currentStep }: { currentStep: number }) {
  return (
    <div className="space-y-3">
      <h4 className="border-l-4 border-blue-500 pl-3 text-sm font-bold text-blue-600">
        Quy trình thực hiện đề tài
      </h4>
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {WORKFLOW_STEPS.map(({ step, label }) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          return (
            <li
              key={step}
              className={`flex items-center gap-3 px-4 py-3 text-sm ${
                isCurrent ? 'bg-blue-50/60' : ''
              }`}
            >
              <span
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full
                            text-xs font-bold ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-600'
                                : isCurrent
                                  ? 'bg-blue-100 text-blue-600'
                                  : 'bg-slate-100 text-slate-400'
                            }`}
              >
                {isCompleted ? '✓' : step}
              </span>
              <span
                className={`font-medium ${
                  isCompleted || isCurrent ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {label}
              </span>
              {isCurrent ? (
                <span className="ml-auto text-[10px] font-bold uppercase text-blue-600">
                  Hiện tại
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-slate-400">
        Quản lý chi tiết nhiệm vụ và biểu đồ Gantt có tại tab{' '}
        <span className="font-semibold text-slate-600">Tiến độ thực hiện</span> trên menu trái.
      </p>
    </div>
  );
}

function ActivityFeedEntry({ item }: { item: FeedItem }) {
  if (item.kind !== 'workflow') return null;

  const author = item.user;
  const timestamp = item.updatedAt;
  const stepLabel = WORKFLOW_STEPS[item.step - 1]?.label;

  return (
    <div className="flex gap-3">
      <div className="relative flex-shrink-0">
        <Avatar name={author || 'Hệ thống'} />
        <div
          className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center
                      rounded-full bg-blue-600 ring-2 ring-white"
        >
          <SvgIcon d={IconPaths.refresh} className="h-2.5 w-2.5 text-white" />
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-blue-600">{author || 'Hệ thống'}</p>
        <p className="text-xs text-slate-400">
          {formatDisplayDate(timestamp)} {formatTime(timestamp)}
        </p>
        <p className="mt-1 text-sm text-slate-700">
          Chuyển sang bước:{' '}
          <span className="font-semibold">{stepLabel ?? `Bước ${item.step}`}</span>
          {item.isRevert ? ' (quay lại)' : null}
        </p>
      </div>
    </div>
  );
}

type CommentCardProps = {
  note: ProjectDiscussionNote;
  allNotes: ProjectDiscussionNote[];
  user: AuthUser | null;
  knownUsernames: Set<string>;
  mentionCandidates: ReturnType<typeof useMentionCandidates>;
  depth?: number;
  disabled?: boolean;
  onLike: (noteId: string) => void;
  onReply: (parentId: string, content: string, mentionedUserIds?: string[]) => void;
  onEdit: (noteId: string, content: string) => void;
  onDelete: (noteId: string) => void;
};

function CommentCard({
  note,
  allNotes,
  user,
  knownUsernames,
  mentionCandidates,
  depth = 0,
  disabled = false,
  onLike,
  onReply,
  onEdit,
  onDelete,
}: CommentCardProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyDraft, setReplyDraft] = useState('');
  const [editDraft, setEditDraft] = useState(note.content);

  const replies = getNoteReplies(allNotes, note.id);
  const likeCount = note.likedBy?.length ?? 0;
  const hasLiked = user?.id ? (note.likedBy ?? []).includes(user.id) : false;
  const isOwner = isNoteOwner(note, user);
  const displayTime = note.updatedAt ?? note.createdAt;

  const submitReply = () => {
    const text = replyDraft.trim();
    if (!text) return;
    onReply(note.id, text, extractMentionedUserIds(text, mentionCandidates));
    setReplyDraft('');
    setIsReplying(false);
  };

  const submitEdit = () => {
    const text = editDraft.trim();
    if (!text) return;
    onEdit(note.id, text);
    setIsEditing(false);
  };

  return (
    <div className={depth > 0 ? 'ml-10 mt-4 border-l-2 border-slate-100 pl-4' : ''}>
      <div className="flex gap-3">
        <div className="relative flex-shrink-0">
          <Avatar name={note.author || 'Hệ thống'} size={depth > 0 ? 'sm' : 'md'} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-blue-600">{note.author}</p>
          <p className="text-xs text-slate-400">
            {formatDisplayDate(displayTime)} {formatTime(displayTime)}
            {note.updatedAt ? ' · đã chỉnh sửa' : ''}
          </p>

          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:outline-none
                           focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={disabled || !editDraft.trim()}
                  onClick={submitEdit}
                  className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white
                             hover:bg-blue-700 disabled:opacity-40"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditDraft(note.content);
                  }}
                  className="rounded-lg px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <MentionContent
              content={note.content}
              knownUsernames={knownUsernames}
              className="mt-1 text-sm text-slate-700"
            />
          )}

          {!isEditing ? (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={disabled || !user?.id}
                onClick={() => onLike(note.id)}
                className={`flex items-center gap-1 text-xs font-semibold transition-colors ${
                  hasLiked ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'
                }`}
              >
                <SvgIcon d={IconPaths.heart} className="h-3.5 w-3.5" />
                Thích{likeCount > 0 ? ` (${likeCount})` : ''}
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => setIsReplying((v) => !v)}
                className="text-xs font-semibold text-slate-500 hover:text-blue-600"
              >
                Trả lời
              </button>
              {isOwner ? (
                <>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setEditDraft(note.content);
                      setIsEditing(true);
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-blue-600"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (window.confirm('Xóa ghi chú này?')) onDelete(note.id);
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-red-600"
                  >
                    Xóa
                  </button>
                </>
              ) : null}
            </div>
          ) : null}

          {isReplying ? (
            <div className="mt-3">
              <CommentMentionInput
                value={replyDraft}
                onChange={setReplyDraft}
                onSubmit={submitReply}
                candidates={mentionCandidates}
                placeholder="Viết trả lời... Gõ @ để gắn thẻ thành viên"
                disabled={disabled}
                isSaving={disabled}
                submitLabel="Gửi trả lời"
                minRows={2}
                compact
              />
              <button
                type="button"
                onClick={() => {
                  setIsReplying(false);
                  setReplyDraft('');
                }}
                className="mt-2 rounded-lg px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100"
              >
                Hủy
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {replies.map((reply) => (
        <CommentCard
          key={reply.id}
          note={reply}
          allNotes={allNotes}
          user={user}
          knownUsernames={knownUsernames}
          mentionCandidates={mentionCandidates}
          depth={depth + 1}
          disabled={disabled}
          onLike={onLike}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function ProjectNoteThread({
  project,
  notes,
  user,
  onAddNote,
  onLike,
  onReply,
  onEdit,
  onDelete,
  isSaving,
}: {
  project: ResearchProject;
  notes: ProjectDiscussionNote[];
  user: AuthUser | null;
  onAddNote: (content: string, mentionedUserIds?: string[]) => void;
  onLike: (noteId: string) => void;
  onReply: (parentId: string, content: string, mentionedUserIds?: string[]) => void;
  onEdit: (noteId: string, content: string) => void;
  onDelete: (noteId: string) => void;
  isSaving?: boolean;
}) {
  const supervisors = useSupervisorAccounts();
  const mentionCandidates = useMentionCandidates(user?.id);
  const knownUsernames = useMemo(
    () => buildKnownUsernames(mentionCandidates),
    [mentionCandidates],
  );
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [memberFilter, setMemberFilter] = useState('all');

  const filterOptions = useMemo(() => {
    const names = new Set<string>();
    if (project.leadAuthor) names.add(project.leadAuthor);
    for (const member of parseMembers(project.members)) names.add(member);
    for (const note of notes) {
      if (note.author) names.add(note.author);
    }
    const supervisor = supervisors.find((u) => u.id === project.supervisorId);
    if (supervisor) names.add(formatSupervisorLabel(supervisor));
    return [...names].sort((a, b) => a.localeCompare(b, 'vi'));
  }, [notes, project.leadAuthor, project.members, project.supervisorId, supervisors]);

  const feedItems = useMemo(
    () => buildDiscussionFeed(project.workflowHistory, notes),
    [project.workflowHistory, notes],
  );

  const filteredFeed = useMemo(() => {
    const q = search.trim().toLowerCase();
    const noteMatches = (note: ProjectDiscussionNote): boolean => {
      if (memberFilter !== 'all' && note.author !== memberFilter) {
        const replies = getNoteReplies(notes, note.id);
        if (!replies.some((r) => r.author === memberFilter)) return false;
      }
      if (!q) return true;
      if (note.content.toLowerCase().includes(q)) return true;
      return getNoteReplies(notes, note.id).some((r) => r.content.toLowerCase().includes(q));
    };

    return feedItems.filter((item) => {
      if (item.kind === 'workflow') {
        if (memberFilter !== 'all' && item.user !== memberFilter) return false;
        if (!q) return true;
        const label = WORKFLOW_STEPS[item.step - 1]?.label ?? '';
        return label.toLowerCase().includes(q) || item.user.toLowerCase().includes(q);
      }
      return noteMatches(item);
    });
  }, [feedItems, memberFilter, notes, search]);

  const handleSubmit = () => {
    const text = draft.trim();
    if (!text) return;
    onAddNote(text, extractMentionedUserIds(text, mentionCandidates));
    setDraft('');
    setMemberFilter('all');
    setSearch('');
  };

  return (
    <div className="max-w-3xl p-6">
      <div className="mb-6">
        <CommentMentionInput
          value={draft}
          onChange={setDraft}
          onSubmit={handleSubmit}
          candidates={mentionCandidates}
          disabled={isSaving}
          isSaving={isSaving}
        />
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <SvgIcon
            d={IconPaths.search}
            className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm ghi chú"
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <select
          value={memberFilter}
          onChange={(e) => setMemberFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500"
        >
          <option value="all">Tất cả thành viên</option>
          {filterOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-5">
        {filteredFeed.length === 0 ? (
          <p className="text-sm italic text-slate-400">
            {feedItems.length === 0
              ? 'Chưa có hoạt động hoặc ghi chú nào.'
              : 'Không có ghi chú phù hợp với bộ lọc hiện tại.'}
          </p>
        ) : (
          filteredFeed.map((item, i) =>
            item.kind === 'workflow' ? (
              <ActivityFeedEntry key={`wf-${item.updatedAt}-${i}`} item={item} />
            ) : (
              <CommentCard
                key={item.id}
                note={item}
                allNotes={notes}
                user={user}
                knownUsernames={knownUsernames}
                mentionCandidates={mentionCandidates}
                disabled={isSaving}
                onLike={onLike}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ),
          )
        )}
      </div>
    </div>
  );
}

function TabContent({
  activeTab,
  project,
  currentStep,
  notes,
  user,
  onAddNote,
  onLike,
  onReply,
  onEdit,
  onDelete,
  isSavingNote,
}: {
  activeTab: DetailTabId;
  project: ResearchProject;
  currentStep: number;
  notes: ProjectDiscussionNote[];
  user: AuthUser | null;
  onAddNote: (content: string, mentionedUserIds?: string[]) => void;
  onLike: (noteId: string) => void;
  onReply: (parentId: string, content: string, mentionedUserIds?: string[]) => void;
  onEdit: (noteId: string, content: string) => void;
  onDelete: (noteId: string) => void;
  isSavingNote?: boolean;
}) {
  const tab = DETAIL_TABS.find((t) => t.id === activeTab);

  if (activeTab === 'nhiem-vu') {
    return (
      <div className="p-6">
        <WorkflowStepsPanel currentStep={currentStep} />
      </div>
    );
  }

  if (activeTab === 'trao-doi') {
    return (
      <ProjectNoteThread
        project={project}
        notes={notes}
        user={user}
        onAddNote={onAddNote}
        onLike={onLike}
        onReply={onReply}
        onEdit={onEdit}
        onDelete={onDelete}
        isSaving={isSavingNote}
      />
    );
  }

  if (tab?.section) {
    return (
      <div className="p-6">
        <InfoSections
          project={project}
          currentStep={currentStep}
          section={tab.section}
          showWrapper={false}
        />
      </div>
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ProjectDetail({
  project,
  onBack,
  onEdit,
  onDelete,
  onUpdateProject,
  onSyncProject,
  canEdit = true,
  canDelete = true,
  canEditProgress = true,
}: ProjectDetailProps) {
  const user = useAuthStore((state) => state.user);
  const { message, notify, dismiss } = useNotification();
  const assignableUsers = useAssignableUsers(true);
  const adminUserIds = useMemo(
    () => assignableUsers.filter((u) => u.role === 'admin').map((u) => u.id),
    [assignableUsers],
  );
  const [localProject, setLocalProject] = useState(project);
  const [activeTab, setActiveTab] = useState<DetailTabId>('thong-tin-chung');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const centerScrollRef = useRef<HTMLDivElement>(null);
  const notifiedUnreadRef = useRef<string | null>(null);
  const markedDiscussionReadRef = useRef<string | null>(null);
  const isSavingNoteRef = useRef(false);

  const notes = localProject.projectNotes ?? [];

  useEffect(() => {
    isSavingNoteRef.current = isSavingNote;
  }, [isSavingNote]);

  useEffect(() => {
    setLocalProject(project);
  }, [project]);

  const applyProject = useCallback(
    (updated: ResearchProject, syncOnly = false) => {
      setLocalProject(updated);
      if (syncOnly) {
        onSyncProject?.(updated);
      } else {
        void onUpdateProject?.(updated);
      }
    },
    [onSyncProject, onUpdateProject],
  );

  const refreshProjectFromServer = useCallback(async () => {
    if (isSavingNoteRef.current) return;
    try {
      const all = await researchProjectService.getAll();
      const fresh = all.find((p) => p.id === project.id);
      if (!fresh) return;
      setLocalProject((current) => {
        const merged = mergeProjectNotes(current, fresh);
        onSyncProject?.(merged);
        return merged;
      });
    } catch {
      /* ignore polling errors */
    }
  }, [onSyncProject, project.id]);

  useEffect(() => {
    void refreshProjectFromServer();
  }, [project.id, refreshProjectFromServer]);

  useEffect(() => {
    if (activeTab !== 'trao-doi') return undefined;

    const timer = window.setInterval(() => {
      void refreshProjectFromServer();
    }, 15000);

    return () => window.clearInterval(timer);
  }, [activeTab, refreshProjectFromServer]);

  const unreadDiscussionCount = useMemo(
    () => countUnreadNoteNotifications(localProject, user?.id),
    [localProject, user?.id],
  );

  useEffect(() => {
    if (!user?.id || unreadDiscussionCount === 0) return;
    const key = `${localProject.id}:${unreadDiscussionCount}`;
    if (notifiedUnreadRef.current === key) return;
    notifiedUnreadRef.current = key;
    notify(
      `Bạn có ${unreadDiscussionCount} ghi chú mới về đề tài này. Xem tab Trao đổi.`,
    );
  }, [localProject.id, notify, unreadDiscussionCount, user?.id]);

  useEffect(() => {
    if (activeTab !== 'trao-doi' || !user?.id || unreadDiscussionCount === 0) return;

    const marker = `${localProject.id}:${user.id}`;
    if (markedDiscussionReadRef.current === marker) return;
    markedDiscussionReadRef.current = marker;

    const updated = markNoteNotificationsRead(localProject, user.id);
    applyProject(updated, false);
  }, [activeTab, applyProject, localProject, unreadDiscussionCount, user?.id]);

  useEffect(() => {
    if (activeTab !== 'trao-doi') {
      markedDiscussionReadRef.current = null;
    }
  }, [activeTab]);

  const currentStep = localProject.workflowStep ?? 1;
  const completionPct = Math.round((currentStep / WORKFLOW_STEPS.length) * 100);
  const members = useMemo(() => parseMembers(localProject.members), [localProject.members]);
  const category = categoryLabel(localProject.categories);

  const persistProject = useCallback(
    (updated: ResearchProject) => {
      applyProject(updated, false);
    },
    [applyProject],
  );

  const handleTabChange = (tab: DetailTabId) => {
    setActiveTab(tab);
    centerScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = () => {
    if (!onDelete) return;
    if (!window.confirm('Bạn có chắc chắn muốn xóa đề tài này?')) return;
    void Promise.resolve(onDelete(localProject.id)).then(() => onBack());
  };

  const handleProgressStatusChange = (status: string) => {
    if (!canEditProgress) return;
    persistProject({ ...localProject, progressStatus: status || undefined });
  };

  const handleAddNote = async (
    content: string,
    options?: { parentId?: string; mentionedUserIds?: string[] },
  ) => {
    if (isSavingNote) return;
    const before = localProject;
    const parentId = options?.parentId;

    let recipientAdminIds = adminUserIds;
    if (recipientAdminIds.length === 0) {
      try {
        const users = await userDirectory.listAssignable();
        recipientAdminIds = users.filter((u) => u.role === 'admin').map((u) => u.id);
      } catch {
        recipientAdminIds = [];
      }
    }

    const updated = appendProjectNote(before, content, user, parentId, {
      adminUserIds: recipientAdminIds,
      mentionedUserIds: options?.mentionedUserIds,
    });
    setIsSavingNote(true);
    setLocalProject(updated);
    try {
      const saved = await researchProjectService.upsert(updated);
      const merged = mergeProjectNotes(updated, saved);
      setLocalProject(merged);
      onSyncProject?.(merged);
      void onUpdateProject?.(merged);
      notify(parentId ? 'Đã gửi trả lời thành công.' : 'Đã gửi ghi chú thành công.');
    } catch {
      setLocalProject(before);
      notify('Gửi ghi chú thất bại. Vui lòng thử lại.');
    } finally {
      setIsSavingNote(false);
    }
  };

  const persistNoteMutation = async (
    mutate: (project: ResearchProject) => ResearchProject | null,
    successMessage: string,
  ) => {
    if (isSavingNote) return;
    const before = localProject;
    const updated = mutate(before);
    if (!updated) {
      notify('Không thể cập nhật ghi chú.');
      return;
    }
    setIsSavingNote(true);
    setLocalProject(updated);
    try {
      const saved = await researchProjectService.upsert(updated);
      const merged = mergeProjectNotes(updated, saved);
      setLocalProject(merged);
      onSyncProject?.(merged);
      void onUpdateProject?.(merged);
      notify(successMessage);
    } catch {
      setLocalProject(before);
      notify('Cập nhật ghi chú thất bại.');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleLikeNote = (noteId: string) => {
    if (!user?.id) return;
    void persistNoteMutation(
      (p) => toggleNoteLike(p, noteId, user.id),
      'Đã cập nhật lượt thích.',
    );
  };

  const handleReplyNote = (
    parentId: string,
    content: string,
    mentionedUserIds?: string[],
  ) => {
    void handleAddNote(content, { parentId, mentionedUserIds });
  };

  const handleEditNote = (noteId: string, content: string) => {
    void persistNoteMutation(
      (p) => editProjectNote(p, noteId, content, user),
      'Đã cập nhật ghi chú.',
    );
  };

  const handleDeleteNote = (noteId: string) => {
    void persistNoteMutation(
      (p) => deleteProjectNote(p, noteId, user),
      'Đã xóa ghi chú.',
    );
  };

  return (
    <div className="flex min-h-[calc(100vh-110px)] flex-col bg-slate-50">
      <DetailTopBar onBack={onBack} />

      <div className="flex min-h-0 flex-1">
        <LeftPanel
          project={localProject}
          completionPct={completionPct}
          members={members}
          category={category}
          onEdit={() => onEdit(localProject)}
          onDelete={canDelete && onDelete ? handleDelete : undefined}
          onScheduleTab={() => handleTabChange('thoi-gian')}
          onProgressStatusChange={handleProgressStatusChange}
          canEdit={canEdit}
          canDelete={canDelete}
          canEditProgress={canEditProgress}
        />

        <main className="flex min-w-0 flex-1 flex-col bg-white">
          <DetailTabBar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onEdit={() => onEdit(localProject)}
            unreadDiscussionCount={unreadDiscussionCount}
            canEdit={canEdit}
          />
          <div ref={centerScrollRef} className="flex-1 overflow-y-auto bg-slate-50">
            <TabContent
              activeTab={activeTab}
              project={localProject}
              currentStep={currentStep}
              notes={notes}
              user={user}
              onAddNote={(content, mentionedUserIds) => {
                void handleAddNote(content, { mentionedUserIds });
              }}
              onLike={handleLikeNote}
              onReply={handleReplyNote}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
              isSavingNote={isSavingNote}
            />
          </div>
        </main>
      </div>

      <Toast message={message} onDismiss={dismiss} />
    </div>
  );
}
