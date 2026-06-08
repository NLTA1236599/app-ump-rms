import type { ResearchProject } from '../DataTable/types.js';

import { InfoCircleIcon } from './icons.js';
import { InfoField } from './InfoField.js';
import { getWorkflowPhaseBadge } from './workflowStatus.js';

type InfoSectionsProps = {
  project: ResearchProject;
  currentStep: number;
  isEditing?: boolean;
  editData?: Partial<ResearchProject>;
  onEditDataChange?: (patch: Partial<ResearchProject>) => void;
  onEdit: () => void;
};

function categoriesDisplay(categories?: string[] | string): string {
  if (!categories) return '---';
  return Array.isArray(categories) ? categories.join(', ') : String(categories);
}

function ProductPills({
  items,
  tone,
}: {
  items?: { type: string; count: number }[];
  tone: 'expected' | 'actual';
}) {
  if (!items?.length) return <span className="font-semibold text-slate-700">---</span>;

  const pillClass =
    tone === 'expected'
      ? 'bg-blue-50 text-blue-700 border-blue-100'
      : 'bg-emerald-50 text-emerald-700 border-emerald-100';

  return (
    <div className="mt-1 flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span
          key={`${item.type}-${i}`}
          className={`rounded border px-2 py-1 text-xs font-semibold ${pillClass}`}
        >
          {item.type}: {item.count}
        </span>
      ))}
    </div>
  );
}

function SectionHeading({
  title,
  accent,
}: {
  title: string;
  accent: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
}) {
  const accentClass = {
    blue: 'border-blue-500',
    emerald: 'border-emerald-500',
    amber: 'border-amber-500',
    purple: 'border-purple-500',
    rose: 'border-rose-500',
  }[accent];

  return (
    <h4 className={`mb-4 border-l-4 pl-2 text-sm font-bold text-slate-800 ${accentClass}`}>
      {title}
    </h4>
  );
}

export function InfoSections({
  project,
  currentStep,
  isEditing = false,
  editData = {},
  onEditDataChange,
  onEdit,
}: InfoSectionsProps) {
  const data = isEditing ? { ...project, ...editData } : project;
  const phaseBadge = getWorkflowPhaseBadge(currentStep);
  const categories = data.categories;

  const field = (
    label: string,
    key: keyof ResearchProject,
    opts?: { isCurrency?: boolean; isDate?: boolean; className?: string; type?: string },
  ) => (
    <InfoField
      label={label}
      value={data[key]}
      isEditing={isEditing}
      isCurrency={opts?.isCurrency}
      isDate={opts?.isDate}
      type={opts?.type}
      className={opts?.className}
      onChange={(val) => onEditDataChange?.({ [key]: val })}
    />
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <InfoCircleIcon className="h-5 w-5 text-blue-500" />
          Thông tin chi tiết đề tài
        </h3>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600
                     hover:bg-blue-100"
        >
          Chỉnh sửa thông tin
        </button>
      </div>

      <SectionHeading title="I. Thông tin chung" accent="blue" />
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
        <div className="lg:col-span-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            {field('Tên đề tài', 'title', { className: 'flex-1 min-w-[200px]' })}
            {!isEditing && (
              <span
                className={`mt-5 rounded-lg border px-3 py-1 text-xs font-bold ${phaseBadge.className}`}
              >
                {phaseBadge.label}
              </span>
            )}
          </div>
        </div>
        {field('Chủ nhiệm', 'leadAuthor')}
        {field('Giới tính', 'leadAuthorGender')}
        {field('Năm sinh', 'leadAuthorBirthYear')}
        {field('Khoa/Đơn vị', 'department')}
        {field('Bộ môn', 'subDepartment')}
        {field('Lĩnh vực NC', 'researchField')}
        {field('Loại hình NC', 'researchType')}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-tight text-slate-500">
            Loại đề tài
          </p>
          {isEditing ? (
            <input
              type="text"
              value={categoriesDisplay(categories)}
              onChange={(e) =>
                onEditDataChange?.({
                  categories: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm font-semibold
                         focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <div className="mt-1 flex flex-wrap gap-1">
              {(Array.isArray(categories) ? categories : categories ? [String(categories)] : []).map(
                (tag, i) => (
                  <span
                    key={`${tag}-${i}`}
                    className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5
                               text-[10px] text-slate-600"
                  >
                    {tag}
                  </span>
                ),
              )}
              {!categories ||
                (Array.isArray(categories) && categories.length === 0) ? (
                <span className="font-semibold text-slate-700">---</span>
              ) : null}
            </div>
          )}
        </div>
        {field('Thành viên NC', 'members', {
          className: 'md:col-span-2 lg:col-span-3',
        })}
      </div>

      <SectionHeading title="II. Hợp đồng & Quyết định" accent="emerald" />
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {field('Số Hợp đồng', 'contractId')}
        {field('Ngày ký HĐ', 'contractDate', { isDate: true })}
        {field('QĐ Xét duyệt', 'approvalDecision')}
        {field('QĐ Phê duyệt', 'authorizationDecision')}
        {field('Số GCN kết quả', 'certificateResultNumber')}
        {field('Ngày cấp GCN', 'certificateResultDate', { isDate: true })}
        {field('Cơ quan cấp GCN', 'certificateResultIssuingAuthority', {
          className: 'md:col-span-2',
        })}
      </div>

      <SectionHeading title="III. Kinh phí & Phân bổ" accent="amber" />
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        {field('Tổng kinh phí', 'budget', { isCurrency: true, className: 'font-bold text-blue-700' })}
        {field('Kinh phí khoán', 'budgetLumpSum', { isCurrency: true })}
        {field('Kinh phí không khoán', 'budgetNonLumpSum', { isCurrency: true })}
        {field('Nguồn khác', 'budgetOtherSources', { isCurrency: true })}
        {field('Cấp đợt 1', 'budgetBatch1', { isCurrency: true })}
        {field('Cấp đợt 2', 'budgetBatch2', { isCurrency: true })}
        {field('Cấp đợt 3', 'budgetBatch3', { isCurrency: true })}
      </div>

      <SectionHeading title="IV. Thời gian & Tiến độ" accent="purple" />
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {field('Thời gian TH', 'duration')}
        {field('Bắt đầu', 'startDate', { isDate: true })}
        {field('Kết thúc', 'endDate', { isDate: true })}
        {field('Gia hạn', 'extensionDate', { isDate: true, className: 'text-amber-600' })}
        {field('Tiến độ thực hiện', 'progressStatus')}
        {field('Báo cáo Giám định', 'reviewReportingDate', { isDate: true })}
        {field('BC Tiến độ 1', 'progressReportDate1', { isDate: true })}
        {field('BC Tiến độ 2', 'progressReportDate2', { isDate: true })}
        {field('BC Tiến độ 3', 'progressReportDate3', { isDate: true })}
        {field('BC Tiến độ 4', 'progressReportDate4', { isDate: true })}
        {field('Ngày nhắc', 'reminderDate', { isDate: true })}
        {field('Ghi chú báo cáo', 'progressReportNote', {
          className: 'md:col-span-2 lg:col-span-3',
        })}
      </div>

      <SectionHeading title="V. Nghiệm thu & Sản phẩm" accent="rose" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {field('Ngày họp NT', 'acceptanceMeetingDate', { isDate: true })}
        {field('Thời điểm NT', 'acceptanceCompletionDate', { isDate: true })}
        {field('Năm nghiệm thu', 'acceptanceYear')}
        {field('Năm học NT', 'acceptanceAcademicYear')}
        {field('Sản phẩm đầu ra', 'outputProduct', { className: 'md:col-span-2' })}
        {field('Chi tiết SP thực tế', 'actualProductDetails', { className: 'md:col-span-2' })}
        <div className="md:col-span-2">
          <p className="text-[11px] font-bold uppercase tracking-tight text-slate-500">
            Sản phẩm cam kết
          </p>
          <ProductPills items={data.expectedProducts} tone="expected" />
        </div>
        <div className="md:col-span-2">
          <p className="text-[11px] font-bold uppercase tracking-tight text-slate-500">
            Sản phẩm thực tế
          </p>
          <ProductPills items={data.actualProducts} tone="actual" />
        </div>
        {field('Lý do thanh lý', 'terminationReason', {
          className: 'md:col-span-2 lg:col-span-2',
        })}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-tight text-slate-500">
            Đề tài chuyển tiếp
          </p>
          <input
            type="checkbox"
            checked={Boolean(data.isTransferred)}
            disabled={!isEditing}
            onChange={(e) => onEditDataChange?.({ isTransferred: e.target.checked })}
            className="mt-2 h-4 w-4 rounded border-slate-300 text-blue-600"
          />
        </div>
      </div>
    </div>
  );
}
