import type { ReactNode } from 'react';

import { getProgressBadge, getStatusBadge } from './badges.js';
import { formatDate, getAge } from './formatDate.js';
import { EyeIcon, PencilIcon, TrashIcon } from './icons.js';
import { isColumnVisible } from './tableColumns.js';
import type { ResearchProject } from './types.js';

type ProjectTableRowProps = {
  project: ResearchProject;
  rowIndex: number;
  isSelected: boolean;
  visibleColumns: Record<string, boolean>;
  onSelect: (id: string) => void;
  onView: (project: ResearchProject) => void;
  onEdit: (project: ResearchProject) => void;
  onDelete: (id: string) => void | boolean | Promise<void | boolean>;
  canDelete?: boolean;
  supervisorEmail?: string;
};

function categoriesList(categories?: string[] | string) {
  if (!categories) return null;
  if (Array.isArray(categories)) {
    return categories.map((c) => (
      <span key={c} className="rounded border bg-slate-100 px-1 py-px text-[9px] text-slate-600">
        {c}
      </span>
    ));
  }
  return (
    <span className="rounded border bg-slate-100 px-1 py-px text-[9px] text-slate-600">
      {categories}
    </span>
  );
}

function principalEmailText(p: ResearchProject): string {
  return p.principalEmail?.trim() || p.leaderDetails?.[0]?.email?.trim() || '';
}

function membersText(p: ResearchProject): string {
  if (p.memberDetails?.length) {
    return p.memberDetails
      .map((m) => [m.fullName, m.academicTitle, m.projectRole].filter(Boolean).join(' — '))
      .join('; ');
  }
  return p.members || '';
}

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

export function ProjectTableRow({
  project: p,
  rowIndex,
  isSelected,
  visibleColumns,
  onSelect,
  onView,
  onEdit,
  onDelete,
  canDelete = true,
  supervisorEmail = '',
}: ProjectTableRowProps) {
  return (
    <tr className="group border-b border-slate-100 transition-colors hover:bg-blue-50/50">
      <td className="sticky left-0 z-20 bg-white px-2 py-1.5 align-top group-hover:bg-blue-50/50">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(p.id)}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
      </td>

      <td
        className="sticky left-[50px] bg-white px-2 py-1.5 text-center text-xs font-bold
                   text-slate-500 align-top group-hover:bg-blue-50/50"
      >
        {rowIndex}
      </td>

      <Col id="contractId" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top font-mono text-xs font-bold text-blue-600">
          {p.contractId}
        </td>
      </Col>
      <Col id="contractAppendix" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs text-slate-700">{p.contractAppendix}</td>
      </Col>
      <Col id="projectCode" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top font-mono text-xs font-bold text-slate-700">
          {p.projectCode}
        </td>
      </Col>

      <Col id="certificateResultNumber" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs">
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
      </Col>

      <Col id="title" visible={visibleColumns}>
        <td
          className="max-w-xs cursor-pointer px-2 py-1.5 align-top text-xs font-medium text-slate-700
                     hover:text-blue-700 whitespace-normal break-words"
          title="Nhấp đúp để xem chi tiết"
          onDoubleClick={() => onView(p)}
        >
          {p.title}
        </td>
      </Col>

      <Col id="leadAuthor" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs font-semibold text-blue-700">{p.leadAuthor}</td>
      </Col>
      <Col id="principalEmail" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs text-slate-700">{principalEmailText(p)}</td>
      </Col>
      <Col id="leadAuthorBirthYear" visible={visibleColumns}>
        <td className="px-2 py-1.5 text-center align-top text-xs">{p.leadAuthorBirthYear}</td>
      </Col>
      <Col id="age" visible={visibleColumns}>
        <td className="px-2 py-1.5 text-center align-top text-xs">{getAge(p.leadAuthorBirthYear)}</td>
      </Col>
      <Col id="leadAuthorGender" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs">{p.leadAuthorGender}</td>
      </Col>

      <Col id="members" visible={visibleColumns}>
        <td
          className="max-w-[240px] px-2 py-1.5 align-top text-xs whitespace-normal break-words"
          title={membersText(p)}
        >
          {membersText(p)}
        </td>
      </Col>
      <Col id="researchField" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs text-slate-700">{p.researchField}</td>
      </Col>
      <Col id="researchType" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs text-slate-700">{p.researchType}</td>
      </Col>
      <Col id="categories" visible={visibleColumns}>
        <td className="flex flex-wrap gap-1 px-2 py-1.5 align-top">{categoriesList(p.categories)}</td>
      </Col>

      <Col id="department" visible={visibleColumns}>
        <td
          className="max-w-[150px] px-2 py-1.5 align-top text-xs whitespace-normal break-words"
          title={p.department}
        >
          {p.department}
        </td>
      </Col>
      <Col id="subDepartment" visible={visibleColumns}>
        <td
          className="max-w-[150px] px-2 py-1.5 align-top text-xs whitespace-normal break-words"
          title={p.subDepartment}
        >
          {p.subDepartment}
        </td>
      </Col>

      <Col id="approvalDecision" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs text-slate-700">{p.approvalDecision}</td>
      </Col>
      <Col id="authorizationDecision" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs text-slate-700">{p.authorizationDecision}</td>
      </Col>
      <Col id="appraisalDecision" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs text-slate-700">{p.appraisalDecision}</td>
      </Col>
      <Col id="acceptanceDecision" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs text-slate-700">{p.acceptanceDecision}</td>
      </Col>

      <Col id="budget" visible={visibleColumns}>
        <td className="px-2 py-1.5 text-right align-top font-mono text-xs font-bold text-slate-700">
          {p.budget?.toLocaleString('vi-VN')}
        </td>
      </Col>
      <Col id="budgetLumpSum" visible={visibleColumns}>
        <td className="px-2 py-1.5 text-right align-top font-mono text-xs text-slate-600">
          {p.budgetLumpSum?.toLocaleString('vi-VN')}
        </td>
      </Col>
      <Col id="budgetNonLumpSum" visible={visibleColumns}>
        <td className="px-2 py-1.5 text-right align-top font-mono text-xs text-slate-600">
          {p.budgetNonLumpSum?.toLocaleString('vi-VN')}
        </td>
      </Col>
      <Col id="budgetOtherSources" visible={visibleColumns}>
        <td className="px-2 py-1.5 text-right align-top font-mono text-xs text-slate-600">
          {p.budgetOtherSources?.toLocaleString('vi-VN')}
        </td>
      </Col>
      <Col id="budgetBatch1" visible={visibleColumns}>
        <td className="px-2 py-1.5 text-right align-top font-mono text-xs">
          {p.budgetBatch1?.toLocaleString('vi-VN')}
        </td>
      </Col>
      <Col id="budgetBatch2" visible={visibleColumns}>
        <td className="px-2 py-1.5 text-right align-top font-mono text-xs">
          {p.budgetBatch2?.toLocaleString('vi-VN')}
        </td>
      </Col>
      <Col id="budgetBatch3" visible={visibleColumns}>
        <td className="px-2 py-1.5 text-right align-top font-mono text-xs">
          {p.budgetBatch3?.toLocaleString('vi-VN')}
        </td>
      </Col>

      <Col id="duration" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs text-slate-700">{p.duration}</td>
      </Col>
      <Col id="startDate" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs text-slate-600">{formatDate(p.startDate)}</td>
      </Col>
      <Col id="endDate" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs text-slate-600">{formatDate(p.endDate)}</td>
      </Col>
      <Col id="extensionDate" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs font-medium text-amber-600">
          {formatDate(p.extensionDate)}
        </td>
      </Col>

      <Col id="reviewReportingDate" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs">{formatDate(p.reviewReportingDate)}</td>
      </Col>
      <Col id="progressReportDate1" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs">{formatDate(p.progressReportDate1)}</td>
      </Col>
      <Col id="progressReportDate2" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs">{formatDate(p.progressReportDate2)}</td>
      </Col>
      <Col id="progressReportDate3" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs">{formatDate(p.progressReportDate3)}</td>
      </Col>
      <Col id="progressReportDate4" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs">{formatDate(p.progressReportDate4)}</td>
      </Col>
      <Col id="progressStatus" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top">{getProgressBadge(p.progressStatus)}</td>
      </Col>
      <Col id="progressReportNote" visible={visibleColumns}>
        <td
          className="max-w-[200px] px-2 py-1.5 align-top text-xs whitespace-normal break-words"
          title={p.progressReportNote}
        >
          {p.progressReportNote}
        </td>
      </Col>
      <Col id="acceptanceMeetingDate" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs">{formatDate(p.acceptanceMeetingDate)}</td>
      </Col>

      <Col id="outputProduct" visible={visibleColumns}>
        <td
          className="max-w-[200px] px-2 py-1.5 align-top text-xs whitespace-normal break-words"
          title={p.outputProduct}
        >
          {p.outputProduct}
        </td>
      </Col>
      <Col id="status" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top">{getStatusBadge(p.status)}</td>
      </Col>

      <Col id="acceptanceYear" visible={visibleColumns}>
        <td className="px-2 py-1.5 text-center align-top text-xs">{p.acceptanceYear}</td>
      </Col>
      <Col id="acceptanceAcademicYear" visible={visibleColumns}>
        <td className="px-2 py-1.5 text-center align-top text-xs">{p.acceptanceAcademicYear}</td>
      </Col>

      <Col id="expectedProducts" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs">
          {(p.expectedProducts || []).reduce((a, b) => a + b.count, 0)} sản phẩm
        </td>
      </Col>
      <Col id="actualProducts" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs">
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
      </Col>

      <Col id="reminderDate" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs">{formatDate(p.reminderDate)}</td>
      </Col>
      <Col id="acceptanceCompletionDate" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs">{formatDate(p.acceptanceCompletionDate)}</td>
      </Col>
      <Col id="supervisorId" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs text-slate-700" title={supervisorEmail}>
          {supervisorEmail}
        </td>
      </Col>
      <Col id="reviewBatch" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs text-slate-700">{p.reviewBatch}</td>
      </Col>
      <Col id="isTransferred" visible={visibleColumns}>
        <td className="px-2 py-1.5 text-center align-top text-xs">{p.isTransferred ? '☑' : ''}</td>
      </Col>
      <Col id="terminationReason" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs text-red-600">{p.terminationReason}</td>
      </Col>
      <Col id="generalNotes" visible={visibleColumns}>
        <td
          className="max-w-[200px] px-2 py-1.5 align-top text-xs whitespace-normal break-words"
          title={p.generalNotes}
        >
          {p.generalNotes}
        </td>
      </Col>

      <td className="sticky right-0 z-10 bg-white px-2 py-1.5 align-top group-hover:bg-blue-50/50">
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onView(p)}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600
                       hover:bg-blue-100"
            title="Xem chi tiết"
          >
            <EyeIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(p)}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-50 text-amber-600
                       hover:bg-amber-100"
            title="Chỉnh sửa"
          >
            <PencilIcon className="h-3.5 w-3.5" />
          </button>
          {canDelete ? (
            <button
              type="button"
              onClick={() => onDelete(p.id)}
              className="flex h-6 w-6 items-center justify-center rounded-md bg-red-50 text-red-500
                         hover:bg-red-100"
              title="Xóa"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </td>

      <Col id="history" visible={visibleColumns}>
        <td className="px-2 py-1.5 align-top text-xs text-slate-500">
          {p.history?.[0] ? (
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-slate-700">@{p.history[0].user}</span>
              <span className="text-slate-500">
                {(() => {
                  const d = new Date(p.history[0].timestamp);
                  if (Number.isNaN(d.getTime())) return p.history[0].timestamp;
                  return d.toLocaleString('vi-VN');
                })()}
              </span>
              <span className="line-clamp-2 text-slate-400">{p.history[0].action}</span>
            </div>
          ) : (
            '---'
          )}
        </td>
      </Col>
    </tr>
  );
}
