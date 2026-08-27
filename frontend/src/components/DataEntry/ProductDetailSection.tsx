import type { ReactNode } from 'react';

import { inputBase } from './formStyles.js';
import { SectionHeader } from './SectionHeader.js';
import {
  createEmptyTypeIIIRow,
  createEmptyTypeIIRow,
  createEmptyTypeIRow,
  IP_SECTION_TITLE,
  PRODUCT_TYPE_II_CAPTION,
  PRODUCT_TYPE_I_CAPTION,
  TRAINING_SECTION_TITLE,
  type ProductTypeIIIRow,
  type ProductTypeIIRow,
  type ProductTypeIRow,
  type TrainingResultRow,
} from './productDetailTypes.js';
import type { DataEntryFormData } from './types.js';

type Props = {
  form: DataEntryFormData;
  setField: <K extends keyof DataEntryFormData>(key: K, value: DataEntryFormData[K]) => void;
};

const th =
  'border border-slate-300 bg-slate-100 px-1.5 py-1.5 text-center text-[11px] font-semibold leading-snug text-slate-700';
const numTh =
  'border border-slate-300 bg-slate-50 px-1 py-0.5 text-center text-[10px] italic text-slate-500';
const td = 'border border-slate-300 p-0 align-middle';
const sttTd =
  'border border-slate-300 px-1 py-1 text-center align-middle text-[11px] font-medium text-slate-600';

const cellInput =
  'w-full min-w-0 resize-none border-0 bg-transparent px-1.5 py-1.5 text-xs text-slate-800 outline-none focus:bg-blue-50/70';
const cellInputActual =
  'w-full min-w-0 resize-none border-0 bg-emerald-50/40 px-1.5 py-1.5 text-xs font-medium text-emerald-800 outline-none focus:bg-emerald-50';
const thActual =
  'border border-emerald-300 bg-emerald-50 px-1.5 py-1.5 text-center text-[11px] font-semibold leading-snug text-emerald-800';
const numThActual =
  'border border-emerald-200 bg-emerald-50/70 px-1 py-0.5 text-center text-[10px] italic text-emerald-700';

function CellInput({
  value,
  onChange,
  multiline,
  className = '',
  inputMode,
  actual,
}: {
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  className?: string;
  inputMode?: 'numeric' | 'text';
  actual?: boolean;
}) {
  const base = actual ? cellInputActual : cellInput;
  if (multiline) {
    return (
      <textarea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${base} ${className}`}
      />
    );
  }
  return (
    <input
      type={inputMode === 'numeric' ? 'number' : 'text'}
      min={inputMode === 'numeric' ? 0 : undefined}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${base} ${className}`}
    />
  );
}

function Caption({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-t-lg border border-b-0 border-slate-300 bg-slate-100 px-3 py-2 text-xs font-semibold leading-relaxed text-slate-800">
      {children}
    </div>
  );
}

function AddRowButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px]
                 font-semibold uppercase tracking-wide text-blue-700 transition-colors hover:bg-blue-100"
    >
      + {label}
    </button>
  );
}

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-1.5 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50"
      aria-label={label}
    >
      Xóa
    </button>
  );
}

export function ProductDetailSection({ form, setField }: Props) {
  const updateTypeI = (id: string, patch: Partial<ProductTypeIRow>) => {
    setField(
      'productTypeI',
      form.productTypeI.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };
  const updateTypeII = (id: string, patch: Partial<ProductTypeIIRow>) => {
    setField(
      'productTypeII',
      form.productTypeII.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };
  const updateTypeIII = (id: string, patch: Partial<ProductTypeIIIRow>) => {
    setField(
      'productTypeIII',
      form.productTypeIII.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };
  const updateTraining = (id: TrainingResultRow['id'], patch: Partial<TrainingResultRow>) => {
    setField(
      'trainingResults',
      form.trainingResults.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };

  const removeTypeI = (id: string) => {
    const next = form.productTypeI.filter((row) => row.id !== id);
    setField('productTypeI', next.length > 0 ? next : [createEmptyTypeIRow()]);
  };
  const removeTypeII = (id: string) => {
    const next = form.productTypeII.filter((row) => row.id !== id);
    setField('productTypeII', next.length > 0 ? next : [createEmptyTypeIIRow()]);
  };
  const removeTypeIII = (id: string) => {
    const next = form.productTypeIII.filter((row) => row.id !== id);
    setField('productTypeIII', next.length > 0 ? next : [createEmptyTypeIIIRow()]);
  };

  return (
    <section>
      <SectionHeader number={7} title="Sản phẩm chi tiết" />

      <div className="space-y-6">
        <div>
          <Caption>{PRODUCT_TYPE_I_CAPTION}</Caption>
          <div className="overflow-x-auto rounded-b-lg border border-slate-300">
            <table className="w-full min-w-[960px] border-collapse">
              <thead>
                <tr>
                  <th className={th} rowSpan={3} style={{ width: '3rem' }}>
                    Số TT
                  </th>
                  <th className={th} rowSpan={3}>
                    Tên sản phẩm cụ thể và chỉ tiêu chất lượng chủ yếu của sản phẩm
                  </th>
                  <th className={th} rowSpan={3} style={{ width: '6.5rem' }}>
                    Đơn vị đo
                  </th>
                  <th className={th} colSpan={3}>
                    Mức chất lượng
                  </th>
                  <th className={th} rowSpan={3} style={{ width: '8rem' }}>
                    Dự kiến số lượng/quy mô sản phẩm tạo ra
                  </th>
                  <th className={thActual} rowSpan={3} style={{ width: '8.5rem' }}>
                    Sản phẩm thực tế
                  </th>
                  <th className={th} rowSpan={3} style={{ width: '3.25rem' }} />
                </tr>
                <tr>
                  <th className={th} rowSpan={2} style={{ width: '7rem' }}>
                    Cần đạt
                  </th>
                  <th className={th} colSpan={2}>
                    Mẫu tương tự (theo các tiêu chuẩn mới nhất)
                  </th>
                </tr>
                <tr>
                  <th className={th} style={{ width: '7rem' }}>
                    Trong nước
                  </th>
                  <th className={th} style={{ width: '7rem' }}>
                    Thế giới
                  </th>
                </tr>
                <tr>
                  {['(1)', '(2)', '(3)', '(4)', '(5)', '(6)', '(7)', '(8)'].map((n) => (
                    <th key={n} className={n === '(8)' ? numThActual : numTh}>
                      {n}
                    </th>
                  ))}
                  <th className={numTh} />
                </tr>
              </thead>
              <tbody>
                {form.productTypeI.map((row, index) => (
                  <tr key={row.id}>
                    <td className={sttTd}>{index + 1}</td>
                    <td className={td}>
                      <CellInput
                        multiline
                        value={row.name}
                        onChange={(name) => updateTypeI(row.id, { name })}
                      />
                    </td>
                    <td className={td}>
                      <CellInput value={row.unit} onChange={(unit) => updateTypeI(row.id, { unit })} />
                    </td>
                    <td className={td}>
                      <CellInput
                        value={row.qualityRequired}
                        onChange={(qualityRequired) => updateTypeI(row.id, { qualityRequired })}
                      />
                    </td>
                    <td className={td}>
                      <CellInput
                        value={row.similarDomestic}
                        onChange={(similarDomestic) => updateTypeI(row.id, { similarDomestic })}
                      />
                    </td>
                    <td className={td}>
                      <CellInput
                        value={row.similarWorld}
                        onChange={(similarWorld) => updateTypeI(row.id, { similarWorld })}
                      />
                    </td>
                    <td className={td}>
                      <CellInput
                        value={row.expectedQuantity}
                        onChange={(expectedQuantity) => updateTypeI(row.id, { expectedQuantity })}
                      />
                    </td>
                    <td className={td}>
                      <CellInput
                        actual
                        multiline
                        value={row.actualProduct}
                        onChange={(actualProduct) => updateTypeI(row.id, { actualProduct })}
                      />
                    </td>
                    <td className={`${td} text-center`}>
                      <RemoveButton
                        onClick={() => removeTypeI(row.id)}
                        label={`Xóa sản phẩm dạng I ${index + 1}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AddRowButton
            label="Thêm sản phẩm dạng I"
            onClick={() => setField('productTypeI', [...form.productTypeI, createEmptyTypeIRow()])}
          />
        </div>

        <div>
          <Caption>{PRODUCT_TYPE_II_CAPTION}</Caption>
          <div className="overflow-x-auto rounded-b-lg border border-slate-300">
            <table className="w-full min-w-[760px] border-collapse">
              <thead>
                <tr>
                  <th className={th} style={{ width: '3rem' }}>
                    TT
                  </th>
                  <th className={th}>Tên sản phẩm</th>
                  <th className={th}>Yêu cầu khoa học cần đạt</th>
                  <th className={th}>Ghi chú</th>
                  <th className={thActual}>Sản phẩm thực tế</th>
                  <th className={th} style={{ width: '3.25rem' }} />
                </tr>
                <tr>
                  {['(1)', '(2)', '(3)', '(4)', '(5)'].map((n) => (
                    <th key={n} className={n === '(5)' ? numThActual : numTh}>
                      {n}
                    </th>
                  ))}
                  <th className={numTh} />
                </tr>
              </thead>
              <tbody>
                {form.productTypeII.map((row, index) => (
                  <tr key={row.id}>
                    <td className={sttTd}>{index + 1}</td>
                    <td className={td}>
                      <CellInput
                        multiline
                        value={row.name}
                        onChange={(name) => updateTypeII(row.id, { name })}
                      />
                    </td>
                    <td className={td}>
                      <CellInput
                        multiline
                        value={row.scientificRequirement}
                        onChange={(scientificRequirement) =>
                          updateTypeII(row.id, { scientificRequirement })
                        }
                      />
                    </td>
                    <td className={td}>
                      <CellInput
                        multiline
                        value={row.note}
                        onChange={(note) => updateTypeII(row.id, { note })}
                      />
                    </td>
                    <td className={td}>
                      <CellInput
                        actual
                        multiline
                        value={row.actualProduct}
                        onChange={(actualProduct) => updateTypeII(row.id, { actualProduct })}
                      />
                    </td>
                    <td className={`${td} text-center`}>
                      <RemoveButton
                        onClick={() => removeTypeII(row.id)}
                        label={`Xóa sản phẩm dạng II ${index + 1}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AddRowButton
            label="Thêm sản phẩm dạng II"
            onClick={() => setField('productTypeII', [...form.productTypeII, createEmptyTypeIIRow()])}
          />
        </div>

        <div>
          <Caption>
            <span className="underline">Dạng III</span>
            : Bài báo; Sách chuyên khảo và các sản phẩm khác
          </Caption>
          <div className="overflow-x-auto rounded-b-lg border border-slate-300">
            <table className="w-full min-w-[880px] border-collapse">
              <thead>
                <tr>
                  <th className={th} style={{ width: '3.5rem' }}>
                    Số TT
                  </th>
                  <th className={th}>Tên sản phẩm</th>
                  <th className={th}>Yêu cầu khoa học cần đạt</th>
                  <th className={th}>Dự kiến nơi công bố (Tạp chí, Nhà xuất bản)</th>
                  <th className={th}>Ghi chú</th>
                  <th className={thActual}>Sản phẩm thực tế</th>
                  <th className={th} style={{ width: '3.25rem' }} />
                </tr>
                <tr>
                  {['(1)', '(2)', '(3)', '(4)', '(5)', '(6)'].map((n) => (
                    <th key={n} className={n === '(6)' ? numThActual : numTh}>
                      {n}
                    </th>
                  ))}
                  <th className={numTh} />
                </tr>
              </thead>
              <tbody>
                {form.productTypeIII.map((row, index) => (
                  <tr key={row.id}>
                    <td className={sttTd}>{index + 1}</td>
                    <td className={td}>
                      <CellInput
                        multiline
                        value={row.name}
                        onChange={(name) => updateTypeIII(row.id, { name })}
                      />
                    </td>
                    <td className={td}>
                      <CellInput
                        multiline
                        value={row.scientificRequirement}
                        onChange={(scientificRequirement) =>
                          updateTypeIII(row.id, { scientificRequirement })
                        }
                      />
                    </td>
                    <td className={td}>
                      <CellInput
                        multiline
                        value={row.publicationVenue}
                        onChange={(publicationVenue) => updateTypeIII(row.id, { publicationVenue })}
                      />
                    </td>
                    <td className={td}>
                      <CellInput
                        multiline
                        value={row.note}
                        onChange={(note) => updateTypeIII(row.id, { note })}
                      />
                    </td>
                    <td className={td}>
                      <CellInput
                        actual
                        multiline
                        value={row.actualProduct}
                        onChange={(actualProduct) => updateTypeIII(row.id, { actualProduct })}
                      />
                    </td>
                    <td className={`${td} text-center`}>
                      <RemoveButton
                        onClick={() => removeTypeIII(row.id)}
                        label={`Xóa sản phẩm dạng III ${index + 1}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AddRowButton
            label="Thêm sản phẩm dạng III"
            onClick={() =>
              setField('productTypeIII', [...form.productTypeIII, createEmptyTypeIIIRow()])
            }
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-bold text-slate-800">{TRAINING_SECTION_TITLE}</p>
          <div className="overflow-x-auto rounded-lg border border-slate-300">
            <table className="w-full min-w-[680px] border-collapse">
              <thead>
                <tr>
                  <th className={th} style={{ width: '3rem' }}>
                    TT
                  </th>
                  <th className={th}>Trình độ đào tạo</th>
                  <th className={th} style={{ width: '7rem' }}>
                    Số lượng
                  </th>
                  <th className={th}>Chuyên ngành đào tạo</th>
                  <th className={th}>Ghi chú</th>
                  <th className={thActual}>Sản phẩm thực tế</th>
                </tr>
                <tr>
                  {['(1)', '(2)', '(3)', '(4)', '(5)', '(6)'].map((n) => (
                    <th key={n} className={n === '(6)' ? numThActual : numTh}>
                      {n}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {form.trainingResults.map((row, index) => (
                  <tr key={row.id}>
                    <td className={sttTd}>{index + 1}</td>
                    <td className="border border-slate-300 px-2 py-1.5 text-xs font-semibold text-slate-800">
                      {row.level}
                    </td>
                    <td className={td}>
                      <CellInput
                        inputMode="numeric"
                        className="text-center"
                        value={row.quantity}
                        onChange={(quantity) => updateTraining(row.id, { quantity })}
                      />
                    </td>
                    <td className={td}>
                      <CellInput
                        value={row.major}
                        onChange={(major) => updateTraining(row.id, { major })}
                      />
                    </td>
                    <td className={td}>
                      <CellInput
                        value={row.note}
                        onChange={(note) => updateTraining(row.id, { note })}
                      />
                    </td>
                    <td className={td}>
                      <CellInput
                        actual
                        value={row.actualProduct}
                        onChange={(actualProduct) => updateTraining(row.id, { actualProduct })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold text-slate-800">{IP_SECTION_TITLE}</p>
          <textarea
            value={form.ipProtectionNote}
            onChange={(e) => setField('ipProtectionNote', e.target.value)}
            rows={3}
            placeholder="Nhập sản phẩm dự kiến đăng ký bảo hộ..."
            className={`${inputBase} min-h-[4.5rem] resize-y`}
          />
        </div>
      </div>
    </section>
  );
}
