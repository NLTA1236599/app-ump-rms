import { ColumnVisibilityDropdown } from './ColumnVisibilityDropdown.js';
import { PAGE_SIZE_OPTIONS } from './constants.js';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from './icons.js';

type ContractSearchRowProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
};

export function ContractSearchRow({ value, onChange, onSearch }: ContractSearchRowProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex-shrink-0 text-xs font-medium text-slate-700">Số hợp đồng</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        placeholder="Nhập số hợp đồng..."
        className="min-w-[160px] border-0 border-b border-slate-400 bg-transparent pb-0.5 text-xs
                   text-slate-700 focus:border-blue-500 focus:outline-none"
      />
      <button
        type="button"
        onClick={onSearch}
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-600
                   shadow-sm transition-colors duration-150 hover:bg-blue-700"
        aria-label="Tìm kiếm theo số hợp đồng"
      >
        <MagnifyingGlassIcon className="h-3.5 w-3.5 text-white" />
      </button>
    </div>
  );
}

type ActionButtonRowProps = {
  selectedCount: number;
  showImport: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onImportClick: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  canRestore?: boolean;
  onRestore?: () => void | Promise<void | number>;
  onDeleteSelected: () => void;
  totalCount: number;
  onDeleteAll: () => void;
  canDeleteProjects?: boolean;
  visibleColumns: Record<string, boolean>;
  onVisibleColumnsChange: (visible: Record<string, boolean>) => void;
};

export function ActionButtonRow({
  selectedCount,
  showImport,
  fileInputRef,
  onImportClick,
  onFileUpload,
  onExport,
  canRestore = false,
  onRestore,
  onDeleteSelected,
  totalCount,
  onDeleteAll,
  canDeleteProjects = true,
  visibleColumns,
  onVisibleColumnsChange,
}: ActionButtonRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {showImport && (
        <>
          <button
            type="button"
            onClick={onImportClick}
            className="flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1.5 text-[10px] font-bold
                       uppercase tracking-wide text-white shadow-sm transition-colors
                       hover:bg-blue-700"
          >
            <ArrowUpTrayIcon className="h-3.5 w-3.5" /> NHẬP EXCEL
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={onFileUpload}
          />
        </>
      )}

      <button
        type="button"
        onClick={onExport}
        className="flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-[10px] font-bold
                   uppercase tracking-wide text-white shadow-sm transition-colors
                   hover:bg-emerald-700"
      >
        <ArrowDownTrayIcon className="h-3.5 w-3.5" /> XUẤT EXCEL
      </button>

      {canDeleteProjects ? (
        <button
          type="button"
          disabled={!canRestore}
          onDoubleClick={() => {
            if (!canRestore) return;
            void onRestore?.();
          }}
          title={
            canRestore
              ? 'Nhấp đúp để khôi phục thao tác xóa trước đó'
              : 'Chưa có thao tác xóa để khôi phục'
          }
          className="flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5
                     text-[10px] font-bold tracking-wide text-red-600 transition-colors
                     hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-45
                     disabled:hover:bg-red-50"
        >
          Khôi phục lại
        </button>
      ) : null}

      {canDeleteProjects && selectedCount > 0 && (
        <button
          type="button"
          onClick={onDeleteSelected}
          className="flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1.5 text-[10px] font-bold
                     uppercase tracking-wide text-white shadow-sm transition-colors
                     hover:bg-red-700"
        >
          XÓA ĐÃ CHỌN ({selectedCount})
        </button>
      )}

      {canDeleteProjects && totalCount > 0 && (
        <button
          type="button"
          onClick={onDeleteAll}
          className="flex items-center gap-1 rounded-md border border-red-300 bg-white px-2.5 py-1.5
                     text-[10px] font-bold uppercase tracking-wide text-red-700 transition-colors
                     hover:bg-red-50"
        >
          XÓA TẤT CẢ ({totalCount})
        </button>
      )}

      <ColumnVisibilityDropdown
        visibleColumns={visibleColumns}
        onChange={onVisibleColumnsChange}
      />
    </div>
  );
}

type PageSizeRowProps = {
  pageSize: number;
  onChange: (size: number) => void;
};

export function PageSizeRow({ pageSize, onChange }: PageSizeRowProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex-shrink-0 text-xs text-slate-600">Bản ghi mỗi trang:</span>
      <div className="relative">
        <select
          value={pageSize}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-16 cursor-pointer appearance-none border-0 border-b border-slate-400
                     bg-transparent pb-0.5 pr-4 text-xs text-slate-700 focus:border-blue-500
                     focus:outline-none"
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-0 top-0 h-4 w-4 text-slate-400" />
      </div>
    </div>
  );
}

type DataTableToolbarProps = {
  contractIdSearch: string;
  onContractIdSearchChange: (value: string) => void;
  onContractSearch: () => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  selectedCount: number;
  showImport: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onImportClick: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  canRestore?: boolean;
  onRestore?: () => void | Promise<void | number>;
  onDeleteSelected: () => void;
  totalCount: number;
  onDeleteAll: () => void;
  canDeleteProjects?: boolean;
  visibleColumns: Record<string, boolean>;
  onVisibleColumnsChange: (visible: Record<string, boolean>) => void;
};

export function DataTableToolbar(props: DataTableToolbarProps) {
  return (
    <div
      className="mb-2 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white px-3 pb-2
                 pt-2.5 shadow-sm"
    >
      <ContractSearchRow
        value={props.contractIdSearch}
        onChange={props.onContractIdSearchChange}
        onSearch={props.onContractSearch}
      />
      <ActionButtonRow
        selectedCount={props.selectedCount}
        showImport={props.showImport}
        fileInputRef={props.fileInputRef}
        onImportClick={props.onImportClick}
        onFileUpload={props.onFileUpload}
        onExport={props.onExport}
        canRestore={props.canRestore}
        onRestore={props.onRestore}
        onDeleteSelected={props.onDeleteSelected}
        totalCount={props.totalCount}
        onDeleteAll={props.onDeleteAll}
        canDeleteProjects={props.canDeleteProjects}
        visibleColumns={props.visibleColumns}
        onVisibleColumnsChange={props.onVisibleColumnsChange}
      />
      <PageSizeRow pageSize={props.pageSize} onChange={props.onPageSizeChange} />
    </div>
  );
}
