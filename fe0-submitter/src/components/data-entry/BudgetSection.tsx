import { BudgetMismatchWarning } from './BudgetMismatchWarning.js';
import { FieldLabel } from './FieldLabel.js';
import { SectionHeader } from './SectionHeader.js';
import { inputBase } from './formStyles.js';
import type { DataEntryFormData } from './types.js';

type Props = {
  form: DataEntryFormData;
  setField: <K extends keyof DataEntryFormData>(key: K, value: DataEntryFormData[K]) => void;
};

const num = {
  className: `${inputBase} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`,
};

export function BudgetSection({ form, setField }: Props) {
  return (
    <section>
      <SectionHeader number={4} title="Kinh phí (VNĐ)" />

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <FieldLabel htmlFor="total-budget">Tổng Kinh phí</FieldLabel>
            <input
              id="total-budget"
              type="number"
              min={0}
              value={form.totalBudget}
              onChange={(e) => setField('totalBudget', e.target.value)}
              className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm font-black text-blue-700 transition-colors duration-150 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <FieldLabel htmlFor="khoan">Kinh phí khoán</FieldLabel>
            <input
              id="khoan"
              type="number"
              min={0}
              value={form.contractedBudget}
              onChange={(e) => setField('contractedBudget', e.target.value)}
              className={num.className}
            />
          </div>
          <div>
            <FieldLabel htmlFor="non-khoan">KP Không khoán</FieldLabel>
            <input
              id="non-khoan"
              type="number"
              min={0}
              value={form.nonContractedBudget}
              onChange={(e) => setField('nonContractedBudget', e.target.value)}
              className={num.className}
            />
          </div>
          <div>
            <FieldLabel htmlFor="other-fund">Nguồn khác</FieldLabel>
            <input
              id="other-fund"
              type="number"
              min={0}
              value={form.otherFunding}
              onChange={(e) => setField('otherFunding', e.target.value)}
              className={num.className}
            />
          </div>
        </div>

        <div className="mt-4 border-t border-slate-200 pt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="hidden lg:block" aria-hidden />
            <div>
              <FieldLabel htmlFor="dot1">Cấp Đợt 1</FieldLabel>
              <input
                id="dot1"
                type="number"
                min={0}
                value={form.installment1}
                onChange={(e) => setField('installment1', e.target.value)}
                className={num.className}
              />
            </div>
            <div>
              <FieldLabel htmlFor="dot2">Cấp Đợt 2</FieldLabel>
              <input
                id="dot2"
                type="number"
                min={0}
                value={form.installment2}
                onChange={(e) => setField('installment2', e.target.value)}
                className={num.className}
              />
            </div>
            <div>
              <FieldLabel htmlFor="dot3">Cấp Đợt 3</FieldLabel>
              <input
                id="dot3"
                type="number"
                min={0}
                value={form.installment3}
                onChange={(e) => setField('installment3', e.target.value)}
                className={num.className}
              />
            </div>
          </div>
        </div>

        <BudgetMismatchWarning
          totalBudget={form.totalBudget}
          contractedBudget={form.contractedBudget}
          nonContractedBudget={form.nonContractedBudget}
          otherFunding={form.otherFunding}
        />
      </div>
    </section>
  );
}
