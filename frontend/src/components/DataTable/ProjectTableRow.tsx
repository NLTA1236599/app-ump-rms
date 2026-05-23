import { getProgressBadge, getStatusBadge } from './badges.js';
import { formatDate, getAge } from './formatDate.js';
import { EyeIcon, PencilIcon, TrashIcon } from './icons.js';
import type { ResearchProject } from './types.js';

type ProjectTableRowProps = {
  project: ResearchProject;
  rowIndex: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onView: (project: ResearchProject) => void;
  onEdit: (project: ResearchProject) => void;
  onDelete: (id: string) => void;
};

function categoriesList(categories?: string[] | string) {
  if (!categories) return null;
  if (Array.isArray(categories)) {
    return categories.map((c) => (
      <span key={c} className="rounded border bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
        {c}
      </span>
    ));
  }
  return (
    <span className="rounded border bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
      {categories}
    </span>
  );
}

export function ProjectTableRow({
  project: p,
  rowIndex,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete,
}: ProjectTableRowProps) {
  return (
    <tr className="group border-b border-slate-100 transition-colors hover:bg-blue-50/50">
      <td
        className="sticky left-0 z-20 bg-white px-3 py-3 align-top group-hover:bg-blue-50/50"
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(p.id)}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
      </td>

      <td
        className="sticky left-[50px] bg-white px-3 py-3 text-center text-xs font-bold
                   text-slate-500 align-top group-hover:bg-blue-50/50"
      >
        {rowIndex}
      </td>

      <td className="px-3 py-3 align-top font-mono text-xs font-bold text-blue-600">
        {p.contractId}
      </td>

      <td className="px-3 py-3 align-top text-xs">
        {p.certificateResultNumber && (
          <div>
            <span className="text-slate-500">Số:</span> {p.certificateResultNumber}
          </div>
        )}
        {p.certificateResultDate && (
          <div>
            <span className="text-slate-500">Ngày:</span> {formatDate(p.certificateResultDate)}
          </div>
        )}
        {p.certificateResultIssuingAuthority && (
          <div>
            <span className="text-slate-500">Nơi:</span> {p.certificateResultIssuingAuthority}
          </div>
        )}
      </td>

      <td
        className="max-w-xs cursor-pointer px-3 py-3 align-top text-sm font-medium text-slate-700
                   hover:text-blue-700 whitespace-normal break-words"
        title="Nhấp đúp để xem chi tiết"
        onDoubleClick={() => onView(p)}
      >
        {p.title}
      </td>

      <td className="px-3 py-3 align-top text-sm font-semibold text-blue-700">{p.leadAuthor}</td>
      <td className="px-3 py-3 text-center align-top text-xs">{p.leadAuthorBirthYear}</td>
      <td className="px-3 py-3 text-center align-top text-xs">{getAge(p.leadAuthorBirthYear)}</td>

      <td
        className="max-w-[200px] px-3 py-3 align-top text-xs whitespace-normal break-words"
        title={p.members}
      >
        {p.members}
      </td>
      <td className="px-3 py-3 align-top text-xs text-slate-700">{p.researchField}</td>
      <td className="px-3 py-3 align-top text-xs text-slate-700">{p.researchType}</td>
      <td className="flex flex-wrap gap-1 px-3 py-3 align-top">{categoriesList(p.categories)}</td>

      <td
        className="max-w-[150px] px-3 py-3 align-top text-xs whitespace-normal break-words"
        title={p.subDepartment}
      >
        {p.subDepartment}
      </td>
      <td
        className="max-w-[150px] px-3 py-3 align-top text-xs whitespace-normal break-words"
        title={p.department}
      >
        {p.department}
      </td>

      <td className="px-3 py-3 align-top text-xs text-slate-700">{p.approvalDecision}</td>
      <td className="px-3 py-3 align-top text-xs text-slate-700">{p.authorizationDecision}</td>

      <td className="px-3 py-3 text-right align-top font-mono text-xs font-bold text-slate-700">
        {p.budget?.toLocaleString('vi-VN')}
      </td>
      <td className="px-3 py-3 text-right align-top font-mono text-xs text-slate-600">
        {p.budgetLumpSum?.toLocaleString('vi-VN')}
      </td>
      <td className="px-3 py-3 text-right align-top font-mono text-xs text-slate-600">
        {p.budgetNonLumpSum?.toLocaleString('vi-VN')}
      </td>
      <td className="px-3 py-3 text-right align-top font-mono text-xs text-slate-600">
        {p.budgetOtherSources?.toLocaleString('vi-VN')}
      </td>
      <td className="px-3 py-3 text-right align-top font-mono text-xs">
        {p.budgetBatch1?.toLocaleString('vi-VN')}
      </td>
      <td className="px-3 py-3 text-right align-top font-mono text-xs">
        {p.budgetBatch2?.toLocaleString('vi-VN')}
      </td>
      <td className="px-3 py-3 text-right align-top font-mono text-xs">
        {p.budgetBatch3?.toLocaleString('vi-VN')}
      </td>

      <td className="px-3 py-3 align-top text-xs text-slate-700">{p.duration}</td>
      <td className="px-3 py-3 align-top text-xs text-slate-600">{formatDate(p.startDate)}</td>
      <td className="px-3 py-3 align-top text-xs text-slate-600">{formatDate(p.endDate)}</td>
      <td className="px-3 py-3 align-top text-xs font-medium text-amber-600">
        {formatDate(p.extensionDate)}
      </td>

      <td className="px-3 py-3 align-top text-xs">{formatDate(p.reviewReportingDate)}</td>
      <td className="px-3 py-3 align-top text-xs">{formatDate(p.progressReportDate1)}</td>
      <td className="px-3 py-3 align-top text-xs">{formatDate(p.progressReportDate2)}</td>
      <td className="px-3 py-3 align-top text-xs">{formatDate(p.progressReportDate3)}</td>
      <td className="px-3 py-3 align-top text-xs">{formatDate(p.progressReportDate4)}</td>
      <td className="px-3 py-3 align-top">{getProgressBadge(p.progressStatus)}</td>
      <td
        className="max-w-[200px] px-3 py-3 align-top text-xs whitespace-normal break-words"
        title={p.progressReportNote}
      >
        {p.progressReportNote}
      </td>
      <td className="px-3 py-3 align-top text-xs">{formatDate(p.acceptanceMeetingDate)}</td>

      <td
        className="max-w-[200px] px-3 py-3 align-top text-xs whitespace-normal break-words"
        title={p.outputProduct}
      >
        {p.outputProduct}
      </td>
      <td className="px-3 py-3 align-top">{getStatusBadge(p.status)}</td>

      <td className="px-3 py-3 text-center align-top text-xs">{p.acceptanceYear}</td>
      <td className="px-3 py-3 text-center align-top text-xs">{p.acceptanceAcademicYear}</td>

      <td className="px-3 py-3 align-top text-xs">
        {(p.expectedProducts || []).reduce((a, b) => a + b.count, 0)} sản phẩm
      </td>
      <td className="px-3 py-3 align-top text-xs">
        <div className="flex flex-col gap-1">
          <span className="font-bold">
            {(p.actualProducts || []).map((x) => `${x.type}(${x.count})`).join('; ')}
          </span>
          {p.actualProductDetails && (
            <span
              className="max-w-[200px] truncate text-[10px] text-slate-500"
              title={p.actualProductDetails}
            >
              {p.actualProductDetails}
            </span>
          )}
        </div>
      </td>

      <td className="px-3 py-3 align-top text-xs">{formatDate(p.reminderDate)}</td>
      <td className="px-3 py-3 align-top text-xs">{formatDate(p.acceptanceCompletionDate)}</td>
      <td className="px-3 py-3 align-top font-mono text-xs font-bold text-slate-700">
        {p.projectCode}
      </td>
      <td className="px-3 py-3 align-top text-xs">{p.leadAuthorGender}</td>
      <td className="px-3 py-3 text-center align-top text-xs">{p.isTransferred ? '☑' : ''}</td>
      <td className="px-3 py-3 align-top text-xs text-red-600">{p.terminationReason}</td>

      <td
        className="sticky right-0 z-10 bg-white px-3 py-3 align-top group-hover:bg-blue-50/50"
      >
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onView(p)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600
                       hover:bg-blue-100"
            title="Xem chi tiết"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(p)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600
                       hover:bg-amber-100"
            title="Chỉnh sửa"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(p.id)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-500
                       hover:bg-red-100"
            title="Xóa"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </td>

      <td className="px-3 py-3 align-top text-xs text-slate-500">
        {p.history?.[0] ? (
          <div className="flex flex-col">
            <span className="font-bold">@{p.history[0].user}</span>
            <span>{p.history[0].timestamp}</span>
          </div>
        ) : (
          '---'
        )}
      </td>
    </tr>
  );
}
