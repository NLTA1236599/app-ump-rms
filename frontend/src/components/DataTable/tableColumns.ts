/** Toggleable data columns for "Dữ liệu đề tài" table + Excel export. */

export type TableColumnDef = {
  id: string;
  label: string;
};

export const TABLE_COLUMNS: TableColumnDef[] = [
  { id: 'contractId', label: 'Số Hợp Đồng' },
  { id: 'contractAppendix', label: 'Phụ lục HĐ' },
  { id: 'projectCode', label: 'Mã số ĐT' },
  { id: 'certificateResultNumber', label: 'Giấy chứng nhận' },
  { id: 'title', label: 'Tên Đề Tài' },
  { id: 'leadAuthor', label: 'Chủ nhiệm' },
  { id: 'leaderDetails', label: 'Chi tiết chủ nhiệm' },
  { id: 'leadAuthorBirthYear', label: 'Năm sinh' },
  { id: 'age', label: 'Tuổi' },
  { id: 'leadAuthorGender', label: 'Giới tính' },
  { id: 'principalEmail', label: 'Email CN' },
  { id: 'members', label: 'Thành viên' },
  { id: 'researchField', label: 'Lĩnh vực nghiên cứu' },
  { id: 'researchType', label: 'Loại hình' },
  { id: 'categories', label: 'Loại đề tài' },
  { id: 'department', label: 'Đơn vị' },
  { id: 'subDepartment', label: 'Bộ môn' },
  { id: 'approvalDecision', label: 'QĐ Xét duyệt' },
  { id: 'authorizationDecision', label: 'QĐ Phê duyệt' },
  { id: 'appraisalDecision', label: 'QĐ giám định' },
  { id: 'acceptanceDecision', label: 'QĐ nghiệm thu' },
  { id: 'budget', label: 'Kinh phí TH' },
  { id: 'budgetLumpSum', label: 'Khoán' },
  { id: 'budgetNonLumpSum', label: 'Không khoán' },
  { id: 'budgetOtherSources', label: 'Nguồn khác' },
  { id: 'budgetBatch1', label: 'Đợt 1' },
  { id: 'budgetBatch2', label: 'Đợt 2' },
  { id: 'budgetBatch3', label: 'Đợt 3' },
  { id: 'duration', label: 'Thời gian TH' },
  { id: 'startDate', label: 'Bắt đầu' },
  { id: 'endDate', label: 'Kết thúc' },
  { id: 'extensionDate', label: 'Gia hạn' },
  { id: 'reviewReportingDate', label: 'TG Báo cáo Giám định' },
  { id: 'progressReportDate1', label: 'TG BC Tiến độ 1' },
  { id: 'progressReportDate2', label: 'TG BC Tiến độ 2' },
  { id: 'progressReportDate3', label: 'TG BC Tiến độ 3' },
  { id: 'progressReportDate4', label: 'TG BC Tiến độ 4' },
  { id: 'progressStatus', label: 'Tiến độ' },
  { id: 'progressReportNote', label: 'Ghi chú BC' },
  { id: 'acceptanceMeetingDate', label: 'Ngày họp NT' },
  { id: 'outputProduct', label: 'SP Đầu ra' },
  { id: 'status', label: 'Tình trạng' },
  { id: 'acceptanceYear', label: 'Năm NT' },
  { id: 'acceptanceAcademicYear', label: 'Năm học NT' },
  { id: 'expectedProducts', label: 'SP Cam kết' },
  { id: 'actualProducts', label: 'Sản phẩm thực tế đạt được' },
  { id: 'reminderDate', label: 'Ngày nhắc' },
  { id: 'acceptanceCompletionDate', label: 'Thời điểm NT' },
  { id: 'supervisorId', label: 'CV phụ trách' },
  { id: 'isTransferred', label: 'Chuyển tiếp' },
  { id: 'terminationReason', label: 'Lý do thanh lý' },
  { id: 'generalNotes', label: 'Ghi chú chung' },
  { id: 'history', label: 'Lịch sử' },
];

export const TABLE_COLUMN_IDS = TABLE_COLUMNS.map((c) => c.id);

export const DEFAULT_VISIBLE_COLUMNS: Record<string, boolean> = Object.fromEntries(
  TABLE_COLUMN_IDS.map((id) => [id, true]),
);

const STORAGE_KEY = 'ump-rms-datatable-visible-columns';

export function loadVisibleColumns(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_VISIBLE_COLUMNS };
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    const next = { ...DEFAULT_VISIBLE_COLUMNS };
    for (const id of TABLE_COLUMN_IDS) {
      if (typeof parsed[id] === 'boolean') next[id] = parsed[id];
    }
    return next;
  } catch {
    return { ...DEFAULT_VISIBLE_COLUMNS };
  }
}

export function saveVisibleColumns(visible: Record<string, boolean>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visible));
  } catch {
    /* ignore quota / private mode */
  }
}

export function isColumnVisible(visible: Record<string, boolean>, id: string): boolean {
  return visible[id] !== false;
}
