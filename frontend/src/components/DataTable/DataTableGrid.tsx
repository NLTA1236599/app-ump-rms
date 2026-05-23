import { FilterableHeader } from './FilterableHeader.js';
import { ProjectTableRow } from './ProjectTableRow.js';
import { PaginationControls } from './PaginationControls.js';
import type { ColumnFilters, ResearchProject } from './types.js';

type DataTableGridProps = {
  paginatedProjects: ResearchProject[];
  filteredCount: number;
  pageOffset: number;
  allSelected: boolean;
  selectedIds: Set<string>;
  columnFilters: ColumnFilters;
  activeFilterColumn: string | null;
  currentPage: number;
  totalPages: number;
  onSelectAll: () => void;
  onSelectOne: (id: string) => void;
  onToggleFilter: (colId: string) => void;
  onFilterChange: (colId: string, value: string) => void;
  onCloseFilter: () => void;
  onPageChange: (page: number) => void;
  onView: (project: ResearchProject) => void;
  onEdit: (project: ResearchProject) => void;
  onDelete: (id: string) => void;
};

export function DataTableGrid({
  paginatedProjects,
  filteredCount,
  pageOffset,
  allSelected,
  selectedIds,
  columnFilters,
  activeFilterColumn,
  currentPage,
  totalPages,
  onSelectAll,
  onSelectOne,
  onToggleFilter,
  onFilterChange,
  onCloseFilter,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: DataTableGridProps) {
  const headerProps = {
    columnFilters,
    activeFilterColumn,
    onToggleFilter,
    onFilterChange,
    onCloseFilter,
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow">
      <div
        className="relative max-h-[calc(100vh-200px)] w-full overflow-auto scrollbar-thin
                   scrollbar-track-slate-100 scrollbar-thumb-slate-300"
      >
        <table
          role="grid"
          className="relative w-auto min-w-full table-auto border-collapse text-left"
        >
          <thead className="sticky top-0 z-30 bg-slate-50">
            <tr className="border-b border-slate-200 bg-slate-50">
              <th
                className="sticky left-0 top-0 z-40 w-[50px] min-w-[50px] border-b border-slate-200
                           bg-slate-50 px-3 py-2 text-center shadow-sm"
              >
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  aria-label="Chọn tất cả"
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th
                className="sticky left-[50px] top-0 z-30 w-[50px] min-w-[50px] border-b
                           border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black uppercase
                           tracking-widest text-slate-600 shadow-sm"
              >
                TT
              </th>

              <FilterableHeader label="Số Hợp Đồng" colId="contractId" minWidth="220px" {...headerProps} />
              <FilterableHeader
                label="Giấy chứng nhận (Số)"
                colId="certificateResultNumber"
                minWidth="200px"
                {...headerProps}
              />
              <FilterableHeader label="Tên Đề Tài" colId="title" minWidth="300px" {...headerProps} />
              <FilterableHeader label="Chủ nhiệm" colId="leadAuthor" minWidth="150px" {...headerProps} />
              <FilterableHeader label="Năm sinh" colId="leadAuthorBirthYear" minWidth="80px" {...headerProps} />
              <th
                className="sticky top-0 z-20 min-w-[60px] border-b border-slate-200 bg-slate-50 px-3 py-2
                           text-xs font-black uppercase tracking-widest text-slate-600 shadow-sm"
              >
                Tuổi
              </th>

              <FilterableHeader label="Thành viên" colId="members" minWidth="300px" {...headerProps} />
              <FilterableHeader label="Lĩnh vực" colId="researchField" minWidth="150px" {...headerProps} />
              <FilterableHeader label="Loại hình" colId="researchType" minWidth="120px" {...headerProps} />
              <FilterableHeader label="Loại đề tài" colId="categories" minWidth="120px" {...headerProps} />
              <FilterableHeader label="Bộ môn" colId="subDepartment" minWidth="150px" {...headerProps} />
              <FilterableHeader label="Đơn vị" colId="department" minWidth="150px" {...headerProps} />
              <FilterableHeader label="QĐ Xét duyệt" colId="approvalDecision" minWidth="120px" {...headerProps} />
              <FilterableHeader label="QĐ Phê duyệt" colId="authorizationDecision" minWidth="120px" {...headerProps} />

              <FilterableHeader label="Kinh phí TH" colId="budget" minWidth="120px" className="text-right" {...headerProps} />
              <FilterableHeader label="Khoán" colId="budgetLumpSum" minWidth="120px" className="text-right" {...headerProps} />
              <FilterableHeader label="Không khoán" colId="budgetNonLumpSum" minWidth="120px" className="text-right" {...headerProps} />
              <FilterableHeader label="Nguồn khác" colId="budgetOtherSources" minWidth="120px" className="text-right" {...headerProps} />
              <FilterableHeader label="Đợt 1" colId="budgetBatch1" minWidth="100px" className="text-right" {...headerProps} />
              <FilterableHeader label="Đợt 2" colId="budgetBatch2" minWidth="100px" className="text-right" {...headerProps} />
              <FilterableHeader label="Đợt 3" colId="budgetBatch3" minWidth="100px" className="text-right" {...headerProps} />

              <FilterableHeader label="Thời gian TH" colId="duration" minWidth="100px" {...headerProps} />
              <FilterableHeader label="Bắt đầu" colId="startDate" minWidth="100px" {...headerProps} />
              <FilterableHeader label="Kết thúc" colId="endDate" minWidth="100px" {...headerProps} />
              <FilterableHeader label="Gia hạn" colId="extensionDate" minWidth="100px" {...headerProps} />
              <FilterableHeader label="TG Báo cáo Giám định" colId="reviewReportingDate" minWidth="150px" {...headerProps} />
              <FilterableHeader label="TG BC Tiến độ 1" colId="progressReportDate1" minWidth="150px" {...headerProps} />
              <FilterableHeader label="TG BC Tiến độ 2" colId="progressReportDate2" minWidth="150px" {...headerProps} />
              <FilterableHeader label="TG BC Tiến độ 3" colId="progressReportDate3" minWidth="150px" {...headerProps} />
              <FilterableHeader label="TG BC Tiến độ 4" colId="progressReportDate4" minWidth="150px" {...headerProps} />
              <FilterableHeader label="Tiến độ" colId="progressStatus" minWidth="100px" {...headerProps} />
              <FilterableHeader label="Ghi chú BC" colId="progressReportNote" minWidth="150px" {...headerProps} />
              <FilterableHeader label="Ngày họp NT" colId="acceptanceMeetingDate" minWidth="300px" {...headerProps} />
              <FilterableHeader label="SP Đầu ra" colId="outputProduct" minWidth="300px" {...headerProps} />
              <FilterableHeader label="Tình trạng" colId="status" minWidth="120px" {...headerProps} />
              <FilterableHeader label="Năm NT" colId="acceptanceYear" minWidth="80px" {...headerProps} />
              <FilterableHeader label="Năm học NT" colId="acceptanceAcademicYear" minWidth="80px" {...headerProps} />
              <FilterableHeader label="SP Cam kết" colId="expectedProducts" minWidth="150px" {...headerProps} />
              <FilterableHeader label="Sản phẩm thực tế đạt được" colId="actualProducts" minWidth="200px" {...headerProps} />
              <FilterableHeader label="Ngày nhắc" colId="reminderDate" minWidth="100px" {...headerProps} />
              <FilterableHeader label="Thời điểm NT" colId="acceptanceCompletionDate" minWidth="100px" {...headerProps} />
              <FilterableHeader label="Mã số ĐT" colId="projectCode" minWidth="100px" {...headerProps} />
              <FilterableHeader label="Giới tính" colId="leadAuthorGender" minWidth="80px" {...headerProps} />
              <FilterableHeader label="Chuyển tiếp" colId="isTransferred" minWidth="80px" {...headerProps} />
              <FilterableHeader label="Lý do thanh lý" colId="terminationReason" minWidth="150px" {...headerProps} />

              <th
                className="sticky right-0 top-0 z-30 min-w-[120px] border-b border-slate-200 bg-slate-50
                           px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-600 shadow-sm"
              >
                Hành Động
              </th>
              <FilterableHeader label="Lịch sử" colId="history" minWidth="150px" {...headerProps} />
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-sm">
            {paginatedProjects.map((p, idx) => (
              <ProjectTableRow
                key={p.id}
                project={p}
                rowIndex={pageOffset + idx + 1}
                isSelected={selectedIds.has(p.id)}
                onSelect={onSelectOne}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
            {filteredCount === 0 && (
              <tr>
                <td
                  colSpan={100}
                  className="py-20 text-center text-xs font-bold uppercase tracking-widest text-slate-400"
                >
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredCount > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
