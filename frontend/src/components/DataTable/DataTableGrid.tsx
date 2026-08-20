import type { ReactNode } from 'react';

import { FilterableHeader } from './FilterableHeader.js';
import { ProjectTableRow } from './ProjectTableRow.js';
import { PaginationControls } from './PaginationControls.js';
import { isColumnVisible } from './tableColumns.js';
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
  visibleColumns: Record<string, boolean>;
  onSelectAll: () => void;
  onSelectOne: (id: string) => void;
  onToggleFilter: (colId: string) => void;
  onFilterChange: (colId: string, value: string) => void;
  onCloseFilter: () => void;
  onPageChange: (page: number) => void;
  onView: (project: ResearchProject) => void;
  onEdit: (project: ResearchProject) => void;
  onDelete: (id: string) => void | boolean | Promise<void | boolean>;
  canDeleteProjects?: boolean;
  supervisorEmailById?: ReadonlyMap<string, string>;
};

function Col({
  id,
  visible,
  children,
}: {
  id: string;
  visible: Record<string, boolean>;
  children: ReactNode;
}) {
  if (!isColumnVisible(visible, id)) return null;
  return children;
}

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
  visibleColumns,
  onSelectAll,
  onSelectOne,
  onToggleFilter,
  onFilterChange,
  onCloseFilter,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  canDeleteProjects = true,
  supervisorEmailById,
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
                           bg-slate-50 px-2 py-1.5 text-center shadow-sm"
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
                           border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] font-semibold uppercase
                           tracking-wide text-slate-600 shadow-sm"
              >
                TT
              </th>

              <Col id="contractId" visible={visibleColumns}>
                <FilterableHeader label="Số Hợp Đồng" colId="contractId" minWidth="160px" {...headerProps} />
              </Col>
              <Col id="contractAppendix" visible={visibleColumns}>
                <FilterableHeader label="Phụ lục HĐ" colId="contractAppendix" minWidth="120px" {...headerProps} />
              </Col>
              <Col id="projectCode" visible={visibleColumns}>
                <FilterableHeader label="Mã số ĐT" colId="projectCode" minWidth="120px" {...headerProps} />
              </Col>
              <Col id="certificateResultNumber" visible={visibleColumns}>
                <FilterableHeader
                  label="Giấy chứng nhận (Số)"
                  colId="certificateResultNumber"
                  minWidth="200px"
                  {...headerProps}
                />
              </Col>
              <Col id="title" visible={visibleColumns}>
                <FilterableHeader label="Tên Đề Tài" colId="title" minWidth="300px" {...headerProps} />
              </Col>
              <Col id="leadAuthor" visible={visibleColumns}>
                <FilterableHeader label="Chủ nhiệm" colId="leadAuthor" minWidth="150px" {...headerProps} />
              </Col>
              <Col id="leaderDetails" visible={visibleColumns}>
                <FilterableHeader
                  label="Chi tiết chủ nhiệm"
                  colId="leaderDetails"
                  minWidth="280px"
                  {...headerProps}
                />
              </Col>
              <Col id="leadAuthorBirthYear" visible={visibleColumns}>
                <FilterableHeader label="Năm sinh" colId="leadAuthorBirthYear" minWidth="80px" {...headerProps} />
              </Col>
              <Col id="age" visible={visibleColumns}>
                <th
                  className="sticky top-0 z-20 min-w-[60px] border-b border-slate-200 bg-slate-50 px-2 py-1.5
                             text-[10px] font-semibold uppercase tracking-wide text-slate-600 shadow-sm"
                >
                  Tuổi
                </th>
              </Col>
              <Col id="leadAuthorGender" visible={visibleColumns}>
                <FilterableHeader label="Giới tính" colId="leadAuthorGender" minWidth="80px" {...headerProps} />
              </Col>
              <Col id="principalEmail" visible={visibleColumns}>
                <FilterableHeader label="Email CN" colId="principalEmail" minWidth="180px" {...headerProps} />
              </Col>

              <Col id="members" visible={visibleColumns}>
                <FilterableHeader label="Thành viên" colId="members" minWidth="300px" {...headerProps} />
              </Col>
              <Col id="researchField" visible={visibleColumns}>
                <FilterableHeader label="Lĩnh vực nghiên cứu" colId="researchField" minWidth="160px" {...headerProps} />
              </Col>
              <Col id="researchType" visible={visibleColumns}>
                <FilterableHeader label="Loại hình" colId="researchType" minWidth="120px" {...headerProps} />
              </Col>
              <Col id="categories" visible={visibleColumns}>
                <FilterableHeader label="Loại đề tài" colId="categories" minWidth="120px" {...headerProps} />
              </Col>
              <Col id="department" visible={visibleColumns}>
                <FilterableHeader label="Đơn vị" colId="department" minWidth="150px" {...headerProps} />
              </Col>
              <Col id="subDepartment" visible={visibleColumns}>
                <FilterableHeader label="Bộ môn" colId="subDepartment" minWidth="150px" {...headerProps} />
              </Col>
              <Col id="approvalDecision" visible={visibleColumns}>
                <FilterableHeader label="QĐ Xét duyệt" colId="approvalDecision" minWidth="120px" {...headerProps} />
              </Col>
              <Col id="authorizationDecision" visible={visibleColumns}>
                <FilterableHeader label="QĐ Phê duyệt" colId="authorizationDecision" minWidth="120px" {...headerProps} />
              </Col>
              <Col id="appraisalDecision" visible={visibleColumns}>
                <FilterableHeader label="QĐ giám định" colId="appraisalDecision" minWidth="120px" {...headerProps} />
              </Col>
              <Col id="acceptanceDecision" visible={visibleColumns}>
                <FilterableHeader label="QĐ nghiệm thu" colId="acceptanceDecision" minWidth="120px" {...headerProps} />
              </Col>

              <Col id="budget" visible={visibleColumns}>
                <FilterableHeader label="Kinh phí TH" colId="budget" minWidth="120px" className="text-right" {...headerProps} />
              </Col>
              <Col id="budgetLumpSum" visible={visibleColumns}>
                <FilterableHeader label="Khoán" colId="budgetLumpSum" minWidth="120px" className="text-right" {...headerProps} />
              </Col>
              <Col id="budgetNonLumpSum" visible={visibleColumns}>
                <FilterableHeader label="Không khoán" colId="budgetNonLumpSum" minWidth="120px" className="text-right" {...headerProps} />
              </Col>
              <Col id="budgetOtherSources" visible={visibleColumns}>
                <FilterableHeader label="Nguồn khác" colId="budgetOtherSources" minWidth="120px" className="text-right" {...headerProps} />
              </Col>
              <Col id="budgetBatch1" visible={visibleColumns}>
                <FilterableHeader label="Đợt 1" colId="budgetBatch1" minWidth="100px" className="text-right" {...headerProps} />
              </Col>
              <Col id="budgetBatch2" visible={visibleColumns}>
                <FilterableHeader label="Đợt 2" colId="budgetBatch2" minWidth="100px" className="text-right" {...headerProps} />
              </Col>
              <Col id="budgetBatch3" visible={visibleColumns}>
                <FilterableHeader label="Đợt 3" colId="budgetBatch3" minWidth="100px" className="text-right" {...headerProps} />
              </Col>

              <Col id="duration" visible={visibleColumns}>
                <FilterableHeader label="Thời gian TH" colId="duration" minWidth="100px" {...headerProps} />
              </Col>
              <Col id="startDate" visible={visibleColumns}>
                <FilterableHeader label="Bắt đầu" colId="startDate" minWidth="100px" {...headerProps} />
              </Col>
              <Col id="endDate" visible={visibleColumns}>
                <FilterableHeader label="Kết thúc" colId="endDate" minWidth="100px" {...headerProps} />
              </Col>
              <Col id="extensionDate" visible={visibleColumns}>
                <FilterableHeader label="Gia hạn" colId="extensionDate" minWidth="100px" {...headerProps} />
              </Col>
              <Col id="reviewReportingDate" visible={visibleColumns}>
                <FilterableHeader label="TG Báo cáo Giám định" colId="reviewReportingDate" minWidth="150px" {...headerProps} />
              </Col>
              <Col id="progressReportDate1" visible={visibleColumns}>
                <FilterableHeader label="TG BC Tiến độ 1" colId="progressReportDate1" minWidth="150px" {...headerProps} />
              </Col>
              <Col id="progressReportDate2" visible={visibleColumns}>
                <FilterableHeader label="TG BC Tiến độ 2" colId="progressReportDate2" minWidth="150px" {...headerProps} />
              </Col>
              <Col id="progressReportDate3" visible={visibleColumns}>
                <FilterableHeader label="TG BC Tiến độ 3" colId="progressReportDate3" minWidth="150px" {...headerProps} />
              </Col>
              <Col id="progressReportDate4" visible={visibleColumns}>
                <FilterableHeader label="TG BC Tiến độ 4" colId="progressReportDate4" minWidth="150px" {...headerProps} />
              </Col>
              <Col id="progressStatus" visible={visibleColumns}>
                <FilterableHeader label="Tiến độ" colId="progressStatus" minWidth="100px" {...headerProps} />
              </Col>
              <Col id="progressReportNote" visible={visibleColumns}>
                <FilterableHeader label="Ghi chú BC" colId="progressReportNote" minWidth="150px" {...headerProps} />
              </Col>
              <Col id="acceptanceMeetingDate" visible={visibleColumns}>
                <FilterableHeader label="Ngày họp NT" colId="acceptanceMeetingDate" minWidth="300px" {...headerProps} />
              </Col>
              <Col id="outputProduct" visible={visibleColumns}>
                <FilterableHeader label="SP Đầu ra" colId="outputProduct" minWidth="300px" {...headerProps} />
              </Col>
              <Col id="status" visible={visibleColumns}>
                <FilterableHeader label="Tình trạng" colId="status" minWidth="120px" {...headerProps} />
              </Col>
              <Col id="acceptanceYear" visible={visibleColumns}>
                <FilterableHeader label="Năm NT" colId="acceptanceYear" minWidth="80px" {...headerProps} />
              </Col>
              <Col id="acceptanceAcademicYear" visible={visibleColumns}>
                <FilterableHeader label="Năm học NT" colId="acceptanceAcademicYear" minWidth="80px" {...headerProps} />
              </Col>
              <Col id="expectedProducts" visible={visibleColumns}>
                <FilterableHeader label="SP Cam kết" colId="expectedProducts" minWidth="150px" {...headerProps} />
              </Col>
              <Col id="actualProducts" visible={visibleColumns}>
                <FilterableHeader label="Sản phẩm thực tế đạt được" colId="actualProducts" minWidth="200px" {...headerProps} />
              </Col>
              <Col id="reminderDate" visible={visibleColumns}>
                <FilterableHeader label="Ngày nhắc" colId="reminderDate" minWidth="100px" {...headerProps} />
              </Col>
              <Col id="acceptanceCompletionDate" visible={visibleColumns}>
                <FilterableHeader label="Thời điểm NT" colId="acceptanceCompletionDate" minWidth="100px" {...headerProps} />
              </Col>
              <Col id="supervisorId" visible={visibleColumns}>
                <FilterableHeader label="CV phụ trách" colId="supervisorId" minWidth="180px" {...headerProps} />
              </Col>
              <Col id="reviewBatch" visible={visibleColumns}>
                <FilterableHeader label="Đợt xét duyệt" colId="reviewBatch" minWidth="120px" {...headerProps} />
              </Col>
              <Col id="isTransferred" visible={visibleColumns}>
                <FilterableHeader label="Chuyển tiếp" colId="isTransferred" minWidth="80px" {...headerProps} />
              </Col>
              <Col id="terminationReason" visible={visibleColumns}>
                <FilterableHeader label="Lý do thanh lý" colId="terminationReason" minWidth="150px" {...headerProps} />
              </Col>
              <Col id="generalNotes" visible={visibleColumns}>
                <FilterableHeader label="Ghi chú chung" colId="generalNotes" minWidth="200px" {...headerProps} />
              </Col>

              <th
                className="sticky right-0 top-0 z-30 min-w-[108px] border-b border-slate-200 bg-slate-50
                           px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 shadow-sm"
              >
                Hành Động
              </th>
              <Col id="history" visible={visibleColumns}>
                <FilterableHeader label="Lịch sử" colId="history" minWidth="150px" {...headerProps} />
              </Col>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs">
            {paginatedProjects.map((p, idx) => (
              <ProjectTableRow
                key={p.id}
                project={p}
                rowIndex={pageOffset + idx + 1}
                isSelected={selectedIds.has(p.id)}
                visibleColumns={visibleColumns}
                onSelect={onSelectOne}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                canDelete={canDeleteProjects}
                supervisorEmail={
                  p.supervisorId && supervisorEmailById
                    ? supervisorEmailById.get(p.supervisorId) ?? ''
                    : ''
                }
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
