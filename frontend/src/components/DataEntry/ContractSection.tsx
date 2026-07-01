import { DateField } from './DateField.js';
import { FieldLabel } from './FieldLabel.js';
import { SectionHeader } from './SectionHeader.js';
import { formatProjectCodeInput } from './projectCodeFormat.js';
import { inputBase, inputError } from './formStyles.js';
import type { DataEntryFormData, FormErrors } from './types.js';

type Props = {
  form: DataEntryFormData;
  errors: FormErrors;
  setField: <K extends keyof DataEntryFormData>(key: K, value: DataEntryFormData[K]) => void;
};

export function ContractSection({ form, errors, setField }: Props) {
  return (
    <section>
      <SectionHeader number={1} title="Hợp đồng & Giấy chứng nhận" first />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="contract-number" required>
                Số Hợp đồng
              </FieldLabel>
              <input
                id="contract-number"
                type="text"
                value={form.contractNumber}
                onChange={(e) => setField('contractNumber', e.target.value)}
                placeholder="51/2023/HĐ-ĐHYD kỳ ngày 20/3/2023"
                className={`${inputBase} font-bold ${errors.contractNumber ? inputError : ''}`}
                aria-invalid={Boolean(errors.contractNumber)}
              />
              {errors.contractNumber ? (
                <p className="mt-1 text-[10px] text-red-500">{errors.contractNumber}</p>
              ) : null}
            </div>

            <div>
              <FieldLabel htmlFor="contract-appendix">Phụ lục hợp đồng</FieldLabel>
              <input
                id="contract-appendix"
                type="text"
                value={form.contractAppendix}
                onChange={(e) => setField('contractAppendix', e.target.value)}
                placeholder="PL01/2023/HĐ-ĐHYD"
                className={`${inputBase} font-bold ${errors.contractAppendix ? inputError : ''}`}
                aria-invalid={Boolean(errors.contractAppendix)}
              />
              {errors.contractAppendix ? (
                <p className="mt-1 text-[10px] text-red-500">{errors.contractAppendix}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-3">
            <FieldLabel htmlFor="project-code">Mã đề tài</FieldLabel>
            <input
              id="project-code"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={form.projectCode}
              onChange={(e) =>
                setField('projectCode', formatProjectCodeInput(e.target.value))
              }
              placeholder="2024.03.20.001"
              className={`${inputBase} font-mono font-bold ${errors.projectCode ? inputError : ''}`}
              aria-invalid={Boolean(errors.projectCode)}
              aria-describedby="project-code-hint"
            />
            <p id="project-code-hint" className="mt-1 text-[10px] text-slate-500">
              Định dạng: aaaa.bb.cc.ddd
            </p>
            {errors.projectCode ? (
              <p className="mt-1 text-[10px] text-red-500">{errors.projectCode}</p>
            ) : null}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 lg:col-span-2">
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
      </div>
    </section>
  );
}
