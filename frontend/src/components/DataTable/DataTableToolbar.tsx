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
    <div className="flex items-center gap-3">
      <span className="flex-shrink-0 text-sm font-medium text-slate-700">Số hợp đồng</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        placeholder="Nhập số hợp đồng..."
        className="min-w-[180px] border-0 border-b border-slate-400 bg-transparent pb-1 text-sm
                   text-slate-700 focus:border-blue-500 focus:outline-none"
      />
      <button
        type="button"
        onClick={onSearch}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600
                   shadow-sm transition-colors duration-150 hover:bg-blue-700"
        aria-label="Tìm kiếm theo số hợp đồng"
      >
        <MagnifyingGlassIcon className="h-4 w-4 text-white" />
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
  onReset: () => void;
  onDeleteSelected: () => void;
};

export function ActionButtonRow({
  selectedCount,
  showImport,
  fileInputRef,
  onImportClick,
  onFileUpload,
  onExport,
  onReset,
  onDeleteSelected,
}: ActionButtonRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {showImport && (
        <>
          <button
            type="button"
            onClick={onImportClick}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-black
                       uppercase tracking-widest text-white shadow-md shadow-blue-200 transition-colors
                       hover:bg-blue-700"
          >
            <ArrowUpTrayIcon className="h-4 w-4" /> NHẬP EXCEL
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
        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black
                   uppercase tracking-widest text-white shadow-md shadow-emerald-200 transition-colors
                   hover:bg-emerald-700"
      >
        <ArrowDownTrayIcon className="h-4 w-4" /> XUẤT EXCEL
      </button>

      <button
        type="button"
        onClick={onReset}
        className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2
                   text-xs font-black uppercase tracking-widest text-red-600 transition-colors
                   hover:bg-red-100"
      >
        RESET
      </button>

      {selectedCount > 0 && (
        <button
          type="button"
          onClick={onDeleteSelected}
          className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-black
                     uppercase tracking-widest text-white shadow-md shadow-red-200 transition-colors
                     hover:bg-red-700"
        >
          XÓA ĐÃ CHỌN ({selectedCount})
        </button>
      )}
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
      <span className="flex-shrink-0 text-sm text-slate-600">Bản ghi mỗi trang:</span>
      <div className="relative">
        <select
          value={pageSize}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-16 cursor-pointer appearance-none border-0 border-b border-slate-400
                     bg-transparent pb-0.5 pr-4 text-sm text-slate-700 focus:border-blue-500
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
  onReset: () => void;
  onDeleteSelected: () => void;
};

export function DataTableToolbar(props: DataTableToolbarProps) {
  return (
    <div
      className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 pb-3
                 pt-4 shadow-sm"
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
        onReset={props.onReset}
        onDeleteSelected={props.onDeleteSelected}
      />
      <PageSizeRow pageSize={props.pageSize} onChange={props.onPageSizeChange} />
    </div>
  );
}
