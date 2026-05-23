import { FieldLabel } from './FieldLabel.js';
import { SectionHeader } from './SectionHeader.js';
import { inputBase } from './formStyles.js';
import type { DataEntryFormData } from './types.js';

type Props = {
  form: DataEntryFormData;
  setField: <K extends keyof DataEntryFormData>(key: K, value: DataEntryFormData[K]) => void;
  setProductCount: (productId: string, kind: 'committed' | 'actual', value: string) => void;
};

export function ProductDetailSection({ form, setField, setProductCount }: Props) {
  return (
    <section>
      <SectionHeader number={7} title="Sản phẩm chi tiết" />

      <div className="grid grid-cols-1 gap-6 divide-y divide-slate-200 lg:grid-cols-2 lg:divide-x lg:divide-y-0 lg:divide-slate-200">
        <div className="lg:pr-3">
          <h4 className="mb-3 text-sm font-semibold text-slate-700">Sản phẩm Cam kết</h4>
          <div className="max-h-60 space-y-1.5 overflow-y-auto pr-1">
            {form.products.map((row) => (
              <div
                key={`c-${row.id}`}
                className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2"
              >
                <span className="text-xs text-slate-600">{row.label}</span>
                <input
                  type="number"
                  min={0}
                  value={row.committed}
                  onChange={(e) => setProductCount(row.id, 'committed', e.target.value)}
                  className="w-12 rounded-md border border-slate-200 bg-white py-1 text-center text-xs"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 lg:pt-0 lg:pl-3">
          <h4 className="mb-3 text-sm font-semibold text-slate-700">Sản phẩm Thực tế</h4>
          <div className="max-h-60 space-y-1.5 overflow-y-auto pr-1">
            {form.products.map((row) => (
              <div
                key={`a-${row.id}`}
                className="flex items-center justify-between gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2"
              >
                <span className="text-xs text-emerald-700">{row.label}</span>
                <input
                  type="number"
                  min={0}
                  value={row.actual}
                  onChange={(e) => setProductCount(row.id, 'actual', e.target.value)}
                  className="w-12 rounded-md border border-emerald-200 bg-white py-1 text-center text-xs font-semibold text-emerald-700 focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 lg:col-span-2">
        <FieldLabel htmlFor="product-detail">Chi tiết Sản phẩm thực tế (Tên bài báo, số hiệu, ...)</FieldLabel>
        <textarea
          id="product-detail"
          value={form.productActualDetail}
          onChange={(e) => setField('productActualDetail', e.target.value)}
          placeholder="Vui lòng ghi rõ chi tiết sản phẩm..."
          rows={4}
          className={`${inputBase} min-h-[6rem] resize-y`}
        />
      </div>
    </section>
  );
}
