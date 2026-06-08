import { Breadcrumb } from './Breadcrumb.js';
import { BREADCRUMBS } from './constants.js';
import { DataTableGrid } from './DataTableGrid.js';
import { DataTableToolbar } from './DataTableToolbar.js';
import { PageTitleBar } from './PageTitleBar.js';
import { useDataTable } from './useDataTable.js';
import type { DataTableProps } from './types.js';

/** Full "Dữ liệu đề tài" page — DataTable-DulieuNghienCuu-spec.md */
export function DataTablePage({
  projects,
  onDelete,
  onEdit,
  onView,
  onImport,
  onImportFeedback,
  onDeleteMultiple,
  onDeleteAll,
}: DataTableProps) {
  const table = useDataTable({ projects, onImport, onImportFeedback, onDeleteMultiple, onDeleteAll });

  const pageOffset = (table.currentPage - 1) * table.pageSize;

  return (
    <div className="space-y-0 bg-slate-50">
      <Breadcrumb items={BREADCRUMBS} />

      <PageTitleBar title="Dữ liệu đề tài" />

      <DataTableToolbar
        contractIdSearch={table.contractIdSearch}
        onContractIdSearchChange={table.setContractIdSearch}
        onContractSearch={table.handleContractSearch}
        pageSize={table.pageSize}
        onPageSizeChange={table.handlePageSizeChange}
        selectedCount={table.selectedIds.size}
        showImport={Boolean(onImport)}
        fileInputRef={table.fileInputRef}
        onImportClick={table.triggerImport}
        onFileUpload={table.handleFileUpload}
        onExport={table.exportExcel}
        onReset={table.handleReset}
        onDeleteSelected={table.handleDeleteSelected}
        totalCount={projects.length}
        onDeleteAll={table.handleDeleteAll}
      />

      <DataTableGrid
        paginatedProjects={table.paginatedProjects}
        filteredCount={table.filteredProjects.length}
        pageOffset={pageOffset}
        allSelected={table.allSelected}
        selectedIds={table.selectedIds}
        columnFilters={table.columnFilters}
        activeFilterColumn={table.activeFilterColumn}
        currentPage={table.currentPage}
        totalPages={table.totalPages}
        onSelectAll={table.handleSelectAll}
        onSelectOne={table.handleSelectOne}
        onToggleFilter={table.toggleFilter}
        onFilterChange={table.handleFilterChange}
        onCloseFilter={() => table.setActiveFilterColumn(null)}
        onPageChange={table.handlePageChange}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
