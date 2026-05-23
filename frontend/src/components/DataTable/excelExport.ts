import * as XLSX from 'xlsx';

import { formatDate, getAge } from './formatDate.js';
import type { ResearchProject } from './types.js';

type ExportColumn = {
  header: string;
  ml: number;
  value: (p: ResearchProject, i: number) => string | number;
};

const EXPORT_COLUMNS: ExportColumn[] = [
  { header: 'Số thứ tự', ml: 5, value: (_, i) => i + 1 },
  { header: 'Số hợp đồng', ml: 20, value: (p) => (p.contractId ? String(p.contractId) : '') },
  {
    header: 'Giấy chứng nhận đăng ký kết quả',
    ml: 30,
    value: (p) => {
      const parts: string[] = [];
      if (p.certificateResultNumber) parts.push(`Số: ${p.certificateResultNumber}`);
      if (p.certificateResultDate) parts.push(`Ngày: ${formatDate(p.certificateResultDate)}`);
      if (p.certificateResultIssuingAuthority)
        parts.push(`Nơi cấp: ${p.certificateResultIssuingAuthority}`);
      return parts.join('\n');
    },
  },
  { header: 'Tên đề tài', ml: 40, value: (p) => p.title },
  { header: 'Chủ nhiệm đề tài', ml: 20, value: (p) => p.leadAuthor },
  { header: 'Năm sinh', ml: 10, value: (p) => p.leadAuthorBirthYear || '' },
  { header: 'Tuổi', ml: 8, value: (p) => getAge(p.leadAuthorBirthYear) },
  { header: 'Thành viên NC', ml: 30, value: (p) => p.members || '' },
  { header: 'Lĩnh vực NC', ml: 15, value: (p) => p.researchField || '' },
  { header: 'Loại hình nghiên cứu', ml: 15, value: (p) => p.researchType || '' },
  {
    header: 'Loại đề tài',
    ml: 20,
    value: (p) => (Array.isArray(p.categories) ? p.categories.join(', ') : p.categories || ''),
  },
  { header: 'Bộ môn', ml: 15, value: (p) => p.subDepartment || '' },
  { header: 'Khoa/Đơn vị', ml: 15, value: (p) => p.department || '' },
  { header: 'Quyết định xét duyệt', ml: 15, value: (p) => p.approvalDecision || '' },
  { header: 'Quyết định phê duyệt', ml: 15, value: (p) => p.authorizationDecision || '' },
  { header: 'Kinh phí thực hiện', ml: 15, value: (p) => p.budget },
  { header: 'Kinh phí khoán', ml: 15, value: (p) => p.budgetLumpSum || 0 },
  { header: 'Kinh phí không khoán', ml: 15, value: (p) => p.budgetNonLumpSum || 0 },
  { header: 'Nguồn khác', ml: 15, value: (p) => p.budgetOtherSources || 0 },
  { header: 'Kinh phí Cấp đợt 1', ml: 12, value: (p) => p.budgetBatch1 || 0 },
  { header: 'Kinh phí Cấp đợt 2', ml: 12, value: (p) => p.budgetBatch2 || 0 },
  { header: 'Kinh phí Cấp đợt 3', ml: 12, value: (p) => p.budgetBatch3 || 0 },
  { header: 'Thời gian thực hiện', ml: 12, value: (p) => p.duration || '' },
  { header: 'Thời gian Bắt đầu', ml: 12, value: (p) => formatDate(p.startDate) },
  { header: 'Thời gian Kết thúc', ml: 12, value: (p) => formatDate(p.endDate) },
  { header: 'Thời gian Gia hạn', ml: 12, value: (p) => formatDate(p.extensionDate) },
  { header: 'Thời gian Báo cáo Giám định', ml: 20, value: (p) => formatDate(p.reviewReportingDate) },
  { header: 'Thời gian Báo cáo tiến độ 1', ml: 20, value: (p) => formatDate(p.progressReportDate1) },
  { header: 'Thời gian Báo cáo tiến độ 2', ml: 20, value: (p) => formatDate(p.progressReportDate2) },
  { header: 'Thời gian Báo cáo tiến độ 3', ml: 20, value: (p) => formatDate(p.progressReportDate3) },
  { header: 'Thời gian Báo cáo tiến độ 4', ml: 20, value: (p) => formatDate(p.progressReportDate4) },
  { header: 'Tiến độ thực hiện', ml: 15, value: (p) => p.progressStatus || '' },
  { header: 'Ghi chú về nộp báo cáo tiến độ', ml: 25, value: (p) => p.progressReportNote || '' },
  { header: 'Ngày họp nghiệm thu', ml: 12, value: (p) => formatDate(p.acceptanceMeetingDate) },
  { header: 'Đầu ra', ml: 20, value: (p) => p.outputProduct || '' },
  { header: 'Tình trạng', ml: 15, value: (p) => p.status },
  { header: 'Năm nghiệm thu', ml: 10, value: (p) => p.acceptanceYear || '' },
  { header: 'Năm học nghiệm thu', ml: 12, value: (p) => p.acceptanceAcademicYear || '' },
  {
    header: 'Sản phẩm NC cam kết',
    ml: 25,
    value: (p) => (p.expectedProducts || []).map((x) => `${x.type}(${x.count})`).join('; '),
  },
  {
    header: 'Sản phẩm thực tế đạt được',
    ml: 30,
    value: (p) => {
      const summary = (p.actualProducts || []).map((x) => `${x.type}(${x.count})`).join('; ');
      return p.actualProductDetails ? `${summary}\n${p.actualProductDetails}` : summary;
    },
  },
  { header: 'Thời điểm nhắc', ml: 15, value: (p) => formatDate(p.reminderDate) },
  { header: 'Thời điểm nghiệm thu', ml: 15, value: (p) => formatDate(p.acceptanceCompletionDate) },
  { header: 'Mã số ĐT', ml: 15, value: (p) => p.projectCode || '' },
  { header: 'Giới tính', ml: 8, value: (p) => p.leadAuthorGender || '' },
  { header: 'Chuyển tiếp', ml: 10, value: (p) => (p.isTransferred ? 'Có' : 'Không') },
  { header: 'Lý do thanh lý', ml: 20, value: (p) => p.terminationReason || '' },
  {
    header: 'Lịch sử edit',
    ml: 30,
    value: (p) =>
      (p.history || [])
        .map((h) => `${formatDate(h.timestamp)} - ${h.user}: ${h.action}`)
        .join('\n'),
  },
];

export function exportProjectsToExcel(projects: ResearchProject[]): void {
  const headers = EXPORT_COLUMNS.map((c) => c.header);
  const dataRows = projects.map((p, i) => EXPORT_COLUMNS.map((c) => c.value(p, i)));
  const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
  ws['!cols'] = EXPORT_COLUMNS.map((c) => ({ wch: c.ml }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Danh sách đề tài');

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Data_DeTai_${today}.xlsx`);
}
