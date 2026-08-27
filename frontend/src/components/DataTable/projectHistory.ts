import { formatDate } from './formatDate.js';
import type { HistoryEntry, HistoryFieldChange, ProductEntry, ResearchProject } from './types.js';
import {
  formatTrainingHistory,
  formatTypeIIIHistory,
  formatTypeIIHistory,
  formatTypeIHistory,
  type ProductTypeIRow,
  type ProductTypeIIRow,
  type ProductTypeIIIRow,
  type TrainingResultRow,
} from '../DataEntry/productDetailTypes.js';

/** Fields that are not part of the editable "Dữ liệu đề tài" payload for audit. */
const META_FIELDS = new Set([
  'id',
  'history',
  'projectNotes',
  'noteNotifications',
  'workflowHistory',
  'workflowTodos',
  'workflowStep',
]);

const FIELD_LABELS: Record<string, string> = {
  title: 'Tên đề tài',
  contractId: 'Số hợp đồng',
  contractAppendix: 'Phụ lục hợp đồng',
  contractDate: 'Ngày hợp đồng',
  certificateResultNumber: 'Số GCN kết quả',
  certificateResultDate: 'Ngày cấp GCN',
  certificateResultIssuingAuthority: 'Nơi cấp GCN',
  leadAuthor: 'Chủ nhiệm đề tài',
  principalEmail: 'Email chủ nhiệm',
  leadAuthorBirthYear: 'Năm sinh chủ nhiệm',
  leadAuthorGender: 'Giới tính chủ nhiệm',
  leaderDetails: 'Chi tiết chủ nhiệm',
  members: 'Thành viên',
  memberDetails: 'Chi tiết thành viên',
  department: 'Khoa/Đơn vị',
  subDepartment: 'Bộ môn/Đơn vị trực thuộc',
  researchField: 'Lĩnh vực nghiên cứu',
  researchType: 'Loại hình nghiên cứu',
  categories: 'Loại đề tài',
  approvalDecision: 'Quyết định xét duyệt',
  authorizationDecision: 'Quyết định phê duyệt',
  appraisalDecision: 'Quyết định giám định',
  acceptanceDecision: 'Quyết định nghiệm thu',
  budget: 'Tổng kinh phí',
  budgetLumpSum: 'Kinh phí khoán',
  budgetNonLumpSum: 'Kinh phí không khoán',
  budgetOtherSources: 'Kinh phí nguồn khác',
  budgetSettled: 'Kinh phí được quyết toán',
  budgetBatch1: 'Đợt 1',
  budgetBatch2: 'Đợt 2',
  budgetBatch3: 'Đợt 3',
  duration: 'Thời gian thực hiện',
  startDate: 'Ngày bắt đầu',
  endDate: 'Ngày kết thúc',
  extensionDate: 'Ngày gia hạn',
  reviewReportingDate: 'Ngày BC đánh giá',
  progressReportDate1: 'Ngày BC tiến độ 1',
  progressReportDate2: 'Ngày BC tiến độ 2',
  progressReportDate3: 'Ngày BC tiến độ 3',
  progressReportDate4: 'Ngày BC tiến độ 4',
  progressStatus: 'Tiến độ thực hiện',
  progressReportNote: 'Ghi chú báo cáo',
  acceptanceMeetingDate: 'Ngày họp nghiệm thu',
  outputProduct: 'Sản phẩm đầu ra',
  status: 'Trạng thái',
  acceptanceYear: 'Năm nghiệm thu',
  acceptanceAcademicYear: 'Năm học nghiệm thu',
  expectedProducts: 'Sản phẩm cam kết',
  actualProducts: 'Sản phẩm thực tế',
  actualProductDetails: 'Chi tiết sản phẩm thực tế',
  productTypeI: 'Sản phẩm dạng I',
  productTypeII: 'Sản phẩm dạng II',
  productTypeIII: 'Sản phẩm dạng III',
  trainingResults: 'Đào tạo ĐH/SĐH',
  ipProtectionNote: 'Sản phẩm đăng ký SHCN',
  reminderDate: 'Ngày nhắc nhở',
  acceptanceCompletionDate: 'Thời điểm nghiệm thu',
  projectCode: 'Mã số đề tài',
  isTransferred: 'Chuyển tiếp',
  terminationReason: 'Lý do thanh lý',
  supervisorId: 'Chuyên viên QL',
  reviewBatch: 'Đợt xét duyệt',
  registrationSequenceNumber: 'Số thứ tự',
  registrationSequenceYear: 'Năm số thứ tự',
  generalNotes: 'Ghi chú chung',
};

function isProductList(value: unknown): value is ProductEntry[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item != null &&
        typeof item === 'object' &&
        'type' in item &&
        'count' in item,
    )
  );
}

function looksLikeDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}/.test(value) ||
    /^\d{2}\/\d{2}\/\d{4}/.test(value) ||
    /^\d+(\.\d+)?$/.test(value)
  );
}

export function formatHistoryFieldValue(field: string, value: unknown): string {
  if (value == null || value === '') return '(trống)';
  if (typeof value === 'boolean') return value ? 'Có' : 'Không';
  if (typeof value === 'number') {
    if (field.startsWith('budget') || field === 'budget') {
      return `${value.toLocaleString('vi-VN')} VNĐ`;
    }
    return String(value);
  }
  if (isProductList(value)) {
    if (value.length === 0) return '(trống)';
    return value.map((p) => `${p.type}: ${p.count}`).join('; ');
  }
  if (field === 'productTypeI' && Array.isArray(value)) {
    return formatTypeIHistory(value as ProductTypeIRow[]);
  }
  if (field === 'productTypeII' && Array.isArray(value)) {
    return formatTypeIIHistory(value as ProductTypeIIRow[]);
  }
  if (field === 'productTypeIII' && Array.isArray(value)) {
    return formatTypeIIIHistory(value as ProductTypeIIIRow[]);
  }
  if (field === 'trainingResults' && Array.isArray(value)) {
    return formatTrainingHistory(value as TrainingResultRow[]);
  }
  if ((field === 'memberDetails' || field === 'leaderDetails') && Array.isArray(value)) {
    if (value.length === 0) return '(trống)';
    return value
      .map((item) => {
        if (item == null || typeof item !== 'object') return String(item);
        const m = item as {
          fullName?: string;
          academicTitle?: string;
          projectRole?: string;
          workUnit?: string;
          department?: string;
          birthYear?: string;
          addReason?: string;
        };
        const reason =
          m.addReason === 'co_leader'
            ? 'Đồng chủ nhiệm'
            : m.addReason === 'replacement'
              ? 'Thay đổi chủ nhiệm'
              : undefined;
        const parts = [
          m.fullName,
          m.academicTitle,
          m.projectRole,
          m.workUnit,
          m.department,
          m.birthYear,
          reason,
        ].filter(Boolean);
        return parts.join(' — ') || JSON.stringify(item);
      })
      .join('; ');
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '(trống)';
    return value.map(String).join(', ');
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '(trống)';
    if (
      field.toLowerCase().includes('date') ||
      field.endsWith('Date') ||
      looksLikeDate(trimmed)
    ) {
      const formatted = formatDate(trimmed);
      if (formatted) return formatted;
    }
    return trimmed;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function normalizeForCompare(value: unknown): string {
  if (value == null || value === '') return '';
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (typeof value === 'number') return Number.isNaN(value) ? '' : String(value);
  if (Array.isArray(value) || typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value).trim();
}

function fieldLabel(field: string): string {
  return FIELD_LABELS[field] ?? field;
}

export function diffProjectFields(
  previous: ResearchProject,
  next: ResearchProject,
): HistoryFieldChange[] {
  const keys = new Set([
    ...Object.keys(previous),
    ...Object.keys(next),
  ]) as Set<keyof ResearchProject | string>;

  const changes: HistoryFieldChange[] = [];

  for (const key of keys) {
    if (META_FIELDS.has(key)) continue;
    const prevVal = previous[key as keyof ResearchProject];
    const nextVal = next[key as keyof ResearchProject];
    if (normalizeForCompare(prevVal) === normalizeForCompare(nextVal)) continue;
    changes.push({
      field: key,
      label: fieldLabel(key),
      oldValue: formatHistoryFieldValue(key, prevVal),
      newValue: formatHistoryFieldValue(key, nextVal),
    });
  }

  return changes;
}

/** Keep discussion/workflow data when an edit form omits them. */
export function preserveProjectMeta(
  previous: ResearchProject,
  next: ResearchProject,
): ResearchProject {
  return {
    ...next,
    projectNotes: next.projectNotes ?? previous.projectNotes,
    noteNotifications: next.noteNotifications ?? previous.noteNotifications,
    workflowHistory: next.workflowHistory ?? previous.workflowHistory,
    workflowTodos: next.workflowTodos ?? previous.workflowTodos,
    workflowStep: next.workflowStep ?? previous.workflowStep,
    history: next.history ?? previous.history,
  };
}

export function resolveHistoryActor(
  user: { displayName?: string | null; username?: string } | null | undefined,
): string {
  const name = user?.displayName?.trim();
  if (name) return name;
  const username = user?.username?.trim();
  if (username) return username;
  return 'Hệ thống';
}

function buildHistoryEntry(
  user: string,
  action: string,
  changes: HistoryFieldChange[] = [],
): HistoryEntry {
  return {
    timestamp: new Date().toISOString(),
    user,
    action,
    changes,
  };
}

export function withCreateHistory(
  project: ResearchProject,
  user: string,
): ResearchProject {
  const entry = buildHistoryEntry(user, 'Tạo mới đề tài');
  return {
    ...project,
    history: [entry, ...(project.history ?? [])],
  };
}

export function withImportHistory(
  project: ResearchProject,
  user: string,
): ResearchProject {
  const entry = buildHistoryEntry(user, 'Nhập từ Excel');
  return {
    ...project,
    history: [entry, ...(project.history ?? [])],
  };
}

/**
 * Merge meta fields, compute field diffs, and prepend a history entry when
 * tracked data actually changed.
 */
export function applyProjectUpdateHistory(
  previous: ResearchProject,
  next: ResearchProject,
  user: string,
): ResearchProject {
  const merged = preserveProjectMeta(previous, next);
  const changes = diffProjectFields(previous, merged);
  if (changes.length === 0) return merged;

  const action =
    changes.length === 1
      ? `Cập nhật: ${changes[0].label}`
      : `Cập nhật ${changes.length} trường thông tin`;

  const entry = buildHistoryEntry(user, action, changes);
  return {
    ...merged,
    history: [entry, ...(previous.history ?? [])],
  };
}
