import { useMemo, useRef, useState } from 'react';

import { DEFAULT_PAGE_SIZE } from './constants.js';
import { exportProjectsToExcel } from './excelExport.js';
import { parseExcelFile } from './excelImport.js';
import { filterProjects } from './filterProjects.js';
import type { ColumnFilters, DataTableProps, ProjectStatus } from './types.js';

export function useDataTable({
  projects,
  onImport,
  onImportFeedback,
  onDeleteMultiple,
  onDeleteAll,
}: Pick<
  DataTableProps,
  'projects' | 'onImport' | 'onImportFeedback' | 'onDeleteMultiple' | 'onDeleteAll'
>) {
  const [contractIdSearch, setContractIdSearch] = useState('');
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL');
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>({});
  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProjects = useMemo(
    () =>
      filterProjects(projects, {
        searchTerm,
        statusFilter,
        columnFilters,
        contractIdSearch,
      }),
    [projects, searchTerm, statusFilter, columnFilters, contractIdSearch],
  );

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize));

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProjects.slice(start, start + pageSize);
  }, [filteredProjects, currentPage, pageSize]);

  const allSelected =
    filteredProjects.length > 0 && filteredProjects.every((p) => selectedIds.has(p.id));

  const handleContractSearch = () => setCurrentPage(1);

  const handleReset = () => {
    setContractIdSearch('');
    setSearchTerm('');
    setColumnFilters({});
    setStatusFilter('ALL');
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = () => {
    onDeleteMultiple?.([...selectedIds]);
    setSelectedIds(new Set());
  };

  const handleDeleteAll = () => {
    if (projects.length === 0) return;
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa tất cả ${projects.length} bản ghi trong bảng? Thao tác này không thể hoàn tác.`,
    );
    if (!confirmed) return;

    onDeleteAll?.();
    setSelectedIds(new Set());
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProjects.map((p) => p.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleFilterChange = (colId: string, value: string) => {
    setColumnFilters((prev) => ({ ...prev, [colId]: value }));
  };

  const toggleFilter = (colId: string) => {
    setActiveFilterColumn((prev) => (prev === colId ? null : colId));
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const triggerImport = () => fileInputRef.current?.click();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        if (!(buffer instanceof ArrayBuffer)) {
          onImportFeedback?.({ ok: false, message: 'Không đọc được file Excel.' });
          return;
        }

        const imported = parseExcelFile(buffer);
        if (imported.length === 0) {
          onImportFeedback?.({
            ok: false,
            message:
              'Không tìm thấy dữ liệu hợp lệ trong file Excel. Kiểm tra dòng tiêu đề và nội dung.',
          });
          return;
        }

        onImport?.(imported);
        onImportFeedback?.({ ok: true, count: imported.length });
      } catch {
        onImportFeedback?.({
          ok: false,
          message: 'Lỗi khi nhập dữ liệu từ Excel. Vui lòng kiểm tra định dạng file (.xlsx, .xls).',
        });
      }
    };
    reader.onerror = () => {
      onImportFeedback?.({ ok: false, message: 'Không thể đọc file. Vui lòng thử lại.' });
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const exportExcel = () => exportProjectsToExcel(filteredProjects);

  return {
    contractIdSearch,
    setContractIdSearch,
    pageSize,
    currentPage,
    totalPages,
    columnFilters,
    activeFilterColumn,
    selectedIds,
    fileInputRef,
    filteredProjects,
    paginatedProjects,
    allSelected,
    handleContractSearch,
    handleReset,
    handleDeleteSelected,
    handleDeleteAll,
    handleSelectAll,
    handleSelectOne,
    handleFilterChange,
    toggleFilter,
    setActiveFilterColumn,
    handlePageSizeChange,
    handlePageChange,
    triggerImport,
    handleFileUpload,
    exportExcel,
  };
}
