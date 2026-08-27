import * as XLSX from 'xlsx';

import { dedupeProjects } from './dedupeProjects.js';
import { formatDate, getAge } from './formatDate.js';
import type { ProjectMember, ResearchProject } from './types.js';

type ExportColumn = {
  header: string;
  ml: number;
  /** Maps to `TABLE_COLUMNS` id; omit for always-exported columns (e.g. STT). */
  columnId?: string;
  value: (p: ResearchProject, i: number) => string | number;
};

function formatMemberDetails(members?: ProjectMember[]): string {
  if (!members?.length) return '';
  return members
    .map((m) => {
      const parts = [
        m.fullName,
        m.academicTitle && `HH/HV: ${m.academicTitle}`,
        m.nationalId && `CCCD: ${m.nationalId}`,
        m.email && `Email: ${m.email}`,
        m.workUnit && `ĐV: ${m.workUnit}`,
        m.department && `BM: ${m.department}`,
        m.projectRole && `Vai trò: ${m.projectRole}`,
      ].filter(Boolean);
      return parts.join(' | ');
    })
    .join('; ');
}

function principalEmailText(p: ResearchProject): string {
  return p.principalEmail?.trim() || p.leaderDetails?.[0]?.email?.trim() || '';
}

/** Column order follows Data Entry form sections §1–§8 for Excel download parity. */
const EXPORT_COLUMNS: ExportColumn[] = [
  { header: 'Số thứ tự', ml: 5, value: (_, i) => i + 1 },
  // §1
  {
    columnId: 'contractId',
    header: 'Số hợp đồng',
    ml: 18,
    value: (p) => (p.contractId ? String(p.contractId) : ''),
  },
  {
    columnId: 'contractAppendix',
    header: 'Phụ lục hợp đồng',
    ml: 16,
    value: (p) => p.contractAppendix || '',
  },
  { columnId: 'projectCode', header: 'Mã số ĐT', ml: 14, value: (p) => p.projectCode || '' },
  {
    columnId: 'certificateResultNumber',
    header: 'Số GCN kết quả',
    ml: 16,
    value: (p) => p.certificateResultNumber || '',
  },
  {
    columnId: 'certificateResultNumber',
    header: 'Ngày cấp GCN',
    ml: 12,
    value: (p) => formatDate(p.certificateResultDate),
  },
  {
    columnId: 'certificateResultNumber',
    header: 'Nơi cấp GCN',
    ml: 18,
    value: (p) => p.certificateResultIssuingAuthority || '',
  },
  // §2
  { columnId: 'title', header: 'Tên đề tài', ml: 40, value: (p) => p.title },
  { columnId: 'leadAuthor', header: 'Chủ nhiệm đề tài', ml: 20, value: (p) => p.leadAuthor },
  {
    columnId: 'principalEmail',
    header: 'Email chủ nhiệm',
    ml: 22,
    value: (p) => principalEmailText(p),
  },
  {
    columnId: 'leadAuthorBirthYear',
    header: 'Năm sinh',
    ml: 10,
    value: (p) => p.leadAuthorBirthYear || '',
  },
  { columnId: 'age', header: 'Tuổi', ml: 8, value: (p) => getAge(p.leadAuthorBirthYear) },
  {
    columnId: 'leadAuthorGender',
    header: 'Giới tính',
    ml: 8,
    value: (p) => p.leadAuthorGender || '',
  },
  {
    columnId: 'members',
    header: 'Thành viên NC',
    ml: 35,
    value: (p) => formatMemberDetails(p.memberDetails) || p.members || '',
  },
  {
    columnId: 'researchField',
    header: 'Lĩnh vực nghiên cứu',
    ml: 18,
    value: (p) => p.researchField || '',
  },
  {
    columnId: 'researchType',
    header: 'Loại hình nghiên cứu',
    ml: 16,
    value: (p) => p.researchType || '',
  },
  {
    columnId: 'categories',
    header: 'Loại đề tài',
    ml: 18,
    value: (p) => (Array.isArray(p.categories) ? p.categories.join(', ') : p.categories || ''),
  },
  { columnId: 'department', header: 'Khoa/Đơn vị', ml: 18, value: (p) => p.department || '' },
  { columnId: 'subDepartment', header: 'Bộ môn', ml: 16, value: (p) => p.subDepartment || '' },
  // §3
  {
    columnId: 'approvalDecision',
    header: 'Quyết định xét duyệt',
    ml: 16,
    value: (p) => p.approvalDecision || '',
  },
  {
    columnId: 'authorizationDecision',
    header: 'Quyết định phê duyệt',
    ml: 16,
    value: (p) => p.authorizationDecision || '',
  },
  {
    columnId: 'appraisalDecision',
    header: 'Quyết định giám định',
    ml: 16,
    value: (p) => p.appraisalDecision || '',
  },
  {
    columnId: 'acceptanceDecision',
    header: 'Quyết định nghiệm thu',
    ml: 16,
    value: (p) => p.acceptanceDecision || '',
  },
  // §4
  { columnId: 'budget', header: 'Kinh phí thực hiện', ml: 14, value: (p) => p.budget },
  { columnId: 'budgetLumpSum', header: 'Kinh phí khoán', ml: 14, value: (p) => p.budgetLumpSum || 0 },
  {
    columnId: 'budgetNonLumpSum',
    header: 'Kinh phí không khoán',
    ml: 14,
    value: (p) => p.budgetNonLumpSum || 0,
  },
  {
    columnId: 'budgetOtherSources',
    header: 'Nguồn khác',
    ml: 12,
    value: (p) => p.budgetOtherSources || 0,
  },
  {
    columnId: 'budgetSettled',
    header: 'Kinh phí được quyết toán',
    ml: 16,
    value: (p) => p.budgetSettled || 0,
  },
  {
    columnId: 'budgetBatch1',
    header: 'Kinh phí Cấp đợt 1',
    ml: 12,
    value: (p) => p.budgetBatch1 || 0,
  },
  {
    columnId: 'budgetBatch2',
    header: 'Kinh phí Cấp đợt 2',
    ml: 12,
    value: (p) => p.budgetBatch2 || 0,
  },
  {
    columnId: 'budgetBatch3',
    header: 'Kinh phí Cấp đợt 3',
    ml: 12,
    value: (p) => p.budgetBatch3 || 0,
  },
  // §5
  { columnId: 'duration', header: 'Thời gian thực hiện', ml: 12, value: (p) => p.duration || '' },
  {
    columnId: 'startDate',
    header: 'Thời gian Bắt đầu',
    ml: 12,
    value: (p) => formatDate(p.startDate),
  },
  {
    columnId: 'endDate',
    header: 'Thời gian Kết thúc',
    ml: 12,
    value: (p) => formatDate(p.endDate),
  },
  {
    columnId: 'extensionDate',
    header: 'Thời gian Gia hạn',
    ml: 12,
    value: (p) => formatDate(p.extensionDate),
  },
  {
    columnId: 'reviewReportingDate',
    header: 'Thời gian Báo cáo Giám định',
    ml: 18,
    value: (p) => formatDate(p.reviewReportingDate),
  },
  {
    columnId: 'progressReportDate1',
    header: 'Thời gian Báo cáo tiến độ 1',
    ml: 18,
    value: (p) => formatDate(p.progressReportDate1),
  },
  {
    columnId: 'progressReportDate2',
    header: 'Thời gian Báo cáo tiến độ 2',
    ml: 18,
    value: (p) => formatDate(p.progressReportDate2),
  },
  {
    columnId: 'progressReportDate3',
    header: 'Thời gian Báo cáo tiến độ 3',
    ml: 18,
    value: (p) => formatDate(p.progressReportDate3),
  },
  {
    columnId: 'progressReportDate4',
    header: 'Thời gian Báo cáo tiến độ 4',
    ml: 18,
    value: (p) => formatDate(p.progressReportDate4),
  },
  {
    columnId: 'progressStatus',
    header: 'Tiến độ thực hiện',
    ml: 14,
    value: (p) => p.progressStatus || '',
  },
  {
    columnId: 'progressReportNote',
    header: 'Ghi chú về nộp báo cáo tiến độ',
    ml: 24,
    value: (p) => p.progressReportNote || '',
  },
  {
    columnId: 'acceptanceMeetingDate',
    header: 'Ngày họp nghiệm thu',
    ml: 14,
    value: (p) => formatDate(p.acceptanceMeetingDate),
  },
  // §6
  { columnId: 'outputProduct', header: 'Đầu ra', ml: 20, value: (p) => p.outputProduct || '' },
  { columnId: 'status', header: 'Tình trạng', ml: 14, value: (p) => p.status },
  {
    columnId: 'registrationSequenceNumber',
    header: 'Số thứ tự',
    ml: 10,
    value: (p) =>
      p.registrationSequenceNumber != null ? String(p.registrationSequenceNumber) : '',
  },
  {
    columnId: 'acceptanceYear',
    header: 'Năm nghiệm thu',
    ml: 10,
    value: (p) => p.acceptanceYear || '',
  },
  {
    columnId: 'acceptanceAcademicYear',
    header: 'Năm học nghiệm thu',
    ml: 12,
    value: (p) => p.acceptanceAcademicYear || '',
  },
  // §7
  {
    columnId: 'expectedProducts',
    header: 'Sản phẩm NC cam kết',
    ml: 24,
    value: (p) => (p.expectedProducts || []).map((x) => `${x.type}(${x.count})`).join('; '),
  },
  {
    columnId: 'actualProducts',
    header: 'Sản phẩm thực tế đạt được',
    ml: 28,
    value: (p) => {
      const summary = (p.actualProducts || []).map((x) => `${x.type}(${x.count})`).join('; ');
      return p.actualProductDetails ? `${summary}\n${p.actualProductDetails}` : summary;
    },
  },
  // §8
  {
    columnId: 'reminderDate',
    header: 'Thời điểm nhắc',
    ml: 12,
    value: (p) => formatDate(p.reminderDate),
  },
  {
    columnId: 'acceptanceCompletionDate',
    header: 'Thời điểm nghiệm thu',
    ml: 14,
    value: (p) => formatDate(p.acceptanceCompletionDate),
  },
  {
    columnId: 'supervisorId',
    header: 'Chuyên viên QL',
    ml: 18,
    value: (p) => p.supervisorId || '',
  },
  {
    columnId: 'reviewBatch',
    header: 'Đợt xét duyệt',
    ml: 12,
    value: (p) => p.reviewBatch || '',
  },
  {
    columnId: 'isTransferred',
    header: 'Chuyển tiếp',
    ml: 10,
    value: (p) => (p.isTransferred ? 'Có' : 'Không'),
  },
  {
    columnId: 'terminationReason',
    header: 'Lý do thanh lý',
    ml: 20,
    value: (p) => p.terminationReason || '',
  },
  { columnId: 'generalNotes', header: 'Ghi chú chung', ml: 24, value: (p) => p.generalNotes || '' },
  {
    columnId: 'history',
    header: 'Lịch sử edit',
    ml: 30,
    value: (p) =>
      (p.history || [])
        .map((h) => `${formatDate(h.timestamp)} - ${h.user}: ${h.action}`)
        .join('\n'),
  },
];

function resolveExportColumns(visibleColumns?: Record<string, boolean>): ExportColumn[] {
  if (!visibleColumns) return EXPORT_COLUMNS;
  return EXPORT_COLUMNS.filter(
    (col) => !col.columnId || visibleColumns[col.columnId] !== false,
  );
}

export function exportProjectsToExcel(
  projects: ResearchProject[],
  visibleColumns?: Record<string, boolean>,
  supervisorEmailById?: ReadonlyMap<string, string>,
): void {
  const uniqueProjects = dedupeProjects(projects);
  const columns = resolveExportColumns(visibleColumns);
  const headers = columns.map((c) => c.header);
  const dataRows = uniqueProjects.map((p, i) =>
    columns.map((c) => {
      if (c.columnId === 'supervisorId') {
        const id = p.supervisorId?.trim();
        if (!id) return '';
        return supervisorEmailById?.get(id) || (id.includes('@') ? id : '');
      }
      return c.value(p, i);
    }),
  );
  const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
  ws['!cols'] = columns.map((c) => ({ wch: c.ml }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Danh sách đề tài');

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Data_DeTai_${today}.xlsx`);
}
