import { DateField } from './DateField.js';
import { FieldLabel } from './FieldLabel.js';
import { SectionHeader } from './SectionHeader.js';
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

          <div className="mt-3 flex flex-wrap items-end gap-3">
            <span className="pb-2 text-[10px] font-medium uppercase text-slate-500">Ngày ký:</span>
            <div className="min-w-[10rem] flex-1">
              <DateField
                id="contract-signed"
                label="Ngày ký hợp đồng"
                noLabel
                valueIso={form.contractSignedAt}
                onChangeIso={(v) => setField('contractSignedAt', v)}
              />
            </div>
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
