import * as XLSX from 'xlsx';

import { formatDate } from './formatDate.js';
import { ProjectStatus, type ResearchProject } from './types.js';

function mapRow(headers: string[], row: unknown[]): Partial<ResearchProject> {
  const p: Partial<ResearchProject> = {};

  headers.forEach((h, index) => {
    const header = h.toLowerCase();
    const val = row[index];
    if (val === undefined) return;

    if (header.includes('số hợp đồng')) p.contractId = val ? String(val) : '';
    else if (header.includes('ngày ký')) p.contractDate = val ? String(val) : '';
    else if (header.includes('tên đề tài')) p.title = val ? String(val) : '';
    else if (header.includes('chủ nhiệm')) p.leadAuthor = val ? String(val) : '';
    else if (header.includes('năm sinh')) p.leadAuthorBirthYear = val ? String(val) : '';
    else if (header.includes('thành viên')) p.members = val ? String(val) : '';
    else if (header.includes('lĩnh vực')) p.researchField = val ? String(val) : '';
    else if (header.includes('loại hình')) p.researchType = val ? String(val) : '';
    else if (header.includes('loại đề tài'))
      p.categories = val ? String(val).split(',').map((s) => s.trim()) : [];
    else if (header.includes('bộ môn')) p.subDepartment = val ? String(val) : '';
    else if (header.includes('đơn vị')) p.department = val ? String(val) : '';
    else if (header.includes('qđ xét duyệt')) p.approvalDecision = val ? String(val) : '';
    else if (header.includes('qđ phê duyệt')) p.authorizationDecision = val ? String(val) : '';
    else if (header.includes('kinh phí thực hiện')) p.budget = Number(val) || 0;
    else if (header.includes('thời gian th')) p.duration = val ? String(val) : '';
    else if (header.includes('bắt đầu')) p.startDate = val ? String(val) : '';
    else if (header.includes('kết thúc')) p.endDate = val ? String(val) : '';
    else if (
      header === 'tiến độ' ||
      header === 'tiến độ thực hiện' ||
      (header.includes('tiến độ') &&
        !header.includes('1') &&
        !header.includes('2') &&
        !header.includes('3') &&
        !header.includes('4') &&
        !header.includes('báo cáo') &&
        !header.includes('ghi chú'))
    )
      p.progressStatus = val ? String(val) : '';
    else if (header.includes('mã số đt')) p.projectCode = val ? String(val) : '';
    else if (header.includes('tình trạng')) p.status = val ? String(val) : '';
    else if (header.includes('giấy chứng nhận')) p.certificateResultNumber = val ? String(val) : '';
    else if (header.includes('khoán') && !header.includes('không')) p.budgetLumpSum = Number(val) || 0;
    else if (header.includes('không khoán')) p.budgetNonLumpSum = Number(val) || 0;
    else if (header.includes('nguồn khác')) p.budgetOtherSources = Number(val) || 0;
    else if (header.includes('đợt 1')) p.budgetBatch1 = Number(val) || 0;
    else if (header.includes('đợt 2')) p.budgetBatch2 = Number(val) || 0;
    else if (header.includes('đợt 3')) p.budgetBatch3 = Number(val) || 0;
    else if (header.includes('gia hạn')) p.extensionDate = val ? String(val) : '';
    else if (header.includes('giám định')) p.reviewReportingDate = val ? String(val) : '';
    else if (header.includes('tiến độ 1')) p.progressReportDate1 = val ? String(val) : '';
    else if (header.includes('tiến độ 2')) p.progressReportDate2 = val ? String(val) : '';
    else if (header.includes('tiến độ 3')) p.progressReportDate3 = val ? String(val) : '';
    else if (header.includes('tiến độ 4')) p.progressReportDate4 = val ? String(val) : '';
    else if (header.includes('đầu ra')) p.outputProduct = val ? String(val) : '';
    else if (header.includes('năm nt') || header.includes('năm nghiệm thu'))
      p.acceptanceYear = val ? String(val) : '';
    else if (header.includes('năm học')) p.acceptanceAcademicYear = val ? String(val) : '';
    else if (header.includes('sản phẩm thực tế')) p.actualProductDetails = val ? String(val) : '';
    else if (
      header.includes('ngày họp nt') ||
      header.includes('ngày họp nghiệm thu') ||
      (header.includes('họp') && header.includes('nghiệm thu'))
    )
      p.acceptanceMeetingDate = val != null ? formatDate(val as string | number) : '';
    else if (header.includes('ngày nhắc') || header.includes('thời điểm nhắc'))
      p.reminderDate = val ? String(val) : '';
    else if (header.includes('thời điểm nt') || header.includes('thời điểm nghiệm thu'))
      p.acceptanceCompletionDate = val ? String(val) : '';
    else if (header.includes('giới tính')) p.leadAuthorGender = val ? String(val) : 'Nam';
    else if (header.includes('chuyển tiếp'))
      p.isTransferred =
        val != null &&
        (String(val).toLowerCase().includes('có') || String(val).toLowerCase() === 'true');
    else if (header.includes('thanh lý')) p.terminationReason = val ? String(val) : '';
  });

  const today = new Date().toISOString().split('T')[0];

  return {
    ...p,
    id: crypto.randomUUID(),
    title: p.title || 'Untitled Project',
    leadAuthor: p.leadAuthor || 'Unknown',
    contractId: p.contractId || '',
    department: p.department || '',
    researchField: p.researchField || '',
    status: p.status || ProjectStatus.ONGOING,
    budget: p.budget || 0,
    startDate: p.startDate || today,
    endDate: p.endDate || today,
  };
}

function readWorkbook(data: string | ArrayBuffer) {
  if (typeof data === 'string') {
    return XLSX.read(data, { type: 'binary' });
  }
  return XLSX.read(new Uint8Array(data), { type: 'array' });
}

export function parseExcelFile(data: string | ArrayBuffer): Partial<ResearchProject>[] {
  const workbook = readWorkbook(data);
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const firstSheet = workbook.Sheets[sheetName];
  if (!firstSheet) return [];

  const rows = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, { header: 1 });

  if (rows.length < 2) return [];

  const headers = (rows[0] ?? []).map((h) => String(h ?? ''));
  return rows
    .slice(1)
    .filter((row) => row.some((cell) => cell != null && cell !== ''))
    .map((row) => mapRow(headers, row));
}
