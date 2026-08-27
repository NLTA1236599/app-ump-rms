import { DateField } from './DateField.js';
import { FacultyUnitSelector } from './FacultyUnitSelector.js';
import { FieldLabel } from './FieldLabel.js';
import { SectionHeader } from './SectionHeader.js';
import {
  PROJECT_CODE_FIXED_PART,
  formatProjectCodeSeq,
  resolveProjectCodeSeq,
  resolveProjectCodeUnit,
  resolveProjectCodeYear,
} from './projectCodeFormat.js';
import { CONTRACT_FIXED_PART, resolveAppendixYear, resolveContractSeq, resolveContractYear } from './contractNumberFormat.js';
import { inputBase, inputError } from './formStyles.js';
import type { DataEntryFormData, FormErrors } from './types.js';

type Props = {
  form: DataEntryFormData;
  errors: FormErrors;
  setField: <K extends keyof DataEntryFormData>(key: K, value: DataEntryFormData[K]) => void;
  setFacultyUnit: (unit: string) => void;
};

const partInput =
  'w-16 rounded-lg border border-slate-200 bg-white px-2 py-2 text-center text-xs font-bold text-slate-800 transition-colors duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500';

export function ContractSection({ form, errors, setField, setFacultyUnit }: Props) {
  const seqLocked = Boolean(form.sequenceNumber.trim()) || form.projectStatus === 'new_registration';
  const yearFromBatch = resolveContractYear(form);
  const yearLocked = Boolean(form.reviewBatch.trim() && yearFromBatch);
  const seqValue = resolveContractSeq(form);
  const yearValue = yearFromBatch;
  const hasError = Boolean(errors.contractNumber || errors.contractSignedAt);
  const codeYear = resolveProjectCodeYear(form);
  const codeUnit = resolveProjectCodeUnit(form);
  const codeSeq = formatProjectCodeSeq(resolveProjectCodeSeq(form));
  const appendixYear = resolveAppendixYear(form);
  const appendixError = Boolean(errors.contractAppendix);

  return (
    <section>
      <SectionHeader number={1} title="Hợp đồng & Giấy chứng nhận" first />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div id="contract-number">
            <FieldLabel htmlFor="contract-seq">
              Số Hợp đồng
            </FieldLabel>
            <div className="flex flex-wrap items-center gap-1.5">
              <input
                id="contract-seq"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={seqValue}
                readOnly={seqLocked}
                placeholder="STT"
                title="Số thứ tự đề tài trong năm xét duyệt"
                onChange={(e) => setField('contractSeq', e.target.value.replace(/\D/g, ''))}
                className={`${partInput} ${hasError ? inputError : ''} ${seqLocked ? 'cursor-default bg-slate-50 text-blue-700' : ''}`}
                aria-invalid={Boolean(errors.contractNumber)}
                aria-label="Số thứ tự hợp đồng"
              />
              <span className="text-sm font-bold text-slate-400">/</span>
              <input
                id="contract-year"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={yearValue}
                readOnly={yearLocked}
                placeholder="Năm"
                title="Năm xét duyệt đề tài"
                maxLength={4}
                onChange={(e) => setField('contractYear', e.target.value.replace(/\D/g, '').slice(0, 4))}
                className={`${partInput} ${hasError ? inputError : ''} ${yearLocked ? 'cursor-default bg-slate-50' : ''}`}
                aria-label="Năm xét duyệt trên hợp đồng"
              />
              <span className="text-sm font-bold text-slate-400">/</span>
              <span className="whitespace-nowrap rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">
                {CONTRACT_FIXED_PART}
              </span>
              <span className="whitespace-nowrap px-1 text-xs font-medium text-slate-500">ký ngày</span>
              <div className="min-w-[9.5rem] flex-1">
                <DateField
                  id="contract-signed-at"
                  label="Ngày ký hợp đồng"
                  noLabel
                  valueIso={form.contractSignedAt}
                  onChangeIso={(v) => setField('contractSignedAt', v)}
                  error={errors.contractSignedAt}
                />
              </div>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              Định dạng: số thứ tự / năm xét duyệt / {CONTRACT_FIXED_PART} ký ngày dd/mm/yyyy
            </p>
            {errors.contractNumber ? (
              <p className="mt-1 text-[10px] text-red-500">{errors.contractNumber}</p>
            ) : null}
          </div>

          <div className="mt-3" id="contract-appendix">
            <FieldLabel htmlFor="contract-appendix-seq">Phụ lục hợp đồng</FieldLabel>
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-bold text-slate-700"
                title="Tiền tố cố định"
              >
                PL
              </span>
              <input
                id="contract-appendix-seq"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={form.contractAppendixSeq}
                placeholder="01"
                title="Số phụ lục"
                onChange={(e) => setField('contractAppendixSeq', e.target.value.replace(/\D/g, ''))}
                className={`${partInput} ${appendixError ? inputError : ''}`}
                aria-invalid={appendixError}
                aria-label="Số phụ lục hợp đồng"
              />
              <span className="text-sm font-bold text-slate-400">/</span>
              <input
                id="contract-appendix-year"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={appendixYear}
                placeholder="Năm"
                title="Năm trên phụ lục — có thể chỉnh"
                maxLength={4}
                onChange={(e) =>
                  setField('contractAppendixYear', e.target.value.replace(/\D/g, '').slice(0, 4))
                }
                className={`${partInput} ${appendixError ? inputError : ''}`}
                aria-invalid={appendixError}
                aria-label="Năm trên phụ lục hợp đồng"
              />
              <span className="text-sm font-bold text-slate-400">/</span>
              <span className="whitespace-nowrap rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">
                {CONTRACT_FIXED_PART}
              </span>
              <span className="whitespace-nowrap px-1 text-xs font-medium text-slate-500">ký ngày</span>
              <div className="min-w-[9.5rem] flex-1">
                <DateField
                  id="contract-appendix-signed-at"
                  label="Ngày ký phụ lục"
                  noLabel
                  valueIso={form.contractAppendixSignedAt}
                  onChangeIso={(v) => setField('contractAppendixSignedAt', v)}
                  error={errors.contractAppendixSignedAt}
                />
              </div>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              Định dạng: PL + số phụ lục / năm / {CONTRACT_FIXED_PART} ký ngày dd/mm/yyyy
            </p>
            {errors.contractAppendix ? (
              <p className="mt-1 text-[10px] text-red-500">{errors.contractAppendix}</p>
            ) : null}
          </div>

          <div className="mt-3">
            <FieldLabel htmlFor="project-code-year">Mã đề tài</FieldLabel>
            <div id="project-code" className="flex flex-wrap items-center gap-1.5">
              <input
                id="project-code-year"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={codeYear}
                readOnly
                placeholder="Năm"
                title="Năm xét duyệt đề tài"
                className={`${partInput} cursor-default bg-slate-50 ${errors.projectCode ? inputError : ''}`}
                aria-invalid={Boolean(errors.projectCode)}
                aria-label="Năm xét duyệt trên mã đề tài"
              />
              <span className="text-sm font-bold text-slate-400">.</span>
              <span
                className="w-12 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-center text-xs font-bold text-slate-700"
                title="Phần cố định"
              >
                {PROJECT_CODE_FIXED_PART}
              </span>
              <span className="text-sm font-bold text-slate-400">.</span>
              <input
                id="project-code-unit"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={codeUnit}
                readOnly
                placeholder="ĐV"
                title="Mã đơn vị theo Đơn vị chủ trì"
                className={`${partInput} cursor-default bg-slate-50 ${errors.projectCode ? inputError : ''}`}
                aria-label="Mã đơn vị trên mã đề tài"
              />
              <span className="text-sm font-bold text-slate-400">.</span>
              <input
                id="project-code-seq"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={codeSeq}
                readOnly
                placeholder="STT"
                title="Số thứ tự đề tài trong năm xét duyệt"
                className={`${partInput} cursor-default bg-slate-50 font-mono ${
                  codeSeq ? 'text-blue-700' : ''
                } ${errors.projectCode ? inputError : ''}`}
                aria-label="Số thứ tự trên mã đề tài"
              />
            </div>
            <p id="project-code-hint" className="mt-1 text-[10px] text-slate-500">
              Năm lấy từ đợt xét duyệt · {PROJECT_CODE_FIXED_PART} cố định · mã đơn vị theo Đơn vị chủ trì · STT năm xét duyệt
            </p>
            {errors.projectCode ? (
              <p className="mt-1 text-[10px] text-red-500">{errors.projectCode}</p>
            ) : null}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              Giấy chứng nhận đăng ký kết quả
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div>
                <FieldLabel htmlFor="gcn-number">Số GCN</FieldLabel>
                <input
                  id="gcn-number"
                  type="text"
                  value={form.gcnNumber}
                  onChange={(e) => setField('gcnNumber', e.target.value)}
                  placeholder="Số GCN"
                  className={inputBase}
                />
              </div>
              <DateField
                id="gcn-date"
                label="Ngày cấp"
                valueIso={form.gcnIssuedAt}
                onChangeIso={(v) => setField('gcnIssuedAt', v)}
              />
              <div>
                <FieldLabel htmlFor="gcn-place">Nơi cấp</FieldLabel>
                <input
                  id="gcn-place"
                  type="text"
                  value={form.gcnPlace}
                  onChange={(e) => setField('gcnPlace', e.target.value)}
                  placeholder="Nơi cấp"
                  className={inputBase}
                />
              </div>
            </div>
          </div>
          <div className="mt-3">
            <FacultyUnitSelector
              selected={form.facultyUnits}
              onChange={setFacultyUnit}
              error={errors.facultyUnits}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
